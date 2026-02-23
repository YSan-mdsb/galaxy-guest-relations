// src/store/useGameEngine.ts
import { useState, useCallback } from 'react';
import { initialGameState, calculateNPS, generateGuestName } from './gameState';
import type { GameState, Guest } from './gameState';
import { CARDS } from './actions';
import type { ActionCardType } from './actions';
import { generateGuestFeedback, evaluateCommsLink } from './llmService';

export function useGameEngine() {
    const [state, setState] = useState<GameState>(() => {
        const types: ActionCardType[] = ['Bio-Snack', 'System Upgrade', 'Scrub Room', 'Comms Link', 'Emergency Venting', 'VIP Treatment'];
        const initialHand: any[] = [];

        // Always start with 1 Bio-Snack to teach the basic mechanic
        initialHand.push({ id: `card-init-base-0`, ...CARDS['Bio-Snack'] });

        while (initialHand.length < 5) {
            let drawPool = [...types];

            // Filter out existing cards in hand
            initialHand.forEach(cardInHand => {
                drawPool = drawPool.filter(c => c !== cardInHand.type);
            });

            // Biased draw pool for the start: increase chance of Bio-Snack and Scrub Room
            if (drawPool.includes('Bio-Snack')) {
                drawPool.push('Bio-Snack', 'Bio-Snack');
            }
            if (drawPool.includes('Scrub Room')) {
                drawPool.push('Scrub Room');
            }

            const randomType = drawPool[Math.floor(Math.random() * drawPool.length)];
            initialHand.push({ id: `card-init-rnd-${initialHand.length}-${Math.random().toString(36).substring(2, 6)}`, ...CARDS[randomType as ActionCardType] });
        }

        return { ...initialGameState, hand: initialHand };
    });

    const spawnGuests = useCallback(() => {
        setState(prev => {
            const newGuests: Guest[] = [];
            const newEvents: any[] = [];
            const numToSpawn = Math.floor(Math.random() * 2) + 2; // 2-3 guests
            const speciesOptions: Guest['species'][] = ['Glip-Glops', 'Borg-ish', 'Nebula-Whales'];
            for (let i = 0; i < numToSpawn; i++) {
                const roomIndex = Math.floor(Math.random() * prev.rooms.length);
                const species = speciesOptions[Math.floor(Math.random() * speciesOptions.length)];

                // Bias category generation towards Detractors/Passives
                const roll = Math.random() * 100;
                let initialCategory: 'Detractor' | 'Passive' | 'Promoter';
                if (roll < 60) initialCategory = 'Detractor'; // 60% chance
                else if (roll < 90) initialCategory = 'Passive'; // 30% chance
                else initialCategory = 'Promoter'; // 10% chance

                // check room upgrade
                const room = prev.rooms[roomIndex];
                if (room.hasSystemUpgrade) {
                    if (initialCategory === 'Detractor') initialCategory = 'Passive';
                    else if (initialCategory === 'Passive') initialCategory = 'Promoter';
                }

                const name = generateGuestName(species);

                newGuests.push({
                    id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    name,
                    species,
                    category: initialCategory,
                    roomIndex,
                    feedback: 'Translating...',
                    turnsAsDetractor: initialCategory === 'Detractor' ? 1 : 0,
                    turnsAsPassive: initialCategory === 'Passive' ? 1 : 0,
                    vipTurnsRemaining: 0,
                });

                newEvents.push({
                    id: `event-spawn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    turn: prev.turn,
                    message: `${name} (a ${species}) docked at the ${room.name}.`
                });
            }

            // Keep log size manageable
            const newLog = [...prev.eventLog, ...newEvents].slice(-50);

            return {
                ...prev,
                guests: [...prev.guests, ...newGuests],
                eventLog: newLog,
            };
        });

        // Trigger async translation for the new guests.
        // We use a slight delay so the initial state settles, then we fetch.
        setTimeout(() => {
            setState(current => {
                const currentGuests = [...current.guests];
                // find guests that are translating
                const guestsToTranslate = currentGuests.filter(g => g.feedback === 'Translating...');

                guestsToTranslate.forEach(async (guest) => {
                    const roomName = current.rooms[guest.roomIndex].name;
                    const feedback = await generateGuestFeedback(guest.name, guest.species, roomName, guest.category);

                    // We need another state update because of the async jump
                    setState(latest => {
                        const updated = [...latest.guests];
                        const idx = updated.findIndex(g => g.id === guest.id);
                        if (idx !== -1 && updated[idx].feedback === 'Translating...') {
                            updated[idx] = { ...updated[idx], feedback };
                        }
                        return { ...latest, guests: updated };
                    });
                });
                return current;
            });
        }, 0);

    }, []);

    const endTurn = useCallback(() => {
        setState(prev => {
            let newCredits = prev.credits;
            let newGuests = [...prev.guests];
            let newEventLog = [...prev.eventLog];
            const newRooms = [...prev.rooms];
            let newPermanentDetractors = prev.permanentDetractors;

            // Slime lethal evaluation first
            newGuests = newGuests.map(guest => {
                const room = newRooms[guest.roomIndex];
                if (guest.vipTurnsRemaining === 0 && room.slime > 2) {
                    if (guest.category === 'Promoter') {
                        newEventLog.push({ id: `event-slimed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, turn: prev.turn, message: `${guest.name} slipped in slime! Mood dropped to Passive.` });
                        return { ...guest, category: 'Passive' };
                    }
                    if (guest.category === 'Passive') {
                        newEventLog.push({ id: `event-slimed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, turn: prev.turn, message: `${guest.name} slipped in slime! Mood dropped to Detractor.` });
                        return { ...guest, category: 'Detractor' };
                    }
                }
                return guest;
            });

            // Slime calculation and Nebula Whale credits, Borg churn
            newGuests = newGuests.filter(guest => {
                let keep = true;

                // Borg-ish churn
                if (guest.species === 'Borg-ish' && guest.category === 'Passive') {
                    if (Math.random() < 0.2) { // 20% chance
                        keep = false;
                        newPermanentDetractors++;
                        newEventLog.push({
                            id: `event-churn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            turn: prev.turn,
                            message: `${guest.name} churned in frustration! Permanent NPS penalty applied.`
                        });
                    }
                }

                // Nebula-Whales credits
                if (guest.species === 'Nebula-Whales' && guest.category === 'Promoter') {
                    newCredits += 15;
                    newEventLog.push({
                        id: `event-tip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        turn: prev.turn,
                        message: `${guest.name} left a generous 15 CR tip!`
                    });
                }

                // Glip-Glops slime
                if (guest.species === 'Glip-Glops' && guest.category !== 'Promoter') {
                    if (guest.turnsAsDetractor >= 1 || guest.turnsAsPassive >= 1) { // 1+ turns
                        const room = newRooms[guest.roomIndex];
                        newRooms[guest.roomIndex] = { ...room, slime: room.slime + 1 };
                        newEventLog.push({
                            id: `event-slime-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            turn: prev.turn,
                            message: `${guest.name} (Glip-Glops) leaked slime in the ${room.name}.`
                        });
                    }
                }

                // Update turn counters
                if (guest.category === 'Passive') guest.turnsAsPassive++;
                else guest.turnsAsPassive = 0;

                if (guest.category === 'Detractor') guest.turnsAsDetractor++;
                else guest.turnsAsDetractor = 0;

                // Update VIP status
                if (guest.vipTurnsRemaining > 0) guest.vipTurnsRemaining--;

                return keep;
            });

            const nextTurn = prev.turn + 1;
            const nps = calculateNPS(newGuests, newPermanentDetractors);
            let status = prev.gameStatus;

            if (nextTurn > 10) {
                if (nps > 20 && newCredits >= 0) status = 'win';
                else status = 'loss';
            } else if (newCredits < -50) {
                status = 'loss'; // Instant loss only if severely bankrupt
            }

            const types = Object.keys(CARDS) as ActionCardType[];
            const newHand = [...prev.hand];

            // Dynamic draw odds
            const totalSlime = newRooms.reduce((sum, r) => sum + r.slime, 0);

            while (newHand.length < 5) {
                // Determine base pool without duplicates
                let drawPool: ActionCardType[] = [...types];

                // Remove cards already in hand
                newHand.forEach(cardInHand => {
                    drawPool = drawPool.filter(c => c !== cardInHand.type);
                });

                // Add biased weighting back into the pool to increase draw probability
                if (drawPool.includes('Bio-Snack')) {
                    drawPool.push('Bio-Snack', 'Bio-Snack');
                }

                if (drawPool.includes('Comms Link')) {
                    drawPool.push('Comms Link');
                }

                // Emergency Trigger: NPS < -20
                if (nps < -20 && drawPool.includes('Scrub Room')) {
                    drawPool.push('Scrub Room', 'Scrub Room');
                }

                // Stability Trigger: 0 Slime and High NPS (> 20)
                if (totalSlime === 0 && nps > 20 && drawPool.includes('System Upgrade')) {
                    drawPool.push('System Upgrade');
                }


                const randomType = drawPool[Math.floor(Math.random() * drawPool.length)];
                newHand.push({
                    id: `card-${nextTurn}-${newHand.length}-${Math.random().toString(36).substring(2, 6)}`,
                    ...CARDS[randomType]
                });
            }

            if (nextTurn > 10) {
                return {
                    ...prev,
                    turn: nextTurn,
                    guests: newGuests,
                    rooms: newRooms,
                    credits: newCredits,
                    gameStatus: status,
                    permanentDetractors: newPermanentDetractors,
                    eventLog: newEventLog.slice(-50)
                };
            }

            return {
                ...prev,
                turn: nextTurn,
                actionOrbs: prev.maxActionOrbs,
                guests: newGuests,
                rooms: newRooms,
                credits: newCredits,
                hand: newHand,
                gameStatus: status,
                permanentDetractors: newPermanentDetractors,
                eventLog: newEventLog.slice(-50)
            };
        });

        // Spawn new guests for the new turn
        spawnGuests();
    }, [spawnGuests]);

    const playCard = useCallback((cardId: string, cardType: ActionCardType, targetId: string) => {
        setState(prev => {
            const card = CARDS[cardType];
            if (prev.actionOrbs < card.orbCost || prev.credits < card.creditCost) {
                return prev;
            }

            // Check if card exists in hand
            const cardInHand = prev.hand.find(c => c.id === cardId);
            if (!cardInHand) return prev;

            let newGuests = [...prev.guests];
            const newRooms = [...prev.rooms];
            const newHand = prev.hand.filter(c => c.id !== cardId);
            const newEventLog = [...prev.eventLog];

            newEventLog.push({
                id: `event-card-${Date.now()}-${cardId.substring(0, 4)}`,
                turn: prev.turn,
                message: `Station Director played: ${card.type}`
            });

            if (cardType === 'Bio-Snack') {
                const idx = newGuests.findIndex(g => g.id === targetId);
                if (idx !== -1) {
                    const guest = newGuests[idx];
                    let newCategory = guest.category;
                    if (guest.species === 'Nebula-Whales') {
                        newCategory = 'Promoter';
                    } else if (guest.category === 'Detractor') {
                        newCategory = 'Passive';
                    } else if (guest.category === 'Passive') {
                        newCategory = 'Promoter';
                    }

                    if (newCategory !== guest.category) {
                        newGuests[idx] = { ...guest, category: newCategory };
                        newEventLog.push({
                            id: `event-biosnack-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            turn: prev.turn,
                            message: `${guest.name} enjoyed a Bio-Snack! Mood improved from ${guest.category} to ${newCategory}.`
                        });
                    }
                }
            } else if (cardType === 'System Upgrade') {
                const roomIdx = parseInt(targetId);
                if (roomIdx >= 0 && roomIdx < 9) {
                    newRooms[roomIdx] = { ...newRooms[roomIdx], hasSystemUpgrade: true };
                    // Apply tier upgrade to existing guests
                    newGuests = newGuests.map(guest => {
                        if (guest.roomIndex === roomIdx) {
                            let newCategory = guest.category;
                            if (guest.category === 'Detractor') newCategory = 'Passive';
                            else if (guest.category === 'Passive') newCategory = 'Promoter';

                            if (newCategory !== guest.category) {
                                newEventLog.push({
                                    id: `event-upgrade-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                                    turn: prev.turn,
                                    message: `System Upgrade at ${newRooms[roomIdx].name} improved ${guest.name}'s mood to ${newCategory}.`
                                });
                                return { ...guest, category: newCategory as import('./gameState').GuestCategory };
                            }
                        }
                        return guest;
                    });
                }
            } else if (cardType === 'Scrub Room') {
                const roomIdx = parseInt(targetId);
                if (roomIdx >= 0 && roomIdx < 9) {
                    newRooms[roomIdx] = { ...newRooms[roomIdx], slime: 0 };
                }
            } else if (cardType === 'VIP Treatment') {
                const idx = newGuests.findIndex(g => g.id === targetId);
                if (idx !== -1) {
                    const guest = newGuests[idx];
                    newGuests[idx] = { ...guest, category: 'Promoter', vipTurnsRemaining: 2 };
                    if (guest.category !== 'Promoter') {
                        newEventLog.push({
                            id: `event-vip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                            turn: prev.turn,
                            message: `VIP Treatment applied to ${guest.name}! Mood maximized to Promoter.`
                        });
                    }
                }
            } else if (cardType === 'Emergency Venting') {
                newRooms.forEach((r, idx) => { newRooms[idx] = { ...r, slime: 0 }; });
                const nonDetractors = newGuests.filter(g => g.category !== 'Detractor' && g.vipTurnsRemaining === 0);
                if (nonDetractors.length > 0) {
                    const targetGuest = nonDetractors[Math.floor(Math.random() * nonDetractors.length)];
                    const idx = newGuests.findIndex(g => g.id === targetGuest.id);
                    newGuests[idx] = { ...newGuests[idx], category: 'Detractor' };
                }
            }

            let newActionOrbs = prev.actionOrbs - card.orbCost;

            return {
                ...prev,
                actionOrbs: newActionOrbs,
                credits: prev.credits - card.creditCost,
                guests: newGuests,
                rooms: newRooms,
                hand: newHand,
                eventLog: newEventLog.slice(-50)
            };
        });
    }, []);

    const burnCard = useCallback((cardId: string) => {
        setState(prev => {
            const newHand = prev.hand.filter(c => c.id !== cardId);
            return {
                ...prev,
                hand: newHand,
            };
        });
    }, []);

    const negotiateWithGuest = useCallback(async (guestId: string, message: string) => {
        // Find guest
        const guest = state.guests.find(g => g.id === guestId);
        if (!guest) return;

        // Optimistically set translating state
        setState(prev => {
            const updated = [...prev.guests];
            const idx = updated.findIndex(g => g.id === guestId);
            if (idx !== -1) {
                updated[idx] = { ...updated[idx], feedback: 'Opening hailing frequencies...' };
            }
            return { ...prev, guests: updated };
        });

        // Fetch Evaluation
        const { newCategory, alienResponse } = await evaluateCommsLink(guest.species, guest.category, message);

        // Apply results
        setState(prev => {
            const updated = [...prev.guests];
            const idx = updated.findIndex(g => g.id === guestId);
            const newEventLog = [...prev.eventLog];

            if (idx !== -1) {
                updated[idx] = {
                    ...updated[idx],
                    category: newCategory,
                    feedback: `[COMMS LINK] ${alienResponse}`
                };

                if (newCategory !== guest.category) {
                    newEventLog.push({
                        id: `event-negotiation-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        turn: prev.turn,
                        message: `Negotiation complete: ${guest.name} changed from ${guest.category} to ${newCategory}!`
                    });
                } else {
                    newEventLog.push({
                        id: `event-negotiation-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        turn: prev.turn,
                        message: `Negotiation complete: ${guest.name} was unmoved and remains ${guest.category}.`
                    });
                }
            }
            return { ...prev, guests: updated, eventLog: newEventLog.slice(-50) };
        });

        return alienResponse;
    }, [state.guests]);

    return {
        state,
        spawnGuests,
        endTurn,
        playCard,
        burnCard,
        negotiateWithGuest,
        nps: calculateNPS(state.guests, state.permanentDetractors),
    };
}
