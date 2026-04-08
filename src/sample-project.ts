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
      arcSummary:
        'Issue one opens the archive, wakes the map, and ends with Vera realising the city has started editing her memories in return.',
      visualLanguage:
        'Dense shadows, neon water reflections, premium European-comic composition, and clean readable silhouettes.',
      worldNotes:
        'Keep the city luminous and decayed. Every environment should feel half sacred, half industrial.',
      characterRoster: [
        {
          id: 'vera',
          name: 'Vera',
          role: 'Lead thief',
          look: 'Cobalt coat, scar over brow, stolen relic satchel.',
          continuityRules: 'Always keep the coat wet and reflective. Her scar should stay visible in three-quarter views.',
        },
        {
          id: 'archivist-drone',
          name: 'Archivist Drone',
          role: 'Archive guide / threat',
          look: 'Silver shell, red lens, hanging antenna arrays.',
          continuityRules: 'Keep the drone small against the architecture so the scale of the archive stays dominant.',
        },
      ],
    },
    scenes: [
      {
        id: 'page-1',
        pageNumber: 1,
        title: 'Cold Open',
        summary: 'Vera descends through ruined scaffolding toward the submerged archive entrance.',
        panelCount: 4,
        location: 'Exterior archive',
        turnMoment: 'Reveal the flooded archive door as the first real threat.',
        dialogueNotes: 'Minimal dialogue. Let captions do the atmosphere work.',
        letteringNotes: 'Thin captions with generous negative space.',
        panels: [
          {
            id: 'page-1-panel-1',
            panelNumber: 1,
            framing: 'Wide establish',
            action: 'Show the drowned skyline and the archive ruin beyond.',
            dialogue: '',
            caption: 'The city keeps its dead in water.',
            prompt:
              'Wide comic panel, drowned neon skyline, monumental archive ruin, premium graphic novel painting.',
          },
          {
            id: 'page-1-panel-2',
            panelNumber: 2,
            framing: 'Medium descent',
            action: 'Vera climbs down fractured scaffold lines.',
            dialogue: '',
            caption: '',
            prompt:
              'Comic panel of lead thief descending twisted scaffolding into neon mist, elegant composition, reflective water below.',
          },
        ],
      },
      {
        id: 'page-2',
        pageNumber: 2,
        title: 'The Living Map',
        summary: 'The archive interior reveals a map that shifts across the walls and onto Vera’s hands.',
        panelCount: 5,
        location: 'Archive interior',
        turnMoment: 'The map responds to Vera and changes the room.',
        dialogueNotes: 'Let the glyph voice stay fragmented and unsettling.',
        letteringNotes: 'Distinct glyph style for the map voice.',
        panels: [
          {
            id: 'page-2-panel-1',
            panelNumber: 1,
            framing: 'Wide reveal',
            action: 'The map glows across the archive walls.',
            dialogue: '',
            caption: '',
            prompt:
              'Wide interior comic panel, luminous glyph map unfolding across archive walls, flooded tech-cathedral atmosphere.',
          },
          {
            id: 'page-2-panel-2',
            panelNumber: 2,
            framing: 'Close-up',
            action: 'Glyphs crawl onto Vera’s wet hands.',
            dialogue: '...OPEN...',
            caption: '',
            prompt:
              'Close-up comic panel of glowing glyphs crawling across wet hands, eerie cyan light, premium sci-fi comic art.',
          },
        ],
      },
    ],
    assets: [
      {
        id: 'asset-1',
        label: 'Archive moodboard',
        type: 'reference',
        status: 'ready',
        notes: 'Wet architecture, broken catwalks, glyph walls, cathedral scale.',
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
        continuityNotes:
          'Always keep the archive glyph system cyan-white and the city lighting magenta-blue.',
      },
    ],
    outputs: [
      {
        id: 'output-1',
        label: 'Issue package',
        status: 'planned',
        target: 'Comic package JSON export',
      },
      {
        id: 'output-2',
        label: 'Cover variants',
        status: 'planned',
        target: 'Three cover prompt variations',
      },
    ],
    metrics: {
      targetPages: 24,
      coverVariants: 3,
    },
    notes: [
      'Preserve the archive glyph design language across every page.',
      'Give Vera one iconic silhouette frame on every fourth page.',
    ],
  },
)
