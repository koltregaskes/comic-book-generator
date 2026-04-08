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
      creativeGoal:
        'Build a comic package that can drive prompt writing, still-image generation, and later motion-comic adaptation.',
      primaryGenerator: 'Offline prompt builder',
      secondaryGenerator: 'Midjourney background runner',
      publishingGoal: 'Create the issue package, cover variants, and reusable prompt bible.',
      characterRoster: [
        {
          id: 'vera',
          name: 'Vera',
          role: 'Lead thief',
          look: 'Cobalt coat, scar over brow, stolen relic satchel.',
          continuityRules:
            'Always keep the coat wet and reflective. Her scar should stay visible in three-quarter views.',
          visualHooks: 'Sharp silhouette, cobalt reflections, relic satchel, brow scar.',
        },
        {
          id: 'archivist-drone',
          name: 'Archivist Drone',
          role: 'Archive guide / threat',
          look: 'Silver shell, red lens, hanging antenna arrays.',
          continuityRules:
            'Keep the drone small against the architecture so the scale of the archive stays dominant.',
          visualHooks: 'Tiny against colossal sets, silver shell, single red lens.',
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
        label: 'Archive cover key art',
        type: 'Cover image',
        source: 'Midjourney background runner',
        status: 'queued',
        promptPackId: 'prompt-pack-1',
        deliveryLane: 'Cover',
        notes: 'Queue three cover variants once the negative prompt is locked.',
      },
      {
        id: 'asset-2',
        label: 'Interior page stills',
        type: 'Page generation set',
        source: 'Midjourney background runner',
        status: 'prompt-ready',
        promptPackId: 'prompt-pack-1',
        deliveryLane: 'Interiors',
        notes: 'Run after character continuity pass is approved.',
      },
    ],
    prompts: [
      {
        id: 'prompt-pack-1',
        label: 'Core issue pack',
        purpose: 'Main cover and page generation pipeline',
        generator: 'Offline prompt builder + Midjourney',
        status: 'prompt-ready',
        coverPrompt:
          'Graphic novel cover, flooded neon archive, lone thief framed against luminous glyph map, dramatic contrast, premium comic painting style.',
        pagePrompt:
          'Cinematic comic interior art with clean panel readability, futuristic ruins, wet reflections, bold silhouettes, consistent costume continuity.',
        negativePrompt: 'blurry faces, inconsistent costume details, muddy hands, unreadable silhouettes',
        continuityNotes:
          'Always keep the archive glyph system cyan-white and the city lighting magenta-blue.',
        targetAsset: 'Archive cover key art',
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
      {
        id: 'output-2',
        label: 'Cover variants',
        status: 'queued',
        target: 'Three cover prompt variations',
        format: 'png',
        notes: 'Use for cover selection and social reveal.',
      },
    ],
    metrics: {
      targetPages: 24,
      coverVariants: 3,
      aiRunbook:
        'Build prompt packs offline first, queue approved assets to Midjourney in the background, then review stills before promoting them into the issue package.',
      reviewFocus: [
        'Character continuity before page 4.',
        'Readable silhouettes in every action panel.',
        'Archive glyph system must stay consistent.',
      ],
    },
    notes: [
      'Preserve the archive glyph design language across every page.',
      'Give Vera one iconic silhouette frame on every fourth page.',
    ],
  },
)
