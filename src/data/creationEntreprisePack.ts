
import { BlogPost, INITIAL_CHECKLIST } from "../../types";

// ID de la catégorie cible : "Entrepreneuriat" (c4)
const CATEGORY_ID = 'c4'; 
const AUTHOR_ID = 'u2'; // Amina Kaddour

const BASE_DATE = new Date().toISOString();

export const CREATION_ENTREPRISE_PACK: BlogPost[] = [
  {
    id: 'pack-creation-01',
    title: "Article 1 : Choisir la Forme Juridique de Votre Entreprise en Algérie (Guide 2025)",
    slug: "choisir-forme-juridique-entreprise-algerie-2025",
    summary: "SARL, EURL, SPA ou Entreprise Individuelle ? Ce choix stratégique impacte votre fiscalité, votre responsabilité et votre crédibilité. Comparatif détaillé pour faire le bon choix en 2025.",
    content: `
      <p class="lead text-lg text-slate-600 mb-8">Le choix de la forme juridique constitue la première décision stratégique que doit prendre tout créateur d'entreprise en Algérie. Cette décision aura des répercussions majeures sur la fiscalité, la responsabilité des associés, le capital minimum requis, et la complexité administrative de votre future activité. Cet article vous guide à travers les différentes formes juridiques disponibles pour faire le choix le plus adapté à votre projet.</p>
      
      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Les formes juridiques disponibles en Algérie</h2>
      
      <div class="grid md:grid-cols-2 gap-4 my-6">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="text-xl font-bold text-slate-900 mb-2">1. Entreprise Individuelle</h3>
            <p class="text-sm text-slate-600 mb-4">La forme la plus simple pour se lancer seul.</p>
            <ul class="space-y-2 text-sm">
                <li class="flex items-start gap-2"><span class="text-green-500 font-bold">✓</span> Création rapide et peu coûteuse</li>
                <li class="flex items-start gap-2"><span class="text-green-500 font-bold">✓</span> Pas de capital minimum</li>
                <li class="flex items-start gap-2"><span class="text-red-500 font-bold">✗</span> Responsabilité illimitée (Biens personnels engagés)</li>
            </ul>
        </div>
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 class="text-xl font-bold text-slate-900 mb-2">2. SARL / EURL</h3>
            <p class="text-sm text-slate-600 mb-4">La structure idéale pour les PME et Startups.</p>
            <ul class="space-y-2 text-sm">
                <li class="flex items-start gap-2"><span class="text-green-500 font-bold">✓</span> Responsabilité limitée aux apports</li>
                <li class="flex items-start gap-2"><span class="text-green-500 font-bold">✓</span> Crédibilité auprès des banques</li>
                <li class="flex items-start gap-2"><span class="text-red-500 font-bold">✗</span> Formalités de création plus lourdes</li>
            </ul>
        </div>
      </div>
      
      <p class="text-slate-600">Pour une analyse approfondie des statuts SPA, SNC et des régimes fiscaux associés, consultez nos guides dédiés ou utilisez notre simulateur de choix de statut.</p>
    `,
    featuredImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFnP7bgFOlVL_BumPxcmghjbVlub_ixMnEVIRelf42fwA9uKiqKNcCJsYETrL060_BieVgfilm-rg5imyuXbr2l0XE3m_w0CxCoaeZ3Yo4zsvPFJ7MTcmtOrxgn2TPJVHceLWUZBBWGPQhIcu9ZI8LdhJ5ngX9bB4AeGGR16XoBPJuayOhNQ6u0-BT2mE2LYyV1CbLva6nPQKxzEvnuRR1Bq9dv0m94s8Rg7H7uOwlXmYV4GMu6jxepgV9V715POVWnEUI0LCkvhfO",
    featuredImageAlt: "Statut Juridique Algérie",
    categoryId: CATEGORY_ID,
    tagIds: ['Création', 'Juridique', 'Statuts'],
    status: 'published',
    authorId: AUTHOR_ID,
    createdAt: BASE_DATE,
    publishedAt: BASE_DATE,
    targetKeywords: ['forme juridique Algérie 2025', 'SARL EURL SPA différence', 'choisir statut entreprise', 'création société Algérie', 'responsabilité limitée'],
    wordCount: 1600,
    qualityChecklist: { ...INITIAL_CHECKLIST, minLengthReached: true },
    isPinned: false
  },
  {
    id: 'pack-creation-02',
    title: "Article 2 : Réservation de la Dénomination Sociale auprès du CNRC (Sidjilcom)",
    slug: "reservation-denomination-sociale-cnrc-sidjilcom",
    summary: "La réservation de la dénomination sociale constitue la première étape officielle.",
    content: "Contenu Article 2...",
    featuredImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBckXNOPetMbia1aXH7m43cdwB0K59nfBt9cHuf8wR57dxpd5STOBj3QsKKirJA-spbddotfuuujbztg9beoaExk1xBvbc1QNs3bpbvADbosZcvbdNoE5qy_KM0Gll6OuUlBwA5CXUSAqZMe9ziYe8zkCG0Fq7di0SC4XoQwbIZ_-OIdnas5LkI64ZVLX780VlF04Neug4eG526FDXEGnnSz9iLrr7B_q-cgJmJcrMj1sKgxzRUE4Tb5wirLJ-2ci0AfwgsalYwSfP-",
    featuredImageAlt: "CNRC Sidjilcom",
    categoryId: CATEGORY_ID,
    tagIds: ['CNRC', 'Sidjilcom', 'Création'],
    status: 'published',
    authorId: AUTHOR_ID,
    createdAt: BASE_DATE,
    publishedAt: BASE_DATE,
    targetKeywords: ['réservation nom entreprise Algérie 2025'],
    wordCount: 1200,
    qualityChecklist: { ...INITIAL_CHECKLIST, minLengthReached: true },
    isPinned: false
  },
  { id: 'pack-creation-03', title: "Article 3 : Rédaction des Statuts Juridiques et Passage chez le Notaire", slug: "redaction-statuts", summary: "...", content: "...", featuredImageUrl: "https://via.placeholder.com/800x400", featuredImageAlt: "", categoryId: CATEGORY_ID, tagIds: [], status: 'published', authorId: AUTHOR_ID, createdAt: BASE_DATE, publishedAt: BASE_DATE, targetKeywords: [], wordCount: 0, qualityChecklist: INITIAL_CHECKLIST },
  { id: 'pack-creation-04', title: "Article 4 : Le Capital Social - Montants, Dépôt et Attestation", slug: "capital-social", summary: "...", content: "...", featuredImageUrl: "https://via.placeholder.com/800x400", featuredImageAlt: "", categoryId: CATEGORY_ID, tagIds: [], status: 'published', authorId: AUTHOR_ID, createdAt: BASE_DATE, publishedAt: BASE_DATE, targetKeywords: [], wordCount: 0, qualityChecklist: INITIAL_CHECKLIST },
  { id: 'pack-creation-05', title: "Article 5 : La Publication Légale (BOAL et Journal)", slug: "publication-legale", summary: "...", content: "...", featuredImageUrl: "https://via.placeholder.com/800x400", featuredImageAlt: "", categoryId: CATEGORY_ID, tagIds: [], status: 'published', authorId: AUTHOR_ID, createdAt: BASE_DATE, publishedAt: BASE_DATE, targetKeywords: [], wordCount: 0, qualityChecklist: INITIAL_CHECKLIST },
  { id: 'pack-creation-06', title: "Article 6 : Obtention du Registre de Commerce (RC) auprès du CNRC", slug: "registre-commerce", summary: "...", content: "...", featuredImageUrl: "https://via.placeholder.com/800x400", featuredImageAlt: "", categoryId: CATEGORY_ID, tagIds: [], status: 'published', authorId: AUTHOR_ID, createdAt: BASE_DATE, publishedAt: BASE_DATE, targetKeywords: [], wordCount: 0, qualityChecklist: INITIAL_CHECKLIST },
  { id: 'pack-creation-07', title: "Article 7 : Déclaration d'Existence Fiscale et Obtention du NIF (Série G N°8)", slug: "nif-fiscale", summary: "...", content: "...", featuredImageUrl: "https://via.placeholder.com/800x400", featuredImageAlt: "", categoryId: CATEGORY_ID, tagIds: [], status: 'published', authorId: AUTHOR_ID, createdAt: BASE_DATE, publishedAt: BASE_DATE, targetKeywords: [], wordCount: 0, qualityChecklist: INITIAL_CHECKLIST },
  { id: 'pack-creation-08', title: "Article 8 : Affiliation à la CASNOS ou CNAS - Obligations Sociales", slug: "affiliation-sociale", summary: "...", content: "...", featuredImageUrl: "https://via.placeholder.com/800x400", featuredImageAlt: "", categoryId: CATEGORY_ID, tagIds: [], status: 'published', authorId: AUTHOR_ID, createdAt: BASE_DATE, publishedAt: BASE_DATE, targetKeywords: [], wordCount: 0, qualityChecklist: INITIAL_CHECKLIST },

  // --- ARTICLE 9 : BANQUE ---
  {
    id: 'pack-creation-09',
    title: "Article 9 : Ouverture du Compte Bancaire Professionnel et Déblocage du Capital",
    slug: "ouverture-compte-bancaire-deblocage-capital",
    summary: "Dernière étape financière : transformez votre compte d'attente en compte courant opérationnel et récupérez votre capital. Comparatif banques, procédure étape par étape et coûts.",
    content: `
      <p class="lead text-lg text-slate-600 mb-8">L'ouverture d'un compte bancaire professionnel est une étape essentielle qui permet à votre entreprise de débloquer le capital social déposé lors de la constitution, d'encaisser les paiements de vos clients et d'effectuer vos règlements fournisseurs. Cette démarche doit être effectuée dès l'obtention de votre registre de commerce et de votre NIF.</p>

      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Pourquoi un compte professionnel distinct ?</h2>
      
      <div class="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500 shadow-sm mb-8">
        <h4 class="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg">
            <span class="material-symbols-outlined">gavel</span> Obligations Légales
        </h4>
        <p class="text-slate-700 mb-3">
            Pour une société commerciale (SARL, EURL, SPA), l'ouverture d'un compte bancaire professionnel est <strong>obligatoire</strong> pour assurer la séparation des patrimoines.
        </p>
        <div class="grid md:grid-cols-2 gap-4">
            <ul class="list-none space-y-2 text-blue-800 text-sm">
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm">check_circle</span> <strong>Débloquer le capital :</strong> Récupérer les fonds initiaux.</li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm">check_circle</span> <strong>Traçabilité :</strong> Séparation nette des flux financiers.</li>
            </ul>
            <ul class="list-none space-y-2 text-blue-800 text-sm">
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm">check_circle</span> <strong>Conformité :</strong> Respect des normes comptables.</li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-sm">check_circle</span> <strong>Crédibilité :</strong> Image sérieuse (RIB Société).</li>
            </ul>
        </div>
      </div>

      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Choix de la banque : Publique ou Privée ?</h2>
      
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center material-symbols-outlined">account_balance</span> 
                Banques Publiques
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 mb-4">
                <li>BNA (Banque Nationale d'Algérie)</li>
                <li>CPA (Crédit Populaire d'Algérie)</li>
                <li>BADR (Agriculture & Rural)</li>
                <li>BDL (Développement Local)</li>
                <li>BEA (Banque Extérieure)</li>
                <li>CNEP-Banque</li>
            </ul>
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                <strong>Avantages :</strong> Réseau d'agences très dense, tarifs souvent plus bas, idéal pour les crédits d'investissement étatiques.
            </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center material-symbols-outlined">account_balance_wallet</span> 
                Banques Privées
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 mb-4">
                <li>Société Générale Algérie</li>
                <li>BNP Paribas El Djazaïr</li>
                <li>Natixis Algérie</li>
                <li>AGB (Arab Gulf Bank)</li>
                <li>Trust Bank, Al Baraka, Al Salam...</li>
            </ul>
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                <strong>Avantages :</strong> Services digitaux (E-banking) performants, réactivité, services internationaux (import/export).
            </div>
        </div>
      </div>

      <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-8 flex items-start gap-3">
        <span class="material-symbols-outlined text-yellow-600 text-2xl">lightbulb</span>
        <div>
            <p class="font-bold text-yellow-900 text-sm">Conseil Stratégique</p>
            <p class="text-sm text-yellow-800">Si vous avez déjà déposé votre capital dans une banque pour l'attestation initiale, privilégiez cette même banque pour l'ouverture du compte définitif afin de simplifier et d'accélérer le transfert des fonds.</p>
        </div>
      </div>

      <hr class="my-8 border-slate-200"/>

      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Documents Requis pour l'Ouverture</h2>

      <div class="grid md:grid-cols-2 gap-8 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary">
            <h3 class="font-bold text-lg text-primary mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined">business</span> Société (Personne Morale)
            </h3>
            <ul class="space-y-3 text-sm text-slate-700">
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-green-500 text-sm font-bold">check</span> <strong>Extrait du RC</strong> (Copie certifiée + Original)</li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-green-500 text-sm font-bold">check</span> <strong>Statuts</strong> notariés (Copie certifiée)</li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-green-500 text-sm font-bold">check</span> <strong>Carte Fiscale (NIF)</strong></li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-green-500 text-sm font-bold">check</span> <strong>BOAL</strong> (Copie de la publication)</li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-green-500 text-sm font-bold">check</span> <strong>Attestation Affiliation</strong> (CNAS/CASNOS)</li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-green-500 text-sm font-bold">check</span> <strong>PV de nomination</strong> du gérant</li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-green-500 text-sm font-bold">check</span> <strong>Documents Gérant :</strong> CNI, Résidence, Photos</li>
            </ul>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-slate-400">
            <h3 class="font-bold text-lg text-slate-700 mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined">person</span> Entreprise Individuelle
            </h3>
            <ul class="space-y-3 text-sm text-slate-700">
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-slate-400 text-sm font-bold">check</span> <strong>Extrait du RC</strong></li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-slate-400 text-sm font-bold">check</span> <strong>Carte Fiscale (NIF)</strong></li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-slate-400 text-sm font-bold">check</span> <strong>Attestation CASNOS</strong></li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-slate-400 text-sm font-bold">check</span> <strong>Justificatif de domicile</strong></li>
                <li class="flex items-start gap-2"><span class="material-symbols-outlined text-slate-400 text-sm font-bold">check</span> <strong>Pièce d'identité</strong> + Photos</li>
            </ul>
        </div>
      </div>

      <hr class="my-8 border-slate-200"/>

      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Procédure : Ouverture & Déblocage</h2>
      
      <div class="space-y-6">
        <div class="flex gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">1</div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
                <h4 class="font-bold text-slate-900 text-lg mb-1">Rendez-vous et Dépôt</h4>
                <p class="text-sm text-slate-600">Prenez RDV avec un chargé d'affaires entreprises. Déposez le dossier complet. La banque vérifie la conformité, l'authenticité des documents et consulte la centrale des risques.</p>
                <div class="mt-2 inline-block bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded font-bold">Délai : 3 à 7 jours</div>
            </div>
        </div>
        
        <div class="flex gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">2</div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
                <h4 class="font-bold text-slate-900 text-lg mb-1">Signature des Conventions</h4>
                <p class="text-sm text-slate-600">Une fois le dossier validé, vous signez les conventions de compte. Commandez immédiatement vos moyens de paiement (Chéquier, CIB) et l'accès E-banking. Un dépôt initial peut être exigé (10.000 à 50.000 DA).</p>
            </div>
        </div>

        <div class="flex gap-4">
            <div class="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">3</div>
            <div class="bg-green-50 p-5 rounded-xl border border-green-200 shadow-sm flex-1">
                <h4 class="font-bold text-green-800 text-lg mb-1">Déblocage du Capital Social</h4>
                <p class="text-sm text-green-700 font-medium mb-2">
                    C'est le moment clé ! Avec votre nouveau RIB définitif, demandez le virement des fonds depuis le compte d'attente (capital bloqué) vers le compte courant.
                </p>
                <ul class="list-disc pl-5 text-sm text-green-800">
                    <li>Fournir le RC original et le NIF.</li>
                    <li>Délai de virement : 24h à 72h.</li>
                    <li>Les fonds deviennent alors utilisables pour l'activité.</li>
                </ul>
            </div>
        </div>
      </div>

      <hr class="my-8 border-slate-200"/>

      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Tarification Bancaire Indicative</h2>
      <p class="mb-4 text-sm text-slate-600">Les tarifs varient selon les banques, voici une moyenne observée pour les comptes professionnels :</p>

      <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm mb-8">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-xs">
                <tr>
                    <th className="p-4 border-b">Service</th>
                    <th className="p-4 border-b">Coût Estimatif</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50"><td className="p-4">Tenue de compte mensuelle</td><td className="p-4 font-mono font-bold">500 - 2.000 DA</td></tr>
                <tr className="hover:bg-slate-50"><td className="p-4">Carnet de chèques (25/50)</td><td className="p-4 font-mono font-bold">1.000 - 2.000 DA</td></tr>
                <tr className="hover:bg-slate-50"><td className="p-4">Virement externe</td><td className="p-4 font-mono font-bold">500 - 1.500 DA</td></tr>
                <tr className="hover:bg-slate-50"><td className="p-4">Abonnement E-banking</td><td className="p-4 font-mono font-bold">Gratuit à 2.000 DA/mois</td></tr>
                <tr className="hover:bg-slate-50"><td className="p-4">Carte CIB Professionnelle</td><td className="p-4 font-mono font-bold">2.000 - 5.000 DA/an</td></tr>
                <tr className="hover:bg-slate-50"><td className="p-4">Location TPE</td><td className="p-4 font-mono font-bold">2.000 - 5.000 DA/mois</td></tr>
                <tr className="hover:bg-slate-50"><td className="p-4 text-red-600 font-bold">Commissions découvert</td><td className="p-4 font-mono font-bold text-red-600">8% à 15% (Taux annuel)</td></tr>
            </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-50 p-5 rounded-xl border-l-4 border-red-500">
            <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2"><span className="material-symbols-outlined">warning</span> À éviter absolument</h4>
            <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                <li>Chèques sans provision (Interdiction bancaire immédiate).</li>
                <li>Confusion dépenses perso/pro (Risque fiscal).</li>
                <li>Découvert non autorisé (Agios majorés).</li>
                <li>Retard paiement frais bancaires.</li>
            </ul>
          </div>
          <div className="bg-green-50 p-5 rounded-xl border-l-4 border-green-500">
            <h4 className="font-bold text-green-800 mb-2 flex items-center gap-2"><span className="material-symbols-outlined">lightbulb</span> Bonnes pratiques</h4>
            <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                <li>Négociez les frais de tenue de compte annuellement.</li>
                <li>Activez les alertes SMS pour les mouvements.</li>
                <li>Utilisez l'E-banking pour éviter les déplacements.</li>
                <li>Rapprochez vos comptes mensuellement avec votre comptable.</li>
            </ul>
          </div>
      </div>

      <div className="mt-12 p-8 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-2xl text-white shadow-xl border border-blue-400/30">
        <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-3xl text-yellow-400">workspace_premium</span>
            <h2 className="text-2xl font-bold text-white m-0">Conclusion</h2>
        </div>
        <p className="text-lg leading-relaxed font-medium opacity-95">
           L'ouverture du compte bancaire professionnel finalise la structure financière de votre entreprise. Une fois le compte ouvert (3 à 7 jours) et le capital débloqué, vous disposez de votre trésorerie de départ pour lancer l'activité. Gérez ce compte avec rigueur, séparez strictement vos finances et utilisez les outils digitaux (E-banking) pour garder un œil constant sur votre cash-flow.
        </p>
      </div>
    `,
    featuredImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATUMDZyZ1RjoLJmNCKsqU5WN4PsiBlIH1TOQb6owc5kCnjfwLdtulmzosoTyBC98lSMvY8ynkJS7EIPFp-cJc9ngg-4f6ntNp9d5wGOXA-tOVSTdsqm6NODfW0SFxcPeRQ4hEmB64CR9GJpQQjEu6YhOPoGAVBG_hYBy6WyaRKxAGxy3hZOOFWGVUZykCktLRXnkgwzo9kxif55XT3dY3zvGL2C-bif_CXD20kDsdiqb9GidveuN6D15v0fGAM8oPxEO0phXu1Z8nV",
    featuredImageAlt: "Compte Bancaire Pro",
    categoryId: CATEGORY_ID,
    tagIds: ['Banque', 'Finance', 'Trésorerie'],
    status: 'published',
    authorId: AUTHOR_ID,
    createdAt: BASE_DATE,
    publishedAt: BASE_DATE,
    targetKeywords: ['compte bancaire pro', 'déblocage capital', 'RIB entreprise', 'banque algérie'],
    wordCount: 1400,
    qualityChecklist: { ...INITIAL_CHECKLIST, minLengthReached: true },
    isPinned: false
  },
  
  // --- ARTICLE 10 : AGREMENTS ---
  {
    id: 'pack-creation-10',
    title: "Article 10 : Licences, Agréments et Autorisations pour Activités Réglementées",
    slug: "agrements-autorisations-activites-reglementees",
    summary: "BTP, Santé, Transport, Import-Export... Votre activité nécessite peut-être un agrément spécifique avant de démarrer. Guide complet des secteurs réglementés et conclusion du pack.",
    content: `
      <p class="lead text-lg text-slate-600 mb-8">Certaines activités économiques en Algérie sont soumises à une réglementation spécifique et nécessitent l'obtention d'agréments, licences ou autorisations préalables délivrés par les ministères ou administrations compétentes. Bien que vous puissiez obtenir votre registre de commerce, l'exercice effectif de l'activité est conditionné par ces sésames administratifs.</p>

      <div class="bg-red-50 p-6 rounded-xl border-l-4 border-red-500 shadow-sm mb-8">
        <h4 class="font-bold text-red-900 flex items-center gap-2 mb-2 text-lg">
            <span class="material-symbols-outlined text-2xl">gavel</span> Règle d'Or Impérative
        </h4>
        <p class="text-red-800 font-medium">
            Vous pouvez obtenir votre Registre de Commerce (RC) avec un agrément provisoire ou une simple inscription, mais <strong>il est strictement interdit d'exercer</strong> (facturer, ouvrir au public) tant que l'agrément définitif n'est pas obtenu.
        </p>
        <p class="text-sm text-red-700 mt-2 italic">Sanction : Fermeture administrative et amende de 50.000 à 500.000 DA.</p>
      </div>

      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Principaux Secteurs Réglementés</h2>

      <div class="grid md:grid-cols-2 gap-6 mb-8">
        
        {/* Import Export */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><span class="material-symbols-outlined">public</span></div>
                1. Import-Export
            </h3>
            <div class="space-y-3 text-sm text-slate-600 pl-2 border-l-2 border-blue-100">
                <p><strong>Programme Prévisionnel (PPI) :</strong> Obligatoire par semestre, visé par le Ministère du Commerce.</p>
                <p><strong>Certificat de Respect :</strong> Exigé pour la revente en l'état.</p>
                <p><strong>Licences Spécifiques :</strong> Produits pharmaceutiques, chimiques, or, armes, etc.</p>
                <p><strong>Autorisation Services :</strong> Pour l'importation de services (Nouveauté).</p>
            </div>
        </div>

        {/* BTP */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"><span class="material-symbols-outlined">construction</span></div>
                2. BTP (Bâtiment)
            </h3>
            <p class="text-sm text-slate-600 mb-2">Nécessite un <strong>Certificat de Qualification et de Classification Professionnelles</strong>.</p>
            <ul class="grid grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                <li class="bg-slate-50 p-2 rounded border">Cat I : Petits travaux</li>
                <li class="bg-slate-50 p-2 rounded border">Cat II : Travaux moyens</li>
                <li class="bg-slate-50 p-2 rounded border">Cat III : Importants</li>
                <li class="bg-slate-50 p-2 rounded border">Cat IV+ : Grands projets</li>
            </ul>
        </div>

        {/* Transport */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600"><span class="material-symbols-outlined">local_shipping</span></div>
                3. Transport
            </h3>
            <ul class="list-disc pl-5 space-y-1 text-sm text-slate-600">
                <li><strong>Marchandises :</strong> Licence de transport (Direction Transports Wilaya).</li>
                <li><strong>Voyageurs :</strong> Agrément + conditions de parc.</li>
                <li><strong>Taxi :</strong> Permis de place (Licence Moudjahidine) + Cahier des charges.</li>
                <li><strong>Auto-école :</strong> Agrément ministère + véhicules double commande.</li>
            </ul>
        </div>

        {/* Santé */}
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600"><span class="material-symbols-outlined">medical_services</span></div>
                4. Santé & Pharmacie
            </h3>
            <ul class="list-disc pl-5 space-y-1 text-sm text-slate-600">
                <li><strong>Pharmacie :</strong> Diplôme + Agrément DSP + Local conforme.</li>
                <li><strong>Laboratoire :</strong> Agrément sanitaire + Biologiste.</li>
                <li><strong>Clinique :</strong> Autorisation technique d'ouverture (Ministère Santé).</li>
            </ul>
        </div>

      </div>

      <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-8">
        <h4 class="font-bold text-slate-800 mb-2">Autres activités fréquentes :</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-medium text-slate-600">
            <span class="bg-white p-2 rounded shadow-sm border border-slate-100 flex items-center gap-2"><span class="material-symbols-outlined text-sm">school</span> Écoles Privées</span>
            <span class="bg-white p-2 rounded shadow-sm border border-slate-100 flex items-center gap-2"><span class="material-symbols-outlined text-sm">flight</span> Agences Voyage</span>
            <span class="bg-white p-2 rounded shadow-sm border border-slate-100 flex items-center gap-2"><span class="material-symbols-outlined text-sm">security</span> Sécurité Privée</span>
            <span class="bg-white p-2 rounded shadow-sm border border-slate-100 flex items-center gap-2"><span class="material-symbols-outlined text-sm">real_estate_agent</span> Agence Immo</span>
        </div>
      </div>

      <hr class="my-8 border-slate-200"/>

      <h2 class="text-2xl font-black text-slate-900 mb-6 border-b-2 border-primary pb-2">Procédure Générale d'Obtention</h2>
      
      <div class="space-y-4 mb-8">
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
            <div>
                <h4 class="font-bold text-slate-900">Identification de l'autorité</h4>
                <p class="text-sm text-slate-600">Repérez l'organisme compétent (Ministère, Wilaya, Direction de wilaya).</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
            <div>
                <h4 class="font-bold text-slate-900">Vérification des conditions</h4>
                <p class="text-sm text-slate-600">Diplômes requis, moyens matériels, surface du local (Cahier des charges).</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
            <div>
                <h4 class="font-bold text-slate-900">Dépôt du dossier</h4>
                <p class="text-sm text-slate-600">Déposez le dossier technique complet contre récépissé.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">4</div>
            <div>
                <h4 class="font-bold text-slate-900">Inspection & Enquête</h4>
                <p class="text-sm text-slate-600">Une commission technique visite vos locaux pour valider la conformité.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm shrink-0">5</div>
            <div>
                <h4 class="font-bold text-green-700">Délivrance</h4>
                <p class="text-sm text-slate-600">Obtention de l'agrément définitif permettant le début d'activité.</p>
            </div>
          </div>
      </div>

      <div class="bg-green-50 p-6 rounded-xl border border-green-200 mb-12">
        <h3 class="font-bold text-green-900 mb-2 flex items-center gap-2"><span class="material-symbols-outlined">lightbulb</span> Conseils Pratiques</h3>
        <ul class="space-y-2 text-sm text-green-800">
            <li>✓ <strong>Anticipez :</strong> Les délais peuvent être longs (3 à 12 mois selon l'activité).</li>
            <li>✓ <strong>Conformité Locale :</strong> Ne signez pas de bail commercial avant de vérifier que le local respecte les normes techniques (surface, issues, etc.).</li>
            <li>✓ <strong>Expertise :</strong> Pour les dossiers complexes (Industrie, Santé), faites-vous accompagner par un bureau d'études agréé.</li>
        </ul>
      </div>

      {/* --- CONCLUSION GÉNÉRALE DU PACK --- */}
      <div class="mt-16 p-8 md:p-12 bg-slate-900 rounded-3xl text-white shadow-2xl relative overflow-hidden border-t-4 border-yellow-500">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-40 h-40 bg-primary/20 rounded-full -ml-10 -mb-10 blur-xl"></div>
        
        <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-yellow-400">emoji_events</span>
                Félicitations, vous êtes prêt !
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-3xl">
                Vous avez parcouru les <strong>10 étapes clés</strong> de la création d'entreprise en Algérie. 
                De l'idée initiale à la conformité réglementaire, vous disposez maintenant de la feuille de route complète pour réussir votre lancement.
            </p>
            
            <div className="bg-white/10 p-8 rounded-2xl border border-white/10 mb-8 backdrop-blur-sm">
                <h4 className="font-bold text-white mb-6 uppercase text-sm tracking-widest border-b border-white/10 pb-2">Récapitulatif du parcours entrepreneur</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-slate-300">
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 1. Forme Juridique</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 2. Réservation Nom (CNRC)</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 3. Statuts Notariés</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 4. Capital Social</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 5. Publication BOAL</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 6. Immatriculation RC</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 7. NIF & Fiscalité</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 8. Affiliation Sociale</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 9. Compte Bancaire</span>
                    <span className="flex items-center gap-3"><span className="text-green-400 bg-green-400/10 p-1 rounded-full material-symbols-outlined text-sm font-bold">check</span> 10. Agréments (Si requis)</span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
                    <p><strong>Délai moyen total :</strong> 4 à 8 semaines</p>
                    <p><strong>Coût moyen total (SARL) :</strong> 60.000 à 250.000 DA</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="/outils/checklist" className="px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 transform hover:-translate-y-1">
                    <span className="material-symbols-outlined">checklist</span>
                    Lancer ma Checklist Interactive
                </a>
                <a href="/contact" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                    Besoin d'aide pour créer ?
                </a>
            </div>
        </div>
      </div>
    `,
    featuredImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAluB1uqLrNZogVCRJGAGyLgiQA88I5PS-4wqpfXvSO7QLife575Apyn2rtxt-CPt7rCZqRA2x4cDkLsbhSuv1d_CABwINjATQZyK9HlheWJg5lDE4ZxFHSDKviC6cP4aX6p4YItS_uKE1V2qZ0_STq-a-ntoZilO7vesAkZ2Cf2wUW_XvdkMTV8QZLnpxn6PK3I8s8GnsUMmOFazg-7hfRJDvqwbygsTY_eQtXVLtHhtvne9kANyw8eEQ-QDZLo6xo3rTCz2iOfaud",
    featuredImageAlt: "Agréments Algérie",
    categoryId: 'c2', // Juridique
    tagIds: ['Agrément', 'Réglementation', 'Loi', 'BTP'],
    status: 'published',
    authorId: AUTHOR_ID,
    createdAt: BASE_DATE,
    publishedAt: BASE_DATE,
    targetKeywords: ['agrément activité', 'autorisation exercer', 'activités réglementées algérie'],
    wordCount: 1600,
    qualityChecklist: { ...INITIAL_CHECKLIST, minLengthReached: true },
    isPinned: false
  }
];
