import { backendApiClient } from '@/shared/api/backend-api-client';
import { bffError, bffSuccess } from '@/shared/api/bff-response';
import { invitationListSchema } from '@/features/groups/schemas/group';

export async function GET() {
  try {
    return bffSuccess(invitationListSchema.parse(await backendApiClient('api/v1/invitations')));
  } catch (error) {
    return bffError(error);
  }
}
