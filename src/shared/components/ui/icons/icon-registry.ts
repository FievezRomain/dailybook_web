import {
  mdiAccountMultipleOutline,
  mdiAccountOutline,
  mdiArrowLeft,
  mdiBellOutline,
  mdiCalendarBlankOutline,
  mdiCalendarMonthOutline,
  mdiCalendarOutline,
  mdiChartBar,
  mdiChartLine,
  mdiCheckCircleOutline,
  mdiClose,
  mdiChevronDown,
  mdiChevronDoubleLeft,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClockOutline,
  mdiCompassOutline,
  mdiCurrencyEur,
  mdiDotsHorizontal,
  mdiHeartOutline,
  mdiHomeOutline,
  mdiMagnify,
  mdiMedicalBag,
  mdiMenu,
  mdiNoteTextOutline,
  mdiPawOutline,
  mdiPinOutline,
  mdiPlus,
  mdiRuler,
  mdiSilverwareForkKnife,
  mdiStethoscope,
  mdiTrafficCone,
  mdiTrophyOutline,
  mdiTuneVariant,
  mdiWalk,
  mdiWeightKilogram,
} from '@mdi/js';
import { RotateCcw, Sparkles, type LucideIcon } from 'lucide-react';

type MaterialCommunityDefinition = {
  provider: 'material-community';
  path: string;
};

type LucideDefinition = {
  provider: 'lucide';
  component: LucideIcon;
};

type IconDefinition = MaterialCommunityDefinition | LucideDefinition;

const material = (path: string): MaterialCommunityDefinition => ({
  provider: 'material-community',
  path,
});

const lucide = (component: LucideIcon): LucideDefinition => ({
  provider: 'lucide',
  component,
});

/**
 * Registre sémantique partagé avec le vocabulaire de l'application mobile.
 * Les composants consommateurs ne connaissent jamais le fournisseur graphique.
 */
export const iconRegistry = {
  add: material(mdiPlus),
  close: material(mdiClose),
  back: material(mdiArrowLeft),
  previous: material(mdiChevronLeft),
  next: material(mdiChevronRight),
  expand: material(mdiChevronDown),
  search: material(mdiMagnify),
  filter: material(mdiTuneVariant),
  calendar: material(mdiCalendarBlankOutline),
  time: material(mdiClockOutline),
  home: material(mdiHomeOutline),
  agenda: material(mdiCalendarMonthOutline),
  animals: material(mdiPawOutline),
  tracking: material(mdiChartLine),
  otherMenu: material(mdiMenu),
  moreHorizontal: material(mdiDotsHorizontal),
  profile: material(mdiAccountOutline),
  notifications: material(mdiBellOutline),
  medical: material(mdiMedicalBag),
  compass: material(mdiCompassOutline),
  stethoscope: material(mdiStethoscope),
  circleCheck: material(mdiCheckCircleOutline),
  trophy: material(mdiTrophyOutline),
  expense: material(mdiCurrencyEur),
  food: material(mdiSilverwareForkKnife),
  training: material(mdiTrafficCone),
  walk: material(mdiWalk),
  weight: material(mdiWeightKilogram),
  size: material(mdiRuler),
  pin: material(mdiPinOutline),
  event: material(mdiCalendarOutline),
  objective: material(mdiChartBar),
  note: material(mdiNoteTextOutline),
  contact: material(mdiAccountOutline),
  heart: material(mdiHeartOutline),
  group: material(mdiAccountMultipleOutline),

  // Actions spécifiques au web : Lucide reste disponible via le même composant.
  collapseRail: material(mdiChevronDoubleLeft),
  resetLayout: lucide(RotateCcw),
  sparkles: lucide(Sparkles),
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof iconRegistry;
