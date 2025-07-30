
import { NextResponse } from "next/server";
import { runOneTurn, Pokemon, Battler, BattleState } from "@/lib/battleLogic";

export async function POST(req: Request) {
    try {
        const { userTeam, opponentTeam, turn, initOnly } = await req.json();

        if (!userTeam || !opponentTeam) {
            return NextResponse.json({ error: "Missing teams" }, { status: 400 });
        }

        const result: BattleState = runOneTurn(
            userTeam as (Pokemon[] | Battler[]),
            opponentTeam as (Pokemon[] | Battler[]),
            turn ?? 0,
            initOnly ?? false
        );

        return NextResponse.json(result);
    } catch (err: unknown) {
        console.error("Battle API error:", err);

        let message = "Battle simulation failed";

        if (err instanceof Error) {
            message = err.message;
        }

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
