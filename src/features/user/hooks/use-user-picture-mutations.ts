'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeUserPicture, uploadUserPicture } from '../api/user-picture';
import { currentUserQueryKey } from './use-current-user';

export function useUserPictureMutations() {
  const queryClient = useQueryClient();
  const refreshUser = () => queryClient.invalidateQueries({ queryKey: currentUserQueryKey });

  const upload = useMutation({ mutationFn: uploadUserPicture, onSuccess: refreshUser });
  const remove = useMutation({ mutationFn: removeUserPicture, onSuccess: refreshUser });

  return {
    uploadPicture: upload.mutateAsync,
    removePicture: remove.mutateAsync,
    isPending: upload.isPending || remove.isPending,
    error: upload.error ?? remove.error,
    reset: () => {
      upload.reset();
      remove.reset();
    },
  };
}
