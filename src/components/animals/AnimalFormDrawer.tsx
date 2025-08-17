import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useRef, useState } from "react";
import { Animal } from "@/types/animal";
import { toast } from "sonner";
import { useAnimalForm } from "@/hooks/useAnimalForm";
import { X } from "lucide-react";
import { deleteFromStorage } from "@/services/storage";

const especeOptions = [
	{ label: 'Chat', value: 'Chat' }, { label: 'Chien', value: 'Chien' }, { label: 'Poisson', value: 'Poisson' },
	{ label: 'Oiseaux', value: 'Oiseaux' }, { label: 'Lapin', value: 'Lapin' }, { label: 'Rongeur', value: 'Rongeur' },
	{ label: 'Reptile', value: 'Reptile' }, { label: 'Furet', value: 'Furet' }, { label: 'Cheval', value: 'Cheval' },
	{ label: 'Poney', value: 'Poney' }, { label: 'Âne', value: 'Âne' }, { label: 'Mulet et bardot', value: 'Mulet et bardot' },
	{ label: 'Poule', value: 'Poule' }, { label: 'Canard', value: 'Canard' }, { label: 'Cochon', value: 'Cochon' },
	{ label: 'Chèvre', value: 'Chèvre' }, { label: 'Mouton', value: 'Mouton' }, { label: 'Bovin', value: 'Bovin' },
	{ label: 'Dinde', value: 'Dinde' }, { label: 'Oie', value: 'Oie' }, { label: 'Caille', value: 'Caille' },
	{ label: 'Écureuil', value: 'Écureuil' }, { label: 'Amphibien', value: 'Amphibien' }, { label: 'Insecte', value: 'Insecte' },
	{ label: 'Crustacé', value: 'Crustacé' }, { label: 'Arachnide', value: 'Arachnide' }, { label: 'Lama et alpaga', value: 'Lama et alpaga' },
	{ label: 'Autruche et émeu', value: 'Autruche et émeu' }, { label: 'Autre', value: 'Autre' },
];

const unityOptions = [
	{ label: 'g', value: 'gramme' }, { label: 'kg', value: 'kilogramme' }, { label: 'mg', value: 'milligramme' },
	{ label: 'q', value: 'quintal' }, { label: 't', value: 'tonne' }, { label: 'L', value: 'litre' },
	{ label: 'mL', value: 'millilitre' }, { label: 'cL', value: 'centilitre' },
];

type AnimalFormDrawerProps = {
	open: boolean;
	onClose: () => void;
	onSubmit: (data: Partial<Animal>, imageFile?: File) => void;
	isSubmitting?: boolean;
};

