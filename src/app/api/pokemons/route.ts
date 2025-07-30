
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import Pokemon, { IPokemonData } from "@/models/Pokemon";

let cachedData: IPokemonData[] | null = null; // Use IPokemonData
let lastFetchTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // Cache for 1 hour (e.g., 1 hour)

export async function GET() {
    try {
        if (cachedData && Date.now() - lastFetchTime < CACHE_DURATION) {
            console.log("Serving pokemons from cache.");
            return NextResponse.json({ pokemon: cachedData });
        }

        await dbConnect();

        const count = await Pokemon.countDocuments();

        if (count === 0) {
            console.log("No data in MongoDB. Fetching from external source and seeding.");
            const externalRes = await fetch("https://raw.githubusercontent.com/Biuni/PokemonGO-Pokedex/master/pokedex.json");
            if (!externalRes.ok) {
                const txt = await externalRes.text();
                throw new Error(`Failed to fetch external Pokémon data (${externalRes.status}): ${txt}`);
            }
            const externalData = await externalRes.json();
            const pokemonsToInsert = externalData.pokemon;

            await Pokemon.insertMany(pokemonsToInsert);
            console.log(`Seeded ${pokemonsToInsert.length} pokemons into the database.`);
        }

        const pokemonsFromDb = await Pokemon.find({}).lean(); // Returns plain JS objects

        // Explicitly cast to unknown first, then to IPokemonData[]
        cachedData = pokemonsFromDb as unknown as IPokemonData[];
        lastFetchTime = Date.now();

        return NextResponse.json({ pokemon: cachedData });

    } catch (err: unknown) {
        console.error("Database or API error:", err);
        let message = "Failed to retrieve Pokémon data.";
        if (err instanceof Error) {
            message = err.message;
        }
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
