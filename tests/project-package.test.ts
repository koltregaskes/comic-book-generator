import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildPublishingPackageManifest,
  buildQueueHandoffPackage,
  createComicBookProject,
  createPage,
  createPanel,
  formatPanelCount,
  parsePublishingPackageManifest,
  parseQueueHandoffPackage,
  parseProjectPackage,
  promoteAssetForPublishing,
} from '../src/project-package.ts'

const traceableComicBookProject = createComicBookProject('Neon Tomb Issue One', {
  scenes: [
    createPage({
      id: 'page-1',
      pageNumber: 1,
      title: 'Cold Open',
      summary: 'Vera descends toward the submerged archive entrance.',
      turnMoment: 'Reveal the flooded archive door as the first real threat.',
      panels: [
        createPanel({
          id: 'page-1-panel-1',
          panelNumber: 1,
          action: 'Show the drowned skyline and the archive ruin beyond.',
          prompt: 'Wide comic panel, drowned neon skyline, monumental archive ruin.',
        }),
      ],
    }),
  ],
  prompts: [
    {
      id: 'prompt-pack-1',
      label: 'Core issue pack',
      purpose: 'Main cover and page generation pipeline',
      generator: 'Offline prompt builder + Midjourney',
      status: 'prompt-ready',
      coverPrompt: 'Graphic novel cover, flooded neon archive, lone thief framed by glyphs.',
      pagePrompt: 'Cinematic comic interior art with clean panel readability.',
      negativePrompt: 'blurry faces, inconsistent costume details',
      continuityNotes: 'Keep glyph lighting cyan-white.',
      targetAsset: 'Archive cover key art',
    },
  ],
  assets: [
    {
      id: 'asset-1',
      label: 'Archive cover key art',
      type: 'Cover image',
      source: 'Midjourney background runner',
      status: 'queued',
      promptPackId: 'prompt-pack-1',
      deliveryLane: 'Cover',
      notes: 'Queue three cover variants once the negative prompt is locked.',
    },
  ],
  outputs: [
    {
      id: 'output-1',
      label: 'Issue package',
      status: 'planned',
      target: 'Comic package JSON export',
      format: 'json',
      notes: 'Primary structured export for the wider toolchain.',
    },
  ],
  metrics: {
    targetPages: 24,
    coverVariants: 3,
    aiRunbook: 'Review queue handoff, approve assets, then export the publishing package.',
    reviewFocus: ['Check cover readability before final package.'],
  },
  notes: ['Keep the cover glyph language consistent in publishing review.'],
})

