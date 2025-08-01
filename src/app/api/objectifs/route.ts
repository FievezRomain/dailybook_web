import { apiBack } from '@/lib/apiBack';

export async function GET() {
    try {
        const data = await apiBack('objectifsByUser', 'GET');
        return Response.json(data);
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 401 });
    }
}