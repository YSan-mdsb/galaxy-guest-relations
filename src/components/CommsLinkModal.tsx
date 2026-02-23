// src/components/CommsLinkModal.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Radio } from 'lucide-react';
import type { Guest } from '../store/gameState';

interface Props {
    isOpen: boolean;
    guest: Guest | null;
    onClose: () => void;
    onSubmit: (guestId: string, message: string) => Promise<string | void> | void;
}

export function CommsLinkModal({ isOpen, guest, onClose, onSubmit }: Props) {
    const [message, setMessage] = useState('');
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [response, setResponse] = useState<string | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setMessage('');
            setResponse(null);
            setIsTransmitting(false);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [isOpen]);

    const handleOpenCard = async () => {
        if (!guest || !message.trim() || isTransmitting) return;
        setIsTransmitting(true);
        const alienReply = await onSubmit(guest.id, message.trim());
        if (typeof alienReply === 'string') {
            setResponse(alienReply);
        }
        setIsTransmitting(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleOpenCard();
        }
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && guest && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-darkBg/90 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="max-w-md w-full border-2 border-neonAmber bg-darkBg p-6 relative shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-neonAmber/70 hover:text-neonAmber transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-3 mb-6 border-b border-neonAmber/30 pb-4">
                            <Radio className="text-neonAmber animate-pulse" size={28} />
                            <div>
                                <h2 className="text-xl font-bold text-neonAmber tracking-widest uppercase m-0 leading-tight">
                                    Comms Link Active
                                </h2>
                                <span className="text-xs text-white uppercase tracking-widest">
                                    Target: {guest.species}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-neonAmber/80 font-mono mb-2">
                                Current Disposition: {guest.category}
                            </p>
                            <p className="text-xs text-white/70 italic border-l-2 border-white/20 pl-3">
                                "{guest.feedback}"
                            </p>
                        </div>

                        {response ? (
                            <div className="bg-darkBg border border-crtGreen p-4 box-glow-green text-crtGreen font-mono">
                                <p className="text-xs uppercase tracking-widest mb-2 opacity-50">Translation Established:</p>
                                <p className="italic text-sm leading-relaxed">"{response}"</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <textarea
                                    ref={inputRef}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isTransmitting}
                                    placeholder="Type your negotiation/apology here..."
                                    className="w-full h-32 bg-darkBg border border-neonAmber/50 p-4 text-white font-mono placeholder:text-neonAmber/30 focus:outline-none focus:border-neonAmber focus:box-glow-amber resize-none disabled:opacity-50"
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] text-neonAmber/50 uppercase tracking-widest pointer-events-none">
                                    {isTransmitting ? 'Transmitting...' : 'Press Enter to Transmit'}
                                </div>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-4">
                            {!response ? (
                                <>
                                    <button
                                        onClick={onClose}
                                        disabled={isTransmitting}
                                        className="px-6 py-2 text-white/50 hover:text-white uppercase text-sm font-bold tracking-widest transition-colors disabled:opacity-50"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleOpenCard}
                                        disabled={!message.trim() || isTransmitting}
                                        className="flex items-center gap-2 px-6 py-2 bg-neonAmber/20 border border-neonAmber text-neonAmber font-bold uppercase tracking-widest hover:bg-neonAmber hover:text-darkBg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-neonAmber/20 disabled:hover:text-neonAmber"
                                    >
                                        <Send size={16} />
                                        {isTransmitting ? 'Sending...' : 'Transmit'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-crtGreen/20 border border-crtGreen text-crtGreen font-bold uppercase tracking-widest hover:bg-crtGreen hover:text-darkBg transition-colors"
                                >
                                    Close Channel
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