describe('comic-book creative project package', () => {
  it('round-trips a traceable package without losing exchange-contract fields', () => {
    const imported = parseProjectPackage(JSON.stringify(traceableComicBookProject))

    assert.equal(imported.formatVersion, 'creative-project-package-v1')
    assert.equal(imported.projectType, 'comic-book')
    assert.equal(imported.title, traceableComicBookProject.title)
    assert.equal(imported.slug, 'neon-tomb-issue-one')
    assert.equal(imported.scenes.length, traceableComicBookProject.scenes.length)
    assert.equal(imported.prompts.length, traceableComicBookProject.prompts.length)
    assert.equal(imported.assets.length, traceableComicBookProject.assets.length)
    assert.equal(imported.outputs.some((output) => output.format === 'json'), true)
  })

  it('normalizes a page with no panels to a zero panel count', () => {
    const imported = parseProjectPackage(
      JSON.stringify({
        formatVersion: 'creative-project-package-v1',
        projectType: 'comic-book',
        title: 'Empty page',
        scenes: [{ id: 'empty-page', panelCount: 99, panels: [] }],
      }),
    )

    assert.equal(imported.scenes[0]?.panelCount, 0)
    assert.equal(imported.scenes[0]?.panels.length, 0)
  })

  it('omits blank working notes from the queue handoff', () => {
    const project = createComicBookProject('Notes', {
      notes: ['  Keep the glyph  ', '', '   '],
    })
    const handoff = buildQueueHandoffPackage(project, '2026-04-27T01:55:00.000Z')

    assert.deepEqual(handoff.publishingHandoff.notes, ['Keep the glyph'])
  })

  it('normalizes imported panel counts to the real panel list', () => {
    const stalePanelCountPackage = createComicBookProject('Panel Count Regression', {
      scenes: [
        createPage({
          id: 'page-with-stale-count',
          panelCount: 99,
          panels: [
            createPanel({ id: 'panel-1', panelNumber: 1 }),
            createPanel({ id: 'panel-2', panelNumber: 2 }),
          ],
        }),
      ],
    })

    const imported = parseProjectPackage(JSON.stringify(stalePanelCountPackage))

    assert.equal(imported.scenes[0]?.panelCount, 2)
    assert.equal(formatPanelCount(imported.scenes.reduce((sum, page) => sum + page.panels.length, 0)), '2 total')
  })

  it('keeps queued assets traceable to prompt packs and target assets', () => {
    const imported = parseProjectPackage(JSON.stringify(traceableComicBookProject))
    const promptIds = new Set(imported.prompts.map((promptPack) => promptPack.id))
    const assetLabels = new Set(imported.assets.map((asset) => asset.label))

    for (const asset of imported.assets.filter((item) => item.status !== 'draft')) {
      assert.equal(promptIds.has(asset.promptPackId), true, `${asset.label} has no prompt pack link`)
      assert.notEqual(asset.deliveryLane.trim(), '', `${asset.label} needs a delivery lane`)
    }

    for (const promptPack of imported.prompts.filter((item) => item.targetAsset.trim())) {
      assert.equal(assetLabels.has(promptPack.targetAsset), true, `${promptPack.label} targets a missing asset`)
    }
  })

  it('preserves the page and panel fields needed by downstream comic-video importers', () => {
    const imported = parseProjectPackage(JSON.stringify(traceableComicBookProject))
    const firstPage = imported.scenes[0]
    const firstPanel = firstPage?.panels[0]

    assert.ok(firstPage)
    assert.ok(firstPanel)
    assert.equal(typeof firstPage.pageNumber, 'number')
    assert.notEqual(firstPage.turnMoment.trim(), '')
    assert.equal(typeof firstPanel.panelNumber, 'number')
    assert.notEqual(firstPanel.action.trim(), '')
    assert.notEqual(firstPanel.prompt.trim(), '')
  })

  it('rejects packages outside the comic-book v1 contract', () => {
    assert.throws(
      () => parseProjectPackage(JSON.stringify({ formatVersion: 'creative-project-package-v1', projectType: 'music-video' })),
      /Expected a comic-book creative-project-package-v1 file/,
    )
  })

  it('builds a durable queue handoff for publishing and comic-video workflows', () => {
    const handoff = buildQueueHandoffPackage(traceableComicBookProject, '2026-04-27T01:55:00.000Z')

    assert.equal(handoff.formatVersion, 'comic-queue-handoff-v1')
    assert.equal(handoff.generatedAt, '2026-04-27T01:55:00.000Z')
    assert.equal(handoff.sourceProject.slug, 'neon-tomb-issue-one')
    assert.equal(handoff.summary.totalAssets, 1)
    assert.equal(handoff.summary.linkedAssets, 1)
    assert.equal(handoff.summary.blockedAssets, 0)
    assert.equal(handoff.items[0]?.traceabilityStatus, 'linked')
    assert.equal(handoff.items[0]?.promptPackLabel, 'Core issue pack')
    assert.equal(handoff.items[0]?.downstreamTargets.includes('publishing-review'), true)
    assert.equal(handoff.items[0]?.downstreamTargets.includes('cover-package-review'), true)
    assert.equal(handoff.comicVideoImport.pageCount, 1)
    assert.equal(handoff.comicVideoImport.panelCount, 1)
    assert.equal(handoff.comicVideoImport.pages[0]?.panels[0]?.prompt.includes('drowned neon skyline'), true)
    assert.equal(handoff.publishingHandoff.outputs[0]?.format, 'json')
  })

  it('marks queue handoff items as blocked when prompt links are missing', () => {
    const unlinkedProject = createComicBookProject('Broken Queue Link', {
      assets: [
        {
          id: 'asset-without-prompt',
          label: 'Unlinked still',
          type: 'Interior still',
          source: 'Offline',
          status: 'queued',
          promptPackId: 'missing-prompt-pack',
          deliveryLane: 'Interiors',
          notes: 'Should not leave the queue without prompt traceability.',
        },
      ],
    })
    const handoff = buildQueueHandoffPackage(unlinkedProject, '2026-04-27T01:55:00.000Z')

    assert.equal(handoff.summary.blockedAssets, 1)
    assert.equal(handoff.items[0]?.promptStatus, 'missing')
    assert.equal(handoff.items[0]?.traceabilityStatus, 'missing-prompt-pack')
    assert.equal(handoff.items[0]?.downstreamTargets.includes('comic-book-video-import'), true)
  })

  it('parses queue handoff artifacts and rejects other package shapes', () => {
    const handoff = buildQueueHandoffPackage(traceableComicBookProject, '2026-04-27T01:55:00.000Z')

    assert.equal(parseQueueHandoffPackage(JSON.stringify(handoff)).sourceProject.title, 'Neon Tomb Issue One')
    assert.throws(
      () => parseQueueHandoffPackage(JSON.stringify({ formatVersion: 'creative-project-package-v1', items: [] })),
      /Expected a comic-queue-handoff-v1 file/,
    )
  })

  it('builds a publishing manifest with checklist and export artifacts from the queue handoff', () => {
    const manifest = buildPublishingPackageManifest(traceableComicBookProject, '2026-04-27T02:05:00.000Z')

    assert.equal(manifest.formatVersion, 'comic-publishing-package-v1')
    assert.equal(manifest.sourceQueueHandoff.formatVersion, 'comic-queue-handoff-v1')
    assert.equal(manifest.readiness.goNoGo, 'NO-GO')
    assert.equal(manifest.readiness.checklistPassed, 4)
    assert.equal(manifest.readiness.checklistTotal, 5)
    assert.equal(manifest.reviewChecklist.find((item) => item.id === 'asset-approval')?.status, 'needs-work')
    assert.equal(
      manifest.exportManifest.artifacts.some((artifact) => artifact.filename === 'neon-tomb-issue-one-queue-handoff.json'),
      true,
    )
    assert.equal(
      manifest.exportManifest.artifacts.some((artifact) => artifact.filename === 'neon-tomb-issue-one-publishing-package.json'),
      true,
    )
  })

  it('promotes reviewed assets into a GO publishing manifest without live connectors', () => {
    const approvedProject = promoteAssetForPublishing(
      traceableComicBookProject,
      'asset-1',
      '2026-04-27T02:05:00.000Z',
    )
    const manifest = buildPublishingPackageManifest(approvedProject, '2026-04-27T02:05:00.000Z')

    assert.equal(approvedProject.assets[0]?.status, 'approved')
    assert.equal(approvedProject.assets[0]?.notes.includes('Approved for publishing handoff:'), true)
    assert.equal(manifest.readiness.goNoGo, 'GO')
    assert.equal(manifest.readiness.percentComplete, 100)
    assert.equal(manifest.approvalPromotions[0]?.eligible, false)
    assert.equal(manifest.approvalPromotions[0]?.reason, 'Already approved for publishing handoff.')
  })

  it('parses publishing manifests and rejects non-publishing artifacts', () => {
    const manifest = buildPublishingPackageManifest(traceableComicBookProject, '2026-04-27T02:05:00.000Z')

    assert.equal(parsePublishingPackageManifest(JSON.stringify(manifest)).sourceProject.title, 'Neon Tomb Issue One')
    assert.throws(
      () => parsePublishingPackageManifest(JSON.stringify({ formatVersion: 'comic-queue-handoff-v1', reviewChecklist: [] })),
      /Expected a comic-publishing-package-v1 file/,
    )
  })
})
