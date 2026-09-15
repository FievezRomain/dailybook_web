"use client";

import { type FormEvent, useState } from "react";
import { Bell, Crown, Mail, Palette, Pencil, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useNotificationPreferencesMutation } from "@/features/notifications/hooks/use-notifications";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { useUpdateCurrentUser } from "@/features/user/hooks/use-update-current-user";
import type { UserWithPicture } from "@/features/user/types/user";
import { cn } from "@/lib/utils";
import { ColorVisionToggle } from "@/shared/components/layout/ColorVisionToggle";
import ModeToggle from "@/shared/components/layout/ModeToggle";
import { PageShell } from "@/shared/components/layout/PageShell";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { SystemState } from "@/shared/components/ui/system-state";
import { UserPictureControl } from "./UserPictureControl";

function ProfileEditor({
  user,
  onDone,
}: {
  user: UserWithPicture;
  onDone: () => void;
}) {
  const { updateProfile, isPending, error } = useUpdateCurrentUser();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    const input = {
      ...(name !== user.name ? { prenom: name } : {}),
      ...(email !== user.email ? { newEmail: email } : {}),
    };
    if (Object.keys(input).length) {
      await updateProfile(input);
      setSaved(true);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onDone();
      }}
    >
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-[26px] p-0">
        <DialogHeader className="border-b bg-muted/20 px-6 py-5 pr-14">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Compte · Étape unique
          </p>
          <DialogTitle className="mt-1 text-2xl">
            Modifier votre identité
          </DialogTitle>
          <DialogDescription>
            Actualisez les informations utilisées par votre compte Vasco.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(event) => void submit(event)}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Nom
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoFocus
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Adresse e-mail
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            {saved && (
              <p className="text-sm text-success sm:col-span-2" role="status">
                Profil enregistré.
              </p>
            )}
            {error && (
              <p
                className="text-sm text-destructive sm:col-span-2"
                role="alert"
              >
                Le profil ne peut pas être enregistré.
              </p>
            )}
          </div>
          <DialogFooter className="border-t bg-muted/10 px-6 py-4">
            <Button type="button" variant="ghost" onClick={onDone}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isPending || (name === user.name && email === user.email)
              }
            >
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfileContent() {
  const { user, isLoading, isError, refetch } = useCurrentUser();
  const notificationPreferences = useNotificationPreferencesMutation();
  const [editing, setEditing] = useState(false);

  if (isLoading)
    return (
      <PageShell className="space-y-5">
        <p className="sr-only" role="status">
          Chargement du compte…
        </p>
        <Skeleton className="h-72 rounded-[28px]" />
        <Skeleton className="h-72 rounded-[24px]" />
      </PageShell>
    );
  if (isError || !user)
    return (
      <PageShell>
        <SystemState
          state="error"
          density="page"
          title="Le compte ne peut pas être chargé."
          description="Vos informations sont temporairement indisponibles."
          primaryAction={{ label: "Réessayer", onClick: () => void refetch() }}
        />
      </PageShell>
    );

  const premium = user.subscription === "Premium";

  async function updateDailyNotifications(enabled: boolean) {
    try {
      await notificationPreferences.updatePreferences({
        dailyReminderEnabled: enabled,
      });
      toast.success(
        enabled
          ? "Notifications quotidiennes activées."
          : "Notifications quotidiennes désactivées.",
      );
    } catch {
      toast.error("La préférence n'a pas pu être enregistrée.");
    }
  }

  return (
    <PageShell className="space-y-6 pb-24">
      <h2 className="sr-only">Mon compte</h2>

      <section
        className="relative overflow-hidden rounded-[28px] border bg-card shadow-surface"
        aria-labelledby="profile-name"
      >
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-[#b07165] to-[#d4a17c]"
          aria-hidden="true"
        />
        <div
          className="absolute -right-16 -top-24 size-72 rounded-full bg-primary/[0.06] blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="shrink-0">
              <UserPictureControl />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Mon profil
              </p>
              <h2
                id="profile-name"
                className="mt-2 truncate text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
              >
                {user.name}
              </h2>
              <p className="mt-2 flex items-center gap-2 truncate text-sm text-muted-foreground">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {user.email}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "relative overflow-hidden rounded-[22px] border p-5",
              premium ? "border-primary/25 bg-primary/[0.07]" : "bg-muted/35",
            )}
          >
            <Crown
              className="absolute -bottom-6 -right-4 size-24 text-primary opacity-[0.08]"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="grid size-10 place-items-center rounded-[14px] bg-primary text-primary-foreground">
                <Crown className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Votre abonnement
              </p>
              <p className="mt-1 text-xl font-semibold">
                {premium ? "Vasco Premium" : "Vasco Essentiel"}
              </p>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {premium
                  ? "Toutes vos fonctionnalités Premium sont actives."
                  : "Les fonctions essentielles pour organiser votre quotidien."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Card className="rounded-[24px] border-border/70 p-5 shadow-sm sm:p-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Informations personnelles
            </p>
            <h3 className="mt-1 text-xl font-semibold">Votre identité</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Les informations utilisées pour votre compte Vasco.
            </p>
          </div>
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-4" />
              Modifier
            </Button>
          )}
        </header>
        {editing ? (
          <ProfileEditor
            key={`${user.name}-${user.email}`}
            user={user}
            onDone={() => setEditing(false)}
          />
        ) : (
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[17px] bg-muted/35 p-4">
              <dt className="text-xs text-muted-foreground">Nom</dt>
              <dd className="mt-1 font-semibold">{user.name}</dd>
            </div>
            <div className="rounded-[17px] bg-muted/35 p-4">
              <dt className="text-xs text-muted-foreground">Adresse e-mail</dt>
              <dd className="mt-1 truncate font-semibold">{user.email}</dd>
            </div>
          </dl>
        )}
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[24px] border-border/70 p-5 shadow-sm sm:p-6">
          <header className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary">
              <Palette className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold">Apparence</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Adaptez Vasco à votre confort de lecture.
              </p>
            </div>
          </header>
          <div className="mt-5 flex flex-wrap gap-3 rounded-[18px] bg-muted/30 p-4">
            <ModeToggle />
            <ColorVisionToggle />
          </div>
        </Card>

        <Card className="rounded-[24px] border-border/70 p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <header className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-primary/10 text-primary">
                <Bell className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold">
                  Notifications quotidiennes
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Activez ou désactivez la notification quotidienne prévue par
                  les règles métier.
                </p>
                <p className="mt-2 text-xs font-medium text-muted-foreground">
                  {user.dailyReminderEnabled ? "Activées" : "Désactivées"}
                </p>
              </div>
            </header>
            <label
              className="relative mt-1 shrink-0 cursor-pointer"
              aria-label="Activer les notifications quotidiennes"
            >
              <input
                type="checkbox"
                className="peer sr-only"
                checked={user.dailyReminderEnabled}
                disabled={notificationPreferences.isPending}
                onChange={(event) =>
                  void updateDailyNotifications(event.target.checked)
                }
              />
              <span
                className="relative block h-7 w-12 rounded-full bg-muted-foreground/25 transition-colors after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-background after:shadow-sm after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-disabled:opacity-50 motion-reduce:after:transition-none"
                aria-hidden="true"
              />
            </label>
          </div>
        </Card>
      </div>

      <Card className="rounded-[24px] border-border/70 p-5 shadow-sm sm:p-6">
        <header className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[14px] bg-emerald-500/10 text-emerald-700">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-lg font-semibold">
              Sécurité et confidentialité
            </h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Votre session et vos données personnelles sont protégées par les
              contrôles sécurisés Vasco.
            </p>
          </div>
        </header>
      </Card>
    </PageShell>
  );
}
