import { createComicBookProject, type ComicBookProjectPackage } from './project-package'

export const sampleComicBookProject: ComicBookProjectPackage = createComicBookProject(
  'Neon Tomb Issue One',
  {
    summary:
      'A relic thief breaks into a drowned city archive and discovers a living map that rewrites everyone who touches it.',
    status: 'ready-for-review',
    inputs: {
      issueNumber: 1,
      seriesTitle: 'Neon Tomb',
      genre: 'Sci-fi thriller',
      logline: 'A heist in a flooded future archive turns into a fight over memory and identity.',
      worldNotes:
        'Keep the city luminous and decayed. Every environment should feel half sacred, half industrial.',
      characterContinuity: ['Vera: cobalt coat, scar over brow', 'Archivist drone: silver shell, red lens'],
    },
    scenes: [
      {
        id: 'page-1',
        pageNumber: 1,
        title: 'Cold Open',
        summary: 'Vera descends through ruined scaffolding toward the submerged archive entrance.',
        panelCount: 5,
        panelPlan: 'Establish skyline, descent, close-up on scanner, flooded door, title reveal.',
        dialogueNotes: 'Minimal dialogue, rely on captions for atmosphere.',
        letteringNotes: 'Use thin captions with generous negative space.',
      },
      {
        id: 'page-2',
        pageNumber: 2,
        title: 'The Living Map',
        summary: 'The archive interior reveals a map that shifts across the walls and onto Vera’s hands.',
        panelCount: 6,
        panelPlan: 'Slow reveal from wide shot to hand detail to the map waking up.',
        dialogueNotes: 'Let the map speak in fragmented glyph captions.',
        letteringNotes: 'Distinct glyph style for the map voice.',
      },
    ],
    prompts: [
      {
        id: 'prompt-pack-1',
        label: 'Core issue pack',
        coverPrompt:
          'Graphic novel cover, flooded neon archive, lone thief framed against luminous glyph map, dramatic contrast, premium comic painting style.',
        pagePrompt:
          'Cinematic comic interior art with clean panel readability, futuristic ruins, wet reflections, bold silhouettes, consistent costume continuity.',
        continuityNotes: 'Always keep the archive glyph system cyan-white and the city lighting magenta-blue.',
      },
    ],
    outputs: [
      {
        id: 'output-1',
        label: 'Issue package',
        status: 'planned',
        target: 'Comic package JSON export',
      },
    ],
    metrics: {
      targetPages: 24,
      coverVariants: 3,
    },
    notes: ['Preserve the archive glyph design language across every page.'],
  },
)
