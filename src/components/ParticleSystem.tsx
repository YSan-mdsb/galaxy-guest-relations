// src/components/ParticleSystem.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Props {
    type: 'slime' | 'sparkle' | 'glitch';
    intensity?: number;
    color?: string;
}

export function ParticleSystem({ type, intensity = 5, color }: Props) {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; size: number }[]>([]);

    useEffect(() => {
        const p = [];
        for (let i = 0; i < intensity; i++) {
            p.push({
                id: Math.random(),
                x: Math.random() * 100, // percentage
                y: Math.random() * 100, // percentage
                delay: Math.random() * 2,
                size: Math.random() * (type === 'sparkle' ? 4 : 8) + 2,
            });
        }
        setParticles(p);
    }, [intensity, type]);

    if (type === 'slime') {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <AnimatePresence>
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ y: -10, opacity: 0, scale: 0.5 }}
                            animate={{ y: '100%', opacity: [0, 0.8, 0.8, 0], scale: 1 }}
                            transition={{
                                duration: 2 + Math.random() * 2,
                                repeat: Infinity,
                                delay: p.delay,
                                ease: "easeIn"
                            }}
                            className="absolute rounded-full"
                            style={{
                                left: `${p.x}%`,
                                top: 0,
                                width: p.size,
                                height: p.size * 1.5,
                                backgroundColor: color || '#33ff33',
                                boxShadow: `0 0 ${p.size * 2}px ${color || '#33ff33'}`
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>
        );
    }

    if (type === 'sparkle') {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <AnimatePresence>
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, scale: 0, rotate: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0], rotate: 180 }}
                            transition={{
                                duration: 1 + Math.random(),
                                repeat: Infinity,
                                delay: p.delay,
                                ease: "easeInOut"
                            }}
                            className="absolute"
                            style={{
                                left: `${p.x}%`,
                                top: `${p.y}%`,
                            }}
                        >
                            <svg width={p.size * 2} height={p.size * 2} viewBox="0 0 24 24" fill="none" className="drop-shadow-lg">
                                <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill={color || '#ffb000'} />
                            </svg>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        );
    }

    return null;
}
