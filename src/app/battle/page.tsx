'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { Pokemon, Battler, BattleState } from "@/lib/battleLogic";

function BattlePageContent() {
    const searchParams = useSearchParams();
    const teamParam = searchParams.get("team");

    const [teamIds, setTeamIds] = useState<number[]>([]);
    const [battleState, setBattleState] = useState<BattleState | null>(null);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [battleEnded, setBattleEnded] = useState(false);
    const [currentTurn, setCurrentTurn] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const battleLogRef = useRef<HTMLUListElement>(null);

    // Parse selected Pokémon IDs from URL
    useEffect(() => {
        if (teamParam) {
            const ids = teamParam
                .split(",")
                .map((id) => parseInt(id, 10))
                .filter(Boolean);
            setTeamIds(ids);
        }
    }, [teamParam]);

    // Auto-scroll battle log
    useEffect(() => {
        if (battleLogRef.current) {
            setTimeout(() => {
                battleLogRef.current!.scrollTop = battleLogRef.current!.scrollHeight;
            }, 50);
        }
    }, [battleLog]);

    // Initialize battle
    useEffect(() => {
        if (teamIds.length === 0) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/pokemons");
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(`Pokémon API failed (${res.status}): ${txt}`);
                }
                const data = await res.json();

                let selected: Pokemon[] = [];
                let opponents: Pokemon[] = [];

                if (teamIds.length === 1) {
                    const chosen = data.pokemon.find((p: Pokemon) => p.id === teamIds[0]);
                    if (!chosen) throw new Error("Chosen Pokémon not found");
                    const others = data.pokemon.filter((p: Pokemon) => p.id !== teamIds[0]);
                    const opponent = others[Math.floor(Math.random() * others.length)];
                    selected = [chosen];
                    opponents = [opponent];
                } else {
                    selected = data.pokemon.filter((p: Pokemon) => teamIds.includes(p.id));
                    const others = data.pokemon.filter((p: Pokemon) => !teamIds.includes(p.id));
                    opponents = others.sort(() => Math.random() - 0.5).slice(0, teamIds.length);
                }

                const resBattle = await fetch("/api/battle", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userTeam: selected, opponentTeam: opponents, turn: 0, initOnly: true }),
                });

                if (!resBattle.ok) {
                    const txt = await resBattle.text();
                    throw new Error(`Battle API failed (${resBattle.status}): ${txt}`);
                }

                const initState: BattleState = await resBattle.json();
                setBattleState(initState);
                setBattleLog(["Battle started! Click 'Initiate turn' to begin."]);
                setCurrentTurn(1);
                setBattleEnded(false);
            } catch (err: unknown) {
                console.error("Error initializing battle:", err);

                let message = "Failed to initialize battle";
                if (err instanceof Error) message = err.message;

                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [teamIds]);

    // Handle turn execution
    async function handleStartBattle() {
        if (!battleState || battleEnded) return;

        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/battle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userTeam: battleState.userBattlers,
                    opponentTeam: battleState.opponentBattlers,
                    turn: currentTurn,
                }),
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Battle API failed (${res.status}): ${txt}`);
            }

            const nextState: BattleState = await res.json();
            setBattleState(nextState);
            setBattleLog((prev) => [...prev, ...nextState.turnLog]);
            setCurrentTurn((prev) => prev + 1);

            if (nextState.ended) setBattleEnded(true);
        } catch (err: unknown) {
            console.error("Battle turn error:", err);

            let message = "Failed to run battle turn";
            if (err instanceof Error) message = err.message;

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="w-full flex-1 relative">
            {/* Battlefield Background */}
            <div className="absolute inset-0 bg-[url('/images/field-battleground.png')] bg-no-repeat bg-center bg-cover" />

            {/* Error Display */}
            {error && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-50">
                    {error}
                </div>
            )}

            {/* Battle Log */}
            <section className="absolute top-0 left-0 w-full bg-black/60 max-h-64 overflow-hidden z-20 flex flex-col">
                <div className="sticky top-0 bg-black/80 px-4 py-2 border-b border-gray-600 flex-shrink-0">
                    <h2 className="text-white text-lg font-bold">Battle Log</h2>
                </div>
                <ul
                    ref={battleLogRef}
                    className="flex-1 overflow-y-auto space-y-1 text-white text-sm px-4 py-2 pb-8"
                    style={{ scrollbarWidth: "thin" }}
                >
                    {battleLog.length > 0 ? (
                        battleLog.map((line, i) => <li key={i}>{line}</li>)
                    ) : (
                        <>
                            <li>The battle begins! ⚔️</li>
                            <li>Your team takes the field...</li>
                        </>
                    )}
                </ul>
            </section>

            {/* Pokémon Display */}
            <div className="relative z-10 min-h-[80vh] p-6">
                {loading || !battleState ? (
                    <p className="text-white">Loading Pokémon...</p>
                ) : (
                    <>
                        {/* Opponent Team */}
                        {battleState.opponentBattlers.map((poke: Battler, idx: number) => {
                            const positions = [
                                { bottom: "2vh", right: "clamp(0vw, 3vw, 7vw)" },
                                { bottom: "18vh", right: "clamp(10vw, 15vw, 20vw)" },
                                { bottom: "2vh", right: "clamp(20vw, 27vw, 35vw)" },
                            ];
                            const pos = positions[idx] || { bottom: "2vh", right: "0vw" };

                            return (
                                <div
                                    key={poke.id}
                                    style={{ position: "absolute", ...pos }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative w-24 h-24">
                                        {/* Changed from <Image> to <img> due to Docker */}
                                        <img
                                            src={poke.img}
                                            alt={poke.name}
                                            style={{ objectFit: "contain", transform: "scaleX(-1)", width: '100%', height: '100%' }}
                                        />
                                    </div>
                                    <p className="font-bold text-xs text-yellow-300 mt-0">
                                        {poke.name}
                                    </p>
                                    <p className="text-yellow-200 text-xs -mt-1">
                                        {poke.hp}HP
                                    </p>
                                </div>
                            );
                        })}

                        {/* User Team */}
                        {battleState.userBattlers.map((poke: Battler, idx: number) => {
                            const positions = [
                                { bottom: "2vh", left: "clamp(0vw, 3vw, 7vw)" },
                                { bottom: "18vh", left: "clamp(10vw, 15vw, 20vw)" },
                                { bottom: "2vh", left: "clamp(20vw, 27vw, 35vw)" },
                            ];
                            const pos = positions[idx] || { bottom: "2vh", left: "0vw" };

                            return (
                                <div
                                    key={poke.id}
                                    style={{ position: "absolute", ...pos }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative w-24 h-24">
                                        {/* Changed from <Image> to <img> due to Docker */}
                                        <img
                                            src={poke.img}
                                            alt={poke.name}
                                            style={{ objectFit: "contain", width: '100%', height: '100%' }}
                                        />
                                    </div>
                                    <p className="text-green-400 font-bold text-xs mt-0">
                                        {poke.name}
                                    </p>
                                    <p className="text-green-300 text-xs -mt-1">
                                        {poke.hp}HP
                                    </p>
                                </div>
                            );
                        })}

                        {/* Battle Button */}
                        <div className="absolute bottom-76 left-1/2 transform -translate-x-1/2 z-30">
                            <button
                                onClick={handleStartBattle}
                                disabled={loading || battleEnded}
                                className="px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {battleEnded ? "Battle Over" : `Initiate turn ${currentTurn}`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

// Wrap the client component in a Suspense boundary for SSR
export default function BattlePage() {
    return (
        <Suspense fallback={<div>Loading battle...</div>}>
            <BattlePageContent />
        </Suspense>
    );
}
