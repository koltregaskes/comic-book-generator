import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  createAsset,
  createCharacter,
  createOutput,
  createPage,
  createPanel,
  createPromptPack,
  exportProjectPackage,
  formatPanelCount,
  parseProjectPackage,
  slugify,
  type CharacterProfile,
  type ComicAsset,
  type ComicBookProjectPackage,
  type ComicGenerationStatus,
  type ComicOutput,
  type ComicPage,
  type ComicPanel,
  type ComicPromptPack,
} from './project-package'
import { sampleComicBookProject } from './sample-project'

const STORAGE_KEY = 'comic-book-generator.project'

type WorkspaceSection =
  | 'overview'
  | 'characters'
  | 'pages'
  | 'prompts'
  | 'queue'
  | 'outputs'

const sectionLabels: { id: WorkspaceSection; label: string; caption: string }[] = [
  { id: 'overview', label: 'Overview', caption: 'Story and issue direction' },
  { id: 'characters', label: 'Characters', caption: 'Continuity and cast bible' },
  { id: 'pages', label: 'Pages', caption: 'Page turns and panel beats' },
  { id: 'prompts', label: 'Prompt Studio', caption: 'AI prompt packs and guidance' },
  { id: 'queue', label: 'Generation Queue', caption: 'Background image runs and asset inbox' },
  { id: 'outputs', label: 'Outputs', caption: 'Deliverables and handoff package' },
]

const generationStatuses: ComicGenerationStatus[] = [
  'draft',
  'prompt-ready',
  'queued',
  'running',
  'approved',
]

