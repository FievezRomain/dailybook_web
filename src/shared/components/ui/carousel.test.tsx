import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './carousel'

vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), {
    canScrollPrev: () => false,
    canScrollNext: () => false,
    scrollPrev: vi.fn(),
    scrollNext: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }],
}))

describe('Carousel', () => {
  it('expose une région nommée et des contrôles localisés', () => {
    render(
      <Carousel>
        <CarouselContent><CarouselItem>Étape 1</CarouselItem></CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    )

    expect(screen.getByRole('region', { name: 'Carrousel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Diapositive précédente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Diapositive suivante' })).toBeInTheDocument()
  })
})
