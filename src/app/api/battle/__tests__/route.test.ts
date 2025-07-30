
import { POST } from '../route';

describe('POST /api/battle', () => {
    // Helper to mock a Request with JSON body
    const createRequest = (body: unknown) =>
        new Request('http://localhost/api/battle', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        });

    it('returns 400 if userTeam or opponentTeam missing', async () => {
        const req = createRequest({ userTeam: null, opponentTeam: null });
        const res = await POST(req);

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBe('Missing teams');
    });

    it('runs battle turn and returns BattleState', async () => {
        const userTeam = [
            { id: 1, num: '001', name: 'Bulbasaur', img: '', type: ['Grass'], weaknesses: [], height: '0.7 m', weight: '6.9 kg', spawn_chance: 0.1, multipliers: [1] },
        ];
        const opponentTeam = [
            { id: 4, num: '004', name: 'Charmander', img: '', type: ['Fire'], weaknesses: [], height: '0.6 m', weight: '8.5 kg', spawn_chance: 0.1, multipliers: [1] },
        ];
        const req = createRequest({ userTeam, opponentTeam, turn: 0, initOnly: true });

        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();

        expect(json).toHaveProperty('userBattlers');
        expect(json).toHaveProperty('opponentBattlers');
        expect(Array.isArray(json.userBattlers)).toBe(true);
        expect(Array.isArray(json.opponentBattlers)).toBe(true);
        expect(json.turnLog).toEqual([]);
        expect(json.ended).toBe(false);
    });

    it('handles errors and returns 500', async () => {
        const badReq = {
            json: () => { throw new Error('parse failed'); }
        } as unknown as Request;

        const res = await POST(badReq);
        expect(res.status).toBe(500);
        const json = await res.json();
        expect(json.error).toBe('parse failed');
    });
});
