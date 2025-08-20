import { Animal } from "@/types/animal";
import { Skeleton } from "./skeleton";
import { FaPlus, FaUsers } from "react-icons/fa";
import { ImageSigned } from "@/types/image";
import { AnimalAvatar } from "../animals/AnimalAvatar";

function AnimalSelector({
  animals,
  selectedIds,
  onChange,
  onUpdateAnimalImage,
  showSelectAll = false,
}: {
  animals: Animal[] | undefined;
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  onUpdateAnimalImage: (id: number, imageObj: ImageSigned) => void; 
  showSelectAll?: boolean;
}) {
  const allSelected =
    animals && animals.length > 0 && selectedIds.length === animals.length;

  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {showSelectAll && animals && (
        <button
          type="button"
          className="flex flex-col items-center focus:outline-none"
          onClick={() =>
            onChange(allSelected ? [] : animals.map((a) => a.id))
          }
        >
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 78,
              height: 78,
              borderRadius: "50%",
              background: allSelected
                ? `linear-gradient(160deg, var(--baie) 30%, var(--rouan))`
                : "transparent",
              transition: "background 0.2s",
            }}
          >
            <div
              className="flex items-center justify-center bg-background"
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                transition: "background 0.2s",
              }}
            >
              <div
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: 64,
                  height: 64,
                  background: "#232323",
                }}
              >
                <FaPlus className="text-white text-2xl" />
              </div>
            </div>
          </div>
          <span className="mt-1 text-sm font-medium text-muted-foreground">
            Tous
          </span>
        </button>
      )}
      {animals === undefined ? (
        [...Array(3)].map((_, i) => (
          <Skeleton key={i} className="w-9 h-9 rounded-full" />
        ))
      ) : (
        animals.map((animal) => {
          const selected = selectedIds.includes(animal.id);

          return (
            <button
              key={animal.id}
              type="button"
              onClick={() =>
                onChange(
                  selected
                    ? selectedIds.filter((id) => id !== animal.id)
                    : [...selectedIds, animal.id]
                )
              }
              className="flex flex-col items-center focus:outline-none"
              tabIndex={0}
              aria-pressed={selected}
            >
              <div
                className="relative flex items-center justify-center"
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: "50%",
                  background: selected
                    ? `linear-gradient(160deg, var(--baie) 30%, var(--rouan))`
                    : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <div
                  className="flex items-center justify-center bg-background"
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    transition: "background 0.2s",
                  }}
                >
                  <div
                    className="rounded-full flex items-center justify-center overflow-hidden relative"
                    style={{
                      width: 64,
                      height: 64,
                      background: animal.imageSigned ? "#232323" : "#222",
                    }}
                  >
                    <AnimalAvatar
                      animal={animal}
                      width={40}
                      height={40}
                      onUpdateAnimalImage={onUpdateAnimalImage}
                    />
                    {/* Icône groupe si provenance === "group" */}
                    {animal.provenance === "group" && (
                      <span
                        className="absolute bottom-1 right-1 bg-background rounded-full p-1 flex items-center justify-center"
                        style={{
                          boxShadow: "0 0 2px #0002",
                        }}
                      >
                        <FaUsers size={14} />
                      </span>
                    )}
                  </div>
                </div>
                {/* Numéro si plusieurs sélectionnés */}
                {selected && selectedIds.length > 1 && (
                  <span
                    className="absolute -top-2 -right-2 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center"
                    style={{
                      background: "var(--baie)",
                      fontWeight: 700,
                      zIndex: 10,
                    }}
                  >
                    {selectedIds.indexOf(animal.id) + 1}
                  </span>
                )}
              </div>
              <span
                className={`mt-1 text-sm font-medium ${
                  selected ? "text-baie" : "text-muted-foreground"
                }`}
              >
                {(() => {
                  const maxLen = 10;
                  if (animal.nom.length > maxLen) {
                    const firstSpace = animal.nom.indexOf(" ");
                    if (firstSpace > 0 && firstSpace <= maxLen) {
                      return animal.nom.slice(0, firstSpace);
                    }
                    return animal.nom.slice(0, maxLen) + "...";
                  }
                  return animal.nom;
                })()}
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}

export { AnimalSelector };