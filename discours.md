# 🎤 Guide de parole — Soutenance Scuderia Ferrari · LiDAR Ride Height

> Chaque section = ce que tu dis pendant la slide correspondante.
> Les **mots en gras** sont les points d'appui visuels.

---

## Slide 1 — Titre

*Arrive, pose le contexte, inspire.*

> Bonjour à tous. Je vous présente le projet **Scuderia Ferrari — LiDAR Ride Height**.
> C'est un **cockpit ingénieur full-stack** qui simule le mur des stands d'une écurie de Formule 1.
> L'objectif : mesurer la **garde au sol** d'une monoplace en temps réel via un capteur **LiDAR**, 
> et assister les ingénieurs avec une **intelligence artificielle intégrée**.

---

## Slide 2 — Sommaire

> Voici le plan. On va parcourir **6 axes** : la vision du projet, l'architecture technique, 
> les fonctionnalités clés, la sécurité, le design, et on finira par une **démo live**.

---

## Slide 3 — Vision & Contexte

*Explique POURQUOI ce projet existe.*

> En Formule 1, la **garde au sol** — le ride height — est un paramètre critique.
> Si le plancher décroche à haute vitesse, la voiture perd soudainement tout son appui aérodynamique.
> C'est ce qu'on appelle le **décrochage de plancher** — et c'est extrêmement dangereux.
>
> Les ingénieurs au **mur des stands** ont besoin de données en **temps réel**, avec une précision 
> **infra-millimétrique**, pour ajuster le setup en permanence.
>
> Notre réponse : un **dashboard connecté** qui affiche les mesures LiDAR à **100 Hz**, 
> un modèle aérodynamique simplifié qui traduit la hauteur en appui, et un **assistant IA** 
> qui répond aux questions techniques en langage naturel — comme si vous parliez à l'ingénieur en chef.

---

## Slide 4 — Architecture Technique

*Explique la stack, de haut en bas.*

> Techniquement, le projet est **full-stack JavaScript/PHP**.
> En haut, le **frontend React 19** avec TanStack Router et Tailwind CSS 4.
> Le bundler **Vite 7** assure un hot reload instantané en développement.
>
> La couche API a deux visages : un **serveur PHP** qui gère les appels aux IA Groq et Mistral, 
> et une version **serverless Node.js** prête pour Vercel.
>
> En dessous, une base de données **MySQL** hébergée sur AlwaysData qui stocke 
> les mesures des capteurs IoT, les données LiDAR, et une FAQ.
>
> Tout en bas, les deux moteurs d'IA : **Groq** avec llama-3.3-70B pour la rapidité, 
> et **Mistral** en fallback pour le raisonnement profond.

---

## Slide 5 — Flux de Données

> Voici comment l'information circule.
> Les **capteurs IoT** envoient température, humidité et luminosité.
> Le **LiDAR G2D** mesure la distance en millimètres et la réflectivité.
> Tout est stocké dans la base **MySQL**.
>
> L'**API PHP** expose ces données en REST, et le **dashboard React** les rafraîchit **toutes les 200 ms**.
> Et surtout — le chatbot IA lit ce **contexte live** avant de répondre :
> il sait en temps réel quelle est la température des pneus ou la garde au sol.
>
> Si l'IA échoue, on a **3 niveaux de fallback** : Groq → Mistral → FAQ en base → réponse locale.
> Le système est conçu pour ne **jamais rester muet**.

---

## Slide 6 — Dashboard Cockpit Ingénieur

*Montre les KPIs, les sliders, la vue LiDAR.*

> Voici le cœur du projet : le **cockpit ingénieur**.
> En haut, quatre **KPIs** : l'appui aéro, la traînée, l'assiette — le rake — et la balance avant.
> Ces valeurs sont recalculées **en temps réel** à chaque changement de setup.
>
> Les **sliders** permettent de régler la garde au sol avant et arrière, et la dureté des ressorts.
> Chaque mouvement de slider recalcule instantanément l'aérodynamique.
>
> La **vue LiDAR plongeante** montre la voiture vue de dessus, avec les capteurs avant et arrière 
> qui pulsent en vert — comme sur une vraie télémétrie.
>
> Cinq vues sont disponibles : **Overview, Architecture, Telemetry, Simulators, IoT Devices**.

---

## Slide 7 — Assistant IA Ferrari

> Le chatbot est la **pièce maîtresse** de l'expérience ingénieur.
> Il incarne **l'Ingénieur de Piste en Chef de la Scuderia Ferrari**.
> Il répond en français, avec le style passionné et technique d'un ingénieur italien au mur des stands.
>
> Il a accès aux **données live** de la base : si vous demandez « quelle est la température des pneus ? », 
> il répond avec la **vraie valeur** en base, pas une donnée simulée.
>
> Le rendu est en **Markdown** — gras, italique, listes, liens — pour des réponses structurées.
> Et il est couplé à un **assistant vocal** complet.

---

## Slide 8 — Mode Vocal Mains-Libres

*Insiste sur l'innovation du mode vocal.*

