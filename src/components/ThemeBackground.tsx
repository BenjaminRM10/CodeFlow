import { useEffect, useState } from 'react';

interface ThemeBackgroundProps {
  theme: 'light' | 'dark';
}

export function ThemeBackground({ theme }: ThemeBackgroundProps) {
  const [stars, setStars] = useState<Array<{ x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (theme === 'dark') {
      // Generate random stars
      const newStars = Array.from({ length: 50 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3,
      }));
      setStars(newStars);
    }
  }, [theme]);

  if (theme === 'light') {
    return (
      <div className="fixed inset-0 -z-10 sky-background">
        {/* Clouds */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-32 h-16 bg-white/50 rounded-full blur-xl animate-cloud-drift"
              style={{
                top: `${20 + i * 15}%`,
                left: `${i * 20}%`,
                animationDelay: `${i * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 night-background">
      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${star.y}%`,
            left: `${star.x}%`,
            opacity: 0.3 + Math.random() * 0.7,
          }}
        />
      ))}
      
      {/* Shooting stars */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`shooting-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full animate-shooting-star opacity-0"
          style={{
            top: `${Math.random() * 50}%`,
            right: `${Math.random() * 30}%`,
            animationDelay: `${i * 4}s`,
          }}
        />
      ))}
    </div>
  );
}
