import { NewsArticle } from '@/src/store/useDashboardStore';

const CACHE_KEY = 'news_cache';
const CACHE_TIME = 15 * 60 * 1000; // 15 mins

export const fetchNews = async (): Promise<NewsArticle[]> => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < CACHE_TIME) {
      return parsed.articles;
    }
  }

// No API key required for Spaceflight News API
  try {
    let res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?limit=10`);

    if (!res.ok) throw new Error('Failed to fetch from news providers');
    const data = await res.json();
    
    let articles: NewsArticle[] = [];
    
    if (data.results) {
        articles = data.results.map((a: any) => ({
            title: a.title,
            source: a.news_site || 'Unknown',
            author: 'Unknown',
            date: a.published_at,
            image: a.image_url || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            description: a.summary || 'No description available',
            url: a.url,
            category: 'Space'
        }));
    }

    // Filter out removed articles
    articles = articles.filter(a => a.title !== '[Removed]');

    if (articles.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), articles }));
    }

    return articles.slice(0, 10);
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return getPlaceholderNews();
  }
};

function getPlaceholderNews(): NewsArticle[] {
    return [
        {
            title: "SpaceX successfully launches another batch of Starlink satellites",
            source: "Space News",
            author: "John Doe",
            date: new Date().toISOString(),
            image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "The Falcon 9 rocket reliably delivered satellites into low Earth orbit.",
            url: "#",
            category: "Space"
        },
        {
            title: "AI models are becoming more efficient at edge devices",
            source: "Tech Crunch",
            author: "Jane Smith",
            date: new Date(Date.now() - 3600000).toISOString(),
            image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "New techniques in quantization are allowing large language models to run on phones.",
            url: "#",
            category: "Technology"
        },
        {
            title: "Global markets show resilience amid inflation concerns",
            source: "Financial Times",
            author: "Alice Johnson",
            date: new Date(Date.now() - 7200000).toISOString(),
            image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Investors remain cautiously optimistic as central banks signal potential rate adjustments.",
            url: "#",
            category: "Finance"
        },
        {
            title: "New species of deep-sea jellyfish discovered",
            source: "National Geographic",
            author: "Bob Wilson",
            date: new Date(Date.now() - 86400000).toISOString(),
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "Marine biologists have found a stunning new jellyfish species in the Mariana Trench.",
            url: "#",
            category: "Science"
        },
        {
            title: "The rise of electric vertical takeoff vehicles",
            source: "Wired",
            author: "Eve Adams",
            date: new Date(Date.now() - 172800000).toISOString(),
            image: "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            description: "eVTOL companies are inching closer to commercialization in major cities.",
            url: "#",
            category: "Technology"
        }
    ];
}
