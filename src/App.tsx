// src/App.tsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameEngine } from './store/useGameEngine';
import { CommandHeader } from './components/CommandHeader';
import { StationMap } from './components/StationMap';
import { EventLogConsole } from './components/FeedbackTicker';
import { GuestDetailsPanel } from './components/GuestDetailsPanel';
import { CardTray } from './components/CardTray';
import { TutorialOverlay } from './components/TutorialOverlay';
import { EndGameModal } from './components/EndGameModal';
import { CommsLinkModal } from './components/CommsLinkModal';
import { IntroScreen } from './components/IntroScreen';
import { audioSystem } from './utils/audioSystem';
import { useRef } from 'react';
import type { ActionCardType } from './store/actions';
import type { Guest } from './store/gameState';

function App() {
  const { state, spawnGuests, endTurn, playCard, burnCard, negotiateWithGuest, nps } = useGameEngine();
  const [showTutorial, setShowTutorial] = useState(false);
  const [focusedGuestId, setFocusedGuestId] = useState<string | null>(null);

  // Comms Link State
  const [commsTarget, setCommsTarget] = useState<Guest | null>(null);

  const [hasStarted, setHasStarted] = useState(false);
  const [shake, setShake] = useState(false);
  const hasSpawnedInitialGuests = useRef(false);

  // Initialize first guests
  useEffect(() => {
    if (hasStarted && !hasSpawnedInitialGuests.current) {
      hasSpawnedInitialGuests.current = true;
      spawnGuests();
      setShowTutorial(true); // Show tutorial on mount (Turn 1)
    }
  }, [hasStarted, spawnGuests]);

  const handleEndTurn = () => {
    audioSystem.playClick();
    endTurn();
    audioSystem.playAirlockHiss();
  };

  const handleDropCard = (cardId: string, cardType: string, targetId: string) => {
    audioSystem.playDrop();

    if (cardType === 'Emergency Venting') {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }

    if (cardType === 'Comms Link') {
      const guest = state.guests.find(g => g.id === targetId);
      if (guest) {
        setCommsTarget(guest);
        // Burn the card (refund logic might be needed if they cancel, but burning on use is fine for MVP)
        burnCard(cardId);
      }
      return;
    }
    playCard(cardId, cardType as ActionCardType, targetId);
  };

  const handleGuestClick = (id: string) => {
    setFocusedGuestId(prev => (prev === id ? null : id));
  };

  return (
    <motion.div
      className="h-screen w-screen flex flex-col overflow-hidden bg-darkBg select-none font-mono"
      onClick={() => setFocusedGuestId(null)}
      animate={shake ? { x: [-15, 15, -10, 10, -5, 5, 0], y: [-5, 5, -5, 5, -2, 2, 0] } : {}}
      transition={{ duration: 0.5, ease: "linear" }}
    >
      {/* Global CRT scanline effect overlay */}
      <div className="crt-overlay pointer-events-none" />

      {!hasStarted && (
        <IntroScreen onStart={() => setHasStarted(true)} />
      )}

      {hasStarted && (
        <>
          <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
          <EndGameModal status={state.gameStatus} nps={nps} credits={state.credits} />

          <CommsLinkModal
            isOpen={!!commsTarget}
            guest={commsTarget}
            onClose={() => setCommsTarget(null)}
            onSubmit={negotiateWithGuest}
          />

          <CommandHeader
            turn={state.turn}
            credits={state.credits}
            orbs={state.actionOrbs}
            maxOrbs={state.maxActionOrbs}
            nps={nps}
            permanentDetractors={state.permanentDetractors}
            onEndTurn={handleEndTurn}
            onHelpClick={() => { audioSystem.playClick(); setShowTutorial(true); }}
          />

          <main className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col relative z-0 relative">
              <div className="flex-1 overflow-auto">
                <StationMap
                  rooms={state.rooms}
                  guests={state.guests}
                  onDropCard={handleDropCard}
                  focusedGuestId={focusedGuestId}
                  onGuestClick={handleGuestClick}
                />
                <GuestDetailsPanel
                  guest={state.guests.find(g => g.id === focusedGuestId) || null}
                  onClose={() => setFocusedGuestId(null)}
                />
              </div>
              <div className="shrink-0 mt-auto shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-20" onClick={(e) => e.stopPropagation()}>
                <CardTray credits={state.credits} orbs={state.actionOrbs} hand={state.hand} onBurnCard={burnCard} />
              </div>
            </div>

            <div onClick={(e) => e.stopPropagation()}>
              <EventLogConsole events={state.eventLog} />
            </div>
          </main>
        </>
      )}
    </motion.div>
  );
}

export default App;
