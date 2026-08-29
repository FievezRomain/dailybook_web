import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SignedImage } from './SignedImage';

describe('SignedImage', () => {
  it('masque une URL en erreur puis affiche une nouvelle URL signée', () => {
    const onErrorRefresh = vi.fn();
    const { rerender } = render(
      <SignedImage
        imageSigned={{ url: '/signed/first', expiresAt: 1 }}
        alt="Portrait"
        width={100}
        height={100}
        onErrorRefresh={onErrorRefresh}
      />,
    );

    fireEvent.error(screen.getByRole('img', { name: 'Portrait' }));

    expect(onErrorRefresh).toHaveBeenCalledOnce();
    expect(screen.queryByRole('img', { name: 'Portrait' })).not.toBeInTheDocument();

    rerender(
      <SignedImage
        imageSigned={{ url: '/signed/second', expiresAt: 2 }}
        alt="Portrait"
        width={100}
        height={100}
        onErrorRefresh={onErrorRefresh}
      />,
    );

    expect(screen.getByRole('img', { name: 'Portrait' })).toHaveAttribute(
      'src',
      expect.stringContaining('%2Fsigned%2Fsecond'),
    );
  });
});
