import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  exportProjectPackage,
  formatPanelCount,
  parseProjectPackage,
  slugify,
  type CharacterProfile,
  type ComicBookProjectPackage,
  type ComicPage,
  type ComicPanel,
} from './project-package'
import { sampleComicBookProject } from './sample-project'

const STORAGE_KEY = 'comic-book-generator.project'

function App() {
  const [project, setProject] = useState<ComicBookProjectPackage>(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      return sampleComicBookProject
    }

    try {
      return parseProjectPackage(saved)
    } catch {
      return sampleComicBookProject
    }
  })
  const [importMessage, setImportMessage] = useState('Ready')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const persist = (nextProject: ComicBookProjectPackage) => {
    setProject(nextProject)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProject, null, 2))
  }

  const updateProject = (
    updater: (current: ComicBookProjectPackage) => ComicBookProjectPackage,
  ) => {
    persist(updater(project))
  }

  const metrics = useMemo(() => {
    const totalPanels = project.scenes.reduce((sum, page) => sum + page.panels.length, 0)
    return {
      pages: project.scenes.length,
      panels: totalPanels,
      characters: project.inputs.characterRoster.length,
      outputs: project.outputs.length,
    }
  }, [project])

  const addCharacter = () => {
    updateProject((current) => ({
      ...current,
      inputs: {
        ...current.inputs,
        characterRoster: [
          ...current.inputs.characterRoster,
          {
            id: crypto.randomUUID(),
            name: `Character ${current.inputs.characterRoster.length + 1}`,
            role: '',
            look: '',
            continuityRules: '',
          },
        ],
      },
      updatedAt: new Date().toISOString(),
    }))
  }

  const addPage = () => {
    updateProject((current) => ({
      ...current,
      scenes: [
        ...current.scenes,
        {
          id: crypto.randomUUID(),
          pageNumber: current.scenes.length + 1,
          title: `Page ${current.scenes.length + 1}`,
          summary: 'Describe the page beat, reveal, or transition here.',
          panelCount: 1,
          location: '',
          turnMoment: '',
          dialogueNotes: '',
          letteringNotes: '',
          panels: [
            {
              id: crypto.randomUUID(),
              panelNumber: 1,
              framing: '',
              action: '',
              dialogue: '',
              caption: '',
              prompt: '',
            },
          ],
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const addPanel = (pageId: string) => {
    updateProject((current) => ({
      ...current,
      scenes: current.scenes.map((page) =>
        page.id === pageId
          ? {
              ...page,
              panels: [
                ...page.panels,
                {
                  id: crypto.randomUUID(),
                  panelNumber: page.panels.length + 1,
                  framing: '',
                  action: '',
                  dialogue: '',
                  caption: '',
                  prompt: '',
                },
              ],
              panelCount: page.panels.length + 1,
            }
          : page,
      ),
      updatedAt: new Date().toISOString(),
    }))
  }

  const addPromptPack = () => {
    updateProject((current) => ({
      ...current,
      prompts: [
        ...current.prompts,
        {
          id: crypto.randomUUID(),
          label: `Prompt Pack ${current.prompts.length + 1}`,
          coverPrompt: '',
          pagePrompt: '',
          continuityNotes: '',
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const addOutput = () => {
    updateProject((current) => ({
      ...current,
      outputs: [
        ...current.outputs,
        {
          id: crypto.randomUUID(),
          label: `Output ${current.outputs.length + 1}`,
          status: 'planned',
          target: 'Issue export target',
        },
      ],
      updatedAt: new Date().toISOString(),
    }))
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      persist(parseProjectPackage(text))
      setImportMessage(`Imported ${file.name}`)
    } catch (error) {
      setImportMessage(
        error instanceof Error ? error.message : 'Import failed. Check the JSON package.',
      )
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Issue Design Console</span>
          <h1>Comic Book Generator</h1>
          <p>
            Build a comic issue as a real production package with character continuity, page turns,
            nested panel beats, cover prompts, and export-ready issue structure.
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
                setImportMessage('Sample project loaded')
              }}
            >
              Load Sample
            </button>
          </div>
          <p className="helper-text">{importMessage}</p>
        </div>
        <div className="metric-grid">
          <MetricCard label="Pages" value={String(metrics.pages)} />
          <MetricCard label="Panels" value={formatPanelCount(metrics.panels)} />
          <MetricCard label="Characters" value={String(metrics.characters)} />
          <MetricCard label="Outputs" value={String(metrics.outputs)} />
        </div>
      </header>

      <main className="workspace-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Issue Setup</span>
              <h2>Concept and series direction</h2>
            </div>
          </div>
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
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Continuity</span>
              <h2>Character roster</h2>
            </div>
            <button className="secondary" onClick={addCharacter}>
              Add Character
            </button>
          </div>
          <div className="stack-list">
            {project.inputs.characterRoster.map((character) => (
              <article className="stack-card" key={character.id}>
                <div className="stack-header compact">
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
                    onChange={(value) =>
                      updateCharacter(project, character.id, persist, {
                        name: value,
                      })
                    }
                  />
                  <Field
                    label="Role"
                    value={character.role}
                    onChange={(value) =>
                      updateCharacter(project, character.id, persist, {
                        role: value,
                      })
                    }
                  />
                </div>
                <TextArea
                  label="Look"
                  value={character.look}
                  onChange={(value) =>
                    updateCharacter(project, character.id, persist, {
                      look: value,
                    })
                  }
                />
                <TextArea
                  label="Continuity rules"
                  value={character.continuityRules}
                  onChange={(value) =>
                    updateCharacter(project, character.id, persist, {
                      continuityRules: value,
                    })
                  }
                />
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel-full">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Pages</span>
              <h2>Page turns and panel beats</h2>
            </div>
            <button className="secondary" onClick={addPage}>
              Add Page
            </button>
          </div>
          <div className="stack-list">
            {project.scenes.map((page, pageIndex) => (
              <PageEditor
                key={page.id}
                page={page}
                pageIndex={pageIndex}
                onChange={(patch) => updatePage(project, page.id, persist, patch)}
                onRemove={() =>
                  updateProject((current) => ({
                    ...current,
                    scenes: current.scenes.filter((item) => item.id !== page.id),
                    updatedAt: new Date().toISOString(),
                  }))
                }
                onAddPanel={() => addPanel(page.id)}
                onUpdatePanel={(panelId, patch) => updatePanel(project, page.id, panelId, persist, patch)}
              />
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Prompt Packs</span>
              <h2>Cover and page prompt sets</h2>
            </div>
            <button className="secondary" onClick={addPromptPack}>
              Add Prompt Pack
            </button>
          </div>
          <div className="stack-list">
            {project.prompts.map((prompt, index) => (
              <article className="stack-card" key={prompt.id}>
                <div className="stack-header compact">
                  <strong>{prompt.label}</strong>
                  <button
                    className="ghost tiny"
                    onClick={() =>
                      updateProject((current) => ({
                        ...current,
                        prompts: current.prompts.filter((item) => item.id !== prompt.id),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Label"
                  value={prompt.label}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      prompts: current.prompts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, label: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="Cover prompt"
                  value={prompt.coverPrompt}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      prompts: current.prompts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, coverPrompt: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="Page prompt"
                  value={prompt.pagePrompt}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      prompts: current.prompts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, pagePrompt: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="Continuity notes"
                  value={prompt.continuityNotes}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      prompts: current.prompts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, continuityNotes: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Outputs</span>
              <h2>Release package and exports</h2>
            </div>
            <button className="secondary" onClick={addOutput}>
              Add Output
            </button>
          </div>
          <div className="stack-list">
            {project.outputs.map((output, index) => (
              <article className="stack-card" key={output.id}>
                <div className="stack-header compact">
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
                      updateProject((current) => ({
                        ...current,
                        outputs: current.outputs.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, label: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <Field
                    label="Status"
                    value={output.status}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        outputs: current.outputs.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, status: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <Field
                  label="Target"
                  value={output.target}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      outputs: current.outputs.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, target: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
              </article>
            ))}
          </div>
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
        </section>
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

type PageEditorProps = {
  page: ComicPage
  pageIndex: number
  onChange: (patch: Partial<ComicPage>) => void
  onRemove: () => void
  onAddPanel: () => void
  onUpdatePanel: (panelId: string, patch: Partial<ComicPanel>) => void
}

function PageEditor({
  page,
  pageIndex,
  onChange,
  onRemove,
  onAddPanel,
  onUpdatePanel,
}: PageEditorProps) {
  return (
    <article className="stack-card cinematic-card">
      <div className="stack-header">
        <div>
          <strong>{page.title}</strong>
          <p className="card-caption">Page {pageIndex + 1}</p>
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
      <div className="field-grid three-up">
        <Field label="Page title" value={page.title} onChange={(value) => onChange({ title: value })} />
        <Field
          label="Page number"
          type="number"
          value={String(page.pageNumber)}
          onChange={(value) => onChange({ pageNumber: Number(value) || 0 })}
        />
        <Field label="Location" value={page.location} onChange={(value) => onChange({ location: value })} />
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
        <span>Panel plan</span>
        <strong>{page.panels.length} planned panels</strong>
      </div>
      <div className="shot-grid">
        {page.panels.map((panel) => (
          <div className="shot-card" key={panel.id}>
            <div className="field-grid">
              <Field
                label="Panel number"
                type="number"
                value={String(panel.panelNumber)}
                onChange={(value) => onUpdatePanel(panel.id, { panelNumber: Number(value) || 0 })}
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
              label="Prompt"
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

function splitLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

type MetricCardProps = { label: string; value: string }

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="metric-card">
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
}

function Field({ label, value, onChange, type = 'text' }: FieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
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
