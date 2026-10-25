export type CreativeProjectType =
  | 'music-video'
  | 'comic-book-video'
  | 'comic-book'
  | 'creative-canvas-workflow'
  | 'planning-estimate'

export type ComicGenerationStatus = 'draft' | 'prompt-ready' | 'queued' | 'running' | 'approved'

export type ComicPanel = {
  id: string
  panelNumber: number
  framing: string
  action: string
  dialogue: string
  caption: string
  prompt: string
}

export type ComicPage = {
  id: string
  pageNumber: number
  title: string
  summary: string
  panelCount: number
  location: string
  turnMoment: string
  dialogueNotes: string
  letteringNotes: string
  panels: ComicPanel[]
}

export type ComicPromptPack = {
  id: string
  label: string
  purpose: string
  generator: string
  status: ComicGenerationStatus
  coverPrompt: string
  pagePrompt: string
  negativePrompt: string
  continuityNotes: string
  targetAsset: string
}

export type CharacterProfile = {
  id: string
  name: string
  role: string
  look: string
  continuityRules: string
  visualHooks: string
}

export type ComicAsset = {
  id: string
  label: string
  type: string
  source: string
  status: ComicGenerationStatus
  promptPackId: string
  deliveryLane: string
  notes: string
}

export type ComicOutput = {
  id: string
  label: string
  status: string
  target: string
  format: string
  notes: string
}

export type ComicQueueHandoffItem = {
  id: string
  label: string
  type: string
  status: ComicGenerationStatus
  deliveryLane: string
  source: string
  promptPackId: string
  promptPackLabel: string
  promptStatus: ComicGenerationStatus | 'missing'
  targetAsset: string
  traceabilityStatus: 'linked' | 'missing-prompt-pack' | 'target-mismatch'
  generationPrompt: string
  negativePrompt: string
  continuityNotes: string
  queueNotes: string
  downstreamTargets: string[]
}

export type ComicQueueHandoffPackage = {
  formatVersion: 'comic-queue-handoff-v1'
  generatedAt: string
  sourceProject: {
    formatVersion: 'creative-project-package-v1'
    projectType: 'comic-book'
    title: string
    slug: string
    status: string
    updatedAt: string
    issueNumber: number
    seriesTitle: string
  }
  summary: {
    totalAssets: number
    linkedAssets: number
    queuedAssets: number
    runningAssets: number
    approvedAssets: number
    blockedAssets: number
  }
  items: ComicQueueHandoffItem[]
  publishingHandoff: {
    outputs: ComicOutput[]
    reviewFocus: string[]
    notes: string[]
  }
  comicVideoImport: {
    pageCount: number
    panelCount: number
    pages: Array<{
      id: string
      pageNumber: number
      title: string
      turnMoment: string
      panelCount: number
      panels: Array<{
        id: string
        panelNumber: number
        action: string
        prompt: string
        dialogue: string
        caption: string
      }>
    }>
  }
}

export type ComicPublishingChecklistStatus = 'pass' | 'needs-work'

export type ComicPublishingChecklistItem = {
  id: string
  category: 'queue' | 'approval' | 'export' | 'video-import' | 'review'
  label: string
  status: ComicPublishingChecklistStatus
  summary: string
}

export type ComicPublishingPackageManifest = {
  formatVersion: 'comic-publishing-package-v1'
  generatedAt: string
  sourceProject: ComicQueueHandoffPackage['sourceProject']
  sourceQueueHandoff: {
    formatVersion: 'comic-queue-handoff-v1'
    generatedAt: string
    summary: ComicQueueHandoffPackage['summary']
  }
  readiness: {
    goNoGo: 'GO' | 'NO-GO'
    percentComplete: number
    checklistPassed: number
    checklistTotal: number
    approvedAssets: number
    totalAssets: number
    blockedAssets: number
  }
  reviewChecklist: ComicPublishingChecklistItem[]
  approvalPromotions: Array<{
    assetId: string
    label: string
    currentStatus: ComicGenerationStatus
    eligible: boolean
    reason: string
  }>
  exportManifest: {
    packageSlug: string
    artifacts: Array<{
      id: string
      label: string
      filename: string
      format: 'json'
      purpose: string
    }>
  }
  publishingHandoff: ComicQueueHandoffPackage['publishingHandoff']
  comicVideoImport: ComicQueueHandoffPackage['comicVideoImport']
}

