# FRAKTUR Home — Spec de refonte UX (propositions, pas encore implémentées)

*Rédigé le 2026-07-07. Complément à `WEBSITE_BRIEF.md`. Rien dans ce document n'a été codé — c'est la passe de proposition demandée avant de transmettre un prompt d'implémentation à la session Claude Code / VS Code (propriétaire des fichiers de la page Home : `Header.tsx`, `WalletList.tsx`, `SeverityBadge.tsx`, `TickerBanner.tsx`, `page.tsx`, `data/*.sample.json`).*

---

## 1. Header — traitement de "For Companies"

**État actuel :** un simple lien texte discret (`For Companies`, petit, sans bordure, sans graisse) posé dans la rangée d'ancres de navigation, à côté d'un bouton pilule plein orange en gras (`⚡ Help us fraKtur it before they do`). Les deux actions les plus importantes du header ont un poids visuel radicalement différent — l'une ressemble à une légende, l'autre à la seule chose qui compte.

**Recommandation (tu m'as demandé de trancher) :** sortir `For Companies` de la rangée de liens simples et l'associer au bouton de don comme une paire de boutons assortie, alignée à droite :

```
[ Wallets   Supporters ]        [ For Companies ]  [ ⚡ Help us fraKtur it before they do ]
        (ancres, discrètes, inchangées)    ↑ contour, bleu électrique   ↑ plein, orange (inchangé)
```

- Même forme de pilule, même padding, même `text-sm font-semibold` que le bouton de don — parité visuelle de taille/graisse, comme demandé.
- Couleur : **contour/ghost, pas plein** — `border border-fraktur-electric text-fraktur-electric bg-transparent hover:bg-fraktur-electric/10`. C'est la "parcimonie" demandée : un fin trait bleu, pas un deuxième bouton plein qui concurrence l'orange. L'orange reste l'action visuellement dominante (le don est l'objectif de conversion principal de la page Home) ; le bleu signale l'action secondaire, pour un public différent, sans se battre pour la même attention.
- Espacement : `gap-3` entre les deux pilules (elles se lisent comme une paire groupée — "les deux choses possibles ici"), un `gap-6` plus large ou un fin séparateur vertical entre les ancres et cette paire, pour que le regroupement soit sans ambiguïté.
- Mobile : les deux pilules doivent survivre au `hidden md:flex` qui masque actuellement les ancres — je recommande de garder les deux pilules toujours visibles (même sur mobile), et de ne replier dans un menu que les liens texte si la place manque. Ce sont les deux pilules qui sont le vrai rôle du header ; les ancres ne sont qu'un bonus.

---

## 2. Titre du Hero

**Actuel :** *"Live, verifiable security scores for Bitcoin wallets."* / *"Audited, timestamped, public."* — ne dit rien sur l'IA, rien sur les tests spécifiques Bitcoin, rien sur l'histoire de triage/efficacité qui est pourtant tout l'intérêt de Layer 1. Par ailleurs, "timestamped, public" surpromet légèrement — la preuve on-chain lie *ce rapport* à *cette version du wallet* à *cette version de fraKtur* à *cette date* ; elle ne veut pas dire que le contenu complet du rapport est public (voir la politique de disclosure, §15 de `WEBSITE_BRIEF.md`).

**Inspiration tirée du positionnement de Loupe lui-même** (Spiral/Block) : "les attaquants utilisent l'IA pour trouver des failles dans le code open-source, la plupart des mainteneurs non" / "que du signal, pas de bruit." C'est cette tension qu'il faut reprendre — l'IA comme ce qui rééquilibre le rapport de force, pas comme un badge de hype.

**10 propositions de titre :**

| # | Titre | Pourquoi ça pourrait marcher |
|---|---|---|
| 1 | "AI that reads Bitcoin code like an attacker would." | Comparaison concrète, pas un mot-clé creux |
| 2 | "Real Bitcoin-native AI. Real files that matter." | IA + spécificité + triage en une ligne |
| 3 | "The AI finds what matters. You don't pay to read the rest." | Relie directement IA → efficacité → accessibilité |
| 4 | "Every Bitcoin wallet, watched by AI that knows Bitcoin." | Continu + spécifique au protocole |
| 5 | "Not every line. The lines that break." | Aucun mot "AI" — montre le triage au lieu de revendiquer l'intelligence ; fait écho à "Not smaller. Smarter." de la page Companies |
| 6 | "AI-triaged. Bitcoin-specific. Publicly proven." | Couvre les trois demandes, mais plus liste que phrase |
| 7 | "Security that knows which 5% to read." | S'appuie sur l'histoire du Pareto déjà prouvée sur Companies, zéro buzzword |
| 8 | "Built to think like Bitcoin. Built to run like an attacker." | Connaissance du protocole + tests dynamiques, sans le mot "AI" |
| 9 | **"Bitcoin-native AI, aimed at what actually breaks."** | Reprend exactement la phrase déjà présente sur Companies ("Bitcoin-Native AI. Targeted by Fuzz.") — écho de marque entre les deux pages |
| 10 | "The scanner that knows Bitcoin — and knows where to look." | Langage simple, en deux temps, aucun risque de buzzword |

**Retenu : le #9.** *(confirmé)*

**Tagline (sous-titre) — la seule ligne que j'ai le droit d'ajouter**, en corrigeant la surpromesse de "timestamped, public" :

> **"Bound to this wallet, this version, this date — proven on-chain, not just claimed."**

Elle cadre la preuve avec exactitude (liaison/authenticité, pas contenu complet du rapport) et sonne plus confiante que la ligne actuelle, pas moins.

Le message accessibilité/prix reste hors de la Home, comme demandé — ça reste le rôle de Companies.

---

## 3. Bandeau des donateurs — animation de fracture plutôt qu'un défilement

**Actuel :** un défilement horizontal continu en CSS (marquee), tous les donateurs actifs visibles en même temps, qui défilent.

**Correction suite à ton retour :** un seul nom centré prend trop de place/d'importance à l'écran et ne renouvelle pas assez vite l'info. **Nouvelle version : 3 noms affichés en même temps, espacés régulièrement, centrés en groupe** (pas un seul, pas un défilement continu). Après ~3-3,5s, les 3 se fissurent et disparaissent ensemble, remplacés par les 3 suivants (ou en cascade légèrement décalée — voir plus bas). Ça règle les deux problèmes en un coup : plus de présence visuelle qu'un seul nom (donc ça ne "prend pas trop d'importance" en paraissant vide), et un renouvellement plus fréquent qu'un défilement lent.

- **Disposition :** 3 slots à largeur fixe, `justify-center gap-8` (ou similaire), le groupe entier centré horizontalement dans le bandeau. Si moins de 3 donateurs actifs existent, remplir les slots vides avec un état neutre ("Be the first this month") plutôt que d'étirer les 2 restants pour combler l'espace.
- **Timing de la fissure — deux options :**
  - *Synchronisé* : les 3 se fissurent exactement en même temps, le nouveau groupe de 3 apparaît ensemble. Plus simple à coder, rythme net.
  - *Cascade* : chaque slot se fissure avec un léger décalage (~150ms entre chaque) plutôt que tous en même temps — legèrement plus organique, évite l'effet "tout clignote d'un coup." Je recommande la cascade si le temps de dev le permet, sinon le synchronisé est un très bon repli.
- **Version retenue pour un premier passage (par slot) :** découpe nette en 2 morceaux le long de l'angle diagonal (`clip-path: polygon(...)`), transition CSS `transform` + `opacity`. Version 3-4 fragments irréguliers = v2, comme convenu.
- Le petit libellé ("Supporters active this month") reste au-dessus du groupe de 3, inchangé.

---

## 4. Corrections sur la fiche wallet

**a) Incohérence de lien en bas de carte.** `"In charge of this wallet? → For Companies"` (flèche au milieu) est placé juste sous `"Help us go deeper, faster →"` (flèche à la fin) — rythme incohérent. **Correction :** remplacer par `"For Companies →"`, flèche à la fin, exactement comme la ligne du dessus. On abandonne la question en préfixe — la ligne au-dessus établit déjà le motif d'un lien court et impératif, celui-ci doit le suivre à l'identique.

**b) Vignettes de sévérité — trois problèmes, trois corrections.**