function loadInitialProject() {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    return sampleComicBookProject
  }

  try {
    return parseProjectPackage(saved)
  } catch {
    return sampleComicBookProject
  }
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function App() {
  const initialProject = useMemo(loadInitialProject, [])
  const [project, setProject] = useState<ComicBookProjectPackage>(initialProject)
  const [activeSection, setActiveSection] = useState<WorkspaceSection>('overview')
  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialProject.scenes[0]?.id ?? null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(
    initialProject.prompts[0]?.id ?? null,
  )
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(initialProject.assets[0]?.id ?? null)
  const [importMessage, setImportMessage] = useState('Ready')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const persist = (nextProject: ComicBookProjectPackage) => {
    setProject(nextProject)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProject, null, 2))
  }

  const updateProject = (
    updater: (current: ComicBookProjectPackage) => ComicBookProjectPackage,
  ) => {
    setProject((current) => {
      const nextProject = updater(current)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProject, null, 2))
      return nextProject
    })
  }

  useEffect(() => {
    if (!selectedPageId && project.scenes[0]?.id) {
      setSelectedPageId(project.scenes[0].id)
    } else if (selectedPageId && !project.scenes.some((page) => page.id === selectedPageId)) {
      setSelectedPageId(project.scenes[0]?.id ?? null)
    }
  }, [project.scenes, selectedPageId])

  useEffect(() => {
    if (!selectedPromptId && project.prompts[0]?.id) {
      setSelectedPromptId(project.prompts[0].id)
    } else if (selectedPromptId && !project.prompts.some((prompt) => prompt.id === selectedPromptId)) {
      setSelectedPromptId(project.prompts[0]?.id ?? null)
    }
  }, [project.prompts, selectedPromptId])

  useEffect(() => {
    if (!selectedAssetId && project.assets[0]?.id) {
      setSelectedAssetId(project.assets[0].id)
    } else if (selectedAssetId && !project.assets.some((asset) => asset.id === selectedAssetId)) {
      setSelectedAssetId(project.assets[0]?.id ?? null)
    }
  }, [project.assets, selectedAssetId])

  const selectedPage = project.scenes.find((page) => page.id === selectedPageId) ?? null
  const selectedPrompt = project.prompts.find((prompt) => prompt.id === selectedPromptId) ?? null
  const selectedAsset = project.assets.find((asset) => asset.id === selectedAssetId) ?? null

  const metrics = useMemo(() => {
    const totalPanels = project.scenes.reduce((sum, page) => sum + page.panels.length, 0)
    const promptReady = project.prompts.filter((prompt) => prompt.status === 'prompt-ready').length
    const queuedAssets = project.assets.filter((asset) => asset.status === 'queued').length
    const approvedAssets = project.assets.filter((asset) => asset.status === 'approved').length

    return {
      pages: project.scenes.length,
      panels: totalPanels,
      characters: project.inputs.characterRoster.length,
      outputs: project.outputs.length,
      promptReady,
      queuedAssets,
      approvedAssets,
    }
  }, [project])

  const sectionCounts = {
    overview: 1,
    characters: project.inputs.characterRoster.length,
    pages: project.scenes.length,
    prompts: project.prompts.length,
    queue: project.assets.length,
    outputs: project.outputs.length,
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const nextProject = parseProjectPackage(text)
      persist(nextProject)
      setSelectedPageId(nextProject.scenes[0]?.id ?? null)
      setSelectedPromptId(nextProject.prompts[0]?.id ?? null)
      setSelectedAssetId(nextProject.assets[0]?.id ?? null)
      setImportMessage(`Imported ${file.name}`)
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : 'Import failed. Check the JSON package.',
      )
    } finally {
      event.target.value = ''
    }
  }

  const addCharacter = () => {
    updateProject((current) => ({
      ...current,
      inputs: {
        ...current.inputs,
        characterRoster: [
          ...current.inputs.characterRoster,
          createCharacter({ name: `Character ${current.inputs.characterRoster.length + 1}` }),
        ],
      },
      updatedAt: new Date().toISOString(),
    }))
    setActiveSection('characters')
  }

  const addPage = () => {
    const nextPage = createPage({
      pageNumber: project.scenes.length + 1,
      title: `Page ${project.scenes.length + 1}`,
      summary: 'Describe the story beat, reveal, or emotional change on this page.',
      panels: [createPanel({ panelNumber: 1 })],
    })

    updateProject((current) => ({
      ...current,
      scenes: [...current.scenes, nextPage],
      updatedAt: new Date().toISOString(),
    }))
    setSelectedPageId(nextPage.id)
    setActiveSection('pages')
  }

  const addPanel = (pageId: string) => {
    updateProject((current) => ({
      ...current,
      scenes: current.scenes.map((page) =>
        page.id === pageId
          ? {
              ...page,
              panels: [...page.panels, createPanel({ panelNumber: page.panels.length + 1 })],
              panelCount: page.panels.length + 1,
            }
          : page,
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  const addPromptPack = () => {
    const nextPrompt = createPromptPack({
      label: `Prompt Pack ${project.prompts.length + 1}`,
      purpose: 'Define what this pack is for before running prompts.',
    })

    updateProject((current) => ({
      ...current,
      prompts: [...current.prompts, nextPrompt],
      updatedAt: new Date().toISOString(),
    }))
    setSelectedPromptId(nextPrompt.id)
    setActiveSection('prompts')
  }

  const addAsset = () => {
    const nextAsset = createAsset({
      label: `Asset ${project.assets.length + 1}`,
      notes: 'Describe what should be generated or reviewed here.',
    })

    updateProject((current) => ({
      ...current,
      assets: [...current.assets, nextAsset],
      updatedAt: new Date().toISOString(),
    }))
    setSelectedAssetId(nextAsset.id)
    setActiveSection('queue')
  }

  const addOutput = () => {
    updateProject((current) => ({
      ...current,
      outputs: [
        ...current.outputs,
        createOutput({
          label: `Output ${current.outputs.length + 1}`,
          target: 'Describe the delivery target',
        }),
      ],
      updatedAt: new Date().toISOString(),
    }))
    setActiveSection('outputs')
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Comic Story Studio</span>
          <h1>Comic Book Generator</h1>
          <p>
            Build the comic inside a real studio workspace: story direction, cast bible, page
            design, prompt engineering, generation queues, and delivery all live together now.
          </p>
          <div className="hero-actions">
            <button onClick={() => exportProjectPackage(project)}>Export Package</button>
            <button className="secondary" onClick={handleImportClick}>
              Import Package
            </button>
            <button
              className="ghost"
              onClick={() => {
                persist(sampleComicBookProject)
                setSelectedPageId(sampleComicBookProject.scenes[0]?.id ?? null)
                setSelectedPromptId(sampleComicBookProject.prompts[0]?.id ?? null)
                setSelectedAssetId(sampleComicBookProject.assets[0]?.id ?? null)
                setImportMessage('Sample studio loaded')
              }}
            >
              Load Sample
            </button>
          </div>
          <p className="helper-text">{importMessage}</p>
          <div className="signal-strip">
            <SignalPill label="Primary AI" value={project.inputs.primaryGenerator} />
            <SignalPill label="Runner" value={project.inputs.secondaryGenerator} />
            <SignalPill label="Goal" value={project.inputs.publishingGoal || 'Set the publishing goal'} />
          </div>
        </div>
        <div className="metric-grid">
          <MetricCard label="Pages" value={String(metrics.pages)} />
          <MetricCard label="Panels" value={formatPanelCount(metrics.panels)} />
          <MetricCard label="Prompt-ready" value={String(metrics.promptReady)} />
          <MetricCard label="Queued assets" value={String(metrics.queuedAssets)} />
        </div>
      </header>

      <main className="studio-layout">
        <aside className="studio-rail panel">
          <div className="rail-header">
            <span className="panel-kicker">Workspace</span>
            <h2>Issue flow</h2>
          </div>
          <div className="section-list">
            {sectionLabels.map((section) => (
              <button
                key={section.id}
                className={`section-button ${activeSection === section.id ? 'is-active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <div>
                  <strong>{section.label}</strong>
                  <span>{section.caption}</span>
                </div>
                <em>{sectionCounts[section.id]}</em>
              </button>
            ))}
          </div>

          <div className="rail-subsection">
            <div className="subsection-heading">
              <span>Quick add</span>
            </div>
            <div className="stack-actions">
              <button className="secondary" onClick={addCharacter}>
                Add Character
              </button>
              <button className="secondary" onClick={addPage}>
                Add Page
              </button>
              <button className="secondary" onClick={addPromptPack}>
                Add Prompt Pack
              </button>
              <button className="secondary" onClick={addAsset}>
                Add Asset
              </button>
            </div>
          </div>

          <div className="rail-subsection">
            <div className="subsection-heading">
              <span>Page navigator</span>
            </div>
            <div className="mini-list">
              {project.scenes.map((page) => (
                <button
                  key={page.id}
                  className={`mini-card ${selectedPageId === page.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedPageId(page.id)
                    setActiveSection('pages')
                  }}
                >
                  <strong>{page.title}</strong>
                  <span>
                    Page {page.pageNumber} · {page.panels.length} panels
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="studio-main panel">
          {activeSection === 'overview' ? (
            <div className="workspace-section">
              <SectionHeader
                kicker="Issue setup"
                title="Concept and production direction"
                description="Shape the issue at the same level you’ll use later for prompt generation and art runs."
              />
              <div className="field-grid">
                <Field
                  label="Project title"
                  value={project.title}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      title: value,
                      slug: slugify(value),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <Field
                  label="Issue number"
                  type="number"
                  value={String(project.inputs.issueNumber)}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, issueNumber: Number(value) || 1 },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <Field
                  label="Series title"
                  value={project.inputs.seriesTitle}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, seriesTitle: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <Field
                  label="Genre"
                  value={project.inputs.genre}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, genre: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </div>
              <TextArea
                label="Story summary"
                value={project.summary}
                onChange={(value) =>
                  updateProject((current) => ({
                    ...current,
                    summary: value,
                    updatedAt: new Date().toISOString(),
                  }))
                }
              />
              <div className="field-grid">
                <TextArea
                  label="Logline"
                  value={project.inputs.logline}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, logline: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="Creative goal"
                  value={project.inputs.creativeGoal}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, creativeGoal: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </div>
              <div className="field-grid">
                <TextArea
                  label="Issue arc"
                  value={project.inputs.arcSummary}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, arcSummary: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="Publishing goal"
                  value={project.inputs.publishingGoal}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, publishingGoal: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </div>
              <div className="field-grid">
                <TextArea
                  label="Visual language"
                  value={project.inputs.visualLanguage}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, visualLanguage: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="World notes"
                  value={project.inputs.worldNotes}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, worldNotes: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </div>
              <div className="field-grid">
                <Field
                  label="Primary AI tool"
                  value={project.inputs.primaryGenerator}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, primaryGenerator: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <Field
                  label="Background runner"
                  value={project.inputs.secondaryGenerator}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      inputs: { ...current.inputs, secondaryGenerator: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </div>
            </div>
          ) : null}

          {activeSection === 'characters' ? (
            <div className="workspace-section">
              <SectionHeader
                kicker="Continuity"
                title="Character and visual bible"
                description="Treat this as the continuity memory for offline prompt writing and generation passes."
                actionLabel="Add Character"
                onAction={addCharacter}
              />
              <div className="card-grid">
                {project.inputs.characterRoster.map((character) => (
                  <article className="studio-card" key={character.id}>
                    <div className="card-toolbar">
                      <strong>{character.name}</strong>
                      <button
                        className="ghost tiny"
                        onClick={() =>
                          updateProject((current) => ({
                            ...current,
                            inputs: {
                              ...current.inputs,
                              characterRoster: current.inputs.characterRoster.filter(
                                (item) => item.id !== character.id,
                              ),
                            },
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Name"
                        value={character.name}
                        onChange={(value) => updateCharacter(project, character.id, persist, { name: value })}
                      />
                      <Field
                        label="Role"
                        value={character.role}
                        onChange={(value) => updateCharacter(project, character.id, persist, { role: value })}
                      />
                    </div>
                    <TextArea
                      label="Look"
                      value={character.look}
                      onChange={(value) => updateCharacter(project, character.id, persist, { look: value })}
                    />
                    <TextArea
                      label="Continuity rules"
                      value={character.continuityRules}
                      onChange={(value) =>
                        updateCharacter(project, character.id, persist, { continuityRules: value })
                      }
                    />
                    <TextArea
                      label="Visual hooks"
                      value={character.visualHooks}
                      onChange={(value) =>
                        updateCharacter(project, character.id, persist, { visualHooks: value })
                      }
                    />
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activeSection === 'pages' ? (
            <div className="workspace-section">
              <SectionHeader
                kicker="Storyboards"
                title="Page and panel designer"
                description="Work one page at a time so the issue feels directed instead of dumped into a single long form."
                actionLabel="Add Page"
                onAction={addPage}
              />
              <div className="pages-layout">
                <div className="page-browser">
                  {project.scenes.map((page) => (
                    <button
                      key={page.id}
                      className={`page-chip ${selectedPageId === page.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedPageId(page.id)}
                    >
                      <strong>{page.title}</strong>
                      <span>
                        Page {page.pageNumber} · {page.panels.length} panels
                      </span>
                    </button>
                  ))}
                </div>

                {selectedPage ? (
                  <PageWorkbench
                    page={selectedPage}
                    onChange={(patch) => updatePage(project, selectedPage.id, persist, patch)}
                    onRemove={() =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.filter((item) => item.id !== selectedPage.id),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                    onAddPanel={() => addPanel(selectedPage.id)}
                    onUpdatePanel={(panelId, patch) =>
                      updatePanel(project, selectedPage.id, panelId, persist, patch)
                    }
                  />
                ) : (
                  <div className="empty-state">Add a page to begin the page workbench.</div>
                )}
              </div>
            </div>
          ) : null}

          {activeSection === 'prompts' ? (
            <div className="workspace-section">
              <SectionHeader
                kicker="Prompt Studio"
                title="AI prompt packs and generation direction"
                description="This is the layer that should eventually feed your offline prompt builder and background Midjourney runner."
                actionLabel="Add Prompt Pack"
                onAction={addPromptPack}
              />
              <div className="pages-layout">
                <div className="page-browser">
                  {project.prompts.map((prompt) => (
                    <button
                      key={prompt.id}
                      className={`page-chip ${selectedPromptId === prompt.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedPromptId(prompt.id)}
                    >
                      <strong>{prompt.label}</strong>
                      <span>
                        {prompt.generator} · {prompt.status}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedPrompt ? (
                  <article className="workbench-card">
                    <div className="card-toolbar">
                      <div>
                        <strong>{selectedPrompt.label}</strong>
                        <p className="card-caption">
                          Keep prompts, negative prompts, and generation intent together.
                        </p>
                      </div>
                      <button
                        className="ghost tiny"
                        onClick={() =>
                          updateProject((current) => ({
                            ...current,
                            prompts: current.prompts.filter((item) => item.id !== selectedPrompt.id),
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        Remove Pack
                      </button>
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Label"
                        value={selectedPrompt.label}
                        onChange={(value) =>
                          updatePrompt(project, selectedPrompt.id, persist, { label: value })
                        }
                      />
                      <Field
                        label="Purpose"
                        value={selectedPrompt.purpose}
                        onChange={(value) =>
                          updatePrompt(project, selectedPrompt.id, persist, { purpose: value })
                        }
                      />
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Generator"
                        value={selectedPrompt.generator}
                        onChange={(value) =>
                          updatePrompt(project, selectedPrompt.id, persist, { generator: value })
                        }
                      />
                      <SelectField
                        label="Status"
                        value={selectedPrompt.status}
                        options={generationStatuses}
                        onChange={(value) =>
                          updatePrompt(project, selectedPrompt.id, persist, {
                            status: value as ComicGenerationStatus,
                          })
                        }
                      />
                    </div>
                    <Field
                      label="Target asset"
                      value={selectedPrompt.targetAsset}
                      onChange={(value) =>
                        updatePrompt(project, selectedPrompt.id, persist, { targetAsset: value })
                      }
                    />
                    <TextArea
                      label="Cover prompt"
                      value={selectedPrompt.coverPrompt}
                      onChange={(value) =>
                        updatePrompt(project, selectedPrompt.id, persist, { coverPrompt: value })
                      }
                    />
                    <TextArea
                      label="Page prompt"
                      value={selectedPrompt.pagePrompt}
                      onChange={(value) =>
                        updatePrompt(project, selectedPrompt.id, persist, { pagePrompt: value })
                      }
                    />
                    <div className="field-grid">
                      <TextArea
                        label="Negative prompt"
                        value={selectedPrompt.negativePrompt}
                        onChange={(value) =>
                          updatePrompt(project, selectedPrompt.id, persist, { negativePrompt: value })
                        }
                      />
                      <TextArea
                        label="Continuity notes"
                        value={selectedPrompt.continuityNotes}
                        onChange={(value) =>
                          updatePrompt(project, selectedPrompt.id, persist, {
                            continuityNotes: value,
                          })
                        }
                      />
                    </div>
                  </article>
                ) : (
                  <div className="empty-state">Add a prompt pack to begin building the AI pipeline.</div>
                )}
              </div>
            </div>
          ) : null}

          {activeSection === 'queue' ? (
            <div className="workspace-section">
              <SectionHeader
                kicker="Generation Queue"
                title="Background runs and asset inbox"
                description="Use this queue to track what should be sent to Midjourney or other image runners once prompts are approved."
                actionLabel="Add Asset"
                onAction={addAsset}
              />
              <div className="pages-layout">
                <div className="page-browser">
                  {project.assets.map((asset) => (
                    <button
                      key={asset.id}
                      className={`page-chip ${selectedAssetId === asset.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedAssetId(asset.id)}
                    >
                      <strong>{asset.label}</strong>
                      <span>
                        {asset.source} · {asset.status}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedAsset ? (
                  <article className="workbench-card">
                    <div className="card-toolbar">
                      <div>
                        <strong>{selectedAsset.label}</strong>
                        <p className="card-caption">
                          Track what is ready, what is queued, and what has been approved back into the issue.
                        </p>
                      </div>
                      <button
                        className="ghost tiny"
                        onClick={() =>
                          updateProject((current) => ({
                            ...current,
                            assets: current.assets.filter((item) => item.id !== selectedAsset.id),
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        Remove Asset
                      </button>
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Label"
                        value={selectedAsset.label}
                        onChange={(value) => updateAsset(project, selectedAsset.id, persist, { label: value })}
                      />
                      <Field
                        label="Type"
                        value={selectedAsset.type}
                        onChange={(value) => updateAsset(project, selectedAsset.id, persist, { type: value })}
                      />
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Source"
                        value={selectedAsset.source}
                        onChange={(value) => updateAsset(project, selectedAsset.id, persist, { source: value })}
                      />
                      <SelectField
                        label="Status"
                        value={selectedAsset.status}
                        options={generationStatuses}
                        onChange={(value) =>
                          updateAsset(project, selectedAsset.id, persist, {
                            status: value as ComicGenerationStatus,
                          })
                        }
                      />
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Prompt pack link"
                        value={selectedAsset.promptPackId}
                        onChange={(value) =>
                          updateAsset(project, selectedAsset.id, persist, { promptPackId: value })
                        }
                      />
                      <Field
                        label="Delivery lane"
                        value={selectedAsset.deliveryLane}
                        onChange={(value) =>
                          updateAsset(project, selectedAsset.id, persist, { deliveryLane: value })
                        }
                      />
                    </div>
                    <TextArea
                      label="Queue notes"
                      value={selectedAsset.notes}
                      onChange={(value) => updateAsset(project, selectedAsset.id, persist, { notes: value })}
                    />
                  </article>
                ) : (
                  <div className="empty-state">Add a queued asset to build the generation inbox.</div>
                )}
              </div>
            </div>
          ) : null}

          {activeSection === 'outputs' ? (
            <div className="workspace-section">
              <SectionHeader
                kicker="Deliverables"
                title="Output package and handoff"
                description="Keep the final exports, notes, and AI runbook together so the issue is easy to move into the wider creative system."
                actionLabel="Add Output"
                onAction={addOutput}
              />
              <div className="card-grid">
                {project.outputs.map((output) => (
                  <article className="studio-card" key={output.id}>
                    <div className="card-toolbar">
                      <strong>{output.label}</strong>
                      <button
                        className="ghost tiny"
                        onClick={() =>
                          updateProject((current) => ({
                            ...current,
                            outputs: current.outputs.filter((item) => item.id !== output.id),
                            updatedAt: new Date().toISOString(),
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Label"
                        value={output.label}
                        onChange={(value) =>
                          updateOutput(project, output.id, persist, { label: value })
                        }
                      />
                      <Field
                        label="Status"
                        value={output.status}
                        onChange={(value) =>
                          updateOutput(project, output.id, persist, { status: value })
                        }
                      />
                    </div>
                    <div className="field-grid">
                      <Field
                        label="Target"
                        value={output.target}
                        onChange={(value) =>
                          updateOutput(project, output.id, persist, { target: value })
                        }
                      />
                      <Field
                        label="Format"
                        value={output.format}
                        onChange={(value) =>
                          updateOutput(project, output.id, persist, { format: value })
                        }
                      />
                    </div>
                    <TextArea
                      label="Notes"
                      value={output.notes}
                      onChange={(value) =>
                        updateOutput(project, output.id, persist, { notes: value })
                      }
                    />
                  </article>
                ))}
              </div>
              <div className="field-grid">
                <TextArea
                  label="AI runbook"
                  value={project.metrics.aiRunbook}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      metrics: { ...current.metrics, aiRunbook: value },
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="Working notes"
                  value={project.notes.join('\n')}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      notes: splitLines(value),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </div>
            </div>
          ) : null}
        </section>

        <aside className="studio-sidebar panel">
          <SectionHeader
            kicker="Studio health"
            title="AI and issue readiness"
            description="This sidebar is the bridge to the wider Creative Hub shape."
          />
          <div className="insight-grid">
            <MetricCard label="Characters" value={String(metrics.characters)} compact />
            <MetricCard label="Approved assets" value={String(metrics.approvedAssets)} compact />
            <MetricCard label="Outputs" value={String(metrics.outputs)} compact />
            <MetricCard label="Cover variants" value={String(project.metrics.coverVariants)} compact />
          </div>
          <div className="sidebar-card">
            <span className="panel-kicker">Review focus</span>
            <ul className="signal-list">
              {project.metrics.reviewFocus.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="sidebar-card">
            <span className="panel-kicker">Current selection</span>
            {activeSection === 'pages' && selectedPage ? (
              <div className="selection-card">
                <strong>{selectedPage.title}</strong>
                <span>
                  Page {selectedPage.pageNumber} · {selectedPage.panels.length} panels
                </span>
                <p>{selectedPage.summary || 'Add a page summary here.'}</p>
              </div>
            ) : null}
            {activeSection === 'prompts' && selectedPrompt ? (
              <div className="selection-card">
                <strong>{selectedPrompt.label}</strong>
                <span>
                  {selectedPrompt.generator} · {selectedPrompt.status}
                </span>
                <p>{selectedPrompt.purpose || 'Describe what this pack is meant to achieve.'}</p>
              </div>
            ) : null}
            {activeSection === 'queue' && selectedAsset ? (
              <div className="selection-card">
                <strong>{selectedAsset.label}</strong>
                <span>
                  {selectedAsset.source} · {selectedAsset.status}
                </span>
                <p>{selectedAsset.notes || 'Track generation and review notes here.'}</p>
              </div>
            ) : null}
            {!(
              (activeSection === 'pages' && selectedPage) ||
              (activeSection === 'prompts' && selectedPrompt) ||
              (activeSection === 'queue' && selectedAsset)
            ) ? (
              <div className="selection-card">
                <strong>{project.title}</strong>
                <span>{project.inputs.seriesTitle || 'Series title not set'}</span>
                <p>{project.summary || 'Use the overview to set the issue direction.'}</p>
              </div>
            ) : null}
          </div>
          <div className="sidebar-card">
            <span className="panel-kicker">Creative Hub alignment</span>
            <p className="sidebar-copy">
              Keep this tool as the focused comic workbench. The Creative Hub should remain the wider
              operating layer that links prompts, runs, reviews, and publishing together.
            </p>
          </div>
        </aside>
      </main>

      <input
        ref={fileInputRef}
        className="hidden-file-input"
        type="file"
        accept="application/json"
        onChange={handleImport}
      />
    </div>
  )
}

type SectionHeaderProps = {
  kicker: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

function SectionHeader({ kicker, title, description, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <div>
        <span className="panel-kicker">{kicker}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actionLabel && onAction ? (
        <button className="secondary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

type PageWorkbenchProps = {
  page: ComicPage
  onChange: (patch: Partial<ComicPage>) => void
  onRemove: () => void
  onAddPanel: () => void
  onUpdatePanel: (panelId: string, patch: Partial<ComicPanel>) => void
}

function PageWorkbench({ page, onChange, onRemove, onAddPanel, onUpdatePanel }: PageWorkbenchProps) {
  return (
    <article className="workbench-card">
      <div className="card-toolbar">
        <div>
          <strong>{page.title}</strong>
          <p className="card-caption">
            Page {page.pageNumber} · {page.panels.length} panel beats
          </p>
        </div>
        <div className="inline-actions">
          <button className="secondary tiny" onClick={onAddPanel}>
            Add Panel
          </button>
          <button className="ghost tiny" onClick={onRemove}>
            Remove Page
          </button>
        </div>
      </div>

      <div className="field-grid">
        <Field label="Page title" value={page.title} onChange={(value) => onChange({ title: value })} />
        <Field
          label="Page number"
          type="number"
          value={String(page.pageNumber)}
          onChange={(value) => onChange({ pageNumber: Number(value) || 1 })}
        />
      </div>
      <div className="field-grid">
        <Field label="Location" value={page.location} onChange={(value) => onChange({ location: value })} />
        <Field
          label="Panel count"
          type="number"
          value={String(page.panels.length)}
          onChange={() => undefined}
          disabled
        />
      </div>
      <TextArea label="Page summary" value={page.summary} onChange={(value) => onChange({ summary: value })} />
      <div className="field-grid">
        <TextArea
          label="Turn moment"
          value={page.turnMoment}
          onChange={(value) => onChange({ turnMoment: value })}
        />
        <TextArea
          label="Dialogue notes"
          value={page.dialogueNotes}
          onChange={(value) => onChange({ dialogueNotes: value })}
        />
      </div>
      <TextArea
        label="Lettering notes"
        value={page.letteringNotes}
        onChange={(value) => onChange({ letteringNotes: value })}
      />

      <div className="subsection-heading">
        <span>Panels</span>
        <strong>{page.panels.length} total</strong>
      </div>
      <div className="panel-grid">
        {page.panels.map((panel) => (
          <div className="panel-card" key={panel.id}>
            <div className="field-grid">
              <Field
                label="Panel #"
                type="number"
                value={String(panel.panelNumber)}
                onChange={(value) =>
                  onUpdatePanel(panel.id, { panelNumber: Number(value) || panel.panelNumber })
                }
              />
              <Field
                label="Framing"
                value={panel.framing}
                onChange={(value) => onUpdatePanel(panel.id, { framing: value })}
              />
            </div>
            <TextArea
              label="Action"
              value={panel.action}
              onChange={(value) => onUpdatePanel(panel.id, { action: value })}
            />
            <div className="field-grid">
              <TextArea
                label="Dialogue"
                value={panel.dialogue}
                onChange={(value) => onUpdatePanel(panel.id, { dialogue: value })}
              />
              <TextArea
                label="Caption"
                value={panel.caption}
                onChange={(value) => onUpdatePanel(panel.id, { caption: value })}
              />
            </div>
            <TextArea
              label="Panel prompt"
              value={panel.prompt}
              onChange={(value) => onUpdatePanel(panel.id, { prompt: value })}
            />
          </div>
        ))}
      </div>
    </article>
  )
}

function updateCharacter(
  project: ComicBookProjectPackage,
  characterId: string,
  persist: (project: ComicBookProjectPackage) => void,
  patch: Partial<CharacterProfile>,
) {
  persist({
    ...project,
    inputs: {
      ...project.inputs,
      characterRoster: project.inputs.characterRoster.map((character) =>
        character.id === characterId ? { ...character, ...patch } : character,
      ),
    },
    updatedAt: new Date().toISOString(),
  })
}

function updatePage(
  project: ComicBookProjectPackage,
  pageId: string,
  persist: (project: ComicBookProjectPackage) => void,
  patch: Partial<ComicPage>,
) {
  persist({
    ...project,
    scenes: project.scenes.map((page) => {
      if (page.id !== pageId) {
        return page
      }
      const nextPage = { ...page, ...patch }
      return { ...nextPage, panelCount: nextPage.panels.length }
    }),
    updatedAt: new Date().toISOString(),
  })
}

function updatePanel(
  project: ComicBookProjectPackage,
  pageId: string,
  panelId: string,
  persist: (project: ComicBookProjectPackage) => void,
  patch: Partial<ComicPanel>,
) {
  persist({
    ...project,
    scenes: project.scenes.map((page) =>
      page.id === pageId
        ? {
            ...page,
            panels: page.panels.map((panel) => (panel.id === panelId ? { ...panel, ...patch } : panel)),
            panelCount: page.panels.length,
          }
        : page,
    ),
    updatedAt: new Date().toISOString(),
  })
}

function updatePrompt(
  project: ComicBookProjectPackage,
  promptId: string,
  persist: (project: ComicBookProjectPackage) => void,
  patch: Partial<ComicPromptPack>,
) {
  persist({
    ...project,
    prompts: project.prompts.map((prompt) => (prompt.id === promptId ? { ...prompt, ...patch } : prompt)),
    updatedAt: new Date().toISOString(),
  })
}

function updateAsset(
  project: ComicBookProjectPackage,
  assetId: string,
  persist: (project: ComicBookProjectPackage) => void,
  patch: Partial<ComicAsset>,
) {
  persist({
    ...project,
    assets: project.assets.map((asset) => (asset.id === assetId ? { ...asset, ...patch } : asset)),
    updatedAt: new Date().toISOString(),
  })
}

function updateOutput(
  project: ComicBookProjectPackage,
  outputId: string,
  persist: (project: ComicBookProjectPackage) => void,
  patch: Partial<ComicOutput>,
) {
  persist({
    ...project,
    outputs: project.outputs.map((output) => (output.id === outputId ? { ...output, ...patch } : output)),
    updatedAt: new Date().toISOString(),
  })
}

type MetricCardProps = {
  label: string
  value: string
  compact?: boolean
}

function MetricCard({ label, value, compact = false }: MetricCardProps) {
  return (
    <div className={`metric-card ${compact ? 'compact' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function SignalPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="signal-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

type FieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
  disabled?: boolean
}

function Field({ label, value, onChange, type = 'text', disabled = false }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: readonly string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

type TextAreaProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

function TextArea({ label, value, onChange }: TextAreaProps) {
  return (
    <label className="field field-textarea">
      <span>{label}</span>
      <textarea rows={5} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

export default App
