// src/components/TutorialOverlay.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isMobile?: boolean;
}

export function TutorialOverlay({ isOpen, onClose, isMobile }: Props) {
    const actionVerb = isMobile ? 'Tap a card to select it, then tap' : 'Drag';
    const onto = isMobile ? '' : ' onto';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="max-w-xl w-full max-h-[90vh] flex flex-col border border-crtGreen bg-darkBg/95 relative box-glow-green"
                    >
                        {/* Fixed Header */}
                        <div className="p-4 md:p-6 pb-3 md:pb-4 shrink-0 flex justify-between items-start border-b border-neonAmber/20">
                            <h2 className="text-lg md:text-2xl font-bold text-crtGreen tracking-widest uppercase">
                                Galactic Director Orientation
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-crtGreen hover:text-white transition-colors pt-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-4 md:p-6 overflow-y-auto space-y-4 text-neonAmber/80 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-crtGreen scrollbar-track-darkBg">
                            <p>
                                <strong className="text-neonAmber glow-amber">Inner Loop: Fixing Guests</strong>
                                <br />
                                {actionVerb} "Bio-Snack" (1 Orb, 10 CR){onto} a <strong className="text-white">Guest</strong> to instantly boost their status by 1 tier. Nebula-Whales love these and will jump straight to Promoter!
                            </p>

                            <hr className="border-neonAmber/20 my-4" />

                            <p>
                                <strong className="text-crtGreen glow-green">Outer Loop: Fixing the Station</strong>
                                <br />
                                {actionVerb} "System Upgrade" (2 Orbs, 60 CR){onto} a <strong className="text-white">Room</strong>. This moves all current guests up 1 tier and buffs any future guests spawning there.
                            </p>

                            <p>
                                <strong className="text-crtGreen glow-green">Slime Management</strong>
                                <br />
                                Glip-Glops leak Slime. If a room gathers {'>'}2 Slime, guests inside will drop in tier at the end of the turn! {actionVerb} "Scrub Room"{onto} a room to clean it, or use "Emergency Venting" for a station-wide sweep.
                            </p>

                            <hr className="border-neonAmber/20 my-4" />

                            <p>
                                <strong className="text-crtGreen glow-green">Guest Profiles & Comms Link</strong>
                                <br />
                                {isMobile ? 'Tap' : 'Click on'} any guest to view their <strong>Guest Profile</strong>, which includes a live, AI-translated review of their experience. If a guest is angry, {isMobile ? 'select' : 'drag'} a <strong>Comms Link</strong> card {isMobile ? 'and tap them' : 'onto them'} to negotiate and improve their mood using natural language!
                            </p>

                            <p className="mt-4">
                                <strong className="text-crtGreen glow-green">Station Log</strong>
                                <br />
                                {isMobile
                                    ? 'Switch to the Log tab at the bottom to see essential events like guests arriving, Nebula-Whales leaving large tips, and impatient Borgs churning.'
                                    : 'Keep an eye on the right-side console. It will narrate essential events like guests arriving, Nebula-Whales leaving large tips, and impatient Borgs churning.'}
                            </p>

                            <hr className="border-neonAmber/20 my-4" />

                            <h3 className="text-lg font-bold text-crtGreen uppercase tracking-widest mb-2">Species Guide</h3>
                            <ul className="list-disc pl-5 space-y-2 text-white">
                                <li>
                                    <strong className="text-neonAmber">Glip-Glops (Ghost):</strong> Leak Slime into rooms if they are less than a Promoter.
                                </li>
                                <li>
                                    <strong className="text-neonAmber">Borg-ish (Skull):</strong> Impatient! If left as a Passive, they might churn and leave a Permanent Detractor penalty on your overall NPS.
                                </li>
                                <li>
                                    <strong className="text-neonAmber">Nebula-Whales (Sparkles):</strong> Huge tippers! If they end the turn as a Promoter, you get +15 CR. They love Bio-Snacks and will jump straight to Promoter if given one!
                                </li>
                            </ul>

                            <hr className="border-neonAmber/20 my-4" />

                            <p>
                                <strong className="text-crtGreen glow-green">Action Cards</strong>
                                <br />
                                From <strong>Bio-Snacks</strong> to <strong>VIP Treatments</strong>, use your Action Cards wisely. You draw back up to 5 cards at the end of each turn, and draw odds dynamically adapt to how your station is doing! {isMobile ? 'Tap the trash icon to burn unwanted cards.' : 'You may drag unwanted cards to the incinerator to burn them.'}
                            </p>

                            <div className="mt-8 pt-4 border-t border-crtGreen/30 text-center">
                                <button
                                    onClick={onClose}
                                    className="px-6 md:px-8 py-3 bg-crtGreen/10 border border-crtGreen text-crtGreen font-bold tracking-widest uppercase hover:bg-crtGreen hover:text-darkBg transition-colors min-h-[44px]"
                                >
                                    Acknowledge Protocol
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

