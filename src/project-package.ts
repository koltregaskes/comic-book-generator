export type CreativeProjectType =
  | 'music-video'
  | 'comic-book-video'
  | 'comic-book'
  | 'creative-canvas-workflow'
  | 'planning-estimate'

export type ComicPage = {
  id: string
  pageNumber: number
  title: string
  summary: string
  panelCount: number
  panelPlan: string
  dialogueNotes: string
  letteringNotes: string
}

export type ComicPromptPack = {
  id: string
  label: string
  coverPrompt: string
  pagePrompt: string
  continuityNotes: string
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
  inputs: {
    issueNumber: number
    seriesTitle: string
    genre: string
    logline: string
    worldNotes: string
    characterContinuity: string[]
  }
  scenes: ComicPage[]
  assets: {
    id: string
    label: string
    type: string
    status: string
    notes: string
  }[]
  prompts: ComicPromptPack[]
  outputs: {
    id: string
    label: string
    status: string
    target: string
  }[]
  metrics: Record<string, unknown>
  notes: string[]
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createComicBookProject(
  title: string,
  partial?: Partial<ComicBookProjectPackage>,
): ComicBookProjectPackage {
  const now = new Date().toISOString()
  return {
    formatVersion: 'creative-project-package-v1',
    projectType: 'comic-book',
    title,
    slug: slugify(title),
    summary: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    inputs: {
      issueNumber: 1,
      seriesTitle: '',
      genre: '',
      logline: '',
      worldNotes: '',
      characterContinuity: [],
    },
    scenes: [],
    assets: [],
    prompts: [],
    outputs: [],
    metrics: {},
    notes: [],
    ...partial,
  }
}

export function parseProjectPackage(raw: string): ComicBookProjectPackage {
  const parsed = JSON.parse(raw) as Partial<ComicBookProjectPackage>
  if (parsed.formatVersion !== 'creative-project-package-v1' || parsed.projectType !== 'comic-book') {
    throw new Error('Expected a comic-book creative-project-package-v1 file.')
  }

  return createComicBookProject(parsed.title ?? 'Imported Comic Project', {
    ...parsed,
    inputs: {
      issueNumber: 1,
      seriesTitle: '',
      genre: '',
      logline: '',
      worldNotes: '',
      characterContinuity: [],
      ...(parsed.inputs ?? {}),
    },
    scenes: Array.isArray(parsed.scenes) ? parsed.scenes : [],
    assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    prompts: Array.isArray(parsed.prompts) ? parsed.prompts : [],
    outputs: Array.isArray(parsed.outputs) ? parsed.outputs : [],
    metrics: parsed.metrics ?? {},
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
  })
}

export function exportProjectPackage(project: ComicBookProjectPackage) {
  const file = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.slug || 'comic-book-project'}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function formatPanelCount(value: number) {
  return `${value} total`
}