export type ComicBookInputs = {
  issueNumber: number
  seriesTitle: string
  genre: string
  logline: string
  arcSummary: string
  visualLanguage: string
  worldNotes: string
  creativeGoal: string
  primaryGenerator: string
  secondaryGenerator: string
  publishingGoal: string
  characterRoster: CharacterProfile[]
}

export type ComicProjectMetrics = {
  targetPages: number
  coverVariants: number
  aiRunbook: string
  reviewFocus: string[]
}

export type ComicBookProjectPackage = {
  formatVersion: 'creative-project-package-v1'
  projectType: 'comic-book'
  title: string
  slug: string
  summary: string
  status: string
  createdAt: string
  updatedAt: string
  inputs: ComicBookInputs
  scenes: ComicPage[]
  assets: ComicAsset[]
  prompts: ComicPromptPack[]
  outputs: ComicOutput[]
  metrics: ComicProjectMetrics
  notes: string[]
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createPanel(partial?: Partial<ComicPanel>): ComicPanel {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    panelNumber: partial?.panelNumber ?? 1,
    framing: partial?.framing ?? '',
    action: partial?.action ?? '',
    dialogue: partial?.dialogue ?? '',
    caption: partial?.caption ?? '',
    prompt: partial?.prompt ?? '',
  }
}

export function createPage(partial?: Partial<ComicPage>): ComicPage {
  const panels = Array.isArray(partial?.panels) ? partial.panels.map((panel) => createPanel(panel)) : []

  return {
    id: partial?.id ?? crypto.randomUUID(),
    pageNumber: partial?.pageNumber ?? 1,
    title: partial?.title ?? 'New page',
    summary: partial?.summary ?? '',
    panelCount: panels.length,
    location: partial?.location ?? '',
    turnMoment: partial?.turnMoment ?? '',
    dialogueNotes: partial?.dialogueNotes ?? '',
    letteringNotes: partial?.letteringNotes ?? '',
    panels,
  }
}

export function createCharacter(partial?: Partial<CharacterProfile>): CharacterProfile {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    name: partial?.name ?? 'Character',
    role: partial?.role ?? '',
    look: partial?.look ?? '',
    continuityRules: partial?.continuityRules ?? '',
    visualHooks: partial?.visualHooks ?? '',
  }
}

export function createPromptPack(partial?: Partial<ComicPromptPack>): ComicPromptPack {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    label: partial?.label ?? 'Prompt Pack',
    purpose: partial?.purpose ?? '',
    generator: partial?.generator ?? 'Offline prompt builder + Midjourney',
    status: partial?.status ?? 'draft',
    coverPrompt: partial?.coverPrompt ?? '',
    pagePrompt: partial?.pagePrompt ?? '',
    negativePrompt: partial?.negativePrompt ?? '',
    continuityNotes: partial?.continuityNotes ?? '',
    targetAsset: partial?.targetAsset ?? '',
  }
}

export function createAsset(partial?: Partial<ComicAsset>): ComicAsset {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    label: partial?.label ?? 'Queued asset',
    type: partial?.type ?? 'Image generation',
    source: partial?.source ?? 'Midjourney background run',
    status: partial?.status ?? 'draft',
    promptPackId: partial?.promptPackId ?? '',
    deliveryLane: partial?.deliveryLane ?? 'Stills',
    notes: partial?.notes ?? '',
  }
}

export function createOutput(partial?: Partial<ComicOutput>): ComicOutput {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    label: partial?.label ?? 'Output package',
    status: partial?.status ?? 'planned',
    target: partial?.target ?? '',
    format: partial?.format ?? 'json',
    notes: partial?.notes ?? '',
  }
}

