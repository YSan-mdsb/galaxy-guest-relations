// src/components/EndGameModal.tsx

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, AlertTriangle, Send } from 'lucide-react';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';

interface Props {
    status: 'playing' | 'win' | 'loss';
    nps: number;
    credits: number;
}

export function EndGameModal({ status, nps, credits }: Props) {
    const [playerName, setPlayerName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [highScores, setHighScores] = useState<any[]>([]);

    useEffect(() => {
        if (status !== 'playing') {
            fetchHighScores();
        }
    }, [status]);

    const fetchHighScores = async () => {
        try {
            const q = query(collection(db, 'highscores'), orderBy('score', 'desc'), limit(10));
            const querySnapshot = await getDocs(q);
            const scores: any[] = [];
            querySnapshot.forEach((doc) => {
                scores.push({ id: doc.id, ...doc.data() });
            });
            setHighScores(scores);
        } catch (error) {
            console.error("Failed to fetch high scores", error);
        }
    };

    const handleSubmitScore = async () => {
        if (!playerName.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'highscores'), {
                name: playerName.trim().substring(0, 10), // Limit name to 10 chars
                score: nps,
                credits: credits,
                timestamp: serverTimestamp()
            });
            setHasSubmitted(true);
            fetchHighScores();
        } catch (error) {
            console.error("Failed to submit score", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === 'playing') return null;

    const isWin = status === 'win';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-darkBg/95 backdrop-blur-xl p-4 overflow-y-auto">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`max-w-2xl w-full p-4 md:p-8 border-2 text-center relative overflow-hidden my-8 ${isWin ? 'border-crtGreen box-glow-green bg-crtGreen/5' : 'border-red-500 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.2)]'}`}
            >
                <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(90deg,transparent_25%,currentColor_50%,transparent_75%,transparent_100%)] bg-[length:4px_100%] animate-scanline" style={{ color: isWin ? '#33ff33' : '#ef4444' }} />

                <div className="relative z-10 flex flex-col items-center">
                    {isWin ? (
                        <Trophy size={64} className="text-crtGreen mb-6 drop-shadow-[0_0_15px_rgba(51,255,51,0.5)]" />
                    ) : (
                        <AlertTriangle size={64} className="text-red-500 mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    )}

                    <h1 className={`font-bold mb-4 uppercase tracking-widest leading-tight ${isWin ? 'text-4xl md:text-5xl text-crtGreen glow-green' : 'text-3xl md:text-5xl text-red-500 text-shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}>
                        {isWin ? 'Promotion to Galactic Director' : 'Station Decommissioned / Recycled'}
                    </h1>

                    <div className="mt-8 grid grid-cols-2 gap-8 text-xl max-w-md w-full">
                        <div className="flex flex-col border border-neonAmber/30 p-4 bg-darkBg">
                            <span className="text-neonAmber/70 text-sm uppercase tracking-wider mb-2">Final NPS Score</span>
                            <span className={`font-bold ${nps >= 40 ? 'text-crtGreen' : 'text-red-500'}`}>{nps}%</span>
                        </div>
                        <div className="flex flex-col border border-neonAmber/30 p-4 bg-darkBg">
                            <span className="text-neonAmber/70 text-sm uppercase tracking-wider mb-2">Final Credits</span>
                            <span className={`font-bold ${credits >= 0 ? 'text-neonAmber' : 'text-red-500'}`}>{credits} CR</span>
                        </div>
                    </div>

                    {isWin && !hasSubmitted && (
                        <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-md relative z-20">
                            <span className="text-neonAmber/80 uppercase tracking-widest text-sm">Enter Identifier for ITA Archives</span>
                            <div className="flex w-full gap-2">
                                <input
                                    type="text"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                                    maxLength={10}
                                    placeholder="AAA"
                                    className="flex-1 bg-darkBg border border-neonAmber text-neonAmber p-3 text-center uppercase tracking-widest focus:outline-none focus:border-crtGreen"
                                />
                                <button
                                    onClick={handleSubmitScore}
                                    disabled={!playerName.trim() || isSubmitting}
                                    className="px-6 border border-crtGreen text-crtGreen hover:bg-crtGreen hover:text-darkBg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    )}

                    {highScores.length > 0 && (
                        <div className="mt-8 w-full max-w-md relative z-20">
                            <h3 className="text-crtGreen uppercase tracking-widest border-b border-crtGreen/30 pb-2 mb-4 text-lg">Top 10 Galactic Directors</h3>
                            <div className="flex flex-col gap-1">
                                {highScores.map((scoreObj, idx) => (
                                    <div key={scoreObj.id} className="flex justify-between items-center text-neonAmber/80 font-mono text-sm border-b border-neonAmber/10 pb-1">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-crtGreen/50 w-6 text-right">{idx + 1}.</span>
                                            <span className="font-bold tracking-widest">{scoreObj.name || "UNKNOWN"}</span>
                                        </div>
                                        <span className="text-crtGreen">{scoreObj.score}% NPS</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-12">
                        <button
                            onClick={() => window.location.reload()}
                            className="text-sm border border-neonAmber/30 text-neonAmber/80 hover:bg-neonAmber hover:text-darkBg px-6 py-3 tracking-widest uppercase transition-colors rounded-sm"
                        >
                            Restart Simulation Cycle
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
