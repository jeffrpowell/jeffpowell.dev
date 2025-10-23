// About Me page functionality
import './about-me.css';
import { PageInterface } from '../page';
import { HOBBIES } from './about-me.data';

export class AboutMePage extends PageInterface {
    // Hobbies data
    private hobbies = HOBBIES;

    constructor() {
        super();
    }

    init(): void {
        // Populate hobbies list
        const hobbiesList = document.getElementById('hobbies-list');
        if (!hobbiesList) return;
        
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

    destroy(): void {
        // Cleanup if needed
    }

    // Randomize the order of hobbies
    private randomizeList<T>(list: T[]): T[] {
        const sortKeys: number[] = [];
        const mapping = new Map<number, T>();
        
        list.forEach(item => {
            const r = Math.random();
            sortKeys.push(r);
            mapping.set(r, item);
        });
        
        sortKeys.sort((a, b) => a - b);
        return sortKeys.map(r => mapping.get(r)!);
    }

    // Format text to sentence case
    private toSentenceCase(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }
}
