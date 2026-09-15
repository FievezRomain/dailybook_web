import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { useRef, type ReactNode } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export const ConfirmDialog = ({
  open,
  title = "Confirmer",
  description = "Êtes-vous sûr de vouloir continuer ?",
  onCancel,
  onConfirm,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
  <Dialog open={open} onOpenChange={onCancel} aria-label="Confirmation de l'action">
    <DialogContent className="max-w-md w-full" onOpenAutoFocus={(event) => { event.preventDefault(); cancelRef.current?.focus(); }}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p>{description}</p>
      <DialogFooter>
        <Button ref={cancelRef} variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  );
};
