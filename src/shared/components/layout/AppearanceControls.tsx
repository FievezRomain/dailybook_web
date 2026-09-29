import ModeToggle from './ModeToggle';
import { ColorVisionToggle } from './ColorVisionToggle';

export function AppearanceControls() {
  return (
    <div className="flex items-center gap-control" aria-label="Préférences d’apparence">
      <ColorVisionToggle />
      <ModeToggle />
    </div>
  );
}