export function AnimalFormDrawer({ open, onClose, onSubmit, isSubmitting = false, initialAnimal }: AnimalFormDrawerProps & { initialAnimal?: Partial<Animal> }) {
    const {
		values,
		errors,
		handleChange,
		handleTextareaChange,
		handleSubmit,
		resetForm,
		setValues,
	} = useAnimalForm(initialAnimal);
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);
    const [removeS3Image, setRemoveS3Image] = useState(false); // Flag pour suppression S3
    const inputRef = useRef<HTMLInputElement>(null);

	// Gestion du changement de fichier image
	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				toast.error("Le fichier doit être une image.");
				return;
			}
			if (file.size > 3 * 1024 * 1024) {
				toast.error("L'image ne doit pas dépasser 3 Mo.");
				return;
			}
			setImageFile(file);
		}
	};

	// Suppression de l'image locale (avant enregistrement)
	const handleRemoveImage = () => {
		setImageFile(undefined);
		if (inputRef.current) inputRef.current.value = "";
	};

	// Flag pour suppression de l'image S3 (affichage uniquement)
	const handleRemoveLinkedImage = () => {
		setRemoveS3Image(true);
	};

	// Reset à la fermeture
	const handleClose = () => {
		resetForm();
		setImageFile(undefined);
		setRemoveS3Image(false);
		if (inputRef.current) inputRef.current.value = "";
		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent showCloseButton={false} className="max-w-[1200px] w-[90vw] h-[90vh] rounded-2xl p-0 overflow-hidden flex flex-col">
				<DialogHeader className="px-6 py-4 flex flex-row items-center justify-between">
					<DialogTitle>Ajouter un animal</DialogTitle>
                    <Button
                        onClick={onClose}
                        className="p-2 rounded hover:bg-white/20 text-white"
                        variant="ghost"
                        type="button"
                        tabIndex={0}
                        aria-label="Fermer"
                    >
                        <X size={20} />
                    </Button>
				</DialogHeader>
				<form className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" onSubmit={handleSubmit(async (vals) => {
                    // Suppression S3 à l'enregistrement
                    if (removeS3Image && initialAnimal?.image) {
                        try {
                            await deleteFromStorage(initialAnimal.image);
                            vals.image = undefined;
                        } catch (e) {
                            toast.error("Erreur lors de la suppression de l'image sur le serveur.");
                        }
                    }
                    onSubmit(vals, imageFile);
                })}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom *</label>
                            <Input
                                name="nom"
                                value={values.nom || ""}
                                onChange={handleChange}
                                required
                                placeholder="Nom *"
                            />
                            {errors.nom && <p className="text-xs text-red-500">{errors.nom}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Espèce *</label>
                            <Select
                                name="espece"
                                value={values.espece || ""}
                                onValueChange={value => setValues(prev => ({ ...prev, espece: value }))}
                                required
                            >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Espèce" />
                            </SelectTrigger>
                            <SelectContent>
                                {especeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            {errors.espece && <p className="text-xs text-red-500">{errors.espece}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date de naissance *</label>
                            <Input
                                type="date"
                                name="datenaissance"
                                value={values.datenaissance || ""}
                                onChange={handleChange}
                                required
                                placeholder="Date de naissance *"
                            />
                            {errors.datenaissance && <p className="text-xs text-red-500">{errors.datenaissance}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Provenance</label>
                            <Input
                                name="provenance"
                                value={values.provenance || ""}
                                onChange={handleChange}
                                placeholder="Provenance"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Race</label>
                            <Input
                                name="race"
                                value={values.race || ""}
                                onChange={handleChange}
                                placeholder="Race"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date d'arrivée</label>
                            <Input
                                type="date"
                                name="datearrivee"
                                value={values.datearrivee || ""}
                                onChange={handleChange}
                                placeholder="Date d'arrivée"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Numéro d'identification</label>
                            <Input
                                name="numeroidentification"
                                value={values.numeroidentification || ""}
                                onChange={handleChange}
                                placeholder="Numéro d'identification"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Alimentation</label>
                            <Input
                                name="food"
                                value={values.food || ""}
                                onChange={handleChange}
                                placeholder="Alimentation"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Poids</label>
                            <Input
                                name="poids"
                                value={values.poids || ""}
                                onChange={handleChange}
                                placeholder="Poids"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sexe</label>
                            <Input
                                name="sexe"
                                value={values.sexe || ""}
                                onChange={handleChange}
                                placeholder="Sexe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Taille</label>
                            <Input
                                name="taille"
                                value={values.taille || ""}
                                onChange={handleChange}
                                placeholder="Taille"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Quantité</label>
                            <Input
                                name="quantity"
                                value={values.quantity || ""}
                                onChange={handleChange}
                                placeholder="Quantité"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Unité</label>
                            <Select
                                name="unity"
                                value={values.unity || ""}
                                onValueChange={value => setValues(v => ({ ...v, unity: value }))}
                            >
                            <SelectTrigger  className="w-full">
                                <SelectValue placeholder="Unité" />
                            </SelectTrigger>
                            <SelectContent>
                                {unityOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Robe</label>
                            <Input
                                name="robe"
                                value={values.robe || ""}
                                onChange={handleChange}
                                placeholder="Robe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom du père</label>
                            <Input
                                name="nompere"
                                value={values.nompere || ""}
                                onChange={handleChange}
                                placeholder="Nom du père"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom de la mère</label>
                            <Input
                                name="nommere"
                                value={values.nommere || ""}
                                onChange={handleChange}
                                placeholder="Nom de la mère"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Image</label>
                            <Input
                                type="file"
                                name="image"
                                accept="image/*"
                                ref={inputRef}
                                onChange={handleImageChange}
                                max={1}
                                disabled={!!imageFile || (!!initialAnimal?.image && !removeS3Image)}
                            />
                            {/* Affiche l'image locale sélectionnée */}
                            {imageFile && (
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-green-600">Image sélectionnée : {imageFile.name}</p>
                                    <Button type="button" size="sm" variant="ghost" onClick={handleRemoveImage}>
                                        Supprimer
                                    </Button>
                                </div>
                            )}
                            {/* Affiche l'image déjà liée à l'animal (S3) si présente et non supprimée */}
                            {initialAnimal?.image && !removeS3Image && (
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-green-600">Image enregistrée : {initialAnimal.image}</p>
                                    <Button type="button" size="sm" variant="ghost" onClick={handleRemoveLinkedImage}>
                                        Supprimer
                                    </Button>
                                </div>
                            )}
                            {/* Message si l'image S3 a été marquée pour suppression */}
                            {removeS3Image && (
                                <p className="text-xs text-red-500 mt-1">Image marquée pour suppression. Enregistrez pour confirmer.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date de départ</label>
                            <Input
                                type="date"
                                name="datedepart"
                                value={values.datedepart || ""}
                                onChange={handleChange}
                                placeholder="Date de départ"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date de décès</label>
                            <Input
                                type="date"
                                name="datedeces"
                                value={values.datedeces || ""}
                                onChange={handleChange}
                                placeholder="Date de décès"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Informations complémentaires</label>
                        <Textarea
                            name="informations"
                            value={values.informations || ""}
                            onChange={handleTextareaChange}
                            placeholder="Informations complémentaires"
                            rows={2}
                        />
                    </div>
                    <DialogFooter className="mt-auto flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="outline" disabled={isSubmitting}>
                            {isSubmitting ? "Ajout..." : "Ajouter"}
                        </Button>
                    </DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}