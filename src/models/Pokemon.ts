// src/models/Pokemon.ts
import mongoose, { Document, Schema } from 'mongoose';

// Plain Pokémon data interface (used in app logic and lean queries)
export interface IPokemonData {
    id: number;
    num: string;
    name: string;
    img: string;
    type: string[];
    weaknesses?: string[];
    height: string;
    weight: string;
    spawn_chance?: number;
    multipliers?: number[] | null;
}

// Pokémon Mongoose document interface (includes Mongoose methods)
export interface IPokemonDocument extends Document {
    id: number;
    num: string;
    name: string;
    img: string;
    type: string[];
    weaknesses?: string[];
    height: string;
    weight: string;
    spawn_chance?: number;
    multipliers?: number[] | null;
}

// Mongoose schema for Pokémon collection
const PokemonSchema: Schema = new Schema({
    id: { type: Number, required: true, unique: true },
    num: { type: String, required: true },
    name: { type: String, required: true },
    img: { type: String, required: true },
    type: [{ type: String, required: true }],
    weaknesses: [{ type: String }],
    height: { type: String, required: true },
    weight: { type: String, required: true },
    spawn_chance: { type: Number },
    multipliers: [{ type: Number }],
}, {
    _id: false,        // Use 'id' instead of default _id
    versionKey: false  // Remove __v
});

// Export Pokémon model (reuse if already compiled)
const Pokemon = mongoose.models.Pokemon || mongoose.model<IPokemonDocument>('Pokemon', PokemonSchema);

export default Pokemon;
