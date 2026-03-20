import { NextResponse } from 'next/server';
import { triggerMatchesForTalent } from '@/app/actions/auto-match';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const talentId = searchParams.get('id');

    if (!talentId) {
        return NextResponse.json({ error: 'Missing id param' }, { status: 400 });
    }

    try {
        const result = await triggerMatchesForTalent(talentId);
        return NextResponse.json({ success: true, result });
    } catch (e: any) {
        console.error("[Test-Match-Endpoint Fatal Error]", e);
        return NextResponse.json({ success: false, error: e.message || String(e) }, { status: 500 });
    }
}
