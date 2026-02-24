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
import { useIsMobile } from './hooks/useIsMobile';
import { Map, Activity } from 'lucide-react';
import type { ActionCardType } from './store/actions';
import type { Guest } from './store/gameState';

function App() {
  const { state, spawnGuests, endTurn, playCard, burnCard, negotiateWithGuest, nps } = useGameEngine();
  const isMobile = useIsMobile();
  const [showTutorial, setShowTutorial] = useState(false);
  const [focusedGuestId, setFocusedGuestId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'map' | 'log'>('map');

  // Track unread log events when on map tab
  const [lastSeenLogCount, setLastSeenLogCount] = useState(0);
  const unreadLogCount = mobileTab === 'map' ? state.eventLog.length - lastSeenLogCount : 0;

  // When switching to log tab, mark all as read
  useEffect(() => {
    if (mobileTab === 'log') {
      setLastSeenLogCount(state.eventLog.length);
    }
  }, [mobileTab, state.eventLog.length]);

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
      setShowTutorial(true);
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
        burnCard(cardId);
      }
      setSelectedCardId(null);
      return;
    }
    playCard(cardId, cardType as ActionCardType, targetId);
    setSelectedCardId(null);
  };

  const handleGuestClick = (id: string) => {
    setFocusedGuestId(prev => (prev === id ? null : id));
  };

  // ─── Shared elements (modals, overlays) ─────────────────
  const sharedOverlays = (
    <>
      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} isMobile={isMobile} />
      <EndGameModal status={state.gameStatus} nps={nps} credits={state.credits} />
      <CommsLinkModal
        isOpen={!!commsTarget}
        guest={commsTarget}
        onClose={() => setCommsTarget(null)}
        onSubmit={negotiateWithGuest}
      />
    </>
  );

  const headerProps = {
    turn: state.turn,
    credits: state.credits,
    orbs: state.actionOrbs,
    maxOrbs: state.maxActionOrbs,
    nps,
    permanentDetractors: state.permanentDetractors,
    onEndTurn: handleEndTurn,
    onHelpClick: () => { audioSystem.playClick(); setShowTutorial(true); },
    isMobile,
  };

  const selectedCard = state.hand.find(c => c.id === selectedCardId) || null;

  return (
    <motion.div
      className="h-screen w-screen flex flex-col overflow-hidden bg-darkBg select-none font-mono"
      onClick={() => { setFocusedGuestId(null); setSelectedCardId(null); }}
      animate={shake ? { x: [-15, 15, -10, 10, -5, 5, 0], y: [-5, 5, -5, 5, -2, 2, 0] } : {}}
      transition={{ duration: 0.5, ease: "linear" }}
    >
      {/* Global CRT scanline effect overlay */}
      <div className="crt-overlay pointer-events-none" />

      {!hasStarted && (
        <IntroScreen onStart={() => setHasStarted(true)} />
      )}

      {hasStarted && isMobile && (
        <>
          {sharedOverlays}
          <CommandHeader {...headerProps} />

          {/* ─── Mobile Tab Content ─── */}
          <main className="flex-1 overflow-hidden relative">
            {mobileTab === 'map' && (
              <div className="h-full overflow-auto relative" onClick={(e) => e.stopPropagation()}>
                <StationMap
                  rooms={state.rooms}
                  guests={state.guests}
                  onDropCard={handleDropCard}
                  focusedGuestId={focusedGuestId}
                  onGuestClick={handleGuestClick}
                  selectedCard={selectedCard}
                  isMobile={isMobile}
                />
                <GuestDetailsPanel
                  guest={state.guests.find(g => g.id === focusedGuestId) || null}
                  onClose={() => setFocusedGuestId(null)}
                  isMobile={isMobile}
                />
              </div>
            )}
            {mobileTab === 'log' && (
              <div className="h-full" onClick={(e) => e.stopPropagation()}>
                <EventLogConsole events={state.eventLog} isMobile={isMobile} />
              </div>
            )}
          </main>

          {/* ─── Mobile Tab Bar ─── */}
          <div className="flex border-t border-neonAmber/30 bg-darkBg/95 shrink-0 z-20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMobileTab('map')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-widest font-bold transition-colors ${mobileTab === 'map' ? 'text-crtGreen border-t-2 border-crtGreen bg-crtGreen/5' : 'text-neonAmber/50'}`}
            >
              <Map size={16} />
              Station
            </button>
            <button
              onClick={() => setMobileTab('log')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-widest font-bold transition-colors relative ${mobileTab === 'log' ? 'text-crtGreen border-t-2 border-crtGreen bg-crtGreen/5' : 'text-neonAmber/50'}`}
            >
              <Activity size={16} />
              Log
              {unreadLogCount > 0 && (
                <span className="absolute top-1 right-1/4 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-crtGreen text-darkBg text-[10px] font-bold px-1">
                  {unreadLogCount > 9 ? '9+' : unreadLogCount}
                </span>
              )}
            </button>
          </div>

          {/* ─── Mobile Card Strip ─── */}
          <div className="shrink-0 z-20" onClick={(e) => e.stopPropagation()}>
            <CardTray
              credits={state.credits}
              orbs={state.actionOrbs}
              hand={state.hand}
              onBurnCard={burnCard}
              selectedCardId={selectedCardId}
              onSelectCard={(id: string) => setSelectedCardId(prev => prev === id ? null : id)}
              isMobile={isMobile}
            />
          </div>
        </>
      )}

      {hasStarted && !isMobile && (
        <>
          {sharedOverlays}
          <CommandHeader {...headerProps} />

          <main className="flex-1 flex flex-row overflow-hidden">
            <div className="flex-1 flex flex-col relative z-0">
              <div className="flex-1 overflow-auto">
                <StationMap
                  rooms={state.rooms}
                  guests={state.guests}
                  onDropCard={handleDropCard}
                  focusedGuestId={focusedGuestId}
                  onGuestClick={handleGuestClick}
                  selectedCard={selectedCard}
                />
                <GuestDetailsPanel
                  guest={state.guests.find(g => g.id === focusedGuestId) || null}
                  onClose={() => setFocusedGuestId(null)}
                />
              </div>
              <div className="shrink-0 mt-auto shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-20" onClick={(e) => e.stopPropagation()}>
                <CardTray
                  credits={state.credits}
                  orbs={state.actionOrbs}
                  hand={state.hand}
                  onBurnCard={burnCard}
                  selectedCardId={selectedCardId}
                  onSelectCard={(id: string) => setSelectedCardId(prev => prev === id ? null : id)}
                />
              </div>
            </div>

            <div className="h-full w-80 border-l border-neonAmber/30 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <EventLogConsole events={state.eventLog} />
            </div>
          </main>
        </>
      )}
    </motion.div>
  );
}

export default App;
