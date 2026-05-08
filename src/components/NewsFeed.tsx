import React, { useState } from 'react';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchNews } from '@/src/services/newsService';

export const NewsFeed = () => {
    const { news, setNews } = useDashboardStore();
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'source'>('date');
    const [expandedNews, setExpandedNews] = useState<number[]>([]);

    const handleRefresh = async () => {
        setLoading(true);
        localStorage.removeItem('news_cache');
        try {
            const freshNews = await fetchNews();
            setNews(freshNews);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    let filteredNews = [...news];

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filteredNews = filteredNews.filter(item => 
            item.title.toLowerCase().includes(q) || 
            item.description.toLowerCase().includes(q) ||
            item.source.toLowerCase().includes(q)
        );
    }

    if (sortBy === 'date') {
        filteredNews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
        filteredNews.sort((a, b) => a.source.localeCompare(b.source));
    }

    const toggleExpand = (index: number) => {
        if (expandedNews.includes(index)) {
            setExpandedNews(expandedNews.filter(i => i !== index));
        } else {
            setExpandedNews([...expandedNews, index]);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 relative h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold dark:text-white">Breaking News</h3>
                <button 
                    onClick={handleRefresh} 
                    disabled={loading}
                    className="px-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white font-medium text-sm flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            
            <div className="flex gap-4 mb-4">
                <input 
                    type="text" 
                    placeholder="Search title, source, author..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                >
                    <option value="date">Sort by Date</option>
                    <option value="source">Sort by Source</option>
                </select>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 h-[400px]">
                {loading && news.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Loading space news...</div>
                ) : filteredNews.length > 0 ? (
                    filteredNews.map((article, i) => {
                        const isExpanded = expandedNews.includes(i);
                        return (
                            <div key={i} className={`flex-shrink-0 overflow-hidden border ${isExpanded ? 'border-red-300 dark:border-red-500/50 bg-red-50/10' : 'border-gray-200 dark:border-gray-800'} rounded-lg p-2 transition-all relative`}>
                                <div className="flex gap-4 cursor-pointer" onClick={() => toggleExpand(i)}>
                                    <div className="relative w-16 h-16 sm:w-24 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded flex-shrink-0">
                                        <img 
                                            src={article.image || 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                                            alt=""
                                            className="w-full h-full object-cover rounded"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                                        />
                                        <div className="absolute -top-2 -left-2 w-5 h-5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0 py-1">
                                        <div className="flex justify-between items-start mb-1 text-[11px] sm:text-xs">
                                            <div className="flex gap-2 items-center flex-wrap">
                                                <span className="font-bold text-blue-500 uppercase tracking-wide">{article.source}</span>
                                                <span className="text-gray-500">
                                                    {article.date && !isNaN(new Date(article.date).getTime()) ? format(new Date(article.date), 'dd/MMM/yyyy, HH:mm') : 'UNKNOWN'}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className={`text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 leading-snug ${isExpanded ? '' : 'line-clamp-2'}`}>
                                            {article.title}
                                        </h4>
                                        {isExpanded && (
                                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                <p className="mb-2">{article.description}</p>
                                                <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-block mt-1">
                                                    Read full article
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 pl-2">
                                        <button className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${isExpanded ? 'bg-red-100 text-red-500 dark:bg-red-500/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        {searchQuery ? 'No matches found.' : 'No articles available.'}
                    </div>
                )}
            </div>
        </div>
    );
};