1. **Titre de section : "Fractures".** *(confirmé)*

2. **La même infobulle sur chaque vignette — le cœur de la plainte.** Actuellement, chaque vignette colorée affiche indépendamment le même paragraphe de politique de disclosure au survol/clic — le lire 3-4 fois par carte, c'est exactement l'"UX décevante" signalée. **Correction :** déplacer l'explication vers une seule icône `ⓘ` (ou 🔍, qui fait aussi un clin d'œil à Loupe) à côté du libellé "Fractures" — une seule affordance d'info par carte, pas une par vignette. Les vignettes colorées (`2 Medium`, `1 High`...) deviennent purement visuelles/informatives, sans infobulle individuelle.

3. **Conflit survol vs clic pour la fermeture.** L'implémentation actuelle : le survol affiche l'infobulle, le clic la "fixe" ouverte indéfiniment jusqu'à un nouveau clic — ce qui, comme tu le notes justement, crée sa propre maladresse (une infobulle qui ne se referme pas toute seule). **Correction : fermeture différée au survol, pas d'état fixe/permanent.** `onMouseLeave` démarre un minuteur de fermeture d'environ 250ms ; re-entrer dans l'icône déclencheuse *ou* dans le panneau de l'infobulle annule ce minuteur. C'est le motif standard utilisé par toutes les librairies d'infobulles sérieuses (Radix, Tippy, Floating UI), justement pour laisser le curseur traverser l'espace visuel entre le déclencheur et le panneau sans que l'infobulle se ferme en cours de route, et elle se referme d'elle-même peu après que le curseur ait vraiment quitté les deux zones — pas besoin d'un second clic manuel. Sur tactile (pas de survol) : un tap l'ouvre, un tap en dehors (détection de clic extérieur) la referme.

