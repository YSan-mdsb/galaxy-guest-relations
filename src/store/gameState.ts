// src/store/gameState.ts

import type { ActionCard } from './actions';

export type GuestSpecies = 'Glip-Glops' | 'Borg-ish' | 'Nebula-Whales';
export type GuestCategory = 'Promoter' | 'Passive' | 'Detractor';

export interface Guest {
    id: string;
    name: string;
    species: GuestSpecies;
    category: GuestCategory;
    roomIndex: number; // 0-8
    feedback: string;
    turnsAsPassive: number;
    turnsAsDetractor: number;
    vipTurnsRemaining: number;
}

export interface Room {
    index: number;
    name: string;
    slime: number;
    hasSystemUpgrade: boolean;
}

export interface GameEvent {
    id: string;
    turn: number;
    message: string;
}

export interface GameState {
    turn: number;
    credits: number;
    actionOrbs: number;
    maxActionOrbs: number;
    rooms: Room[];
    guests: Guest[];
    hand: ActionCard[];
    eventLog: GameEvent[];
    gameStatus: 'playing' | 'win' | 'loss';
    permanentDetractors: number;
}

export const initialRooms: Room[] = Array.from({ length: 9 }, (_, i) => ({
    index: i,
    name: getRoomName(i),
    slime: 0,
    hasSystemUpgrade: false,
}));

function getRoomName(index: number): string {
    const roomTypes = ['Mess Hall', 'Docking Bay', 'Life Support', 'Gravity Control', 'Holodeck', 'Airlock', 'Hydroponics', 'Medical Bay', 'Living Quarter'];
    return roomTypes[index % roomTypes.length];
}

export const initialGameState: GameState = {
    turn: 1,
    credits: 100,
    actionOrbs: 3,
    maxActionOrbs: 3,
    rooms: initialRooms,
    guests: [],
    hand: [],
    eventLog: [{ id: 'init-event', turn: 1, message: 'System Boot Sequence Initialized. Awaiting docked transports.' }],
    gameStatus: 'playing',
    permanentDetractors: 0,
};

// --- Synchrnous Name Generation ---
export function generateGuestName(species: GuestSpecies): string {
    const glipGlopNames = ['Gloop', 'Shlorp', 'Squish', 'Plop', 'Splosh', 'Blub', 'Glug', 'Squelch', 'Ooze', 'Slurm'];
    const borgIshNames = ['Unit-734', 'Drone-Alpha', 'Sub-Node 9', 'Compiler-X', 'Task-001', 'Node-Beta', 'Protocol-7', 'Syntax-Err', 'Assembler-42', 'Root-Access'];
    const whaleNames = ['Orian the Vast', 'Void-Swimmer', 'Ancient Cetus', 'The Star-Drifter', 'Cosmic Echo', 'The Deep Singer', 'Stellar Tide', 'The Grand Leviathan', 'Astral Behemoth', 'The Silent Observer'];

    let pool: string[];
    if (species === 'Glip-Glops') pool = glipGlopNames;
    else if (species === 'Borg-ish') pool = borgIshNames;
    else pool = whaleNames;

    return pool[Math.floor(Math.random() * pool.length)];
}

// Helper action calculations
export function calculateNPS(guests: Guest[], permanentDetractors: number = 0): number {
    const totalHeadcount = guests.length + permanentDetractors;
    if (totalHeadcount === 0) return 0;

    let promoters = 0;
    let detractors = 0;

    guests.forEach(g => {
        if (g.category === 'Promoter') promoters++;
        else if (g.category === 'Detractor') detractors++;
    });

    return Math.round(((promoters - detractors - permanentDetractors) / totalHeadcount) * 100);
}
