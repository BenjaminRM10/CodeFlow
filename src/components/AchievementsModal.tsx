import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/types/achievements';

interface AchievementsModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievements: Achievement[];
    unlockedIds: string[];
}

const RARITY_COLORS = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-600',
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
    isOpen,
    onClose,
    achievements,
    unlockedIds
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        <span>🏆</span> Achievements
                        <span className="text-sm font-normal text-gray-400 ml-auto">
                            {unlockedIds.length} / {achievements.length} Unlocked
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {achievements.map((achievement) => {
                        const isUnlocked = unlockedIds.includes(achievement.id);

                        return (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${isUnlocked
                                        ? `border-${achievement.rarity === 'common' ? 'gray' : achievement.rarity === 'rare' ? 'blue' : achievement.rarity === 'epic' ? 'purple' : 'yellow'}-500/50 bg-${achievement.rarity === 'common' ? 'gray' : achievement.rarity === 'rare' ? 'blue' : achievement.rarity === 'epic' ? 'purple' : 'yellow'}-500/10`
                                        : 'border-gray-800 bg-gray-900/50 opacity-50 grayscale'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl">
                                        {achievement.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{achievement.title}</h3>
                                            <Badge
                                                className={`bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} border-0`}
                                            >
                                                {achievement.rarity}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {achievement.description}
                                        </p>
                                        {isUnlocked && (
                                            <p className="text-xs text-green-400 mt-2 font-mono">
                                                Unlocked
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const UnlockNotification = ({ achievement, onClose }: { achievement: Achievement | null, onClose: () => void }) => {
    return (
        <AnimatePresence>
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="fixed bottom-8 right-8 z-[100] p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-2xl border-2 border-white/20"
                    onClick={onClose}
                >
                    <div className="flex items-center gap-4">
                        <div className="text-5xl animate-bounce">{achievement.icon}</div>
                        <div>
                            <p className="text-sm font-semibold text-white/90 uppercase tracking-widest">
                                Achievement Unlocked!
                            </p>
                            <p className="text-xl font-bold text-white shadow-black drop-shadow-md">
                                {achievement.title}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
