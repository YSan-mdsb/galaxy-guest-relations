// src/components/CardTray.tsx
import { useState } from 'react';
import type { ActionCard } from '../store/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Cookie, Cog, Sparkles, Wind, Radio, ShieldCheck } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface Props {
    credits: number;
    orbs: number;
    hand: ActionCard[];
    onBurnCard: (cardId: string) => void;
    selectedCardId?: string | null;
    onSelectCard?: (cardId: string) => void;
    isMobile?: boolean;
}

function getCardIcon(type: string, size: number) {
    switch (type) {
        case 'Bio-Snack': return <Cookie size={size} />;
        case 'System Upgrade': return <Cog size={size} />;
        case 'Scrub Room': return <Sparkles size={size} />;
        case 'Emergency Venting': return <Wind size={size} />;
        case 'Comms Link': return <Radio size={size} />;
        case 'VIP Treatment': return <ShieldCheck size={size} />;
        default: return <Cookie size={size} />;
    }
}

export function CardTray({ credits, orbs, hand, onBurnCard, selectedCardId, onSelectCard, isMobile }: Props) {
    const [tooltipCard, setTooltipCard] = useState<ActionCard | null>(null);

    const handleDragStart = (e: any, card: ActionCard) => {
        if (credits < card.creditCost || orbs < card.orbCost) {
            audioSystem.playError();
            e.preventDefault();
            return;
        }
        audioSystem.playClick();
        e.dataTransfer.setData('cardType', card.type);
        e.dataTransfer.setData('cardId', card.id);
        e.dataTransfer.effectAllowed = 'copyMove';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropOnTrash = (e: React.DragEvent) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('cardId');
        if (cardId) {
            audioSystem.playBurn();
            onBurnCard(cardId);
        }
    };

    // ─── Mobile compact icon strip ───
    if (isMobile) {
        return (
            <div className="border-t border-neonAmber/30 bg-darkBg/95 px-2 py-2 z-10 relative">
                {/* Floating tooltip for selected card */}
                <AnimatePresence>
                    {tooltipCard && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-darkBg border border-neonAmber/80 px-3 py-2 z-50 max-w-[280px] shadow-[0_0_15px_rgba(255,176,0,0.3)]"
                        >
                            <div className="text-xs font-bold text-neonAmber mb-1">{tooltipCard.type}</div>
                            <div className="text-[10px] text-neonAmber/70 mb-1">{tooltipCard.description}</div>
                            <div className="flex gap-2 text-[10px] font-bold">
                                <span className={credits >= tooltipCard.creditCost ? 'text-crtGreen' : 'text-red-500'}>{tooltipCard.creditCost} CR</span>
                                <span className={orbs >= tooltipCard.orbCost ? 'text-crtGreen' : 'text-red-500'}>{tooltipCard.orbCost} ORB</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-2">
                    {hand.map((card) => {
                        const canAfford = credits >= card.creditCost && orbs >= card.orbCost;
                        const isSelected = selectedCardId === card.id;

                        return (
                            <motion.button
                                key={card.id}
                                animate={{ y: isSelected ? -6 : 0 }}
                                className={`
                                    relative w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200
                                    min-w-[56px] min-h-[56px]
                                    ${canAfford
                                        ? (isSelected
                                            ? 'border-crtGreen bg-crtGreen/15 box-glow-green'
                                            : 'border-neonAmber/50 bg-darkBg active:bg-neonAmber/10')
                                        : 'border-neonAmber/20 bg-darkBg/50 opacity-40'}
                                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!canAfford) { audioSystem.playError(); return; }
                                    audioSystem.playClick();
                                    onSelectCard?.(card.id);
                                    setTooltipCard(isSelected ? null : card);
                                }}
                            >
                                <div className={canAfford ? (isSelected ? 'text-crtGreen' : 'text-neonAmber') : 'text-neonAmber/40'}>
                                    {getCardIcon(card.type, 20)}
                                </div>
                                <span className={`text-[8px] font-bold mt-0.5 ${orbs >= card.orbCost ? 'text-crtGreen/80' : 'text-red-500/80'}`}>
                                    {card.orbCost}⚡
                                </span>
                            </motion.button>
                        );
                    })}

                    {/* Trash */}
                    <button
                        onClick={() => {
                            if (selectedCardId) {
                                audioSystem.playBurn();
                                onBurnCard(selectedCardId);
                                onSelectCard?.(selectedCardId);
                                setTooltipCard(null);
                            }
                        }}
                        className={`w-14 h-14 rounded-lg border-2 border-dashed flex items-center justify-center min-w-[56px] min-h-[56px] transition-all duration-200
                            ${selectedCardId
                                ? 'border-red-500 text-red-500 bg-red-500/15'
                                : 'border-red-500/30 text-red-500/30'}`}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        );
    }

    // ─── Desktop full card tray ───
    return (
        <div className="h-48 border-t border-neonAmber/30 bg-darkBg/90 flex items-center p-4 gap-6 z-10 relative box-glow-amber group/tray justify-center">
            <div className="absolute top-2 left-4 text-[10px] uppercase text-neonAmber/50 tracking-widest">
                Action Protocol Tray
            </div>

            {/* Trash Zone */}
            <div
                onClick={() => {
                    if (selectedCardId) {
                        audioSystem.playBurn();
                        onBurnCard(selectedCardId);
                        onSelectCard?.(selectedCardId);
                    }
                }}
                onDragOver={handleDragOver}
                onDrop={handleDropOnTrash}
                className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                    ${selectedCardId
                        ? 'border-red-500 text-red-500 bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : 'border-red-500/30 text-red-500/50 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]'}
                `}
            >
                <Trash2 size={24} className="mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-center">Incinerate<br />Card</span>
            </div>

            {hand.map((card) => {
                const canAfford = credits >= card.creditCost && orbs >= card.orbCost;
                const isSelected = selectedCardId === card.id;

                return (
                    <motion.div
                        key={card.id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: isSelected ? -10 : 0, opacity: 1 }}
                        className={`
              w-48 h-36 rounded border flex flex-col justify-between p-3 cursor-grab active:cursor-grabbing flex-shrink-0
              transition-all duration-300
              ${canAfford
                                ? (isSelected
                                    ? 'border-crtGreen bg-darkBg box-glow-green ring-2 ring-crtGreen/50'
                                    : 'border-neonAmber bg-darkBg hover:-translate-y-2 hover:box-glow-amber')
                                : 'border-neonAmber/20 bg-darkBg/50 opacity-50 cursor-not-allowed'}
            `}
                        draggable={canAfford}
                        onDragStart={(e) => handleDragStart(e, card as ActionCard)}
                        onMouseEnter={() => canAfford && audioSystem.playHover()}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!canAfford) {
                                audioSystem.playError();
                                return;
                            }
                            audioSystem.playClick();
                            onSelectCard?.(card.id);
                        }}
                    >
                        <div className="flex justify-between items-start font-bold">
                            <span className={`text-sm ${canAfford ? 'text-neonAmber' : 'text-neonAmber/50'}`}>
                                {card.type}
                            </span>
                        </div>

                        <p className="text-xs text-neonAmber/70 leading-tight">
                            {card.description}
                        </p>

                        <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider">
                            <span className={credits >= card.creditCost ? 'text-crtGreen' : 'text-red-500'}>
                                {card.creditCost} CR
                            </span>
                            <span className={orbs >= card.orbCost ? 'text-crtGreen' : 'text-red-500'}>
                                {card.orbCost} ORB
                            </span>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

