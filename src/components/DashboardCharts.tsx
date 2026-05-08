import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useDashboardStore } from '@/src/store/useDashboardStore';
import { format } from 'date-fns';

export const IssSpeedChart = ({ theme }: { theme?: string }) => {
    const { issPath } = useDashboardStore();

    const data = useMemo(() => {
        return issPath.filter(p => p.speed).map(p => ({
            time: format(new Date(p.timestamp * 1000), 'HH:mm:ss'),
            speed: Math.round(p.speed!)
        }));
    }, [issPath]);

    const isLight = theme !== 'dark';
    const textColor = isLight ? '#64748b' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    const lineColor = '#ef4444'; // Red line as in picture

    return (
        <div className="h-full w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={true} />
                    <XAxis 
                        dataKey="time" 
                        stroke={textColor} 
                        fontSize={10} 
                        tickMargin={15} 
                        className="mono"
                        angle={-45}
                        textAnchor="end"
                    />
                    <YAxis 
                        stroke={textColor} 
                        fontSize={10} 
                        tickFormatter={(val) => `${val.toLocaleString()}`} 
                        width={50} 
                        className="mono" 
                        domain={['auto', 'auto']} 
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: isLight ? '#ffffff' : 'rgba(0,0,0,0.8)',
                            border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '8px',
                            color: isLight ? '#1f2937' : '#ffffff',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '10px',
                            boxShadow: isLight ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                    />
                    <Line 
                        type="linear" 
                        dataKey="speed" 
                        stroke={lineColor} 
                        strokeWidth={2} 
                        dot={{ r: 2, fill: lineColor }} 
                        activeDot={{ r: 4, fill: lineColor, stroke: isLight ? '#fff' : '#050505' }} 
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const NewsDistributionChart = () => {
    const { news } = useDashboardStore();

    const data = useMemo(() => {
        const counts = news.reduce((acc, article) => {
            const cat = article.category || 'General';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [news]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const textColor = '#94a3b8';

    if (data.length === 0) {
        return <div className="h-full flex items-center justify-center text-[10px] text-gray-500 mono uppercase">No data</div>
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: `1px solid rgba(255,255,255,0.1)`,
                            borderRadius: '4px',
                            color: '#ffffff',
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '10px'
                        }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: textColor, fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
