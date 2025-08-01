'use client';

import { useEffect, useState } from 'react';
import Button from '../buttons/Button';
import { ArrowDown, X } from 'phosphor-react';

interface Pokemon {
    id: number;
    name: string;
    img: string;
}

interface ChosenPokemon extends Pokemon {
    uniqueId: number;
}

interface DataListWithAddProps {
    items: Pokemon[];
    onFight: (selectedItems: ChosenPokemon[]) => void; // keep uniqueId
    header?: string;
    battleMode: 'single' | 'team';
}

export default function DataListWithAdd({
    items,
    onFight,
    header = 'Select Your Pokémon',
    battleMode,
}: DataListWithAddProps) {
    const [selected, setSelected] = useState<Pokemon | null>(null);
    const [chosen, setChosen] = useState<ChosenPokemon[]>([]);
    const [selectedInTeam, setSelectedInTeam] = useState<ChosenPokemon | null>(null);

    const maxAllowed = battleMode === 'single' ? 1 : 3;

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
        // send chosen with uniqueId
        onFight(chosen);
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-center mb-4 text-[#EE1515]">{header}</h2>

            <div className="flex gap-4">
                {/* Available Pokémon */}
                <div className="flex-1 border-2 border-[#78C850] rounded-lg bg-[#E6F2D7] max-w-[200px]">
                    <div className="px-3 py-1 font-semibold text-[#3A5F0B] border-b border-[#78C850]">Available</div>
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
                                    <img
                                        src={item.img.startsWith('http') ? item.img : `/${item.img}`}
                                        alt={item.name}
                                        style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Selected Pokémon Details */}
                <div className="flex-1 border-2 border-[#78C850] rounded-lg bg-[#E6F2D7] flex flex-col items-center justify-center p-4">
                    {selected ? (
                        <>
                            <div className="relative w-24 h-24 rounded-lg border overflow-hidden bg-white shadow-sm mb-4">
                                <img
                                    src={selected.img.startsWith('http') ? selected.img : `/${selected.img}`}
                                    alt={selected.name}
                                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                />
                            </div>
                            <h4 className="text-lg font-semibold text-[#EE1515]">{selected.name}</h4>
                        </>
                    ) : (
                        <p className="text-gray-500 italic text-center">Select a Pokémon to view details.</p>
                    )}
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
                    aria-label="Add selected Pokémon"
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
                    aria-label="Remove selected Pokémon"
                >
                    <X size={18} weight="bold" />
                </button>
            </div>

            {/* Your Team Section */}
            <div className="border-2 border-[#78C850] rounded-lg bg-[#E6F2D7]">
                <div className="px-3 py-1 font-semibold text-[#3A5F0B] border-b border-[#78C850]">Your Team</div>
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
                                <img
                                    src={item.img.startsWith('http') ? item.img : `/${item.img}`}
                                    alt={item.name}
                                    style={{ objectFit: 'contain', width: '100%', height: '100%' }}
                                />
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
                        chosen.length === 0 ||
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
