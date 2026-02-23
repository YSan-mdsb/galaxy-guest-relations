# Galaxy Guest Relations

A turn-based Customer Experience (CX) simulator set on a chaotic deep-space waystation. Run the station, manage wacky alien species, and try to survive the regional audit!

## Turn-Based Loop
1. **Guests Arrive**: Every turn, 2-3 new aliens dock at random rooms on the 3x3 Station Grid.
2. **Review Feedback**: Guests leave garbled comments based on their status (Detractor, Passive, or Promoter). The LLM Translator automatically translates their mood into real-time English feedback.
3. **Action Cards**: Spend Action Orbs and Credits to play cards from your persistent hand of 5 unique cards to fix rooms and satisfy guests.
4. **End Turn**: Tally up new Net Promoter Score (NPS), handle alien species quirks (like Borg-ish churn), process slime hazards, and replenish your active hand back to 5 cards.

## Scoring & Status Tiers
Guests have three clear status tiers:
*   **Detractor** (Red): Unhappy guests. They leak slime if they are Glip-Glops.
*   **Passive** (Amber): Neutral guests. Borg-ish guests might abruptly leave (churn) in this state, leaving a Permanent Detractor penalty on your overall NPS!
*   **Promoter** (Green): Happy guests. Nebula-Whales will tip extra credits if they reach this state.

## Action Cards
At the start of the game, you are dealt 5 cards (at least one of each type). Played cards are removed from your hand, and you draw back up to 5 at the end of each turn. Draw odds are dynamic—they increase for recovery cards when in an emergency, and increase for growth cards when stable!

*   **Bio-Snack (1 Orb, 5 CR)**: Instantly upgrade a guest's status by 1 tier. Nebula-Whales skip straight to Promoter!
*   **System Upgrade (2 Orbs, 10 CR)**: Install permanent upgrades to a room. Moves all current guests up 1 tier and buffs any future guests who spawn there.
*   **Scrub Room (1 Orb, 5 CR)**: Clean a room of all Slime. *Warning: If a room reaches >2 Slime, non-VIP guests inside drop a tier at the end of the turn!*
*   **Comms Link (1 Orb, 5 CR)**: Opens a direct hailing frequency to an alien guest. Allows the player to negotiate directly to improve the guest's mood based on species-specific logic. 
*   **VIP Treatment (3 Orbs, 15 CR)**: Upgrade a guest directly to Promoter. Grants immunity to tier drops (from decay or slime) for 2 turns.
*   **Emergency Venting (2 Orbs, 10 CR)**: Clear all Slime across the entire station. The loud noise downgrades 1 random non-Detractor guest.

## Win / Loss Conditions
*   **Loss**: If your Credits fall below -50 at any point, the station goes bankrupt instantly.
*   **The Audit (Turn 10)**: You win if you survive until Turn 10 with an **NPS > 20** and positive credits. Otherwise, you lose your job as Galactic Director.

## Tech Stack
*   React 18 + TypeScript + Vite
*   Tailwind CSS (for styling and neon glow effects)
*   Framer Motion (for fluid drag-and-drop and animations)
*   Lucide React (for icons)
