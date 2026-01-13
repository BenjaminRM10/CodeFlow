import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Project } from '@/types';

interface StreakTrackerProps {
    currentStreak: number;
    projects: Project[];
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ currentStreak, projects }) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
    });

    const hasPracticed = (date: Date) => {
        return projects.some(
            (p) =>
                new Date(p.createdAt || 0).toLocaleDateString() === date.toLocaleDateString()
        );
    };

    return (
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20 shadow-lg shadow-orange-900/20">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="text-4xl animate-pulse">🔥</div>
                        <div>
                            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Current Streak</p>
                            <p className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                                {currentStreak} days
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center px-4 overflow-x-auto gap-4">
                    {last7Days.map((date, i) => {
                        const practiced = hasPracticed(date);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                            <div key={i} className="flex flex-col items-center gap-3 group flex-1">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${practiced
                                        ? 'bg-green-500 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)] scale-110'
                                        : isToday
                                            ? 'bg-gray-800 border-gray-600 ring-2 ring-gray-700'
                                            : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                                        }`}
                                >
                                    {practiced && <span className="text-white font-bold text-lg drop-shadow-md">✓</span>}
                                </div>
                                <span className={`text-xs font-mono font-bold tracking-widest ${isToday ? 'text-white' : 'text-gray-500'}`}>
                                    {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
