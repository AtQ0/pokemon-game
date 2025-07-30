'use client';

import { useEffect, useState } from 'react';
import Button from '../buttons/Button';
import { ArrowDown, X } from 'phosphor-react';

interface PokemonBase {
    id: number;
    img?: string;
    name?: string;
    height?: string;
    weight?: string;
    egg?: string;
    spawn_chance?: number;
    avg_spawns?: number;
    spawn_time?: string;
    type?: string[];
    weaknesses?: string[];
}

interface ChosenPokemon extends PokemonBase {
    uniqueId: number;
}

interface DataListWithAddProps<T extends PokemonBase> {
    items: T[];
    onFight: (selectedItems: T[]) => void;
    header?: string;
    battleMode: 'single' | 'team';
}

export default function DataListWithAdd<T extends PokemonBase>({
    items,
    onFight: onFight,
    header = 'Select Items',
    battleMode,
}: DataListWithAddProps<T>) {
    const [selected, setSelected] = useState<T | null>(null);
    const [chosen, setChosen] = useState<ChosenPokemon[]>([]);
    const [selectedInTeam, setSelectedInTeam] = useState<ChosenPokemon | null>(null);

    // Max allowed by mode
    const maxAllowed = battleMode === 'single' ? 1 : 3;

    // Reset team when battleMode changes
    useEffect(() => {
        setChosen([]);
        setSelectedInTeam(null);
    }, [battleMode]);

    const handleAdd = () => {
        if (selected) {
            if (chosen.length >= maxAllowed) {
                alert(`You can only select up to ${maxAllowed} Pokémon in this mode.`);
                return;
            }
            // Add a uniqueId to allow duplicates
            const newChosen: ChosenPokemon = { ...selected, uniqueId: Date.now() + Math.random() };
            setChosen((prev) => [...prev, newChosen]);
        }
    };

    const handleRemove = () => {
        if (selectedInTeam) {
            setChosen((prev) => prev.filter((item) => item.uniqueId !== selectedInTeam.uniqueId));
            setSelectedInTeam(null);
        }
    };

    const handleFight = () => {
        // Remove uniqueId before saving to keep original shape
        const fight = chosen.map(({ uniqueId: _uniqueId, ...rest }) => {
            void _uniqueId; // Prevent unused warning
            return rest as T;
        });
        onFight(fight);
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-lg">
            {/* Header */}
            <h2 className="text-xl font-bold text-center mb-4 text-[#EE1515]">{header}</h2>

            {/* Available + Details Row */}
            <div className="flex gap-4">
                {/* Available Column */}
                <div className="flex-1 border-2 border-[#78C850] rounded-lg bg-[#E6F2D7] max-w-[200px]">
                    {/* Title */}
                    <div className="px-3 py-1 font-semibold text-[#3A5F0B] border-b border-[#78C850]">
                        Available
                    </div>

                    {/* Scrollable content */}
                    <div className="px-3 pt-2 pb-3 overflow-y-auto max-h-[160px]">
                        <div className="grid grid-cols-2 gap-2">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelected(item)}
                                    className={`relative w-16 h-16 cursor-pointer rounded-lg border-2 overflow-hidden p-1 transition-colors ${selected?.id === item.id
                                        ? 'bg-[#A6CDE1] border-[#EE1515]'
                                        : 'hover:bg-[#D4EAC9] border-transparent'
                                        }`}
                                >
                                    {item.img ? (
                                        // Changed from <Image> to <img>
                                        <img
                                            src={item.img.startsWith('http') ? item.img : `/${item.img}`}
                                            alt={item.name ?? 'Item'}
                                            style={{ objectFit: 'contain', width: '100%', height: '100%' }} // Equivalent of fill
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400 italic text-xs">
                                            No image
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Details Column */}
                <div className="flex-1 border-2 border-[#78C850] rounded-lg bg-[#E6F2D7]">
                    {/* Title */}
                    <div className="px-3 py-1 font-semibold text-[#3A5F0B] border-b border-[#78C850]">
                        Details
                    </div>

                    {/* Scrollable content */}
                    <div className="px-3 pt-2 pb-3 overflow-y-auto max-h-[160px]">
                        {selected ? (
                            <div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative w-20 h-20 rounded-lg border overflow-hidden bg-white shadow-sm">
                                        {selected.img ? (
                                            // Changed from <Image> to <img> due to docker
                                            <img
                                                src={selected.img.startsWith('http') ? selected.img : `/${selected.img}`}
                                                alt={selected.name ?? 'Item'}
                                                style={{ objectFit: 'contain', width: '100%', height: '100%' }} // Equivalent of fill
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 italic text-xs">
                                                No image
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-sm font-semibold text-[#EE1515]">{selected.name ?? 'Unknown'}</h4>
                                </div>

                                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-gray-800 text-xs">
                                    <div className="font-semibold">Height:</div>
                                    <div>{selected.height ?? 'N/A'}</div>

                                    <div className="font-semibold">Weight:</div>
                                    <div>{selected.weight ?? 'N/A'}</div>

                                    <div className="font-semibold">Egg:</div>
                                    <div>{selected.egg ?? 'N/A'}</div>

                                    <div className="font-semibold">Spawn Chance:</div>
                                    <div>{selected.spawn_chance !== undefined ? `${selected.spawn_chance}%` : 'N/A'}</div>

                                    <div className="font-semibold">Avg Spawns:</div>
                                    <div>{selected.avg_spawns ?? 'N/A'}</div>

                                    <div className="font-semibold">Spawn Time:</div>
                                    <div>{selected.spawn_time ?? 'N/A'}</div>
                                </div>

                                <div className="mt-6">
                                    <div className="font-semibold mb-1 text-gray-700 text-xs">Type:</div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {selected.type?.length ? (
                                            selected.type.map((t) => (
                                                <span
                                                    key={t}
                                                    className="px-2 py-1 rounded-full font-semibold bg-green-400 text-green-900"
                                                >
                                                    {t}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 italic">N/A</span>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="font-semibold mb-1 text-gray-700 text-xs">Weaknesses:</div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        {selected.weaknesses?.length ? (
                                            selected.weaknesses.map((w) => (
                                                <span
                                                    key={w}
                                                    className="px-2 py-1 rounded-full font-semibold bg-red-200 text-red-800"
                                                >
                                                    {w}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 italic">N/A</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-xs">Select a Pokémon to view details.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add + Remove Buttons */}
            <div className="flex justify-center items-center my-4 gap-3">
                <button
                    onClick={handleAdd}
                    disabled={!selected || chosen.length >= maxAllowed}
                    className={`p-2 rounded-full transition-colors ${selected && chosen.length < maxAllowed
                        ? 'bg-[#EE1515] text-white hover:bg-[#B01010] cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    aria-label="Add selected item"
                    title={chosen.length >= maxAllowed ? `Max ${maxAllowed} Pokémon allowed` : undefined}
                >
                    <ArrowDown size={18} weight="bold" />
                </button>

                <button
                    onClick={handleRemove}
                    disabled={!selectedInTeam}
                    className={`p-2 rounded-full transition-colors ${selectedInTeam
                        ? 'bg-[#EE1515] text-white hover:bg-[#B01010] cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    aria-label="Remove selected item"
                >
                    <X size={18} weight="bold" />
                </button>
            </div>

            {/* Your Team Section */}
            <div className="border-2 border-[#78C850] rounded-lg bg-[#E6F2D7]">
                {/* Title */}
                <div className="px-3 py-1 font-semibold text-[#3A5F0B] border-b border-[#78C850]">Your Team</div>

                {/* Scrollable content */}
                <div className="p-3 pt-4 overflow-y-auto max-h-[160px] grid grid-cols-3 sm:grid-cols-4 gap-2 min-h-[100px]">
                    {chosen.length > 0 ? (
                        chosen.map((item) => (
                            <div
                                key={item.uniqueId}
                                onClick={() =>
                                    setSelectedInTeam(selectedInTeam?.uniqueId === item.uniqueId ? null : item)
                                }
                                className={`relative w-16 h-16 cursor-pointer rounded-lg border-2 overflow-hidden p-1 transition-colors ${selectedInTeam?.uniqueId === item.uniqueId
                                    ? 'bg-[#A6CDE1] border-[#EE1515]'
                                    : 'hover:bg-[#D4EAC9] border-transparent'
                                    }`}
                            >
                                {item.img ? (
                                    // Changed from <Image> to <img> due to Docker
                                    <img
                                        src={item.img.startsWith('http') ? item.img : `/${item.img}`}
                                        alt={item.name ?? 'Item'}
                                        style={{ objectFit: 'contain', width: '100%', height: '100%' }} // Equivalent of fill
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 italic text-xs">
                                        No image
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 italic text-center col-span-full">Your team is empty.</p>
                    )}
                </div>
            </div>

            {/* Fight! Button */}
            <div className="mt-6 flex justify-center">
                <Button
                    label="Fight!"
                    onClick={handleFight}
                    disabled={
                        chosen.length === 0 || // no selection at all
                        (battleMode === 'single' && chosen.length !== 1) ||
                        (battleMode === 'team' && chosen.length !== 3)
                    }
                    className={`w-full max-w-[300px] text-white ${chosen.length === (battleMode === 'single' ? 1 : 3)
                        ? 'bg-[#EE1515] hover:bg-[#B01010]'
                        : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    useIsActiveStyle={false}
                />
            </div>
        </div>
    );
}