**c) Un wallet dont les résultats sont réellement publics — construire le parcours, pas juste le texte.** *(confirmé, avec deux précisions ajoutées)*

- Générer un wallet d'exemple **rendu public** : ses failles sont en `status: "Fixed"`, l'embargo est dépassé. Le marquer distinctement sur sa carte — un petit lien/badge `Full report available →`, visuellement différent du traitement générique "Fractures ⓘ" des autres wallets.
- Je recommande de faire ça **au niveau du wallet pour l'instant** (un wallet, toutes ses failles publiques) plutôt qu'une granularité par faille individuelle — plus simple pour un premier passage ; la granularité par faille est une v2 légitime.

**Précision 1 — la popup doit lister l'historique des audits, pas un seul instantané.** Le wallet a probablement été audité plusieurs fois dans le temps (nouveaux commits, nouvelles versions). La popup doit donc présenter :
- Une **liste des audits** de ce wallet (date, version), le **dernier affiché par défaut** — s'il est consultable (public). S'il ne l'est pas (encore sous embargo), afficher un message d'information à sa place ("Ce scan est en cours de divulgation responsable — disponible le [date] ou dès correction") plutôt qu'un vide ou une erreur.
- Un clic permet de **naviguer dans l'historique** (audit précédent / suivant, ou une liste cliquable des dates).
- L'UI doit rendre **immédiatement visible** lesquels de ces audits sont publics et lesquels sont encore réservés — par exemple un badge "Public" (vert/électrique) vs "Embargoed until [date/fix]" (gris, verrouillé/cadenas) sur chaque entrée de la liste, pour que l'utilisateur comprenne d'un coup d'œil sans avoir à cliquer sur chacun pour le découvrir.

