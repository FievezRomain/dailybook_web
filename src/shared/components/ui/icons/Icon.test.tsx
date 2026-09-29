import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Icon } from './Icon';

describe('Icon', () => {
  it('utilise Material Community Icons pour un concept partagé avec le mobile', () => {
    render(<Icon name="medical" aria-label="Soin" />);

    expect(screen.getByLabelText('Soin')).toHaveAttribute('data-icon-provider', 'material-community');
  });

  it('utilise Material Community pour le contrôle de l’app rail', () => {
    render(<Icon name="collapseRail" aria-label="Réduire" />);

    expect(screen.getByLabelText('Réduire')).toHaveAttribute('data-icon-provider', 'material-community');
  });
});
