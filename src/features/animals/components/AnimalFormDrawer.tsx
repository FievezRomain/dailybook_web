import { useRef, useState } from "react";
import { HeartPulse, Home, PawPrint, Trash2, Utensils } from "lucide-react";
import { toast } from "sonner";

import { useAnimalForm } from "@/features/animals/hooks/use-animal-form";
import type { Animal } from "@/features/animals/types/animal";
import {
  FormSection,
  SteppedFormSheet,
} from "@/shared/components/forms/SteppedFormSheet";
import { Button } from "@/shared/components/ui/button";
import { DateInput } from "@/shared/components/ui/form-feedback";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { UnitInput } from "@/shared/components/ui/specialized-inputs";

const especeOptions = [
  "Chat",
  "Chien",
  "Poisson",
  "Oiseaux",
  "Lapin",
  "Rongeur",
  "Reptile",
  "Furet",
  "Cheval",
  "Poney",
  "Âne",
  "Mulet et bardot",
  "Poule",
  "Canard",
  "Cochon",
  "Chèvre",
  "Mouton",
  "Bovin",
  "Dinde",
  "Oie",
  "Caille",
  "Écureuil",
  "Amphibien",
  "Insecte",
  "Crustacé",
  "Arachnide",
  "Lama et alpaga",
  "Autruche et émeu",
  "Autre",
];
const unityOptions = [
  { label: "g", value: "gramme" },
  { label: "kg", value: "kilogramme" },
  { label: "mg", value: "milligramme" },
  { label: "q", value: "quintal" },
  { label: "t", value: "tonne" },
  { label: "L", value: "litre" },
  { label: "mL", value: "millilitre" },
  { label: "cL", value: "centilitre" },
];

type AnimalFormDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Animal>, imageFile?: File) => Promise<void>;
  isSubmitting?: boolean;
  initialAnimal?: Partial<Animal>;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

