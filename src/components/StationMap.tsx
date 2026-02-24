// src/components/StationMap.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { Room, Guest } from '../store/gameState';
import type { ActionCard } from '../store/actions';
import { Droplets, HardDrive } from 'lucide-react';
import { audioSystem } from '../utils/audioSystem';
import { GlipGlopSprite, BorgishSprite, NebulaWhaleSprite } from './AlienSprites';
import { ParticleSystem } from './ParticleSystem';

interface Props {
    rooms: Room[];
    guests: Guest[];
    onDropCard?: (cardId: string, cardType: string, targetId: string) => void;
    focusedGuestId: string | null;
    onGuestClick: (guestId: string) => void;
    selectedCard?: ActionCard | null;
    isMobile?: boolean;
}

const ROOM_CARD_TYPES = ['System Upgrade', 'Scrub Room', 'Emergency Venting'];
const GUEST_CARD_TYPES = ['Bio-Snack', 'VIP Treatment', 'Comms Link'];

export function StationMap({ rooms, guests, onDropCard, focusedGuestId, onGuestClick, selectedCard, isMobile }: Props) {

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDropOnRoom = (e: React.DragEvent, roomIndex: number) => {
        e.preventDefault();
        const cardType = e.dataTransfer.getData('cardType');
        const cardId = e.dataTransfer.getData('cardId');
        if (ROOM_CARD_TYPES.includes(cardType)) {
            onDropCard?.(cardId, cardType, roomIndex.toString());
        }
    };

    const handleDropOnGuest = (e: React.DragEvent, guestId: string) => {
        e.preventDefault();
        e.stopPropagation(); // prevent room drop
        const cardType = e.dataTransfer.getData('cardType');
        const cardId = e.dataTransfer.getData('cardId');
        if (GUEST_CARD_TYPES.includes(cardType)) {
            onDropCard?.(cardId, cardType, guestId);
        }
    };

    const isRoomTargeted = selectedCard && ROOM_CARD_TYPES.includes(selectedCard.type);
    const isGuestTargeted = selectedCard && GUEST_CARD_TYPES.includes(selectedCard.type);

    // Mobile room tint colors (simpler than full bg images)
    const roomTints: Record<string, string> = {
        'Mess Hall': 'bg-amber-900/20',
        'Docking Bay': 'bg-blue-900/20',
        'Life Support': 'bg-cyan-900/20',
        'Gravity Control': 'bg-purple-900/20',
        'Holodeck': 'bg-indigo-900/20',
        'Airlock': 'bg-slate-800/30',
        'Hydroponics': 'bg-green-900/20',
        'Medical Bay': 'bg-red-900/15',
        'Living Quarter': 'bg-orange-900/15',
    };

    return (
        <div className={`grid gap-2 p-3 flex-1 h-full min-h-0 ${isMobile ? 'grid-cols-2 auto-rows-[minmax(120px,1fr)]' : 'grid-cols-3 p-4'}`}>
            {rooms.map((room) => {
                const roomGuests = guests.filter(g => g.roomIndex === room.index);
                const hasSlime = room.slime > 0;

                // Desktop uses bg images, mobile uses tints
                const roomBg = isMobile
                    ? (roomTints[room.name] || 'bg-slate-900/20')
                    : (() => {
                        const bgMap: Record<string, string> = {
                            'Mess Hall': 'bg-[url("/imgs/mess-hall.png")] bg-cover bg-center',
                            'Docking Bay': 'bg-[url("/imgs/docking-station.png")] bg-cover bg-center',
                            'Life Support': 'bg-[url("/imgs/life-support.png")] bg-cover bg-center',
                            'Gravity Control': 'bg-[url("/imgs/gravity-control.png")] bg-cover bg-center',
                            'Holodeck': 'bg-[url("/imgs/holodeck.png")] bg-cover bg-center',
                            'Airlock': 'bg-[url("/imgs/airlock.png")] bg-cover bg-center',
                            'Hydroponics': 'bg-[url("/imgs/hydroponics.png")] bg-cover bg-center',
                            'Medical Bay': 'bg-[url("/imgs/medical-bay.png")] bg-cover bg-center',
                            'Living Quarter': 'bg-[url("/imgs/living-quarter.png")] bg-cover bg-center',
                        };
                        return bgMap[room.name] || 'bg-[#0f172a]';
                    })();

                return (
                    <div
                        key={room.index}
                        className={`
              relative border-2 p-2 flex flex-col items-center justify-center overflow-hidden
              transition-all duration-500 rounded-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]
              ${hasSlime ? 'box-glow-green border-crtGreen/60' : 'border-neonAmber/30'}
              ${room.hasSystemUpgrade ? 'border-neonAmber shadow-[inset_0_0_30px_rgba(255,176,0,0.15)] bg-neonAmber/5' : ''}
              ${isRoomTargeted ? 'border-dashed border-crtGreen/60 cursor-pointer' : ''}
              ${roomBg}
            `}
                        onDragOver={!isMobile ? handleDragOver : undefined}
                        onDrop={!isMobile ? (e) => handleDropOnRoom(e, room.index) : undefined}
                        onClick={() => {
                            if (selectedCard && ROOM_CARD_TYPES.includes(selectedCard.type)) {
                                onDropCard?.(selectedCard.id, selectedCard.type, room.index.toString());
                            }
                        }}
                    >
                        {/* Contrast Overlay */}
                        <div className="absolute inset-0 bg-black/50 pointer-events-none z-0" />

                        {/* Slime Hazard Stripes */}
                        {hasSlime && (
                            <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#33ff33_10px,#33ff33_20px)] opacity-50 z-10 border-b border-crtGreen/30" />
                        )}

                        <span className="text-[10px] text-neonAmber/80 font-bold tracking-wider absolute top-2 left-2 uppercase z-20 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                            {room.name}
                        </span>

                        {hasSlime && (
                            <>
                                <ParticleSystem type="slime" intensity={isMobile ? Math.min(room.slime * 2, 4) : room.slime * 3} color="#33ff33" />
                                <div className="absolute top-1 right-1 flex items-center text-crtGreen z-20">
                                    <Droplets size={12} className="mr-1" />
                                    <span className="text-xs">{room.slime}</span>
                                </div>
                            </>
                        )}

                        {room.hasSystemUpgrade && (
                            <>
                                <ParticleSystem type="sparkle" intensity={isMobile ? 3 : 5} color="#ffb000" />
                                <HardDrive size={14} className="absolute bottom-1 left-1 text-neonAmber z-20" />
                            </>
                        )}

                        <div className="flex flex-wrap gap-2 mt-4 justify-center items-center z-10 w-full">
                            {roomGuests.map((guest) => (
                                <motion.div
                                    key={guest.id}
                                    layoutId={guest.id}
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: focusedGuestId === guest.id ? 1.2 : 1 }}
                                    className={`relative group cursor-pointer ${focusedGuestId === guest.id ? 'z-30' : 'z-10'} ${isGuestTargeted ? 'ring-1 ring-crtGreen/40 rounded-lg' : ''}`}
                                    onDragOver={!isMobile ? handleDragOver : undefined}
                                    onDrop={!isMobile ? (e) => handleDropOnGuest(e, guest.id) : undefined}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (selectedCard && GUEST_CARD_TYPES.includes(selectedCard.type)) {
                                            onDropCard?.(selectedCard.id, selectedCard.type, guest.id);
                                        } else {
                                            audioSystem.playClick();
                                            onGuestClick(guest.id);
                                        }
                                    }}
                                    onMouseEnter={() => !isMobile && audioSystem.playHover()}
                                    title={`Category: ${guest.category}\nSpecies: ${guest.species}`}
                                >
                                    {/* Guest Icon base on species */}
                                    <div className={`relative p-1 border rounded-lg ${getGuestColor(guest.category)} backdrop-blur-md bg-darkBg/90 ${focusedGuestId === guest.id ? 'ring-2 ring-white ring-offset-2 ring-offset-darkBg' : ''} ${guest.vipTurnsRemaining > 0 ? 'ring-1 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]' : ''}`}>
                                        {guest.species === 'Glip-Glops' && <GlipGlopSprite category={guest.category} width={isMobile ? 36 : 32} height={isMobile ? 36 : 32} />}
                                        {guest.species === 'Borg-ish' && <BorgishSprite category={guest.category} width={isMobile ? 36 : 32} height={isMobile ? 36 : 32} />}
                                        {guest.species === 'Nebula-Whales' && <NebulaWhaleSprite category={guest.category} width={isMobile ? 36 : 32} height={isMobile ? 36 : 32} />}
                                        {guest.vipTurnsRemaining > 0 && (
                                            <div className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 border border-darkBg text-black text-[10px] z-50 shadow-md">
                                                ★
                                            </div>
                                        )}
                                    </div>

                                    {/* Category label — always visible on mobile, hover-only on desktop */}
                                    {isMobile ? (
                                        <div className="text-center text-[8px] font-bold mt-0.5 uppercase tracking-wider z-20" style={{ color: guest.category === 'Promoter' ? '#33ff33' : guest.category === 'Detractor' ? '#ef4444' : '#ffb000' }}>
                                            {guest.category.charAt(0)}
                                        </div>
                                    ) : (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-darkBg border border-neonAmber px-1 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                            {guest.category}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                    </div>
                );
            })}
        </div>
    );
}

function getGuestColor(category: 'Promoter' | 'Passive' | 'Detractor') {
    if (category === 'Promoter') return 'text-crtGreen border-crtGreen shadow-[0_0_8px_rgba(51,255,51,0.5)]';
    if (category === 'Passive') return 'text-neonAmber border-neonAmber shadow-[0_0_5px_rgba(255,176,0,0.3)]';
    return 'text-red-500 border-red-500 shadow-[0_0_5px_rgba(239,68,68,0.3)]';
}

