import { create } from 'zustand';

export interface ISSPosition {
  lat: number;
  lon: number;
  timestamp: number;
  speed?: number; // km/h
  locationName?: string;
}

export interface NewsArticle {
  title: string;
  source: string;
  author: string;
  date: string;
  image: string;
  description: string;
  url: string;
  category?: string;
}

interface DashboardState {
  // ISS State
  issPath: ISSPosition[];
  currentIss: ISSPosition | null;
  astronauts: { name: string; craft: string }[];
  addIssPosition: (pos: ISSPosition) => void;
  setAstronauts: (astronauts: { name: string; craft: string }[]) => void;
  
  // News State
  news: NewsArticle[];
  setNews: (news: NewsArticle[]) => void;

  // General App State
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  issPath: [],
  currentIss: null,
  astronauts: [],
  addIssPosition: (pos) => set((state) => {
    const newPath = [...state.issPath, pos].slice(-15); // Keep last 15 for path
    return {
      issPath: newPath,
      currentIss: pos
    };
  }),
  setAstronauts: (astronauts) => set({ astronauts }),
  
  news: [],
  setNews: (news) => set({ news }),

  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light', // default to light
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  })
}));
