'use client';

import BattleModeToggle from '@/components/buttons/BattleModeToggle';
import DataListWithAdd from '@/components/dataListWithAdd/dataListWithAdd';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Pokemon {
  id: number;
  name: string;
  img: string;
  uniqueId?: number; // added optional for duplicates
}

export default function Home() {
  const router = useRouter();

  const introAudioRef = useRef<HTMLAudioElement | null>(null);
  const themeAudioRef = useRef<HTMLAudioElement | null>(null);

  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [battleMode, setBattleMode] = useState<'single' | 'team'>('single');

  useEffect(() => {
    async function fetchPokemon() {
      try {
        const res = await fetch('/api/pokemons');
        if (!res.ok) throw new Error('Failed to fetch Pokémon data');
        const data = await res.json();
        setPokemonList(data.pokemon);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    fetchPokemon();
  }, []);

  useEffect(() => {
    introAudioRef.current = new Audio('/sounds/intro.mp3');
    themeAudioRef.current = new Audio('/sounds/theme-song.mp3');

    introAudioRef.current
      .play()
      .catch((err) => console.warn('Autoplay was prevented:', err));

    const onIntroEnded = () => {
      if (themeAudioRef.current) {
        themeAudioRef.current.loop = true;
        themeAudioRef.current
          .play()
          .catch((err) =>
            console.warn('Autoplay theme-song was prevented:', err)
          );
      }
    };

    introAudioRef.current.addEventListener('ended', onIntroEnded);

    return () => {
      introAudioRef.current?.pause();
      introAudioRef.current?.removeEventListener('ended', onIntroEnded);
      introAudioRef.current = null;

      themeAudioRef.current?.pause();
      themeAudioRef.current = null;
    };
  }, []);

  if (loading) {
    return <p className="text-white text-center mt-10">Loading Pokémon...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
  }

  return (
    <section className="bg-[#78C850] h-[100%] relative flex flex-col items-center justify-around p-4">
      <div className="fixed inset-0 bg-[#A6CDE1] flex flex-col items-center justify-center z-50 animate-slideDownFadeOut">
        <div
          className="bg-[url('/images/slider-characters.png')] bg-no-repeat bg-center bg-contain w-full h-[35%] animate-pulseFade"
        />
        <div
          className="bg-[url('/images/pokemon-logo.png')] bg-no-repeat bg-center bg-contain w-full h-[18%] -mt-6 animate-pulseFade"
        />
      </div>

      <BattleModeToggle mode={battleMode} setMode={setBattleMode} />

      <DataListWithAdd
        items={pokemonList}
        battleMode={battleMode}
        onFight={(selected) => {
          // Include uniqueId so duplicates remain unique and redirect
          const ids = selected
            .map((p) => `${p.id}-${p.uniqueId}`)
            .join(',');
          router.push(`/battle?team=${ids}`);
        }}
        header="Select Your Pokémon"
      />
    </section>
  );
}
