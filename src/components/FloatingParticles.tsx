import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Initialize particles
    const initialParticles: Particle[] = [];
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
    
    for (let i = 0; i < 50; i++) {
      initialParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    setParticles(initialParticles);

    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + particle.speedX;
          let newY = particle.y + particle.speedY;
          
          // Bounce off edges
          if (newX <= 0 || newX >= window.innerWidth) {
            particle.speedX *= -1;
            newX = particle.x + particle.speedX;
          }
          if (newY <= 0 || newY >= window.innerHeight) {
            particle.speedY *= -1;
            newY = particle.y + particle.speedY;
          }
          
          return {
            ...particle,
            x: newX,
            y: newY,
            opacity: Math.sin(Date.now() * 0.001 + particle.id) * 0.3 + 0.4
          };
        })
      );
    };

    const interval = setInterval(animateParticles, 50);
    
    // Handle window resize
    const handleResize = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          x: Math.min(particle.x, window.innerWidth),
          y: Math.min(particle.y, window.innerHeight)
        }))
      );
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full transition-opacity duration-1000"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
