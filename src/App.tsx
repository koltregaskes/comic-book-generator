import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import {
  exportProjectPackage,
  formatPanelCount,
  parseProjectPackage,
  slugify,
  type ComicBookProjectPackage,
  type ComicPage,
  type ComicPromptPack,
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

  const addPage = () => {
    updateProject((current) => {
      const page: ComicPage = {
        id: crypto.randomUUID(),
        pageNumber: current.scenes.length + 1,
        title: `Page ${current.scenes.length + 1}`,
        summary: 'Describe the story beat, reveal, or transition on this page.',
        panelCount: 5,
        panelPlan: 'Panel 1: establish. Panel 2: action. Panel 3: reaction. Panel 4: escalation.',
        dialogueNotes: '',
        letteringNotes: '',
      }

      return {
        ...current,
        scenes: [...current.scenes, page],
        updatedAt: new Date().toISOString(),
      }
    })
  }

  const addPromptPack = () => {
    updateProject((current) => {
      const pack: ComicPromptPack = {
        id: crypto.randomUUID(),
        label: `Prompt Pack ${current.prompts.length + 1}`,
        coverPrompt: 'Write the cover prompt here.',
        pagePrompt: 'Write the page style prompt here.',
        continuityNotes: 'Describe palette, costume, props, and environment continuity.',
      }

      return {
        ...current,
        prompts: [...current.prompts, pack],
        updatedAt: new Date().toISOString(),
      }
    })
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

  const handleExport = () => exportProjectPackage(project)
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

  const metrics = useMemo(() => {
    const totalPanels = project.scenes.reduce((sum, page) => sum + page.panelCount, 0)
    return {
      pages: project.scenes.length,
      panels: totalPanels,
      promptPacks: project.prompts.length,
      characters: project.inputs.characterContinuity.length,
    }
  }, [project])

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Issue Builder</span>
          <h1>Comic Book Generator</h1>
          <p>
            Shape a concept into a full comic issue package with page planning, panel structure,
            character continuity, lettering notes, and exportable prompt packs.
          </p>
          <div className="hero-actions">
            <button onClick={handleExport}>Export Package</button>
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
          <MetricCard label="Prompt Packs" value={String(metrics.promptPacks)} />
          <MetricCard label="Characters" value={String(metrics.characters)} />
        </div>
      </header>

      <main className="workspace-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Issue Setup</span>
              <h2>Concept and continuity</h2>
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
              value={String(project.inputs.issueNumber)}
              type="number"
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
            label="Logline and issue objective"
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
            label="Character continuity"
            value={project.inputs.characterContinuity.join('\n')}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                inputs: {
                  ...current.inputs,
                  characterContinuity: value.split('\n').map((line) => line.trim()).filter(Boolean),
                },
                updatedAt: new Date().toISOString(),
              }))
            }
          />
          <TextArea
            label="World and lettering notes"
            value={project.inputs.worldNotes}
            onChange={(value) =>
              updateProject((current) => ({
                ...current,
                inputs: { ...current.inputs, worldNotes: value },
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
                notes: value
                  .split('\n')
                  .map((line) => line.trim())
                  .filter(Boolean),
                updatedAt: new Date().toISOString(),
              }))
            }
          />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">Pages</span>
              <h2>Page and panel planner</h2>
            </div>
            <button className="secondary" onClick={addPage}>
              Add Page
            </button>
          </div>
          <div className="stack-list">
            {project.scenes.map((page, index) => (
              <article className="stack-card" key={page.id}>
                <div className="field-grid">
                  <Field
                    label="Page title"
                    value={page.title}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, title: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <Field
                    label="Panel count"
                    type="number"
                    value={String(page.panelCount)}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, panelCount: Number(value) || 0 } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
                <TextArea
                  label="Page summary"
                  value={page.summary}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      scenes: current.scenes.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, summary: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <TextArea
                  label="Panel plan"
                  value={page.panelPlan}
                  onChange={(value) =>
                    updateProject((current) => ({
                      ...current,
                      scenes: current.scenes.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, panelPlan: value } : item,
                      ),
                      updatedAt: new Date().toISOString(),
                    }))
                  }
                />
                <div className="field-grid">
                  <TextArea
                    label="Dialogue notes"
                    value={page.dialogueNotes}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, dialogueNotes: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                  <TextArea
                    label="Lettering notes"
                    value={page.letteringNotes}
                    onChange={(value) =>
                      updateProject((current) => ({
                        ...current,
                        scenes: current.scenes.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, letteringNotes: value } : item,
                        ),
                        updatedAt: new Date().toISOString(),
                      }))
                    }
                  />
                </div>
              </article>
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
                <div className="stack-header">
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

type MetricCardProps = {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
