
import {
    Pokemon,
    Battler,
    BattleState,
    runOneTurn,
} from '../battleLogic';

const mockMathRandom = jest.spyOn(Math, 'random');

describe('battleLogic - Minimal Tests', () => {
    beforeEach(() => {
        mockMathRandom.mockRestore();
    });

    // Sample Pokemon data for tests
    const mockPokemon1: Pokemon = {
        id: 1, num: '001', name: 'Bulbasaur', img: 'bulbasaur.png',
        type: ['Grass', 'Poison'], weaknesses: ['Fire', 'Psychic', 'Flying', 'Ice'],
        height: '0.7 m', weight: '6.9 kg', spawn_chance: 0.69, multipliers: [1.58],
    };

    const mockPokemon2: Pokemon = {
        id: 4, num: '004', name: 'Charmander', img: 'charmander.png',
        type: ['Fire'], weaknesses: ['Water', 'Ground', 'Rock'],
        height: '0.6 m', weight: '8.5 kg', spawn_chance: 0.253, multipliers: [1.65],
    };

    // Helper to create Battler objects from Pokemon with default stats
    const createTestBattler = (pokemon: Pokemon, overrides?: Partial<Battler>): Battler => {
        const parseStat = (value: string, unit: string): number => parseFloat(value.replace(unit, "").trim());
        const weightKg = parseStat(pokemon.weight, "kg");
        const heightM = parseStat(pokemon.height, "m");
        const rarityFactor = pokemon.spawn_chance ? (pokemon.spawn_chance < 0.05 ? 1.3 : (pokemon.spawn_chance < 0.2 ? 1.15 : 1.0)) : 1.0;
        const powerMultiplier = pokemon.multipliers ? Math.max(...pokemon.multipliers) : 1.0;

        return {
            ...pokemon,
            hp: 100,
            maxHp: 100,
            defense: 10,
            critChance: 0.2,
            missChance: 0.08,
            speed: 50,
            attack: 25,
            weightKg,
            heightM,
            rarityFactor,
            powerMultiplier,
            ...overrides,
        };
    };

    // Test initialization mode: verify battlers created properly from Pokemon data
    it('should initialize battlers from Pokemon data in initOnly mode', () => {
        const userTeam: Pokemon[] = [mockPokemon1];
        const opponentTeam: Pokemon[] = [mockPokemon2];
        const initialState: BattleState = runOneTurn(userTeam, opponentTeam, 0, true);

        expect(initialState.userBattlers.length).toBe(1);
        expect(initialState.opponentBattlers.length).toBe(1);
        expect(initialState.userBattlers[0].name).toBe('Bulbasaur');
        expect(initialState.userBattlers[0].hp).toBe(100);
        expect(initialState.opponentBattlers[0].name).toBe('Charmander');
        expect(initialState.turnLog).toEqual([]);
        expect(initialState.ended).toBe(false);
    });

    // Simple helper test for checking if a team is defeated (all HP zero or below)
    it('should correctly determine if a team is defeated', () => {
        const isTeamDefeated = (team: Battler[]) => team.every((b) => b.hp <= 0);

        const defeatedTeam: Battler[] = [createTestBattler(mockPokemon1, { hp: 0 })];
        const activeTeam: Battler[] = [createTestBattler(mockPokemon1, { hp: 5 })];

        expect(isTeamDefeated(defeatedTeam)).toBe(true);
        expect(isTeamDefeated(activeTeam)).toBe(false);
    });

    // Simulate one turn where opponent attacks first and user faints, battle ends
    it('should declare opponent winner if user team faints', () => {
        const userBattler: Battler = createTestBattler(mockPokemon1, { hp: 1, speed: 50, attack: 1 });
        const opponentBattler: Battler = createTestBattler(mockPokemon2, { hp: 100, speed: 60, attack: 100, critChance: 1.0 });

        // Mock random values to control damage, crit, miss, etc.
        mockMathRandom.mockReturnValueOnce(0.04) // tryHeal check (no heal)
            .mockReturnValueOnce(0.00)  // target selection
            .mockReturnValueOnce(0.01)  // miss check (hit)
            .mockReturnValueOnce(0.5)   // base damage random factor
            .mockReturnValueOnce(0.5)   // damage random factor
            .mockReturnValueOnce(0.01); // crit check (critical hit)

        const initialBattleState: BattleState = {
            userBattlers: [userBattler],
            opponentBattlers: [opponentBattler],
            turnLog: [],
            ended: false
        };

        const nextState = runOneTurn(initialBattleState.userBattlers, initialBattleState.opponentBattlers, 1, false);

        expect(nextState.userBattlers[0].hp).toBe(0);
        expect(nextState.ended).toBe(true);
        expect(nextState.turnLog).toContain('Bulbasaur fainted!');
        expect(nextState.turnLog).toContain('Your team has all fainted! You lose! 💀');
    });
});
