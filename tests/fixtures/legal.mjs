export function completeLegalInformation() {
  return {
    updatedOn: '2026-11-06',
    publisher: { name: 'Éditrice de test', status: '', address: 'Adresse de test', country: 'Suisse', email: 'editor@example.org', publicationDirector: '', registration: '' },
    developer: { name: '', role: 'Conception et développement', url: '', showInFooter: false },
    hosting: { name: 'Prestataire de test', address: 'Adresse de test', service: 'Hébergement statique de test', url: 'https://example.org/', privacyUrl: 'https://example.org/privacy/', dpaUrl: 'https://example.org/dpa/' },
    privacy: {
      controllerName: '', contactEmail: '', applicableLaw: 'Cadre de test', processingBasis: 'Répondre aux demandes et fournir les pages.',
      emailProvider: 'Messagerie de test', contactRetention: 'Un mois après clôture de la demande de test.', hostingRetention: 'Un jour pour les journaux de test.',
      processingCountries: 'Suisse pour ce scénario de test.', transferSafeguards: 'Aucun transfert dans ce scénario de test.',
      hostingCookies: 'Aucun cookie dans le scénario de test.', audienceMeasurement: 'Désactivée dans ce scénario de test.',
      authorityName: 'Autorité de test', authorityUrl: 'https://example.org/authority/',
    },
  };
}
