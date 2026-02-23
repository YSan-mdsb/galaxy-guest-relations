// src/components/CardTray.tsx
import type { ActionCard } from '../store/actions';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';

interface Props {
    credits: number;
    orbs: number;
    hand: ActionCard[];
    onBurnCard: (cardId: string) => void;
}

export function CardTray({ credits, orbs, hand, onBurnCard }: Props) {

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

    return (
        <div className="h-48 border-t border-neonAmber/30 bg-darkBg/90 flex items-center justify-center p-4 gap-6 z-10 relative box-glow-amber group/tray">
            <div className="absolute top-2 left-4 text-[10px] uppercase text-neonAmber/50 tracking-widest">
                Action Protocol Tray
            </div>

            {/* Trash Zone */}
            <div
                onDragOver={handleDragOver}
                onDrop={handleDropOnTrash}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-32 border-2 border-dashed border-red-500/30 rounded-lg flex flex-col items-center justify-center text-red-500/50 transition-all duration-300 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            >
                <Trash2 size={24} className="mb-2" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-center">Incinerate<br />Card</span>
            </div>

            {hand.map((card) => {
                const canAfford = credits >= card.creditCost && orbs >= card.orbCost;

                return (
                    <motion.div
                        key={card.id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`
              w-48 h-36 rounded border flex flex-col justify-between p-3 cursor-grab active:cursor-grabbing
              transition-all duration-300
              ${canAfford ? 'border-neonAmber bg-darkBg hover:-translate-y-2 hover:box-glow-amber' : 'border-neonAmber/20 bg-darkBg/50 opacity-50 cursor-not-allowed'}
            `}
                        draggable={canAfford}
                        onDragStart={(e) => handleDragStart(e, card as ActionCard)}
                        onMouseEnter={() => canAfford && audioSystem.playHover()}
                        onClick={() => !canAfford && audioSystem.playError()}
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
