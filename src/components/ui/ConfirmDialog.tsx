import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./index";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
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
}: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={onCancel} aria-label="Confirmation de l'action">
    <DialogContent className="max-w-md w-full">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <p>{description}</p>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>{cancelLabel}</Button>
        <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);