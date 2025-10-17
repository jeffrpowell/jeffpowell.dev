// About Me page functionality
import './about-me.css';
import { PageInterface } from '../page';

export class AboutMePage extends PageInterface {
  constructor() {
    super();
    // Hobbies data
    this.hobbies = [
      {text: "board games", url: "https://boardgamegeek.com/collection/user/cpu3140?sort=rating&sortdir=desc&rankobjecttype=subtype&rankobjectid=1&columns=title%7Cstatus%7Cversion%7Crating%7Cbggrating%7Ccomment%7Ccommands&geekranks=Board%20Game%20Rank&own=1&objecttype=thing&ff=1&subtype=boardgame"},
      {text: "singing"},
      {text: "piano"},
      {text: "puzzles"},
      {text: "cooking"},
      {text: "baking"},
      {text: "panoramic photography", url: "https://www.deviantart.com/cpu3140/gallery"},
      {text: "road biking"},
      {text: "skiing"},
      {text: "musicals"},
      {text: "woodworking"},
      {text: "hiking"},
      {text: "video post-production"},
      {text: "reading", url: "https://www.goodreads.com/review/list/29680027-jeff-powell?ref=nav_mybooks&shelf=read&sort=date_read"},
      {text: "podcasts"},
      {text: "video games", url: "https://steamcommunity.com/profiles/76561198093895995/games/?tab=all"}
    ];
  }

  init() {
    // Populate hobbies list
    const hobbiesList = document.getElementById('hobbies-list');
    const randomizedHobbies = this.randomizeList(this.hobbies);
    
    hobbiesList.innerHTML = randomizedHobbies.map((hobby, index) => {
      const isLast = index === randomizedHobbies.length - 1;
      const separator = isLast ? '' : ', ';
      
      if (hobby.url) {
        return `<span><a href="${hobby.url}" target="_blank" class="text-blue-600 hover:underline">${this.toSentenceCase(hobby.text)}</a>${separator}</span>`;
      } else {
        return `<span>${this.toSentenceCase(hobby.text)}${separator}</span>`;
      }
    }).join('');
  }

  destroy() {
    
  }

  // Randomize the order of hobbies
  randomizeList(list) {
    const sortKeys = [];
    const mapping = new Map();
    
    list.forEach(item => {
      const r = Math.random();
      sortKeys.push(r);
      mapping.set(r, item);
    });
    
    sortKeys.sort((a, b) => a - b);
    return sortKeys.map(r => mapping.get(r));
  }

  // Format text to sentence case
  toSentenceCase(text) {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}