export function createComicBookProject(
  title: string,
  partial?: Partial<ComicBookProjectPackage>,
): ComicBookProjectPackage {
  const now = new Date().toISOString()
  const nextTitle = partial?.title ?? title

  return {
    formatVersion: 'creative-project-package-v1',
    projectType: 'comic-book',
    title: nextTitle,
    slug: partial?.slug ?? slugify(nextTitle),
    summary: partial?.summary ?? '',
    status: partial?.status ?? 'draft',
    createdAt: partial?.createdAt ?? now,
    updatedAt: partial?.updatedAt ?? now,
    inputs: {
      issueNumber: partial?.inputs?.issueNumber ?? 1,
      seriesTitle: partial?.inputs?.seriesTitle ?? '',
      genre: partial?.inputs?.genre ?? '',
      logline: partial?.inputs?.logline ?? '',
      arcSummary: partial?.inputs?.arcSummary ?? '',
      visualLanguage: partial?.inputs?.visualLanguage ?? '',
      worldNotes: partial?.inputs?.worldNotes ?? '',
      creativeGoal: partial?.inputs?.creativeGoal ?? '',
      primaryGenerator: partial?.inputs?.primaryGenerator ?? 'Offline prompt builder',
      secondaryGenerator: partial?.inputs?.secondaryGenerator ?? 'Midjourney background runner',
      publishingGoal: partial?.inputs?.publishingGoal ?? '',
      characterRoster: Array.isArray(partial?.inputs?.characterRoster)
        ? partial.inputs.characterRoster.map((character) => createCharacter(character))
        : [],
    },
    scenes: Array.isArray(partial?.scenes) ? partial.scenes.map((page) => createPage(page)) : [],
    assets: Array.isArray(partial?.assets) ? partial.assets.map((asset) => createAsset(asset)) : [],
    prompts: Array.isArray(partial?.prompts)
      ? partial.prompts.map((promptPack) => createPromptPack(promptPack))
      : [],
    outputs: Array.isArray(partial?.outputs) ? partial.outputs.map((output) => createOutput(output)) : [],
    metrics: {
      targetPages: partial?.metrics?.targetPages ?? 24,
      coverVariants: partial?.metrics?.coverVariants ?? 3,
      aiRunbook: partial?.metrics?.aiRunbook ?? '',
      reviewFocus: Array.isArray(partial?.metrics?.reviewFocus) ? partial.metrics.reviewFocus : [],
    },
    notes: Array.isArray(partial?.notes) ? partial.notes.map((item) => String(item)) : [],
  }
}

export function parseProjectPackage(raw: string): ComicBookProjectPackage {
  const parsed = JSON.parse(raw) as Partial<ComicBookProjectPackage>
  if (parsed.formatVersion !== 'creative-project-package-v1' || parsed.projectType !== 'comic-book') {
    throw new Error('Expected a comic-book creative-project-package-v1 file.')
  }

  return createComicBookProject(parsed.title ?? 'Imported Comic Project', parsed)
}

