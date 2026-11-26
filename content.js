// Keep full movies outside Git; configure the public hosted film here.
export const film = {
  url: 'https://media.strikeout.us/films/ghost-town-1080p-20261015.mp4',
  title: 'Ghost Town — a short film by Matteo Salvadei',
  poster: '/assets/ghost-town-poster.jpg',
};

export const menuPages = [
  {
    slug: 'studios', title: 'Studios',
    note: 'Strikeout Studios is an interdisciplinary production studio developing original media and IP that transcends individual mediums.',
  },
  {
    slug: 'ssc', title: 'Service', mark: 'service',
    note: 'Student Service Corp is a 501(c)3 not-for-profit championing grassroots community projects across the United States with a focus on youth, the unhoused, and sustainability.',
  },
  {
    slug: 'dopo', title: 'Dopo',
    note: 'Dopo is a personalized intelligence company building Venice (!!), a self-improving local model with proprietary architecture trained in-house.',
  },
  {
    slug: 'formal', title: 'Formal',
    note: 'FORMAL is a sustainable design label working across art, architecture, fashion, and media, supported by desert FORMAL, a live broadcasting and distribution network.',
  },
  {
    slug: 'about', title: 'About', mark: 'flower',
    note: 'STRIKEOUT is an independent holding company and venture development ecosystem for SPs and small businesses building SUMMER. Superintelligence (the good kind). Urban development and architecture. Media (inclusive). Manufacturing and design. Events and community. Retail and consumer product.',
  },
];

export const pages = [...menuPages, { slug: 'catalog', title: 'Catalog' }];
