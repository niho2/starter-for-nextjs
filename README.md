# Next.js mit Appwrite SSR Authentication

Diese Anwendung implementiert eine vollständige Server-Side Rendering (SSR) Authentication mit Appwrite und Shadcn UI-Komponenten.

## Features

- ✅ **Server-Side Rendering (SSR)** - Vollständige SSR-Unterstützung für Authentifizierung
- ✅ **E-Mail/Passwort Authentication** - Sichere Anmeldung mit E-Mail und Passwort
- ✅ **E-Mail-Verifizierung** - Benutzer können ihre E-Mail-Adresse verifizieren
- ✅ **Geschützter Bereich** - Exklusiver Zugang nur für verifizierte Benutzer
- ✅ **Moderne UI** - Shadcn/ui Komponenten mit Tailwind CSS
- ✅ **TypeScript** - Vollständige Typsicherheit
- ✅ **Responsive Design** - Mobile-first Design
- ✅ **Session Management** - Sichere HTTP-only Cookies

## Einrichtung

### 1. Umgebungsvariablen

Kopieren Sie `.env.example` zu `.env.local` und füllen Sie Ihre Appwrite-Konfiguration aus:

```bash
cp .env.example .env.local
```

Bearbeiten Sie `.env.local`:

```env
NEXT_APPWRITE_KEY=your-api-key-here
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your-project-id-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Appwrite Setup

1. Erstellen Sie ein neues Projekt in [Appwrite Console](https://cloud.appwrite.io/console)
2. Aktivieren Sie die Authentication:
   - Gehen Sie zu **Authentication** -> **Settings**
   - Aktivieren Sie **Email/Password**
3. Erstellen Sie einen API Key:
   - Gehen Sie zu **Settings** -> **API Keys**
   - Erstellen Sie einen neuen API Key mit **Server** Berechtigung
4. Konfigurieren Sie die Domains:
   - Gehen Sie zu **Settings** -> **General**
   - Fügen Sie `http://localhost:3000` zu den **Platforms** hinzu

### 3. Installation und Start

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die Anwendung ist unter [http://localhost:3000](http://localhost:3000) verfügbar.

## Projektstruktur

```
app/
├── page.tsx              # Home Page (Weiterleitung basierend auf Auth-Status)
├── signin/page.tsx       # Anmelde-Seite
├── signup/page.tsx       # Registrierungs-Seite
├── account/page.tsx      # Geschützte Account-Seite
├── verify-email/page.tsx # E-Mail-Verifizierungsseite
├── verified-area/page.tsx # Geschützter Bereich für verifizierte Benutzer
└── layout.tsx           # Root Layout

components/
└── auth/
    ├── sign-in-form.tsx  # Anmelde-Formular
    └── sign-up-form.tsx  # Registrierungs-Formular

lib/
└── server/
    ├── appwrite.ts       # Appwrite Server Client
    └── auth-actions.ts   # Authentication Server Actions
```

## Verwendung

### Authentication Flow

1. **Benutzer besucht die Homepage** (`/`)

   - Wenn nicht angemeldet → Weiterleitung zu `/signin`
   - Wenn angemeldet → Weiterleitung zu `/account`

2. **Registrierung** (`/signup`)

   - E-Mail/Passwort Registrierung
   - Nach erfolgreicher Registrierung → Weiterleitung zu `/account`

3. **Anmeldung** (`/signin`)

   - E-Mail/Passwort Anmeldung
   - Nach erfolgreicher Anmeldung → Weiterleitung zu `/account`

4. **Account Seite** (`/account`)

   - Geschützte Seite (nur für angemeldete Benutzer)
   - Zeigt Benutzerinformationen
   - E-Mail-Verifizierungsstatus
   - Senden von Verifizierungs-E-Mails
   - Zugang zum verifizierten Bereich
   - Abmelde-Funktionalität

5. **E-Mail-Verifizierung** (`/verify-email`)

   - Verarbeitung von E-Mail-Verifizierungslinks
   - Automatische Weiterleitung nach Verifizierung

6. **Verifizierter Bereich** (`/verified-area`)
   - Exklusiver Zugang nur für verifizierte Benutzer
   - Premium-Features und Inhalte
   - Erhöhte Sicherheitsstufe

### Server Actions

- `signUpWithEmail()` - Registrierung mit E-Mail/Passwort
- `signInWithEmail()` - Anmeldung mit E-Mail/Passwort
- `signOut()` - Benutzer abmelden
- `sendEmailVerification()` - E-Mail-Verifizierung senden
- `verifyEmailDirectly()` - E-Mail-Verifizierung abschließen (SSR-optimiert)

### Server Functions

- `getLoggedInUser()` - Aktuellen Benutzer abrufen
- `createSessionClient()` - Client für angemeldete Benutzer
- `createAdminClient()` - Admin Client für Server-Operationen

## Security Features

- **HTTP-only Cookies** - Session Token sind nicht über JavaScript zugänglich
- **Secure Cookies** - HTTPS-only in Production
- **SameSite Protection** - CSRF-Schutz
- **Server-Side Validation** - Alle Authentication läuft serverseitig
- **Type Safety** - Vollständige TypeScript-Unterstützung

## Development

```bash
# Development starten
npm run dev

# Build für Production
npm run build

# Production starten
npm start

# Linting
npm run lint
```

## Technologien

- **Next.js 15** - React Framework mit App Router
- **Appwrite** - Backend-as-a-Service für Authentication
- **Shadcn/ui** - UI-Komponentenbibliothek
- **Tailwind CSS** - Utility-first CSS Framework
- **TypeScript** - Typsichere JavaScript-Entwicklung
- **Lucide React** - Icon-Bibliothek

## Lizenz

MIT License