function downloadJsonFile(filename: string, value: unknown) {
  const file = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function downstreamTargetsForAsset(asset: ComicAsset) {
  const lane = asset.deliveryLane.toLowerCase()
  const targets = new Set<string>(['publishing-review'])

  if (asset.status === 'approved' || lane.includes('interior') || lane.includes('still')) {
    targets.add('comic-book-video-import')
  }

  if (lane.includes('cover')) {
    targets.add('cover-package-review')
  }

  return Array.from(targets)
}

function getTraceabilityStatus(
  asset: ComicAsset,
  promptPack: ComicPromptPack | undefined,
): ComicQueueHandoffItem['traceabilityStatus'] {
  if (!promptPack) {
    return 'missing-prompt-pack'
  }

  if (promptPack.targetAsset.trim() && promptPack.targetAsset.trim() !== asset.label.trim()) {
    return 'target-mismatch'
  }

  return 'linked'
}

export function buildQueueHandoffPackage(
  project: ComicBookProjectPackage,
  generatedAt = new Date().toISOString(),
): ComicQueueHandoffPackage {
  const promptPacksById = new Map(project.prompts.map((promptPack) => [promptPack.id, promptPack]))
  const items: ComicQueueHandoffItem[] = project.assets.map((asset) => {
    const promptPack = promptPacksById.get(asset.promptPackId)
    const promptStatus: ComicQueueHandoffItem['promptStatus'] = promptPack?.status ?? 'missing'

    return {
      id: asset.id,
      label: asset.label,
      type: asset.type,
      status: asset.status,
      deliveryLane: asset.deliveryLane,
      source: asset.source,
      promptPackId: asset.promptPackId,
      promptPackLabel: promptPack?.label ?? '',
      promptStatus,
      targetAsset: promptPack?.targetAsset ?? '',
      traceabilityStatus: getTraceabilityStatus(asset, promptPack),
      generationPrompt: [promptPack?.coverPrompt, promptPack?.pagePrompt].filter(Boolean).join('\n\n'),
      negativePrompt: promptPack?.negativePrompt ?? '',
      continuityNotes: promptPack?.continuityNotes ?? '',
      queueNotes: asset.notes,
      downstreamTargets: downstreamTargetsForAsset(asset),
    }
  })

  return {
    formatVersion: 'comic-queue-handoff-v1',
    generatedAt,
    sourceProject: {
      formatVersion: project.formatVersion,
      projectType: project.projectType,
      title: project.title,
      slug: project.slug,
      status: project.status,
      updatedAt: project.updatedAt,
      issueNumber: project.inputs.issueNumber,
      seriesTitle: project.inputs.seriesTitle,
    },
    summary: {
      totalAssets: items.length,
      linkedAssets: items.filter((item) => item.traceabilityStatus === 'linked').length,
      queuedAssets: items.filter((item) => item.status === 'queued').length,
      runningAssets: items.filter((item) => item.status === 'running').length,
      approvedAssets: items.filter((item) => item.status === 'approved').length,
      blockedAssets: items.filter((item) => item.traceabilityStatus !== 'linked').length,
    },
    items,
    publishingHandoff: {
      outputs: project.outputs,
      reviewFocus: project.metrics.reviewFocus,
      notes: project.notes.map((note) => note.trim()).filter(Boolean),
    },
    comicVideoImport: {
      pageCount: project.scenes.length,
      panelCount: project.scenes.reduce((sum, page) => sum + page.panels.length, 0),
      pages: project.scenes.map((page) => ({
        id: page.id,
        pageNumber: page.pageNumber,
        title: page.title,
        turnMoment: page.turnMoment,
        panelCount: page.panels.length,
        panels: page.panels.map((panel) => ({
          id: panel.id,
          panelNumber: panel.panelNumber,
          action: panel.action,
          prompt: panel.prompt,
          dialogue: panel.dialogue,
          caption: panel.caption,
        })),
      })),
    },
  }
}

export function parseQueueHandoffPackage(raw: string): ComicQueueHandoffPackage {
  const parsed = JSON.parse(raw) as Partial<ComicQueueHandoffPackage>
  if (parsed.formatVersion !== 'comic-queue-handoff-v1' || !Array.isArray(parsed.items)) {
    throw new Error('Expected a comic-queue-handoff-v1 file.')
  }

  return parsed as ComicQueueHandoffPackage
}

function checklistItem(
  id: ComicPublishingChecklistItem['id'],
  category: ComicPublishingChecklistItem['category'],
  label: ComicPublishingChecklistItem['label'],
  passed: boolean,
  passSummary: string,
  needsWorkSummary: string,
): ComicPublishingChecklistItem {
  return {
    id,
    category,
    label,
    status: passed ? 'pass' : 'needs-work',
    summary: passed ? passSummary : needsWorkSummary,
  }
}

export function buildPublishingPackageManifest(
  project: ComicBookProjectPackage,
  generatedAt = new Date().toISOString(),
): ComicPublishingPackageManifest {
  const queueHandoff = buildQueueHandoffPackage(project, generatedAt)
  const hasIssueJsonOutput = project.outputs.some((output) => output.format.toLowerCase() === 'json')
  const hasReviewNotes = project.metrics.reviewFocus.length > 0 || project.notes.length > 0
  const hasVideoImportData =
    queueHandoff.comicVideoImport.pageCount > 0 &&
    queueHandoff.comicVideoImport.panelCount > 0 &&
    queueHandoff.comicVideoImport.pages.every((page) =>
      page.panels.every((panel) => panel.action.trim() && panel.prompt.trim()),
    )
  const allAssetsApproved =
    queueHandoff.summary.totalAssets > 0 &&
    queueHandoff.summary.approvedAssets === queueHandoff.summary.totalAssets
  const checklist: ComicPublishingChecklistItem[] = [
    checklistItem(
      'queue-traceability',
      'queue',
      'Queue assets are traceable',
      queueHandoff.summary.totalAssets > 0 && queueHandoff.summary.blockedAssets === 0,
      'Every queued asset links back to a prompt pack and target asset.',
      'Resolve missing prompt links or target mismatches before publishing.',
    ),
    checklistItem(
      'asset-approval',
      'approval',
      'Generated assets are approved',
      allAssetsApproved,
      'All queued assets are promoted to approved for handoff.',
      'Promote reviewed generated assets to approved before final packaging.',
    ),
    checklistItem(
      'issue-json-output',
      'export',
      'Issue package JSON is listed',
      hasIssueJsonOutput,
      'A JSON issue package output is present for archiving and import.',
      'Add an issue package JSON output before exporting the publishing package.',
    ),
    checklistItem(
      'comic-video-import-data',
      'video-import',
      'Comic-video import data is usable',
      hasVideoImportData,
      'Pages and panels include action and prompt data for downstream video import.',
      'Add page, panel, action, and prompt details before comic-video import.',
    ),
    checklistItem(
      'review-notes',
      'review',
      'Review notes are available',
      hasReviewNotes,
      'Review focus or working notes are included for the publishing pass.',
      'Add review focus or working notes for the publishing pass.',
    ),
  ]
  const checklistPassed = checklist.filter((item) => item.status === 'pass').length
  const packageSlug = project.slug || 'comic-book-project'

  return {
    formatVersion: 'comic-publishing-package-v1',
    generatedAt,
    sourceProject: queueHandoff.sourceProject,
    sourceQueueHandoff: {
      formatVersion: queueHandoff.formatVersion,
      generatedAt: queueHandoff.generatedAt,
      summary: queueHandoff.summary,
    },
    readiness: {
      goNoGo: checklistPassed === checklist.length ? 'GO' : 'NO-GO',
      percentComplete: Math.round((checklistPassed / checklist.length) * 100),
      checklistPassed,
      checklistTotal: checklist.length,
      approvedAssets: queueHandoff.summary.approvedAssets,
      totalAssets: queueHandoff.summary.totalAssets,
      blockedAssets: queueHandoff.summary.blockedAssets,
    },
    reviewChecklist: checklist,
    approvalPromotions: queueHandoff.items.map((item) => ({
      assetId: item.id,
      label: item.label,
      currentStatus: item.status,
      eligible: item.traceabilityStatus === 'linked' && item.status !== 'approved',
      reason:
        item.traceabilityStatus !== 'linked'
          ? 'Fix prompt-pack traceability before approval.'
          : item.status === 'approved'
            ? 'Already approved for publishing handoff.'
            : 'Ready for human review and local approval promotion.',
    })),
    exportManifest: {
      packageSlug,
      artifacts: [
        {
          id: 'issue-package-json',
          label: 'Issue package JSON',
          filename: `${packageSlug}.json`,
          format: 'json',
          purpose: 'Canonical creative-project-package-v1 export.',
        },
        {
          id: 'queue-handoff-json',
          label: 'Queue handoff JSON',
          filename: `${packageSlug}-queue-handoff.json`,
          format: 'json',
          purpose: 'Traceable prompt, asset, and downstream workflow handoff.',
        },
        {
          id: 'publishing-package-json',
          label: 'Publishing package manifest',
          filename: `${packageSlug}-publishing-package.json`,
          format: 'json',
          purpose: 'Review checklist, readiness, and publishing export manifest.',
        },
      ],
    },
    publishingHandoff: queueHandoff.publishingHandoff,
    comicVideoImport: queueHandoff.comicVideoImport,
  }
}

export function parsePublishingPackageManifest(raw: string): ComicPublishingPackageManifest {
  const parsed = JSON.parse(raw) as Partial<ComicPublishingPackageManifest>
  if (parsed.formatVersion !== 'comic-publishing-package-v1' || !Array.isArray(parsed.reviewChecklist)) {
    throw new Error('Expected a comic-publishing-package-v1 file.')
  }

  return parsed as ComicPublishingPackageManifest
}

export function promoteAssetForPublishing(
  project: ComicBookProjectPackage,
  assetId: string,
  approvedAt = new Date().toISOString(),
): ComicBookProjectPackage {
  return {
    ...project,
    assets: project.assets.map((asset) =>
      asset.id === assetId
        ? {
            ...asset,
            status: 'approved',
            notes: asset.notes.includes('Approved for publishing handoff:')
              ? asset.notes
              : [asset.notes, `Approved for publishing handoff: ${approvedAt}`].filter(Boolean).join('\n'),
          }
        : asset,
    ),
    updatedAt: approvedAt,
  }
}

export function exportProjectPackage(project: ComicBookProjectPackage) {
  downloadJsonFile(`${project.slug || 'comic-book-project'}.json`, project)
}

export function exportQueueHandoffPackage(project: ComicBookProjectPackage) {
  const handoff = buildQueueHandoffPackage(project)
  downloadJsonFile(`${project.slug || 'comic-book-project'}-queue-handoff.json`, handoff)
}

export function exportPublishingPackageManifest(project: ComicBookProjectPackage) {
  const manifest = buildPublishingPackageManifest(project)
  downloadJsonFile(`${project.slug || 'comic-book-project'}-publishing-package.json`, manifest)
}

export function formatPanelCount(value: number) {
  return `${value} total`
}
