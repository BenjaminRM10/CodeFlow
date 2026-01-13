import { storage } from './storage';
import { ACHIEVEMENTS, Achievement } from '@/types/achievements';
import { toast } from 'sonner';

export const achievementManager = {
    checkAchievements: () => {
        const stats = achievementManager.calculateStats();
        const unlocked = storage.getUnlockedAchievements();

        const newUnlocks: Achievement[] = [];

        ACHIEVEMENTS.forEach(achievement => {
            if (!unlocked.includes(achievement.id)) {
                if (achievement.requirement(stats)) {
                    storage.saveUnlockedAchievement(achievement.id);
                    newUnlocks.push(achievement);
                }
            }
        });

        // Notify for new unlocks
        newUnlocks.forEach(achievement => {
            toast.success(`Achievement Unlocked: ${achievement.title}`, {
                description: achievement.description,
                duration: 5000,
                icon: achievement.icon,
            });
        });

        return newUnlocks;
    },

    calculateStats: () => {
        const projects = storage.getProjects();
        const dailyProgress = storage.getDailyProgress();

        // Aggregate stats
        const projectsCompleted = projects.filter(p => p.completed).length;

        const maxWPM = projects.reduce((max, p) => Math.max(max, p.wpm || 0), 0);

        const perfectProjects = projects.filter(p => p.completed && (p.accuracy === 100 || (p.code && p.accuracy === undefined && false))).length;
        // Note: p.accuracy might be undefined if old project. 
        // We need to trust the new metrics format.

        const languages = new Set(projects.filter(p => p.completed).map(p => p.language));

        const totalTime = dailyProgress.reduce((total, day) => total + (day.minutesPracticed || 0), 0) * 60 * 1000; // minutes to ms

        // Streak calculation
        let currentStreak = 0;
        const sortedDays = dailyProgress
            .map(d => new Date(d.date).getTime())
            .sort((a, b) => b - a); // descending

        if (sortedDays.length > 0) {
            const today = new Date().setHours(0, 0, 0, 0);
            const lastDay = sortedDays[0];

            // If last practice was today or yesterday, streak is alive
            const diffDays = (today - lastDay) / (1000 * 60 * 60 * 24);

            if (diffDays <= 1) {
                currentStreak = 1;
                for (let i = 0; i < sortedDays.length - 1; i++) {
                    const curr = sortedDays[i];
                    const prev = sortedDays[i + 1];
                    const diff = (curr - prev) / (1000 * 60 * 60 * 24);
                    if (Math.round(diff) === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        return {
            projectsCompleted,
            maxWPM,
            perfectProjects,
            languagesPracticed: languages.size,
            totalTime,
            currentStreak
        };
    }
};
