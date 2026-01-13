export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    requirement: (stats: any) => boolean; // Using any for stats temporarily until we unify types
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-project',
        title: 'First Steps',
        description: 'Complete your first project',
        icon: '🎯',
        requirement: (stats) => stats.projectsCompleted >= 1,
        rarity: 'common',
    },
    {
        id: 'speed-demon',
        title: 'Speed Demon',
        description: 'Achieve 80+ WPM',
        icon: '⚡',
        requirement: (stats) => stats.maxWPM >= 80,
        rarity: 'rare',
    },
    {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Complete a project with 100% accuracy',
        icon: '💎',
        requirement: (stats) => stats.perfectProjects >= 1,
        rarity: 'epic',
    },
    {
        id: 'polyglot',
        title: 'Code Polyglot',
        description: 'Practice in 5 different languages',
        icon: '🌐',
        requirement: (stats) => stats.languagesPracticed >= 5,
        rarity: 'epic',
    },
    {
        id: 'marathon',
        title: 'Marathon Runner',
        description: 'Practice for 10 hours total',
        icon: '🏃',
        requirement: (stats) => (stats.totalTime || 0) >= 36000000,
        rarity: 'legendary',
    },
    {
        id: 'streak-master',
        title: 'Streak Master',
        description: 'Practice 7 days in a row',
        icon: '🔥',
        requirement: (stats) => stats.currentStreak >= 7,
        rarity: 'legendary',
    },
];
