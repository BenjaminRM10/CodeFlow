import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    gradient: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, gradient }) => {
    return (
        <Card className="relative overflow-hidden bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
            <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
                        {React.cloneElement(icon as React.ReactElement, {
                            className: 'w-6 h-6 text-white',
                        })}
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-400 mb-1">{label}</p>
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