> L'assistant vocal fonctionne dans **deux modes**.
> Le mode **manuel** : vous cliquez sur le micro, vous dictez, il répond.
>
> Le mode **mains-libres** est plus innovant. Vous activez le mode, et le système écoute **en continu**.
> Dès que vous dites **« Ferrari »**, un bip sonore confirme la détection.
> Vous posez votre question, et l'IA répond — le tout sans toucher le clavier.
>
> Techniquement, il y a une **machine d'état** : IDLE → détection du mot-clé → WAKING → capture de la question → retour IDLE.
> La reconnaissance vocale utilise la **Web Speech API** du navigateur, en français.

---

## Slide 9 — API IA 3 Niveaux

> L'appel à l'IA suit une **chaîne de fallback** en cascade.
> Niveau 1 : **Groq** avec llama-3.3-70B. C'est ultra-rapide, moins de 500 ms de latence.
> Si Groq échoue — time-out, quota dépassé — on bascule sur **Mistral**.
> Si Mistral échoue à son tour, on cherche dans la **FAQ en base de données** MySQL.
> En dernier recours, le chatbot a des **réponses codées en dur** sur les sujets techniques.
>
> Résultat : le chatbot répond **toujours**, quelles que soient les conditions réseau ou les pannes d'API.

---

## Slide 10 — Google OAuth 2.0

> L'accès au cockpit est protégé par **Google OAuth**.
> L'utilisateur clique sur le bouton Google Sign-In, Google vérifie son identité, 
> et on décode le **JWT** côté client pour extraire nom, email et photo.
>
> La session est persistée dans le **localStorage** du navigateur.
> Le dashboard est protégé par un **contexte React** `useAuth()` :
> si vous n'êtes pas connecté, vous êtes redirigé vers la page de login.
>
> Côté sécurité : les **clés API Groq et Mistral ne sont jamais exposées** au client.
> Elles sont stockées côté serveur PHP et chargées depuis un fichier `.env.local` 
> qui est **exclu de Git** via `.gitignore`.
> On a aussi un **rate limiting** à 10 requêtes par minute par IP pour éviter les abus.

---

## Slide 11 — Design System

> Le design est un thème **« Race Day »** — l'esthétique des stands de course.
> Fond noir profond, panneaux avec une légère texture de grille, 
> accents en **Rosso Corsa** — le rouge Ferrari — et vert capteur pour les données live.
>
> On a aussi un **mode clair** accessible via un toggle ☀️/🌙 dans la navbar.
> Le mode clair garde l'esprit technique mais avec des fonds blancs et des bordures plus douces.
> La bascule est **instantanée** — 130 règles CSS inversent toutes les couleurs via un attribut `data-theme`.

---

## Slide 12 — Démo Live

*Passer en mode démo maintenant.*

> Je vous propose maintenant une **démo live** du projet.
> On va parcourir 6 points :
> 1. La **vitrine publique** avec le storytelling Ferrari et le circuit de Monza interactif
> 2. La **connexion Google** — je me connecte avec mon compte
> 3. Le **cockpit dashboard** — je modifie le setup et je vois l'appui changer
> 4. L'**assistant IA** — je lui pose une question technique
> 5. Le **mode vocal** — je dis « Ferrari » et je dicte ma question
> 6. Le **toggle clair/sombre**
>
> Je lance avec `npm run dev:php`.

---

## Slide 13 — Roadmap

> Pour la suite, j'ai identifié plusieurs évolutions.
> À court terme : le **streaming** des réponses IA token par token pour un affichage progressif, 
> un **historique des conversations** persisté en base, et des **notifications push** pour les événements piste.
>
> À moyen terme : intégrer des **données LiDAR réelles** via l'API F1 officielle, 
> un mode **multi-écrans** pour simuler un vrai mur des stands, et de l'**analyse prédictive** 
> avec du machine learning pour anticiper la dégradation des pneus.

---

## Slide 14 — Conclusion

*Synthèse percutante.*

> Pour résumer, ce projet est un **cockpit ingénieur complet** qui couvre toute la chaîne :
> **capteurs → stockage → API → dashboard → IA → vocal → authentification**.
>
> C'est du **full-stack moderne** : React 19, PHP 8.5, MySQL, Vercel.
> L'IA est **multi-fournisseurs** avec fallback.
> Le vocal est **mains-libres** avec wake-word.
> Et tout est **open source** — le code est sur GitHub.
>
> **Forza Ferrari !** 🏎️ — Je suis disponible pour vos questions.

---

## Slides 15-16 — Annexes

*Seulement si on te pose des questions techniques.*

> Si vous voulez plus de détails sur la stack, voici la liste complète des technos.
> Frontend : React 19, TanStack Router, Tailwind CSS 4, TypeScript 5.7, Web Speech API.
> Backend : PHP 8.5 avec cURL pour les appels IA, Node.js pour le serverless Vercel, MySQL en PDO.
> DevOps : Vite 7, Vercel, GitHub avec deux remotes.
>
> Côté architecture du code, on a des **contextes React** pour l'auth et le thème,
> des **routes** TanStack pour le routage, et les **composants** sont organisés par domaine métier.
