// src/store/actions.ts
export type ActionCardType = 'Bio-Snack' | 'System Upgrade' | 'Scrub Room' | 'VIP Treatment' | 'Emergency Venting' | 'Comms Link';

export interface ActionCard {
    id: string;
    type: ActionCardType;
    orbCost: number;
    creditCost: number;
    description: string;
}

export const CARDS: Record<ActionCardType, Omit<ActionCard, 'id'>> = {
    'Bio-Snack': { type: 'Bio-Snack', orbCost: 1, creditCost: 10, description: 'Upgrades 1 guest by a tier' },
    'System Upgrade': { type: 'System Upgrade', orbCost: 2, creditCost: 60, description: 'Upgrades all guests in room by a tier' },
    'Scrub Room': { type: 'Scrub Room', orbCost: 1, creditCost: 0, description: 'Removes all Slime' },
    'VIP Treatment': { type: 'VIP Treatment', orbCost: 1, creditCost: 30, description: 'Upgrades guest to Promoter. Immune to slime/decay for 2 turns.' },
    'Emergency Venting': { type: 'Emergency Venting', orbCost: 1, creditCost: 0, description: 'Instantly clears all Slime everywhere. Downgrades 1 random non-Detractor guest.' },
    'Comms Link': { type: 'Comms Link', orbCost: 0, creditCost: 10, description: 'Open a comms channel. Negotiate directly with a guest to alter their mood.' },
};

export const ALIEN_FEEDBACK = {
    'Life Support': 'Oxygen/Air is bad',
    'Mess Hall': 'Food/Paste is terrible',
    'Gravity Control': 'Lumpy/Heavy feeling',
};

// Generates garbled text
export function createGarbledText(keyword: string) {
    const chars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let garbled = '';
    // Mix chars with actual keywords to create "Babelfish" effect
    for (let i = 0; i < 15; i++) {
        garbled += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return garbled + ' ' + keyword + ' ' + garbled;
}
