import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Badge } from './badge'
import { Button, IconButton } from './button'
import { Field, FieldCounter, FieldDescription, FieldError, FieldLabel, FieldMeta } from './field'
import { DateInput, FormErrorSummary, TimeInput } from './form-feedback'
import { FileUpload } from './file-upload'
import { Input } from './input'
import { Separator } from './separator'
import { NumberInput, PasswordInput } from './specialized-inputs'
import { TextLink } from './text-link'
import { Textarea } from './textarea'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'
import { Plus } from 'lucide-react'

describe('fondations UI Vasco', () => {
  it('expose l’état de chargement d’un bouton sans autoriser une seconde soumission', () => {
    render(<Button loading>Enregistrer</Button>)

    const button = screen.getByRole('button', { name: 'Enregistrer' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveClass('disabled:bg-muted')
    expect(button.querySelector('.sr-only')).toHaveTextContent('Enregistrer')
  })

  it('préserve un enfant unique lorsque Button est utilisé avec asChild', () => {
    render(<Button asChild><a href="/profile">Mon profil</a></Button>)
    expect(screen.getByRole('link', { name: 'Mon profil' })).toHaveAttribute('href', '/profile')
  })

  it('rend un lien asChild inactif durant un chargement, sans lui passer disabled', () => {
    const onClick = vi.fn()
    render(<Button asChild loading onClick={onClick}><a href="/profile">Mon profil</a></Button>)

    const link = screen.getByRole('link', { name: 'Mon profil' })
    fireEvent.click(link)

    expect(link).toHaveAttribute('aria-disabled', 'true')
    expect(link).toHaveAttribute('tabindex', '-1')
    expect(link).not.toHaveAttribute('disabled')
    expect(onClick).not.toHaveBeenCalled()
  })

  it('maintient une cible de 44 px autour des trois tailles visuelles IconButton', () => {
    render(
      <>
        <IconButton label="Ajouter" size="compact"><Plus /></IconButton>
        <IconButton label="Ajouter en grand" size="large" variant="default"><Plus /></IconButton>
      </>,
    )

    expect(screen.getByRole('button', { name: 'Ajouter' })).toHaveClass('size-11', 'after:inset-1.5')
    expect(screen.getByRole('button', { name: 'Ajouter en grand' })).toHaveClass('size-12', 'after:inset-0')
  })

  it('fournit des rôles sémantiques pour les statuts, erreurs et séparateurs', () => {
    render(
      <>
        <Badge variant="success">Enregistré</Badge>
        <Field>
          <FieldLabel htmlFor="name" required>Nom</FieldLabel>
          <input id="name" />
          <FieldDescription id="name-help">Visible uniquement par vous.</FieldDescription>
          <FieldError>Le nom est requis.</FieldError>
        </Field>
        <Separator decorative={false} />
      </>,
    )

    expect(screen.getByText('Enregistré')).toHaveClass('bg-success')
    expect(screen.getByText('Le nom est requis.')).toHaveRole('alert')
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('expose les trois métriques Figma des champs texte', () => {
    render(
      <>
        <Input aria-label="Nom compact" size="compact" />
        <Input aria-label="Nom large" size="large" readOnly />
        <Textarea aria-label="Description" size="default" />
      </>,
    )

    expect(screen.getByLabelText('Nom compact')).toHaveClass('data-[size=compact]:h-8', 'data-[size=compact]:text-[13px]')
    expect(screen.getByLabelText('Nom large')).toHaveAttribute('data-size', 'large')
    expect(screen.getByLabelText('Nom large')).toHaveClass('data-[size=large]:h-12', 'read-only:bg-muted')
    expect(screen.getByLabelText('Description')).toHaveClass('data-[size=default]:h-[120px]')
  })

  it('compose aide et compteur dans la ligne de métadonnées', () => {
    render(<FieldMeta><FieldDescription>Maximum autorisé.</FieldDescription><FieldCounter current={12} max={80} /></FieldMeta>)
    expect(screen.getByText('12/80')).toHaveClass('tabular-nums')
  })

  it('affiche le mot de passe sans perdre le focus ni la sélection', async () => {
    render(<PasswordInput aria-label="Mot de passe" defaultValue="secret" autoComplete="current-password" />)
    const input = screen.getByLabelText('Mot de passe') as HTMLInputElement
    input.focus()
    input.setSelectionRange(2, 4)

    fireEvent.click(screen.getByRole('button', { name: 'Afficher le mot de passe' }))

    expect(input).toHaveAttribute('type', 'text')
    await vi.waitFor(() => expect(input).toHaveFocus())
    expect(input.selectionStart).toBe(2)
    expect(input.selectionEnd).toBe(4)
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toBeInTheDocument()
  })

  it('accepte la virgule française et fournit une valeur numérique séparée', () => {
    const onValueChange = vi.fn()
    render(<NumberInput aria-label="Prix" onValueChange={onValueChange} />)
    const input = screen.getByLabelText('Prix')

    fireEvent.change(input, { target: { value: '12,50' } })

    expect(input).toHaveValue('12,50')
    expect(onValueChange).toHaveBeenCalledWith('12,50', 12.5)
    expect(input).toHaveAttribute('inputmode', 'decimal')
  })

  it('sécurise les liens externes et conserve les liens internes dans le routeur Next', () => {
    render(
      <>
        <TextLink href="/dashboard" variant="navigation">Accueil</TextLink>
        <TextLink href="https://met.no" external>Source météo</TextLink>
      </>,
    )

    expect(screen.getByRole('link', { name: 'Accueil' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: 'Source météo' })).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('décrit un contrôle au focus clavier sans créer de contenu permanent', () => {
    render(
      <Tooltip>
        <TooltipTrigger aria-label="Informations Premium">?</TooltipTrigger>
        <TooltipContent placement="bottom" shortcut="⌘K">Disponible avec Premium</TooltipContent>
      </Tooltip>,
    )

    const trigger = screen.getByRole('button', { name: 'Informations Premium' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    fireEvent.focus(trigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Disponible avec Premium')
    expect(screen.getByRole('tooltip')).toHaveTextContent('⌘K')
    expect(screen.getByRole('tooltip')).toHaveClass('top-full', 'bg-primary')
    expect(trigger).toHaveAttribute('aria-describedby')
    fireEvent.keyDown(trigger, { key: 'Escape' })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('propose des contrôles date/heure natifs et un résumé reliant les erreurs aux champs', () => {
    render(
      <>
        <DateInput aria-label="Date de début" size="comfortable" />
        <TimeInput aria-label="Heure de début" />
        <FormErrorSummary errors={[{ fieldId: 'date-debut', message: 'La date de début est requise.' }]} />
      </>,
    )

    expect(screen.getByLabelText('Date de début')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('Date de début')).toHaveClass('h-12')
    expect(screen.getByLabelText('Heure de début')).toHaveAttribute('type', 'time')
    expect(screen.getByText('24 h')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('Corrigez les erreurs suivantes')
    expect(screen.getByRole('link', { name: 'La date de début est requise.' })).toHaveAttribute('href', '#date-debut')
  })

  it('affiche les états de sélection, progression, erreur et retrait d’un fichier', () => {
    const onFileChange = vi.fn()
    const onRetry = vi.fn()
    const file = new File(['Vasco'], 'document.pdf', { type: 'application/pdf' })
    const { rerender } = render(<FileUpload onFileChange={onFileChange} />)

    const dropzone = screen.getByLabelText('Gestionnaire de fichier')
    fireEvent.dragEnter(dropzone)
    expect(dropzone).toHaveClass('bg-info/10')
    expect(screen.getByText('Relâcher pour importer')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Gestionnaire de fichier').querySelector('input')!, { target: { files: [file] } })
    expect(onFileChange).toHaveBeenCalledWith(file)

    rerender(<FileUpload file={file} progress={68} status="uploading" onFileChange={onFileChange} />)
    expect(screen.getByLabelText('Progression de l’envoi')).toHaveAttribute('aria-valuenow', '68')

    rerender(<FileUpload file={file} status="error" onFileChange={onFileChange} onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('L’envoi du fichier a échoué.')
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }))
    expect(onRetry).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Retirer document.pdf' }))
    expect(onFileChange).toHaveBeenLastCalledWith(null)
  })
})
