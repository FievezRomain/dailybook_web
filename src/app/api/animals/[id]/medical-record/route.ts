import { backendApiBinary } from '@/shared/api/backend-api-client';
import { bffError } from '@/shared/api/bff-response';
import { positiveIdSchema } from '@/features/animals/schemas/animal';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const id = positiveIdSchema.parse((await context.params).id);
    const result = await backendApiBinary(`api/v1/animals/${id}/medical-record`);
    if (!result.contentType.toLowerCase().startsWith('application/pdf')) {
      throw new Error('Le service Vasco n’a pas renvoyé un document PDF.');
    }
    return new Response(new Blob([result.body], { type: 'application/pdf' }), {
      headers: {
        'cache-control': 'private, no-store',
        'content-disposition': `attachment; filename="synthese-dossier-medical-${id}.pdf"`,
        'content-type': 'application/pdf',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (error) {
    return bffError(error);
  }
}