**Précision 2 — garde-fou important : la popup ne doit JAMAIS donner le rapport complet gratuitement.** Même pour un audit "public" (fix livré ou embargo dépassé), ce qui devient public par la politique de disclosure, c'est la faille précise qui a été divulguée — pas l'intégralité du rapport d'audit (tous les fichiers couverts, toute la méthodologie, etc.). La popup doit donc :
- Montrer le détail de la ou des failles concernées par CET audit précis (celles qui sont sorties d'embargo) — c'est gratuit, c'est la politique de disclosure qui s'applique.
- Ne jamais afficher "le rapport complet" en un clic gratuit — à la place, un CTA clair : *"Want the complete findings report for this wallet? → [Get the full report]"*, qui route vers le parcours d'achat (voir §7, nouveau). C'est exactement le produit payant n°1 (rentrée d'argent "payer pour le rapport complet") qui a besoin d'un point d'entrée concret — cette popup, au moment où l'utilisateur vient de voir une preuve réelle et a le plus confiance, est un excellent endroit pour le lui proposer.

---

## 5. Les trois rentrées d'argent × deux profils clients — carte des parcours

| | **Entreprise qui développe le wallet** | **Utilisateur final (sécurise ses propres fonds)** |
|---|---|---|
| Payer pour le rapport complet | ✅ Nouveau : une option ponctuelle, sans abonnement — "acheter l'ensemble des trouvailles actuelles, une fois" pour une entreprise pas prête à s'engager au mois. Vit sur **Companies**, pas sur Home. | ❌ Pas leur offre — ils n'achètent pas de rapports techniques sur un wallet qu'ils n'exploitent pas. Explicitement écarté lors de la décision sur la politique de disclosure. |
| Payer au mois (abonnement) | ✅ Le produit B2B central — couverture continue. Déjà la seule option sur la page de pricing de Companies. | ❌ Non applicable |
| Tips (dev / audit / équipe) | Possible en théorie, mais pas le donateur visé | ✅ Tout le tiroir de don — déjà construit, c'est exactement son rôle |

**Ce que ça confirme est déjà juste :** les deux liens de chaque carte wallet — `Help us go deeper, faster →` (tiroir de don, parcours utilisateur final) et `For Companies →` (page Companies, parcours entreprise) — séparent déjà correctement les deux profils au seul endroit où les deux publics regardent. Pas de refonte structurelle nécessaire au-delà de la correction 4(a) ci-dessus.

**Ce qui est réellement nouveau :** la page de pricing de Companies n'offre actuellement que l'abonnement. Ajouter une deuxième option, à engagement plus faible, à côté — un achat ponctuel de "rapport de trouvailles complet" — pour que la rentrée d'argent n°1 (payer pour le rapport complet) ait enfin une page d'atterrissage. Deux cartes/options côte à côte : *S'abonner* (continu, le chemin recommandé en priorité) et *Rapport ponctuel* (un scan complet unique, sans engagement).

**Deux notions de "rapport complet" à ne pas confondre dans le texte :**
- Le **rapport public gratuit, post-embargo** (§4c ci-dessus) — une faille déjà divulguée qui devient publique une fois corrigée ou après 90 jours. Aucun paiement en jeu, jamais.
- Le **rapport complet payant** (cette section) — vendu à l'entreprise auditée, couvre tout ce qui a été trouvé sur l'ensemble du code, disponible immédiatement, n'attend aucun embargo. Un axe complètement différent (étendue + immédiateté, pas timing de disclosure).

Je recommande de les nommer distinctement dans tout texte à venir — par exemple "Public Disclosure Report" (gratuit) vs. "Complete Findings Report" (payant) — pour qu'un lecteur n'ait jamais à se demander de quel "rapport" un bouton donné parle.

---

## 6. Le paradoxe du wallet "clean" — ce que tu as repéré, et comment le résoudre

Ton raisonnement, reformulé pour être sûr de bien le suivre : un utilisateur qui regarde son wallet voit soit (a) des failles ouvertes, dont il n'aura jamais le détail tant qu'elles ne sont pas corrigées — soit (b) un wallet "clean," où les seules failles visibles sont d'anciennes failles déjà corrigées. Dans les deux cas, **l'utilisateur n'a jamais d'info fraîche et actionnable sur l'état réel actuel du code** — parce qu'une nouvelle vérification demande un nouvel audit, qui coûte, et que rien n'oblige l'équipe à le payer une fois qu'elle a corrigé ce qu'on lui reprochait. Et tu poses la vraie question : est-ce qu'on a intérêt à rassurer gratuitement l'utilisateur, si ça retire à l'équipe toute raison de payer pour être revérifiée ?

**Le point que je pense pouvoir résoudre : ce n'est pas un choix binaire entre "rassurer gratuitement" et "monétiser."** La bonne réponse est de rendre visible une information qui est à la fois honnête ET qui crée une pression organique à payer — sans jamais mentir ni cacher quelque chose d'important.

**Le mécanisme : la fraîcheur ("freshness") comme signal de premier plan, pas "clean vs pas clean" comme un simple binaire.**

Le code a déjà l'instinct correct en germe — `WalletList.tsx` calcule déjà `isStale` (pas de review depuis 30+ jours) et affiche un petit ⓘ. Il faut pousser ce réflexe beaucoup plus loin et en faire un vrai signal visuel de premier plan, pas un détail discret :

- Un wallet "clean" scanné **il y a 3 jours** doit visuellement paraître plus digne de confiance qu'un wallet "clean" scanné **il y a 8 mois** — même si les deux affichent "0 failles ouvertes" aujourd'hui. Le badge de statut devrait intégrer la fraîcheur (ex. un badge vert vif "Verified 3 days ago" vs un badge vert délavé/gris "Last verified 8 months ago — re-scan pending").
- Ça règle ton dilemme : on **est** honnête (on ne cache jamais que l'info est vieille), mais on ne donne **jamais** l'impression gratuite d'un statut "propre pour toujours" — la fraîcheur se dégrade visuellement avec le temps, ce qui crée une pression réputationnelle organique sur l'équipe pour qu'elle paie une revérification plutôt que de laisser son badge se ternir aux yeux de ses propres utilisateurs.

**Deuxième mécanisme, pour ton "nouveau cas d'usage" (l'équipe corrige, veut que ce soit reflété) : distinguer "corrigé, déclaré par l'équipe" de "corrigé, vérifié par FRAKTUR."**

- **Gratuit / public :** le simple fait qu'un fix ait été livré (ça, c'est juste de l'historique de disclosure, déjà couvert par la politique existante — une fois le fix livré, l'embargo tombe). Badge neutre : *"Team reports this fixed — pending re-verification."*
- **Payant :** la **revérification indépendante par FRAKTUR** — un vrai re-scan (Layer 1 + Layer 2) qui confirme que le fix tient la route, horodaté à nouveau. Badge fort, distinct visuellement : *"FRAKTUR-verified fixed as of [date]."* C'est un produit à part entière, différent de l'abonnement (continu) et du rapport ponctuel (étendue complète) : une **revérification ciblée, à la demande**, exactement au moment où la motivation de l'équipe est la plus forte (elle vient de corriger, elle veut le crédit maintenant, pas "selon notre roadmap").

Ça répond directement à ta question : oui, il y a quelque chose à la fois rassurant ET monétisable — mais ce n'est pas la même chose qui remplit les deux rôles. Le "déclaratif" (gratuit) rassure un minimum sans se substituer à une vraie vérification ; le "vérifié FRAKTUR" (payant) est la version qui compte vraiment, et qui reste hors de portée sans payer.

---

## 7. Le parcours client idéal — 2 profils, 2 pages, un chemin vers le paiement

| Profil | Page d'entrée | Ce qu'il voit | Le déclencheur vers le paiement |
|---|---|---|---|
| **Entreprise** (reconnaît son propre wallet) | Home → carte wallet | Fraîcheur dégradée, faille ouverte non détaillée, ou statut "declared fixed, not yet verified" | `For Companies →` — **doit porter le contexte** (quel wallet, pourquoi il a cliqué) jusqu'à Companies, pas juste renvoyer vers une page générique |
| **Entreprise** | Companies (arrivée avec contexte) | Un bandeau contextuel reconnaissant pourquoi il est là, puis les 3 offres : Abonnement / Rapport ponctuel / Revérification ciblée | Choisir l'offre qui correspond exactement à sa situation (pas à deviner laquelle des 3 lui correspond) |
| **Utilisateur final** | Home → carte wallet, ou popup d'historique d'audit | Preuve concrète que le processus est réel (une faille passée, documentée, avec CWE et date) | `Help us go deeper, faster →` — au moment de confiance maximale (il vient de voir une vraie preuve), pas seulement en bas de carte de façon générique |

**Ce qui manque encore et que je recommande d'ajouter :**

1. **Contexte porté par le lien `For Companies →`.** Aujourd'hui c'est un lien générique vers `/companies`. Recommandation : passer le nom du wallet (et idéalement la raison — "stale," "open finding," "declared fixed") en paramètre d'URL (`?wallet=X&reason=stale`), pour que Companies puisse afficher un message ciblé en haut de page : *"Checking in about [Wallet Name]? Here's what fits."* — et mettre en avant l'offre la plus pertinente (revérification si "declared fixed," abonnement si "stale," rapport ponctuel si aucun signal particulier) plutôt que de présenter les trois options à plat sans hiérarchie.

2. **CTA à l'intérieur même de la popup d'historique d'audit (§4c),** pas seulement sur la carte wallet en arrière-plan. C'est le moment de confiance le plus élevé du parcours entier (l'utilisateur vient de voir une preuve technique réelle) — les deux CTA (don pour l'utilisateur final, rapport complet/revérification pour l'entreprise) devraient être présents directement dans la popup, pas juste accessibles en fermant la popup et en cherchant sur la carte.

3. **La page Companies doit accueillir trois offres, pas deux.** Le §5 avait déjà acté l'ajout du "rapport ponctuel" à côté de l'abonnement — ce paradoxe en ajoute une troisième, plus petite mais à fort taux de conversion : la **revérification ciblée** (moins chère qu'un rapport complet, plus rapide, vendue au moment précis où l'équipe vient de corriger quelque chose). Je recommande de la présenter comme la plus "impulsive"/accessible des trois, avec le rapport ponctuel et l'abonnement comme options plus engageantes juste à côté.

---

## Décisions déjà tranchées

1. Titre du Hero : **#9 "Bitcoin-native AI, aimed at what actually breaks."** + tagline *"Bound to this wallet, this version, this date — proven on-chain, not just claimed."*
2. Libellé au-dessus des vignettes : **"Fractures"**.
3. Animation du bandeau donateurs : **3 noms en même temps**, découpe simple en 2 par slot pour ce premier passage (version riche à 3-4 fragments en v2, cascade vs synchronisé à trancher en implémentant).
4. Pricing Companies : **oui, ajouter maintenant** — et désormais **trois** offres (abonnement / rapport ponctuel / revérification ciblée), pas deux.
5. Popup d'historique d'audit (§4c) : liste des audits avec badges public/embargoed, jamais de rapport complet gratuit, CTA d'achat intégré directement dans la popup.
6. Mécanisme fraîcheur + double statut "declared fixed" vs "FRAKTUR-verified fixed" (§6) : validé comme principe, à detailer techniquement dans le prompt d'implémentation.

## Reste à valider avant le prompt d'implémentation

- Le passage de contexte `?wallet=X&reason=...` entre Home et Companies (§7, point 1) — un ajout que je recommande, pas encore explicitement confirmé par toi.
- La présentation à 3 offres sur Companies (§7, point 3) — la hiérarchie/mise en avant contextuelle proposée n'est pas encore validée dans le détail.
