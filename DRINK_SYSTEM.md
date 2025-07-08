# 🍻 Getränke-System Feature

## Übersicht

Das neue Getränke-System ermöglicht es Benutzern, ihre aktuellen Getränke mit Freunden zu teilen und eine Historie ihrer Getränke-Aktivitäten zu verfolgen.

## Features

### ✨ Getränke teilen

- **12 verschiedene Getränke-Optionen**: Bier, Aperol Spritz, Wein, Cocktail, Whiskey, Champagner, Kaffee, Tee, Wasser, Saft, Energy Drink, Smoothie
- **Große visuelle Buttons** mit Emojis für einfache Auswahl
- **Sofortige Benachrichtigung** an alle Freunde im Format: "[Name] trinkt gerade [Getränk]"
- **Real-Time Updates** - alle Freunde sehen sofort was getrunken wird

### 📊 Historie & Tracking

- **Persönliche Historie**: Eigene letzten 20 Getränke mit Zeitstempel
- **Freunde-Feed**: Aktivitäten aller Freunde mit den letzten 50 Einträgen
- **Live-Aktivitäts-Preview**: Die letzten 3 Aktivitäten werden auf der Hauptseite angezeigt
- **Zeitstempel**: Relative Zeitangaben in Deutsch (z.B. "vor 2 Minuten")

### 🔔 Real-Time Benachrichtigungen

- **Browser-Notifications**: Desktop-Benachrichtigungen wenn Freunde trinken
- **In-App Messages**: Live-Updates im Interface
- **Automatic Reload**: Historie wird automatisch aktualisiert bei neuen Aktivitäten

## Technische Implementation

### Database Schema (Appwrite Collection: `drinks`)

```json
{
  "user_id": "string(50)", // Benutzer-ID
  "user_name": "string(100)", // Anzeigename
  "drink_name": "string(100)", // Name des Getränks
  "drink_emoji": "string(10)", // Emoji des Getränks
  "created_at": "datetime" // Zeitstempel
}
```

### Server Actions

- `shareDrink(drinkName, drinkEmoji)`: Teilt ein Getränk und benachrichtigt Freunde
- `getDrinkHistory(limit)`: Ruft persönliche Getränke-Historie ab
- `getAllDrinkHistory(limit)`: Ruft Getränke-Historie aller Freunde ab

### Real-Time Integration

- **Appwrite Real-Time Subscriptions** für `drinks` Collection
- **Automatische Updates** bei neuen Getränke-Shares
- **Cross-User Notifications** zwischen Freunden

## UI/UX Features

### Responsive Design

- **Grid Layout**: 2-4 Spalten je nach Bildschirmgröße
- **Hover Effects**: Buttons mit Scale-Animation
- **Loading States**: Disabled Buttons während Requests

### Dialog-basierte Historie

- **Modal Windows** für Historie-Anzeige mit Shadcn Dialog
- **Scrollbare Listen** für viele Einträge
- **Übersichtliche Zeitstempel** und Benutzer-Kennzeichnung

### Navigation

- **Neue Getränke-Seite**: `/drinks` für fokussierte Nutzung
- **Integration in Account**: Getränke-System auf Account-Seite
- **Responsive Navigation** mit aktiven States

## Workflow

1. **Benutzer wählt Getränk** → Klick auf einen der 12 Getränke-Buttons
2. **Server Action** → `shareDrink()` erstellt Eintrag in `drinks` Collection
3. **Notification System** → `sendNotificationToFriends()` benachrichtigt alle Freunde
4. **Real-Time Update** → Alle verbundenen Clients erhalten Live-Updates
5. **Browser Notifications** → Freunde sehen Desktop-Benachrichtigung
6. **Historie Update** → Getränke-Liste wird automatisch aktualisiert

## Navigation & Zugriff

- **Hauptzugriff**: `/account` Seite - Getränke-System ist integriert
- **Dedicated Page**: `/drinks` - Vollbild-Getränke-Erlebnis
- **Navigation**: Responsive Navigation-Component mit aktiven States

## Benutzerfreundlichkeit

### Feedback & Indikationen

- ✅ **Erfolgsmeldungen**: "Du trinkst 🍺 Bier!"
- 🔄 **Loading States**: Buttons werden während Requests deaktiviert
- 📱 **Browser Notifications**: Desktop-Benachrichtigungen für Freunde
- ⏰ **Live Timestamps**: "vor 2 Minuten", "vor 1 Stunde"

### Accessibility

- **Tastatur-Navigation**: Vollständig tastaturzugänglich
- **Screen Reader**: Semantische HTML-Struktur
- **Focus States**: Klare visuelle Fokus-Indikatoren
- **High Contrast**: Unterstützung für Dark/Light Mode

Das Getränke-System ist vollständig integriert mit dem bestehenden Friend-System und nutzt die gleiche Real-Time-Infrastruktur für nahtlose Live-Updates zwischen Freunden! 🎉