export function AnimalFormDrawer({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialAnimal,
}: AnimalFormDrawerProps) {
  const {
    values,
    errors,
    handleChange,
    handleTextareaChange,
    handleSubmit,
    resetForm,
    setValues,
  } = useAnimalForm(initialAnimal);
  const [imageFile, setImageFile] = useState<File>();
  const [removeS3Image, setRemoveS3Image] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEdit = Boolean(initialAnimal?.id);

  function handleClose() {
    resetForm();
    setImageFile(undefined);
    setRemoveS3Image(false);
    if (inputRef.current) inputRef.current.value = "";
    onClose();
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("L’image ne doit pas dépasser 3 Mo.");
      return;
    }
    setImageFile(file);
  }

  return (
    <SteppedFormSheet
      open={open}
      onClose={handleClose}
      onSubmit={handleSubmit(async (submittedValues) => {
        await onSubmit(
          {
            ...submittedValues,
            image: removeS3Image ? null : submittedValues.image,
          },
          imageFile,
        );
      })}
      title={
        isEdit ? `Modifier ${values.nom || "un animal"}` : "Ajouter un animal"
      }
      description="Construisez sa fiche progressivement : identité, caractéristiques, quotidien puis informations complémentaires."
      submitLabel={
        isEdit ? "Enregistrer les modifications" : "Ajouter l’animal"
      }
      submitting={isSubmitting}
      steps={[
        {
          title: "Identité",
          description:
            "Les informations indispensables pour reconnaître votre animal.",
          icon: PawPrint,
          content: (
            <FormSection
              title="Identité"
              description="Les champs marqués d’un astérisque sont nécessaires."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom *">
                  <Input
                    name="nom"
                    value={values.nom || ""}
                    onChange={handleChange}
                    required
                    aria-invalid={Boolean(errors.nom)}
                    placeholder="Son nom"
                  />
                  {errors.nom && (
                    <span className="text-xs text-destructive">
                      {errors.nom}
                    </span>
                  )}
                </Field>
                <Field label="Espèce *">
                  <Select
                    name="espece"
                    value={values.espece || ""}
                    onValueChange={(value) =>
                      setValues((previous) => ({ ...previous, espece: value }))
                    }
                    required
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={Boolean(errors.espece)}
                    >
                      <SelectValue placeholder="Choisir une espèce" />
                    </SelectTrigger>
                    <SelectContent>
                      {especeOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.espece && (
                    <span className="text-xs text-destructive">
                      {errors.espece}
                    </span>
                  )}
                </Field>
                <Field label="Date de naissance">
                  <DateInput
                    name="datenaissance"
                    value={values.datenaissance || ""}
                    onChange={handleChange}
                  />
                  {errors.datenaissance && (
                    <span className="text-xs text-destructive">
                      {errors.datenaissance}
                    </span>
                  )}
                </Field>
                <Field label="Sexe">
                  <Input
                    name="sexe"
                    value={values.sexe || ""}
                    onChange={handleChange}
                    placeholder="Femelle, mâle…"
                  />
                </Field>
                <Field label="Race">
                  <Input
                    name="race"
                    value={values.race || ""}
                    onChange={handleChange}
                  />
                </Field>
                <Field label="Robe ou couleur">
                  <Input
                    name="couleur"
                    value={values.couleur || ""}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </FormSection>
          ),
        },
        {
          title: "Caractéristiques",
          description: "Identification et repères physiques utiles au suivi.",
          icon: HeartPulse,
          content: (
            <div className="space-y-4">
              <FormSection title="Identification">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Numéro d’identification">
                    <Input
                      name="numeroidentification"
                      value={values.numeroidentification || ""}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Date d’arrivée">
                    <DateInput
                      name="datearrivee"
                      value={values.datearrivee || ""}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </FormSection>
              <FormSection
                title="Mesures initiales"
                description="Ces valeurs pourront ensuite être complétées dans l’historique."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Poids">
                    <UnitInput
                      unit="kg"
                      name="poids"
                      value={values.poids || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </Field>
                  <Field label="Taille">
                    <UnitInput
                      unit="cm"
                      name="taille"
                      value={values.taille || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                    />
                  </Field>
                </div>
              </FormSection>
            </div>
          ),
        },
        {
          title: "Quotidien",
          description: "Alimentation et quantité habituelle.",
          icon: Utensils,
          content: (
            <FormSection title="Alimentation">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Alimentation">
                  <Input
                    name="food"
                    value={values.food || ""}
                    onChange={handleChange}
                    placeholder="Croquettes, foin…"
                  />
                </Field>
                <Field label="Quantité">
                  <Input
                    type="number"
                    inputMode="decimal"
                    name="quantity"
                    value={values.quantity || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
                </Field>
                <Field label="Unité">
                  <Select
                    name="unity"
                    value={values.unity || ""}
                    onValueChange={(value) =>
                      setValues((previous) => ({ ...previous, unity: value }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {unityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FormSection>
          ),
        },
        {
          title: "Compléments",
          description: "Photo, filiation, dates de vie et informations libres.",
          icon: Home,
          content: (
            <div className="space-y-4">
              <FormSection
                title="Photo"
                description="JPEG, PNG ou WebP, 3 Mo maximum."
              >
                <Input
                  ref={inputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={
                    Boolean(imageFile) ||
                    (Boolean(initialAnimal?.image) && !removeS3Image)
                  }
                />
                {imageFile && (
                  <div className="mt-2 flex items-center justify-between rounded-control bg-muted/40 p-2 text-xs">
                    <span className="truncate">{imageFile.name}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setImageFile(undefined);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                      Retirer
                    </Button>
                  </div>
                )}
                {initialAnimal?.image && !removeS3Image && (
                  <div className="mt-2 flex items-center justify-between rounded-control bg-muted/40 p-2 text-xs">
                    <span>Photo actuelle conservée</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setRemoveS3Image(true)}
                    >
                      <Trash2 aria-hidden="true" />
                      Retirer
                    </Button>
                  </div>
                )}
                {removeS3Image && (
                  <p className="mt-2 text-xs text-destructive">
                    La photo sera supprimée lors de l’enregistrement.
                  </p>
                )}
              </FormSection>
              <FormSection title="Filiation et parcours">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nom du père">
                    <Input
                      name="nompere"
                      value={values.nompere || ""}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Nom de la mère">
                    <Input
                      name="nommere"
                      value={values.nommere || ""}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Date de départ">
                    <DateInput
                      name="datedepart"
                      value={values.datedepart || ""}
                      onChange={handleChange}
                    />
                  </Field>
                  <Field label="Date de décès">
                    <DateInput
                      name="datedeces"
                      value={values.datedeces || ""}
                      onChange={handleChange}
                    />
                  </Field>
                </div>
              </FormSection>
              <FormSection title="Informations complémentaires">
                <Textarea
                  name="informations"
                  value={values.informations || ""}
                  onChange={handleTextareaChange}
                  rows={5}
                  placeholder="Habitudes, particularités, informations importantes…"
                />
              </FormSection>
            </div>
          ),
        },
      ]}
    />
  );
}
