// src/components/FeedbackTicker.tsx
import type { GameEvent } from '../store/gameState';
import { Activity } from 'lucide-react';

interface Props {
    events: GameEvent[];
    isMobile?: boolean;
}

export function EventLogConsole({ events, isMobile }: Props) {
    const recentEvents = [...events].reverse();

    return (
        <div className={`h-full bg-darkBg/80 flex flex-col z-10 ${isMobile ? 'w-full' : 'w-80 border-l border-neonAmber/30'}`}>
            <div className="p-3 border-b border-neonAmber/30 flex items-center gap-2">
                <Activity size={18} className="text-crtGreen" />
                <h2 className="text-sm font-bold tracking-widest uppercase">Station Log</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs no-scrollbar">
                {recentEvents.length === 0 && (
                    <div className="text-neonAmber/50 italic text-center mt-10">Awaiting events...</div>
                )}

                {recentEvents.map((event, i) => (
                    <div
                        key={event.id}
                        className={`font-mono leading-relaxed ${i === 0 ? 'text-neonAmber glow-amber' : 'text-neonAmber/70'}`}
                    >
                        <span className="opacity-50 mr-2">[{String(event.turn).padStart(2, '0')}]</span>
                        <span className="opacity-70 mr-2">{'>'}</span>
                        {event.message}
                    </div>
                ))}
            </div>
        </div>
    );
}

