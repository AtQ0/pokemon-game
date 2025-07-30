
export interface Pokemon {
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

export interface Battler extends Pokemon {
    hp: number;
    maxHp: number;
    defense: number;
    critChance: number;
    missChance: number;
    speed: number;
    attack: number;
    weightKg: number;
    heightM: number;
    rarityFactor: number;
    powerMultiplier: number;
}

export interface BattleState {
    userBattlers: Battler[];
    opponentBattlers: Battler[];
    turnLog: string[];
    ended: boolean;
}

// Parse height/weight strings into numbers
function parseStat(value: string, unit: string): number {
    return parseFloat(value.replace(unit, "").trim());
}

// Check if all battlers on a team are defeated
function isTeamDefeated(team: Battler[]) {
    return team.every((b) => b.hp <= 0);
}

// Simplified Pokémon type effectiveness chart
const typeChart: Record<string, Record<string, number>> = {
    Fire: { Grass: 2, Water: 0.5, Fire: 0.5 },
    Water: { Fire: 2, Grass: 0.5, Water: 0.5 },
    Grass: { Water: 2, Fire: 0.5, Grass: 0.5 },
    Electric: { Water: 2, Ground: 0 },
    Ground: { Electric: 2, Grass: 0.5 },
};

// Determine attack multiplier based on attacker/defender types & weaknesses
function getTypeMultiplier(
    attackerTypes: string[],
    defenderTypes: string[],
    defenderWeaknesses?: string[]
): number {
    let multiplier = 1;
    for (const atkType of attackerTypes) {
        for (const defType of defenderTypes) {
            const effect = typeChart[atkType]?.[defType];
            if (effect !== undefined) multiplier *= effect;
        }
    }
    // Extra weakness bonus
    if (defenderWeaknesses) {
        for (const atkType of attackerTypes) {
            if (defenderWeaknesses.includes(atkType)) multiplier *= 1.2;
        }
    }
    return multiplier;
}

// Calculate attack damage with critical hits, accuracy, and multipliers
function calculateDamage(attacker: Battler, defender: Battler) {
    // Miss check (heavier Pokémon are slightly clumsier)
    if (Math.random() < attacker.missChance + (attacker.weightKg > 80 ? 0.05 : 0)) {
        return { damage: 0, isCritical: false, missed: true, effectiveness: 1 };
    }

    // Base damage + randomness
    const baseDamage = attacker.attack * 0.7 + (5 + Math.floor(Math.random() * 5));

    // Modifiers
    const weightFactor = Math.min(1.4, attacker.weightKg / Math.max(1, defender.weightKg));
    const heightFactor = attacker.heightM >= defender.heightM ? 1.05 : 0.95;
    const rarityFactor = attacker.rarityFactor;
    const evoFactor = attacker.powerMultiplier;
    const effectiveness = getTypeMultiplier(attacker.type, defender.type, defender.weaknesses);

    // Apply modifiers and subtract defense
    let damage = baseDamage * weightFactor * heightFactor * rarityFactor * evoFactor * effectiveness;
    damage -= defender.defense * 0.8;
    if (damage < 1) damage = 1;

    // Add randomness ±10%
    damage *= 0.9 + Math.random() * 0.2;

    // Critical hit chance
    const isCritical = Math.random() < attacker.critChance;
    if (isCritical) damage *= 1.4;

    return {
        damage: Math.floor(damage),
        isCritical,
        missed: false,
        effectiveness,
    };
}

// Small chance for a battler to heal between turns
function tryHeal(battler: Battler, log: string[]) {
    if (battler.hp > 0 && battler.hp < battler.maxHp && Math.random() < 0.03) {
        const healAmount = 8 + Math.floor(Math.random() * 8);
        battler.hp = Math.min(battler.hp + healAmount, battler.maxHp);
        log.push(`${battler.name} heals for ${healAmount} HP! (${battler.hp}/${battler.maxHp})`);
        return true;
    }
    return false;
}

// Run a single turn of battle or initialize battlers if initOnly = true
export function runOneTurn(
    userInput: Pokemon[] | Battler[],
    opponentInput: Pokemon[] | Battler[],
    turn: number,
    initOnly = false
): BattleState {
    // Initialization: convert Pokémon data into Battler objects
    if (initOnly) {
        const toBattler = (p: Pokemon): Battler => {
            const weightKg = parseStat(p.weight, "kg");
            const heightM = parseStat(p.height, "m");
            return {
                ...p,
                hp: 100,
                maxHp: 100,
                defense: 6 + Math.floor(Math.random() * 6),
                critChance: 0.2,
                missChance: 0.08,
                speed: 30 + Math.floor(Math.random() * 21),
                attack: 18 + Math.floor(Math.random() * 9),
                weightKg,
                heightM,
                rarityFactor: p.spawn_chance
                    ? p.spawn_chance < 0.05
                        ? 1.3
                        : p.spawn_chance < 0.2
                            ? 1.15
                            : 1.0
                    : 1.0,
                powerMultiplier: p.multipliers ? Math.max(...p.multipliers) : 1.0,
            };
        };

        return {
            userBattlers: (userInput as Pokemon[]).map(toBattler),
            opponentBattlers: (opponentInput as Pokemon[]).map(toBattler),
            turnLog: [],
            ended: false,
        };
    }

    // Deep copy teams for the current turn
    const userCopy = (userInput as Battler[]).map((b) => ({ ...b }));
    const oppCopy = (opponentInput as Battler[]).map((b) => ({ ...b }));
    const log: string[] = [];

    log.push(`--- Turn ${turn} ---`);

    // Sort all battlers by speed (faster goes first)
    const allBattlers = [
        ...userCopy.map((b) => ({ battler: b, isUser: true })),
        ...oppCopy.map((b) => ({ battler: b, isUser: false })),
    ].sort((a, b) => b.battler.speed - a.battler.speed);

    // Each battler takes a turn
    for (const { battler, isUser } of allBattlers) {
        if (battler.hp <= 0) continue;

        const enemyTeam = isUser ? oppCopy : userCopy;
        if (isTeamDefeated(enemyTeam)) break;

        // Chance to heal instead of attacking
        if (tryHeal(battler, log)) continue;

        // Choose a random alive opponent
        const aliveOpponents = enemyTeam.filter((b) => b.hp > 0);
        if (aliveOpponents.length === 0) break;

        const defender = aliveOpponents[Math.floor(Math.random() * aliveOpponents.length)];
        const { damage, isCritical, missed, effectiveness } = calculateDamage(battler, defender);

        // Log the attack
        if (missed) {
            log.push(`${battler.name} attacks ${defender.name} but missed!`);
        } else {
            defender.hp = Math.max(defender.hp - damage, 0);
            let msg = `${battler.name} hits ${defender.name} for ${damage} damage.`;
            if (isCritical) msg += " Critical hit!";
            if (effectiveness > 1) msg += " It's super effective!";
            if (effectiveness < 1 && effectiveness > 0) msg += " It's not very effective...";
            if (effectiveness === 0) msg += " But it had no effect!";
            msg += ` (${defender.hp}/${defender.maxHp} HP left)`;
            log.push(msg);

            if (defender.hp === 0) log.push(`${defender.name} fainted!`);
        }
    }

    // Check victory/defeat conditions
    if (isTeamDefeated(oppCopy)) {
        log.push("Opponent team has all fainted! You win! 🎉");
        return { userBattlers: userCopy, opponentBattlers: oppCopy, turnLog: log, ended: true };
    }
    if (isTeamDefeated(userCopy)) {
        log.push("Your team has all fainted! You lose! 💀");
        return { userBattlers: userCopy, opponentBattlers: oppCopy, turnLog: log, ended: true };
    }

    // End battle if max turns reached, compare total HP
    const MAX_TURNS = 12;
    if (turn >= MAX_TURNS) {
        log.push(`Reached max turns (${MAX_TURNS}). Determining winner by HP...`);
        const userHpSum = userCopy.reduce((sum, b) => sum + b.hp, 0);
        const oppHpSum = oppCopy.reduce((sum, b) => sum + b.hp, 0);

        if (userHpSum > oppHpSum) log.push("Battle ends! You win by HP advantage! 🎉");
        else if (oppHpSum > userHpSum) log.push("Battle ends! Opponents win by HP advantage! 💀");
        else log.push("Battle ends in a draw!");

        return { userBattlers: userCopy, opponentBattlers: oppCopy, turnLog: log, ended: true };
    }

    // Battle continues
    return { userBattlers: userCopy, opponentBattlers: oppCopy, turnLog: log, ended: false };
}
