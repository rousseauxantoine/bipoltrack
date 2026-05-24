# Guide : connecter BipolTrack à Google Drive

Ce guide t'explique pas-à-pas comment obtenir un **Client ID Google** pour que BipolTrack puisse sauvegarder dans ton Google Drive. C'est gratuit et tu n'as besoin que d'un compte Google.

Le tout prend environ **10-15 minutes** la première fois.

---

## Avant de commencer

Tu auras besoin de :

- Ton **URL GitHub Pages** où BipolTrack est hébergé, par exemple `https://tonpseudo.github.io` (sans le `/bipoltrack/` à la fin, juste le domaine).
- Ton **compte Google** (le même que celui de ton Drive).

> Si tu testes BipolTrack en ouvrant le fichier `index.html` localement sur ton ordi, l'OAuth Google ne fonctionnera **pas** — il faut absolument que l'app soit servie via une URL `https://`. GitHub Pages est parfait pour ça.

---

## Étape 1 — Créer un projet Google Cloud

1. Va sur **https://console.cloud.google.com/**
2. Connecte-toi avec ton compte Google.
3. En haut de la page, à côté de "Google Cloud", clique sur le **sélecteur de projet** (généralement écrit "Sélectionner un projet" ou le nom d'un projet existant).
4. Dans la fenêtre qui s'ouvre, clique sur **"Nouveau projet"** (en haut à droite).
5. Donne-lui un nom, par exemple `BipolTrack`. Tu peux laisser "Organisation" et "Emplacement" sur "Aucune organisation".
6. Clique sur **"Créer"** et attends quelques secondes que le projet soit prêt.
7. Vérifie en haut que le sélecteur affiche bien le nom de ton nouveau projet.

---

## Étape 2 — Activer l'API Google Drive

1. Dans la barre de recherche en haut de la page Google Cloud, tape **"Google Drive API"**.
2. Clique sur le résultat **"Google Drive API"** (l'icône avec un triangle coloré).
3. Sur la page de l'API, clique sur le bouton **"Activer"** (bouton bleu).
4. Attends quelques secondes. Une fois activé, tu seras redirigé vers le tableau de bord de l'API.

---

## Étape 3 — Configurer l'écran de consentement OAuth

C'est l'écran qui demandera à ton compte Google "Acceptez-vous que BipolTrack accède à votre Drive ?"

1. Dans le menu de gauche (☰ en haut à gauche), va dans **"API et services" → "Écran de consentement OAuth"**.
2. Choisis le type d'utilisateur : **"Externe"** puis clique sur **"Créer"**.
   > "Externe" est nécessaire car tu n'as pas de compte Google Workspace organisation.

3. Remplis le formulaire **Informations sur l'application** :
   - **Nom de l'application** : `BipolTrack`
   - **E-mail d'assistance utilisateur** : ton adresse email
   - **Coordonnées du développeur** : à nouveau ton adresse email
   - Tu peux laisser tous les autres champs vides.
4. Clique sur **"Enregistrer et continuer"**.

5. À l'étape **"Niveaux d'accès"** (Scopes) :
   - Clique sur **"Ajouter ou supprimer des champs d'application"**.
   - Dans la liste, recherche **"Drive API"** et coche la ligne `.../auth/drive.file` — son intitulé est : *"Voir, modifier, créer et supprimer uniquement les fichiers Google Drive spécifiques que vous utilisez avec cette application"*.
   - **Important** : ne coche que celle-ci, c'est le minimum nécessaire et la plus respectueuse de ta vie privée — l'app n'aura accès qu'à ses propres sauvegardes, pas au reste de ton Drive.
   - Clique sur **"Mettre à jour"** en bas, puis **"Enregistrer et continuer"**.

6. À l'étape **"Utilisateurs test"** :
   - Clique sur **"+ Add Users"** et ajoute ton adresse Gmail (celle de ton Drive).
   - Clique sur **"Enregistrer et continuer"**.
   > Tant que l'app est en "Mode Test", seuls les utilisateurs ajoutés ici peuvent l'utiliser. C'est parfait pour un usage perso. Limite : 100 utilisateurs test.

7. À l'étape **"Récapitulatif"**, clique sur **"Retour au tableau de bord"**.

---

## Étape 4 — Créer l'identifiant OAuth (Client ID)

1. Dans le menu de gauche, va dans **"API et services" → "Identifiants"**.
2. En haut, clique sur **"+ Créer des identifiants"** puis choisis **"ID client OAuth"**.
3. Pour **"Type d'application"**, choisis **"Application Web"**.
4. **Nom** : mets `BipolTrack Web` (juste pour t'y retrouver).
5. Dans **"Origines JavaScript autorisées"**, clique sur **"+ Ajouter un URI"** et colle ton URL GitHub Pages, exactement comme ceci :
   ```
   https://tonpseudo.github.io
   ```
   > Remplace `tonpseudo` par ton vrai pseudo GitHub. **Ne mets pas** `/bipoltrack/` à la fin, juste le domaine. **Pas** de barre oblique finale.
   
   Tu peux aussi ajouter `http://localhost:8080` ou similaire si tu testes l'app en local avec un mini-serveur.

6. Dans **"URI de redirection autorisés"**, clique sur **"+ Ajouter un URI"** et ajoute :
   ```
   https://tonpseudo.github.io/bipoltrack/oauth.html
   ```
   *(Remplace `tonpseudo` par ton pseudo GitHub. Le chemin `/bipoltrack/oauth.html` est important — ne pas oublier le sous-dossier.)*

   Si tu testes aussi en local, ajoute également :
   ```
   http://localhost:8080/oauth.html
   ```
7. Clique sur **"Créer"**.

---

## Étape 5 — Récupérer ton Client ID

Une fenêtre apparaît avec :
- **Votre ID client** : c'est ce qu'il te faut. Il ressemble à quelque chose comme :
  ```
  123456789012-abcdefghijklmnop.apps.googleusercontent.com
  ```
- Tu peux ignorer le "Code secret du client" — on n'en a pas besoin pour une app côté navigateur.

**Copie ton Client ID** (clique sur l'icône de copie à côté).

---

## Étape 6 — Coller le Client ID dans BipolTrack

1. Ouvre BipolTrack.
2. Va dans l'onglet **Réglages** (icône engrenage tout à droite de la barre du bas).
3. Dans la section **Google Drive**, colle ton Client ID dans le champ prévu.
4. Clique sur **"Enregistrer le Client ID"**.
5. Clique sur **"Se connecter à Google Drive"**.
6. Une fenêtre Google s'ouvre :
   - Choisis ton compte Google.
   - Tu verras un avertissement **"Google n'a pas validé cette application"** : c'est normal pour une app perso en mode test. Clique sur **"Continuer"** (peut être caché sous **"Paramètres avancés"**).
   - Autorise l'accès en cliquant sur **"Continuer"**.
7. Tu devrais voir **"✓ Connecté à Google Drive"** dans l'app.

---

## Étape 7 — Activer la sauvegarde automatique (optionnel)

Toujours dans **Réglages** :

- Coche la case **"Activer la sauvegarde automatique quotidienne"**.

À chaque première ouverture de l'app dans une nouvelle journée, une sauvegarde sera envoyée silencieusement sur ton Drive. Les **10 dernières** sauvegardes sont conservées, les plus anciennes sont supprimées automatiquement.

Tu retrouveras tes sauvegardes dans Google Drive, dans un dossier nommé **`BipolTrack-Sauvegardes`** (créé automatiquement à la première sauvegarde).

---

## Notes importantes

- **Le Client ID n'est pas un secret** : il est visible dans le code de la page (côté navigateur). Ce qui protège ton accès, ce sont les origines autorisées (ton URL GitHub Pages) que tu as configurées à l'étape 4. Personne ne peut utiliser ton Client ID depuis un autre domaine.

- **Quel niveau d'accès l'app a-t-elle ?** Uniquement les fichiers qu'elle crée elle-même (`drive.file`). Elle ne peut **pas** lire ou modifier le reste de ton Drive. Tu peux le vérifier dans ton compte Google → Sécurité → Applications tierces.

- **Token et expiration** : le token d'accès expire au bout d'environ une heure. La prochaine fois que tu ouvres l'app, elle te le redemandera silencieusement si tu es toujours connecté à Google dans ton navigateur. Sinon, il faudra recliquer sur "Se connecter".

- **Mode Test (7 jours)** : tant que ton projet Google Cloud est en mode "Test", Google peut révoquer le token tous les 7 jours environ. Pour éviter ça, tu peux passer ton app en mode "En production" (bouton dans "Écran de consentement OAuth") — mais Google demandera une vérification si tu veux des scopes sensibles. Avec `drive.file`, la vérification n'est pas requise.

- **Révoquer l'accès** à tout moment : va sur https://myaccount.google.com/permissions et clique sur BipolTrack.

---

## En cas de problème

| Problème | Solution |
|---|---|
| "redirect_uri_mismatch" | L'**URI de redirection** enregistrée dans Google Console ne correspond pas. Elle doit être `https://tonpseudo.github.io/bipoltrack/oauth.html` (avec le sous-dossier `/bipoltrack/`). Vérifie aussi que tu n'as pas mis `https://tonpseudo.github.io/oauth.html` sans le sous-dossier. |
| "origine non autorisée" | Vérifie que l'URL dans **Origines JavaScript autorisées** est exactement `https://tonpseudo.github.io`, sans `/bipoltrack/`, sans `/` final. |
| Format inattendu pour le Client ID | Le Client ID doit finir par `.apps.googleusercontent.com`. |
| "Cette app n'est pas vérifiée" | Normal en mode Test. Clique sur "Paramètres avancés" puis "Continuer". |
| L'écran de consentement réapparaît tous les 7 jours | Voir "Mode Test" ci-dessus. |
| "access_denied" | Tu n'es pas dans les utilisateurs test. Retourne dans **Écran de consentement OAuth** et ajoute ton email. |
