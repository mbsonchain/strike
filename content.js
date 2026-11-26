// Keep full movies outside Git; configure the public hosted film here.
export const film = {
  url: 'https://media.strikeout.us/films/ghost-town-1080p-20261015.mp4',
  title: 'Ghost Town — a short film by Matteo Salvadei',
  poster: '/assets/ghost-town-poster.jpg',
};

export const menuPages = [
  {
    slug: 'studios', title: 'Studios', backgroundColor: '#799dbb',
    scenery: { image: '/assets/strikeout-sky.jpg' },
    note: {
      opening: 'Strikeout Studios is an interdisciplinary production studio',
      continuation: 'developing original media and IP that transcends individual mediums.',
      closing: { art: 'studios-signoff', text: 'people over platforms!' },
    },
  },
  {
    slug: 'ssc', title: 'Service', mark: 'service', backgroundColor: '#000000',
    note: {
      opening: 'Student Service Corp is a 501(c)3 not-for-profit championing grassroots community projects',
      continuation: 'across the United States with a focus on youth, the unhoused, and sustainability.',
      closing: { art: 'ssc-site', text: 'studentservicecorp.org', href: 'https://studentservicecorp.org/' },
    },
  },
  {
    slug: 'dopo', title: 'Dopo', backgroundColor: '#fbae9d',
    note: {
      opening: 'Dopo is a personalized intelligence company building Venice (!!),',
      continuation: 'a self-improving local model with proprietary architecture trained in-house.',
      closing: { art: 'dopo-site', text: 'getdopo.com', href: 'https://getdopo.com/' },
    },
  },
  {
    slug: 'formal', title: 'Formal', backgroundColor: '#cbb98f',
    scenery: { image: '/assets/formal-camo-landscape.jpg', portrait: '/assets/formal-camo-portrait.jpg' },
    note: {
      opening: 'FORMAL is a sustainable design label working across art, architecture, fashion, and media,',
      continuation: 'supported by desert FORMAL, a live broadcasting and distribution network.',
      closing: { art: 'formal-site', text: 'desertformal.com', href: 'https://desertformal.com/' },
    },
  },
  {
    slug: 'about', title: 'About', mark: 'flower', backgroundColor: '#ffffff',
    note: {
      opening: 'STRIKEOUT is an independent holding company and',
      continuation: 'venture development ecosystem for SPs and small businesses building SUMMER.',
      closing: { art: 'summer', text: 'Superintelligence (the good kind). Urban development and architecture. Media (inclusive). Manufacturing and design. Events and community. Retail and consumer product.' },
    },
  },
];

export const pages = [...menuPages, { slug: 'catalog', title: 'Catalog' }];
