import {
  useId,
  useRef,
  useState,
  type ComponentType,
  type FormEvent,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";

export type FormStep = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  content: ReactNode | ((actions: { advance: () => void }) => ReactNode);
  validate?: () => boolean;
  validationMessage?: string;
};

type SteppedFormSheetProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: string;
  description: string;
  eyebrow?: string;
  steps: FormStep[];
  submitLabel: string;
  submitting?: boolean;
  toneClassName?: string;
};

export function SteppedFormSheet({
  open,
  onClose,
  onSubmit,
  title,
  description,
  eyebrow,
  steps,
  submitLabel,
  submitting = false,
  toneClassName = "",
}: SteppedFormSheetProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string>();
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const explicitSubmitRef = useRef(false);
  const activeStep = steps[currentStep];
  const ActiveIcon = activeStep.icon;
  const isLastStep = currentStep === steps.length - 1;

  function close() {
    setCurrentStep(0);
    onClose();
  }

  function continueToNextStep() {
    if (!formRef.current?.reportValidity()) return;
    const incompleteRequiredControl =
      formRef.current.querySelector<HTMLElement>(
        '[aria-required="true"][data-placeholder]',
      );
    if (incompleteRequiredControl) {
      incompleteRequiredControl.focus();
      setStepError("Complétez les informations requises pour continuer.");
      return;
    }
    if (activeStep.validate && !activeStep.validate()) {
      setStepError(
        activeStep.validationMessage ||
          "Complétez les informations requises pour continuer.",
      );
      return;
    }
    setStepError(undefined);
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function advance() {
    setStepError(undefined);
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  }

  function submitExplicitly() {
    if (!formRef.current?.reportValidity()) return;
    explicitSubmitRef.current = true;
    formRef.current.requestSubmit();
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    if (!explicitSubmitRef.current) {
      event.preventDefault();
      return;
    }
    explicitSubmitRef.current = false;
    onSubmit(event);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
    >
      <DialogContent
        closeLabel="Fermer le formulaire"
        className={`h-[min(860px,calc(100dvh-1.5rem))] max-w-4xl grid-rows-[auto_auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-[26px] bg-background p-0 ${toneClassName}`}
      >
        <DialogHeader className="relative gap-0 border-b bg-background px-5 py-4 pr-14 text-left sm:px-6">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {eyebrow && (
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                {eyebrow}
              </p>
            )}
            <DialogTitle className="text-xl leading-tight tracking-[-0.02em] sm:text-2xl">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="mt-1 line-clamp-1 max-w-[70ch] text-xs leading-5">
            {description}
          </DialogDescription>
        </DialogHeader>

        <nav
          aria-label="Étapes du formulaire"
          className="border-b bg-muted/20 px-4 py-2 sm:px-6"
        >
          <ol className="flex gap-2 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const active = index === currentStep;
              const complete = index < currentStep;
              return (
                <li key={step.title} className="relative min-w-0 flex-1">
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      data-slot="form-step-connector"
                      data-complete={index <= currentStep ? "true" : "false"}
                      className={`absolute left-[calc(-50%+8px)] right-[calc(50%+16px)] top-3 z-0 h-0.5 rounded-full transition-colors ${index <= currentStep ? "bg-primary" : "bg-border"}`}
                    />
                  )}
                  <button
                    type="button"
                    disabled={index > currentStep || submitting}
                    onClick={() => {
                      setStepError(undefined);
                      setCurrentStep(index);
                    }}
                    aria-current={active ? "step" : undefined}
                    className={`relative z-10 flex min-h-9 w-full flex-col items-center gap-1 rounded-[12px] px-1 text-center transition-colors ${active ? "text-foreground" : complete ? "text-foreground" : "cursor-not-allowed text-muted-foreground"}`}
                  >
                    <span
                      className={`relative z-20 grid size-6 shrink-0 place-items-center rounded-full ring-4 ring-background ${active ? "bg-primary text-primary-foreground shadow-sm" : complete ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}
                    >
                      {complete ? (
                        <Check className="size-3.5" aria-hidden="true" />
                      ) : (
                        <StepIcon className="size-3.5" aria-hidden="true" />
                      )}
                    </span>
                    <span className="hidden truncate text-xs font-semibold sm:block">
                      {step.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <form
          id={formId}
          ref={formRef}
          onSubmit={handleFormSubmit}
          aria-label={title}
          className="flex min-h-0 flex-1 flex-col"
          aria-busy={submitting}
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-[11px] bg-primary/10 text-primary">
                  <ActiveIcon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">
                    Étape {currentStep + 1} sur {steps.length}
                  </p>
                  <h2 className="text-lg font-semibold leading-tight">
                    {activeStep.title}
                  </h2>
                  <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                    {activeStep.description}
                  </p>
                </div>
              </div>
              {typeof activeStep.content === "function" ? (
                activeStep.content({ advance })
              ) : (
                activeStep.content
              )}
              {stepError && (
                <p
                  role="alert"
                  className="mt-4 rounded-control border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                >
                  {stepError}
                </p>
              )}
            </div>
          </div>
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t bg-background/95 px-5 py-3 backdrop-blur sm:px-6">
            <Button
              type="button"
              variant="ghost"
              onClick={
                currentStep === 0
                  ? close
                  : () => {
                      setStepError(undefined);
                      setCurrentStep((step) => step - 1);
                    }
              }
              disabled={submitting}
            >
              {currentStep === 0 ? (
                "Annuler"
              ) : (
                <>
                  <ArrowLeft aria-hidden="true" />
                  Retour
                </>
              )}
            </Button>
            {isLastStep ? (
              <Button
                type="button"
                disabled={submitting}
                onClick={submitExplicitly}
              >
                {submitting ? "Enregistrement…" : submitLabel}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={continueToNextStep}
                disabled={submitting}
              >
                Continuer
                <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[20px] border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {description && (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function SingleStepFormCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  children,
  actions,
  onClose,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
}) {
  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose?.();
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-[26px] bg-background p-0">
        <DialogHeader className="border-b bg-background px-5 py-4 pr-14 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
                {eyebrow} · Étape unique
              </p>
              <DialogTitle className="mt-0.5 text-xl tracking-[-0.02em]">
                {title}
              </DialogTitle>
              <DialogDescription className="mt-1 max-w-[64ch] text-xs leading-4">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto px-5 py-4 sm:px-6">{children}</div>
        <footer className="flex flex-col-reverse gap-2 border-t bg-muted/10 px-5 py-3 sm:flex-row sm:justify-end sm:px-6">
          {actions}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
