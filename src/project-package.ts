export type CreativeProjectType =
  | 'music-video'
  | 'comic-book-video'
  | 'comic-book'
  | 'creative-canvas-workflow'
  | 'planning-estimate'

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
  coverPrompt: string
  pagePrompt: string
  continuityNotes: string
}

export type CharacterProfile = {
  id: string
  name: string
  role: string
  look: string
  continuityRules: string
}

export type ComicAsset = {
  id: string
  label: string
  type: string
  status: string
  notes: string
}

export type ComicOutput = {
  id: string
  label: string
  status: string
  target: string
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
    arcSummary: string
    visualLanguage: string
    worldNotes: string
    characterRoster: CharacterProfile[]
  }
  scenes: ComicPage[]
  assets: ComicAsset[]
  prompts: ComicPromptPack[]
  outputs: ComicOutput[]
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

function createPanel(partial?: Partial<ComicPanel>): ComicPanel {
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

function createPage(partial?: Partial<ComicPage>): ComicPage {
  const panels = Array.isArray(partial?.panels) ? partial.panels.map((panel) => createPanel(panel)) : []

  return {
    id: partial?.id ?? crypto.randomUUID(),
    pageNumber: partial?.pageNumber ?? 1,
    title: partial?.title ?? 'New page',
    summary: partial?.summary ?? '',
    panelCount: partial?.panelCount ?? (panels.length || 4),
    location: partial?.location ?? '',
    turnMoment: partial?.turnMoment ?? '',
    dialogueNotes: partial?.dialogueNotes ?? '',
    letteringNotes: partial?.letteringNotes ?? '',
    panels,
  }
}

function createCharacter(partial?: Partial<CharacterProfile>): CharacterProfile {
  return {
    id: partial?.id ?? crypto.randomUUID(),
    name: partial?.name ?? 'Character',
    role: partial?.role ?? '',
    look: partial?.look ?? '',
    continuityRules: partial?.continuityRules ?? '',
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
      characterRoster: Array.isArray(partial?.inputs?.characterRoster)
        ? partial.inputs.characterRoster.map((character) => createCharacter(character))
        : [],
    },
    scenes: Array.isArray(partial?.scenes) ? partial.scenes.map((page) => createPage(page)) : [],
    assets: Array.isArray(partial?.assets) ? partial.assets : [],
    prompts: Array.isArray(partial?.prompts) ? partial.prompts : [],
    outputs: Array.isArray(partial?.outputs) ? partial.outputs : [],
    metrics: partial?.metrics ?? {},
    notes: Array.isArray(partial?.notes) ? partial.notes.map((item) => String(item)) : [],
  }
}

export function parseProjectPackage(raw: string): ComicBookProjectPackage {
  const parsed = JSON.parse(raw) as Partial<ComicBookProjectPackage>
  if (parsed.formatVersion !== 'creative-project-package-v1' || parsed.projectType !== 'comic-book') {
    throw new Error('Expected a comic-book creative-project-package-v1 file.')
  }

  return createComicBookProject(parsed.title ?? 'Imported Comic Project', {
    ...parsed,
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
