# Modèles de courriels — Ogooué School

Les courriels envoyés par Supabase Auth utilisent des modèles **par défaut
volontairement neutres** : du texte brut, un lien nu, aucune identité. Le
premier message qu'un enseignant ou un parent reçoit de la plateforme mérite
mieux que cela.

Les fichiers de ce dossier reprennent le vocabulaire visuel du tableau de
bord : violet `#7c3aed`, cartes à coins arrondis, pastille d'icône teintée,
même hiérarchie typographique.

## Où les coller

Dashboard Supabase → **Authentication** → **Emails** → onglet **Templates**.
Un modèle par onglet :

| Onglet Supabase | Fichier |
|---|---|
| Confirm signup | `confirmation.html` |
| Invite user | `invitation.html` |
| Magic Link | `lien-magique.html` |
| Reset Password | `reinitialisation.html` |
| Change Email Address | `changement-adresse.html` |

Pensez à changer aussi le **sujet** de chaque message : le champ se trouve
juste au-dessus du corps.

## Contraintes respectées

Un courriel n'est pas une page web. Les clients de messagerie — Outlook en
tête — ignorent la moitié du CSS moderne. D'où les partis pris suivants :

- **Tableaux pour la mise en page**, pas de `flex` ni de `grid`.
- **Styles en ligne**, pas de feuille externe : Gmail supprime les `<style>`
  dans certains contextes.
- **Aucune image distante.** Le logo est composé en HTML et en couleurs de
  fond ; une image bloquée par défaut laisserait un cadre vide.
- **Largeur fixe de 600 px**, la seule qui passe partout.
- **Contraste AA** sur tous les textes.
- **Le lien est aussi affiché en clair**, sous le bouton : certains clients
  n'affichent pas les boutons, et un lien invisible est un lien mort.

## Variables disponibles

Supabase remplace ces jetons à l'envoi :

- `{{ .ConfirmationURL }}` — le lien d'action, déjà complet
- `{{ .Token }}` — le code à six chiffres, si vous préférez la saisie manuelle
- `{{ .Email }}` — l'adresse du destinataire
- `{{ .SiteURL }}` — l'URL configurée du site

## Un point à régler avant la production

Le SMTP par défaut de Supabase est **limité à quelques courriels par heure** et
réservé aux essais. Dès que de vraies familles recevront ces messages, il faudra
un fournisseur SMTP (Resend, Brevo, Postmark…) configuré dans
**Authentication → Emails → SMTP Settings**. Sans cela, les invitations
d'établissement seront silencieusement bloquées.
