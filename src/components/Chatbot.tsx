import React, { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { queryChatbot, ChatMessage } from '@/src/services/chatService';
import { Send, Trash2, Loader2, Settings, X, MessageSquare } from 'lucide-react';

const CHAT_STORAGE_KEY = 'chatbot_messages';

export const Chatbot = ({ onClose }: { onClose?: () => void }) => {
    const { currentIss, news } = useDashboardStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [hfToken, setHfToken] = useState('');

    useEffect(() => {
        const storedToken = localStorage.getItem('hf_token');
        if (storedToken) setHfToken(storedToken);

        const stored = localStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setMessages(parsed.slice(-30));
                }
            } catch (e) {
                console.error("Failed to parse chat messages", e);
            }
        } else {
            setMessages([{ role: 'assistant', content: 'Hello! I can answer questions about the ISS location, speed, or the latest news shown on this dashboard. Ask me anything!' }]);
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-30)));
        }
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleClear = () => {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        setMessages([{ role: 'assistant', content: 'Chat history cleared. How can I help you today?' }]);
    };

    const handleSaveToken = () => {
        if (hfToken) {
            localStorage.setItem('hf_token', hfToken);
        } else {
            localStorage.removeItem('hf_token');
        }
        setShowSettings(false);
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        const trimmedInput = input.trim();
        if (!trimmedInput || isTyping) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmedInput }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const contextStr = `
CURRENT ISS STATE:
Latitude: ${currentIss?.lat?.toFixed(4) || 'Unknown'}
Longitude: ${currentIss?.lon?.toFixed(4) || 'Unknown'}
Speed: ${currentIss?.speed ? Math.round(currentIss.speed) : 'Unknown'} km/h
Location Over: ${currentIss?.locationName || 'Unknown'}

LATEST NEWS HEADLINES:
${news.slice(0, 5).map(n => `- ${n.title} (Source: ${n.source})`).join('\n')}
Total articles fetched: ${news.length}
            `.trim();

            const response = await queryChatbot(newMessages, contextStr);
            
            let replyContent = "Sorry, I couldn't process that.";
            
            if (response && response.choices && response.choices.length > 0) {
                replyContent = response.choices[0].message.content;
            } else if (response && response.error) {
                replyContent = `Error: ${response.error}`;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: replyContent }]);
            
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Connection error or missing API key. Please check your network and Hugging Face token." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#111113] overflow-hidden relative rounded-xl font-sans">
            <div className="bg-blue-600 p-3 sm:p-4 text-white flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-tight">AI Assistant</h3>
                        <div className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowSettings(true)} className="p-1.5 hover:bg-white/20 rounded transition-colors" title="Settings">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={handleClear} className="p-1.5 hover:bg-white/20 rounded transition-colors" title="Clear Chat">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {onClose && (
                        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded transition-colors" title="Close Chat">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {showSettings && (
                <div className="absolute inset-0 bg-white/95 dark:bg-black/95 z-10 flex flex-col p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">API Configuration</h4>
                        <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Enter your Hugging Face Access Token to enable the AI chatbot. Get one from your account settings.</p>
                    <input 
                        type="password"
                        value={hfToken}
                        onChange={(e) => setHfToken(e.target.value)}
                        placeholder="hf_..."
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white mb-6"
                    />
                    <button onClick={handleSaveToken} className="bg-blue-600 text-white text-sm font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        Save Configuration
                    </button>
                </div>
            )}

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 bg-gray-50 dark:bg-black/20">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role !== 'user' && (
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0 mt-1">
                                <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            </div>
                        )}
                        <div className={`${
                            msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl' 
                                : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-r-2xl rounded-tl-2xl shadow-sm'
                        } py-2.5 px-4 text-sm max-w-[85%] leading-relaxed`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex gap-2 justify-start">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center shrink-0 mt-1">
                            <MessageSquare className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-2.5 px-4 rounded-r-2xl rounded-tl-2xl shadow-sm flex items-center gap-2">
                            <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="pb-1" />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#111113] border-t border-gray-100 dark:border-gray-800 flex gap-2 items-center">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-gray-100 dark:bg-gray-900 border-none text-sm px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder:text-gray-500 transition-shadow"
                    disabled={isTyping}
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shrink-0 shadow-sm"
                >
                    <Send className="w-4 h-4 ml-0.5" />
                </button>
            </form>
        </div>
    );
};
