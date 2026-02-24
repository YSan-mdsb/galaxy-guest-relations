// src/components/GuestDetailsPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Languages } from 'lucide-react';
import type { Guest } from '../store/gameState';

interface Props {
    guest: Guest | null;
    onClose: () => void;
    isMobile?: boolean;
}

export function GuestDetailsPanel({ guest, onClose, isMobile }: Props) {
    if (!guest) return null;

    if (isMobile) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[45] max-h-[45vh]"
                >
                    <div className="bg-darkBg border-t-2 border-neonAmber/50 backdrop-blur-md shadow-[0_-10px_30px_rgba(0,0,0,0.8)] p-4 relative overflow-y-auto max-h-[45vh]">
                        {/* Drag handle */}
                        <div className="flex justify-center mb-3">
                            <div className="w-10 h-1 rounded-full bg-neonAmber/30" />
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="absolute top-3 right-3 text-neonAmber/50 active:text-neonAmber transition-colors z-50 min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-3 pb-2 border-b border-neonAmber/20">
                            <div className="p-1.5 border border-neonAmber/30 bg-neonAmber/10 text-neonAmber rounded">
                                <User size={16} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-neonAmber uppercase tracking-widest leading-none">{guest.name}</h3>
                                <span className="text-[10px] text-neonAmber/60 font-mono uppercase">{guest.species}</span>
                            </div>
                        </div>

                        <div className="space-y-2 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-neonAmber/50 uppercase">Disposition:</span>
                                <span className={`font-bold uppercase ${guest.category === 'Promoter' ? 'text-crtGreen' : guest.category === 'Detractor' ? 'text-red-500' : 'text-neonAmber'}`}>
                                    {guest.category}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-neonAmber/50 uppercase">VIP:</span>
                                <span className="text-neonAmber">{guest.vipTurnsRemaining > 0 ? `Active (${guest.vipTurnsRemaining}T)` : 'None'}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-neonAmber/20">
                                <div className="flex items-center gap-1 text-[10px] text-crtGreen uppercase mb-1">
                                    <Languages size={12} /> Live Translation
                                </div>
                                <div className="text-crtGreen glow-green italic break-words leading-relaxed pl-2 border-l-2 border-crtGreen/30">
                                    "{guest.feedback}"
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute bottom-6 left-6 w-80 z-40"
            >
                <div className="bg-darkBg/95 border-2 border-neonAmber/50 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.2)] p-4 relative overflow-hidden">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50"></div>

                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="absolute top-2 right-2 text-neonAmber/50 hover:text-neonAmber transition-colors z-50"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-4 pb-2 border-b border-neonAmber/20">
                        <div className="p-2 border border-neonAmber/30 bg-neonAmber/10 text-neonAmber rounded">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-neonAmber uppercase tracking-widest leading-none">
                                {guest.name}
                            </h3>
                            <span className="text-[10px] text-neonAmber/60 font-mono uppercase">
                                {guest.species}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                        <div className="flex justify-between">
                            <span className="text-neonAmber/50 uppercase">Disposition:</span>
                            <span className={`font-bold uppercase ${guest.category === 'Promoter' ? 'text-crtGreen drop-shadow-[0_0_5px_rgba(51,255,51,0.8)]' : guest.category === 'Detractor' ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'text-neonAmber'}`}>
                                {guest.category}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-neonAmber/50 uppercase">VIP Status:</span>
                            <span className="text-neonAmber">
                                {guest.vipTurnsRemaining > 0 ? `Active (${guest.vipTurnsRemaining}T)` : 'None'}
                            </span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-neonAmber/20">
                            <div className="flex items-center gap-1 text-[10px] text-crtGreen uppercase mb-2">
                                <Languages size={12} /> Live Translation
                            </div>
                            <div className="text-crtGreen glow-green italic break-words leading-relaxed pl-2 border-l-2 border-crtGreen/30">
                                "{guest.feedback}"
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

