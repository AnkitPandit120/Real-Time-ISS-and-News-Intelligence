import React, { useEffect, useState } from 'react';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { fetchISSPosition, fetchAstronauts } from '@/src/services/issService';
import { fetchNews } from '@/src/services/newsService';
import { IssMap } from './components/IssMap';
import { IssSpeedChart } from './components/DashboardCharts';
import { NewsFeed } from './components/NewsFeed';
import { Chatbot } from './components/Chatbot';
import { MessageSquare, RefreshCw } from 'lucide-react';

function App() {
  const { theme, toggleTheme, addIssPosition, currentIss, setAstronauts, setNews, astronauts, issPath } = useDashboardStore();
  const [initialLoading, setInitialLoading] = useState(true);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    let mounted = true;
    fetchNews().then(news => {
      if (mounted) setNews(news);
    });
    fetchAstronauts().then(astros => {
      if (mounted) setAstronauts(astros);
    });
    return () => { mounted = false; };
  }, [setNews, setAstronauts]);

  // ISS Polling
  useEffect(() => {
    let mounted = true;

    const pollISS = async () => {
      if (isAutoRefresh || initialLoading) {
        // Use getState to get latest without adding to dependency array
        const latestIss = useDashboardStore.getState().currentIss;
        const pos = await fetchISSPosition(latestIss || undefined);
        if (mounted && pos) {
          addIssPosition(pos);
          if (initialLoading) setInitialLoading(false);
        }
      }
    };

    pollISS();
    
    // Auto Refresh Every 15 Seconds
    const interval = setInterval(() => {
      pollISS();
    }, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [isAutoRefresh, initialLoading, addIssPosition]);

  const handleRefreshNow = async () => {
    const pos = await fetchISSPosition(currentIss || undefined);
    if (pos) addIssPosition(pos);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  return (
    <div className={`min-h-screen w-full relative ${theme === 'dark' ? 'dark bg-[#050505]' : 'bg-[#faf8f5] text-gray-900'}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-start mt-2">
          <div>
            <h2 className="text-blue-500 font-bold text-[10px] sm:text-xs tracking-widest uppercase mb-1">Mission Control Dashboard</h2>
            <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-gray-900 tracking-tight">Real-Time ISS and News Intelligence</h1>
          </div>
          <div className="relative">
            {showTooltip && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg z-50">
                Switched to {theme === 'light' ? 'light' : 'dark'} mode.
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45"></div>
              </div>
            )}
            <button 
              onClick={handleToggleTheme}
              className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 text-sm font-medium px-4 py-2 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - ISS & News */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* ISS Tracking Card */}
            <div className="bg-white dark:bg-[#111113] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold dark:text-white">ISS Live Tracking</h3>
                <div className="flex gap-3 text-sm">
                  <button onClick={handleRefreshNow} className="px-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white font-medium flex items-center gap-2">
                    <RefreshCw className="w-3 h-3" /> Refresh Now
                  </button>
                  <button onClick={() => setIsAutoRefresh(!isAutoRefresh)} className="px-4 py-1.5 border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white font-medium">
                    Auto-Refresh: {isAutoRefresh ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="border border-gray-100 dark:border-gray-800 bg-[#faf8f5] dark:bg-black/50 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Latitude / Longitude</div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {currentIss ? `${currentIss.lat.toFixed(3)}, ${currentIss.lon.toFixed(3)}` : '--'}
                  </div>
                </div>
                <div className="border border-gray-100 dark:border-gray-800 bg-[#faf8f5] dark:bg-black/50 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Speed</div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {currentIss?.speed ? `${currentIss.speed.toLocaleString(undefined, { maximumFractionDigits: 2 })} km/h` : '--'}
                  </div>
                </div>
                <div className="border border-gray-100 dark:border-gray-800 bg-[#faf8f5] dark:bg-black/50 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Nearest Place</div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm truncate" title={currentIss?.locationName}>
                    {currentIss?.locationName || 'Unknown'}
                  </div>
                </div>
                <div className="border border-gray-100 dark:border-gray-800 bg-[#faf8f5] dark:bg-black/50 p-4 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">Tracked Positions</div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">
                    {issPath.length}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="h-[350px] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 z-0">
                <IssMap />
              </div>
            </div>

            {/* Breaking News Card */}
            <div className="bg-white dark:bg-[#111113] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800">
               <NewsFeed />
            </div>

          </div>

          {/* Right Column - Stats & Charts */}
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-[#111113] rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-gray-800 h-[500px] flex flex-col">
              <h3 className="text-xl font-bold dark:text-white mb-6">ISS Speed Trend</h3>
              <div className="flex-1 w-full min-h-0">
                <IssSpeedChart theme={theme} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full shadow-xl flex items-center justify-center text-white z-50 transition-transform hover:scale-105"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chatbot Overlay */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-full max-w-[380px] h-[500px] bg-white dark:bg-[#111113] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 z-50 overflow-hidden flex flex-col">
          <Chatbot onClose={() => setShowChat(false)} />
        </div>
      )}
      
    </div>
  );
}

export default App;
