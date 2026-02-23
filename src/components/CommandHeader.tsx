// src/components/CommandHeader.tsx

import { useState } from 'react';
import { ShieldAlert, Zap, Coins, FastForward, HelpCircle, Volume2, VolumeX } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { AnimatedNumber } from './AnimatedNumber';

interface Props {
    turn: number;
    credits: number;
    orbs: number;
    maxOrbs: number;
    nps: number;
    permanentDetractors: number;
    onEndTurn: () => void;
    onHelpClick: () => void;
}

export function CommandHeader({ turn, credits, orbs, maxOrbs, nps, permanentDetractors, onEndTurn, onHelpClick }: Props) {
    const [isMuted, setIsMuted] = useState(audioSystem.isMuted);

    const handleMuteToggle = () => {
        const muted = audioSystem.toggleMute();
        setIsMuted(muted);
        if (!muted) audioSystem.playClick();
    };

    // NPS colors: >30 Blue/Green, <0 Red, else Amber
    let npsColor = 'text-neonAmber';
    if (nps > 30) npsColor = 'text-crtGreen';
    else if (nps < 0) npsColor = 'text-red-500';

    return (
        <header className="flex items-center justify-between p-4 border-b border-neonAmber/30 bg-darkBg/90 backdrop-blur-sm z-10 relative">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-neonAmber/70">NPS Override</span>
                    <div className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className={npsColor} />
                            <AnimatedNumber value={nps} suffix="%" className={`text-2xl font-bold ${npsColor} glow-amber`} />
                        </div>
                        {permanentDetractors > 0 && (
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-900/40 px-1 py-0.5 rounded border border-red-500/50" title={`${permanentDetractors} Permanent Detractor(s) from Borg-ish churns`}>
                                PENALTY: -{permanentDetractors}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex flex-col ml-8 border-l border-neonAmber/30 pl-8">
                    <span className="text-xs uppercase tracking-widest text-neonAmber/70">Cycle</span>
                    <span className="text-xl font-bold text-crtGreen glow-green">{turn} / 10</span>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-neonAmber">
                    <Coins size={20} />
                    <AnimatedNumber value={credits} suffix=" CR" className="text-xl font-bold" />
                </div>

                <div className="flex items-center gap-2 text-crtGreen">
                    <Zap size={20} className="fill-current" />
                    <span className="text-xl font-bold">
                        <AnimatedNumber value={orbs} />/{maxOrbs} ORB
                    </span>
                </div>

                <button
                    onClick={onHelpClick}
                    onMouseEnter={() => audioSystem.playHover()}
                    className="p-2 text-neonAmber/70 hover:text-neonAmber hover:bg-neonAmber/10 transition-colors rounded-full"
                    title="Open Galactic Protocol (Help)"
                >
                    <HelpCircle size={24} />
                </button>

                <button
                    onClick={handleMuteToggle}
                    onMouseEnter={() => audioSystem.playHover()}
                    className="p-2 text-neonAmber/70 hover:text-neonAmber hover:bg-neonAmber/10 transition-colors rounded-full"
                    title={isMuted ? "Enable Audio" : "Mute Audio"}
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>

                <button
                    onClick={onEndTurn}
                    onMouseEnter={() => audioSystem.playHover()}
                    className="ml-4 flex items-center gap-2 px-6 py-2 border border-crtGreen text-crtGreen hover:bg-crtGreen/10 transition-colors uppercase font-bold tracking-widest box-glow-green"
                >
                    <FastForward size={18} />
                    Advance
                </button>
            </div>
        </header>
    );
}
