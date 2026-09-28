export const premiumFeatures = {
  groupManagement: {
    title: 'Gestion des groupes',
    description: 'Avec Premium, vous pouvez créer un groupe, inviter des membres et gérer les demandes. Un compte Gratuit peut toujours accepter une invitation, consulter un groupe actif, proposer ses propres animaux et le quitter.',
  },
  medicalDocuments: {
    title: 'Documents médicaux',
    description: 'Avec Premium, vous pouvez ajouter et ouvrir les pièces jointes médicales, puis exporter une synthèse PDF. L’historique de santé reste consultable avec un compte Gratuit.',
  },
  bodyTracking: {
    title: 'Suivi photo mensuel',
    description: 'Avec Premium, vous pouvez documenter l’évolution physique de votre animal avec une photo par mois et retrouver toute sa chronologie.',
  },
  statistics: {
    title: 'Statistiques',
    description: 'Avec Premium, vous pouvez visualiser les tendances et les indicateurs issus du suivi de vos animaux.',
  },
} as const;

export type PremiumFeatureKey = keyof typeof premiumFeatures;
