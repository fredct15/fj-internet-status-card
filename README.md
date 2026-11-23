# FJ Internet Status Card 🌐

Carte personnalisée **Home Assistant Lovelace** indépendante, en français québécois, compatible avec HACS.

## Fonctions

- Affiche **Connecté**, **Déconnecté** ou **Indisponible** selon une entité `binary_sensor` Ping (ICMP).
- Cercle, icône globe, temps écoulé depuis le dernier changement d'état.
- Thèmes clair et sombre assortis à FJ Smart Lock Card.
- Vert lorsque connecté, rouge lorsque déconnecté.
- Éditeur visuel pour choisir le capteur, le titre et l'adresse affichée.

## Préparer le capteur

Dans Home Assistant, ajouter l'intégration **Ping (ICMP)** pour `8.8.8.8`. Relever l'identifiant exact de son entité dans **Outils de développement → États**.

La carte ne lance pas elle-même de ping : elle lit le capteur créé dans Home Assistant. L'adresse `host` est une étiquette, **pas** une configuration de la destination Ping.

## Installation HACS

1. Dans HACS, ajouter le dépôt personnalisé `https://github.com/fredct15/fj-internet-status-card` de catégorie **Dashboard**.
2. Installer **FJ Internet Status Card**.
3. Actualiser le navigateur après installation.
4. Ajouter la carte via l'éditeur visuel ou YAML.

## YAML

```yaml
type: custom:fj-internet-status-card
entity: binary_sensor.connexion_internet
title: Connexion Internet
host: 8.8.8.8
```

Remplacer `binary_sensor.connexion_internet` par le vrai nom de votre entité.

## Versions

Les versions suivent `vMAJEURE.MINEURE.CORRECTIF`. Une GitHub Action publie les releases lorsqu'un nouveau numéro de version est inscrit sur la première ligne du fichier JavaScript.

## Notes

Un ping réussi vers une adresse IP confirme qu'elle répond, pas nécessairement que tous les sites Web et le DNS fonctionnent. Le compteur dépend de `last_changed` de Home Assistant.

## Licence

MIT — projet original, sans dépendance à Alarm Keeper Card.
