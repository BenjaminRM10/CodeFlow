import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export const Leaderboard = () => {
    const mockLeaders = [
        { rank: 1, name: 'CodeMaster', wpm: 120, accuracy: 98 },
        { rank: 2, name: 'TypeNinja', wpm: 115, accuracy: 97 },
        { rank: 3, name: 'KeyboardWarrior', wpm: 110, accuracy: 96 },
        { rank: 4, name: 'DevGuru', wpm: 105, accuracy: 98 },
        { rank: 5, name: 'BitBurner', wpm: 102, accuracy: 95 },
        { rank: 6, name: 'SyntaxSoul', wpm: 98, accuracy: 94 },
        { rank: 7, name: 'AlgoRhythm', wpm: 95, accuracy: 96 },
        { rank: 8, name: 'PixelPush', wpm: 92, accuracy: 93 },
    ];

    return (
        <Card className="bg-gray-900/50 border-gray-800 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Global Leaderboard
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {mockLeaders.map((leader) => (
                        <div
                            key={leader.rank}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors border border-gray-700/50"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md ${leader.rank === 1
                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black'
                                        : leader.rank === 2
                                            ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black'
                                            : leader.rank === 3
                                                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                                                : 'bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    {leader.rank}
                                </div>
                                <span className="font-semibold text-gray-200">{leader.name}</span>
                            </div>
                            <div className="flex flex-col items-end text-sm font-mono gap-1">
                                <span className="text-cyan-400 font-bold">{leader.wpm} <span className="text-xs text-cyan-400/70">WPM</span></span>
                                <span className="text-green-400 font-bold">{leader.accuracy}% <span className="text-xs text-green-400/70">ACC</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
