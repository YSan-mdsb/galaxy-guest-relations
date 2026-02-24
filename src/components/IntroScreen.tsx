// src/components/IntroScreen.tsx

import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface Props {
    onStart: () => void;
}

export function IntroScreen({ onStart }: Props) {
    return (
        <div className="fixed inset-0 z-[100] bg-darkBg text-neonAmber font-mono overflow-y-auto">
            {/* Global CRT scanline effect overlay */}
            <div className="crt-overlay pointer-events-none fixed inset-0" />

            <div className="min-h-full flex items-center justify-center p-4 py-8 md:p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="max-w-3xl w-full border border-neonAmber/50 bg-darkBg/95 p-6 md:p-12 relative shadow-[0_0_50px_rgba(245,158,11,0.15)] box-glow-amber"
                >
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 md:mb-8 border-b border-neonAmber/30 pb-4">
                        <Terminal size={32} className="text-crtGreen animate-pulse hidden md:block" />
                        <h1 className="text-xl md:text-3xl font-bold tracking-widest uppercase text-crtGreen glow-green m-0 leading-tight">
                            ITA Command Interface
                        </h1>
                    </div>

                    <div className="space-y-4 md:space-y-6 text-sm md:text-base leading-relaxed text-neonAmber/90">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 1 }}
                        >
                            Welcome to Outpost 9, Galactic Station Director.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.5, duration: 1 }}
                        >
                            As the newly appointed liaison for the Intergalactic Transit Authority, you inherited a decaying rest stop plagued by leaky vents, broken gravity generators, and terrible food.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 4, duration: 1 }}
                        >
                            Your objective is simple: keep the transiting alien species happy.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 5.5, duration: 1 }}
                            className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        >
                            You have exactly 10 cycles (turns) before the ITA conducts their quarterly Audit. Ensure your Net Promoter Score (NPS) stays above 20 and your station avoids bankruptcy, or you will be permanently relieved of duty.
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 7, duration: 1 }}
                            className="italic text-neonAmber/70"
                        >
                            Manage the slime leaks, distribute Bio-Snacks, and don't let the Nebula-Whales tip the station over... Good luck, Director.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 8.5, duration: 1 }}
                        className="mt-8 md:mt-12 flex justify-center"
                    >
                        <button
                            onClick={() => { audioSystem.init(); audioSystem.playClick(); onStart(); }}
                            onMouseEnter={() => audioSystem.playHover()}
                            className="px-6 md:px-10 py-3 md:py-4 text-lg md:text-xl font-bold tracking-[0.2em] uppercase bg-crtGreen/10 border-2 border-crtGreen text-crtGreen hover:bg-crtGreen hover:text-darkBg transition-all duration-300 relative group overflow-hidden flex-shrink-0"
                        >
                            <span className="relative z-10">Begin Shift</span>
                            <div className="absolute inset-0 bg-crtGreen transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out z-0"></div>
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
