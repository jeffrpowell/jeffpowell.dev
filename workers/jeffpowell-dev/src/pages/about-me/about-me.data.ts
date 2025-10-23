export interface Hobby {
  text: string;
  url?: string;
}

export const HOBBIES: Hobby[] = [
  {
    text: 'board games',
    url: 'https://boardgamegeek.com/collection/user/cpu3140?sort=rating&sortdir=desc&rankobjecttype=subtype&rankobjectid=1&columns=title%7Cstatus%7Cversion%7Crating%7Cbggrating%7Ccomment%7Ccommands&geekranks=Board%20Game%20Rank&own=1&objecttype=thing&ff=1&subtype=boardgame'
  },
  { text: 'singing' },
  { text: 'piano' },
  { text: 'puzzles' },
  { text: 'cooking' },
  { text: 'baking' },
  { text: 'panoramic photography', url: 'https://www.deviantart.com/cpu3140/gallery' },
  { text: 'road biking' },
  { text: 'skiing' },
  { text: 'musicals' },
  { text: 'woodworking' },
  { text: 'hiking' },
  { text: 'video post-production' },
  { text: 'reading', url: 'https://www.goodreads.com/review/list/29680027-jeff-powell?ref=nav_mybooks&shelf=read&sort=date_read' },
  { text: 'podcasts' },
  { text: 'video games', url: 'https://steamcommunity.com/profiles/76561198093895995/games/?tab=all' }
];
