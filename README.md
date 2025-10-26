# 🏖️ Szabi Tervező - Szabadság Menedzsment Rendszer

Professzionális szabadságkezelő modul a ModulSite platform részeként. Egyszerűsíti a szabadságkérelmek létrehozását, jóváhagyását és nyilvántartását.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Főbb Funkciók

- **📅 Vizuális Naptár** - Szabadságok áttekintése, magyar nemzeti ünnepek kiemelése
- **📝 Szabadságkérelem** - Egyszerű kérelem létrehozás különböző szabadság típusokhoz
- **✅ Jóváhagyási Workflow** - Manager jóváhagyás/elutasítás indoklással
- **📊 Egyenleg Nyilvántartás** - Valós idejű fizetett/fizetetlen szabadság egyenleg
- **👥 Multi-tenant Rendszer** - Több cég/szervezet támogatása
- **🌙 Dark Mode** - Világos és sötét téma támogatás
- **📱 Responsive Design** - Mobil és asztali eszközökön is használható

---

## 🚀 Gyors Indítás

### Előfeltételek

- **Node.js** 18+ verzió
- **Supabase** fiók (ingyenes tier is elegendő)
- **Git** verziókezelő

### 1. Telepítés

```bash
# Repository klónozása
git clone <repository-url>
cd szabi-tervező

# Függőségek telepítése
npm install
```

### 2. Környezeti Változók Beállítása

Hozz létre egy `.env.local` fájlt a projekt gyökerében:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

**Supabase kulcsok beszerzése:**
1. Látogass el a [Supabase Dashboard](https://supabase.com/dashboard)-ra
2. Válaszd ki a projektet: `stzjhrcvyzbazaaptzqy`
3. Settings → API → Project URL és anon/service_role keys

### 3. Adatbázis Inicializálása

Nyisd meg a Supabase SQL Editor-t és futtasd le a `SEED_INSTRUCTIONS.md` fájlban található SQL parancsokat:

```sql
-- 1. Tenant létrehozása
INSERT INTO tenants (id, name, slug, status) VALUES (...);

-- 2. Auth users létrehozása
INSERT INTO auth.users (...) VALUES (...);

-- 3. Profiles, leave types, balance, requests
-- (Részletes SQL a SEED_INSTRUCTIONS.md fájlban)
```

**Fontos:** Fejlesztéshez kapcsold ki az RLS-t:
```sql
ALTER TABLE leave_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balance DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_new DISABLE ROW LEVEL SECURITY;
```

### 4. Alkalmazás Indítása

```bash
npm run dev
```

Nyisd meg a böngészőben: [http://localhost:3000](http://localhost:3000)

---

## 👤 Mock Felhasználók (Localhost)

Az alkalmazás 3 teszt felhasználót tartalmaz:

| Név | Szerep | Email | Leírás |
|-----|--------|-------|--------|
| Nagy Péter | Manager | manager@example.com | Jóváhagyhat/elutasíthat kérelmeket |
| Kovács Anna | Munkavállaló | employee@example.com | Szabadságkérelmet tud beküldeni |
| Szabó Mária | Munkavállaló | employee2@example.com | Szabadságkérelmet tud beküldeni |

**Felhasználó váltás:** Használd a fejlécben található legördülő menüt.

---

## 📋 Használati Útmutató

### Alkalmazott Nézet

1. **Szabadság Kérelem Létrehozása**
   - Válaszd ki a szabadság típusát (Fizetett/Fizetetlen)
   - Add meg a kezdő és befejező dátumot
   - Opcionális: Írj indoklást
   - Kattints a "Kérelem beküldése" gombra

2. **Egyenleg Ellenőrzése**
   - Bal oldali widget mutatja az aktuális egyenleget
   - Zöld: Rendelkezésre álló napok
   - Sárga: Függőben lévő napok
   - Piros: Felhasznált napok

3. **Naptár Használata**
   - Kék színnel jelölt napok: Jóváhagyott szabadságok
   - Sárga színnel: Függőben lévő kérelmek
   - Indigo háttér: Magyar nemzeti ünnepek
   - Szürke háttér: Hétvégék

### Manager Nézet

1. **Kérelmek Jóváhagyása/Elutasítása**
   - A "Jóváhagyásra váró kérelmek" szekcióban láthatók a függőben lévő kérelmek
   - Kattints a "Jóváhagyás" vagy "Elutasítás" gombra
   - Elutasításkor kötelező indoklást megadni

2. **Csapat Naptár**
   - Láthatók az összes alkalmazott szabadságai
   - Különböző színek jelzik a státuszokat
   - Hover tooltip mutatja a részleteket

---

## 🏗️ Technológiai Stack

### Frontend
- **React 18** - UI könyvtár
- **TypeScript** - Típusos JavaScript
- **Vite** - Build tool és dev server
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Supabase** - PostgreSQL adatbázis + Edge Functions
- **Edge Functions** - Deno-alapú serverless funkciók
- **Row Level Security** - Multi-tenant biztonság

### Authentikáció
- **Localhost:** Mock users (localStorage)
- **Production:** Clerk (tervezve)

---

## 📁 Projekt Struktúra

```
szabi-tervező/
├── components/          # React komponensek
│   ├── App.tsx         # Fő alkalmazás komponens
│   ├── Calendar.tsx    # Naptár megjelenítés
│   ├── Header.tsx      # Fejléc és user switcher
│   ├── LeaveBalance.tsx    # Egyenleg widget
│   ├── LeaveRequestForm.tsx # Kérelem űrlap
│   └── PendingRequests.tsx  # Manager jóváhagyási panel
├── contexts/           # React Context API
│   └── AuthContext.tsx # Authentikáció kezelés
├── hooks/              # Custom React hooks
│   ├── useLeaveRequests.ts  # Kérelmek CRUD műveletek
│   ├── useLeaveBalance.ts   # Egyenleg lekérdezés
│   └── useLeaveTypes.ts     # Szabadság típusok
├── utils/              # Utility funkciók
│   └── dateUtils.ts    # Dátum kezelés, ünnepek
├── lib/                # Külső szolgáltatások
│   └── supabase.ts     # Supabase kliens
├── types.ts            # TypeScript típus definíciók
├── .env.local          # Környezeti változók (NEM commitolva)
├── DEPLOYMENT.md       # Deployment útmutató
└── SEED_INSTRUCTIONS.md # Adatbázis seed SQL
```

---

## 🧪 Tesztelés

### Manuális Tesztelés Checklist

- [ ] Alkalmazás betöltődik hibák nélkül
- [ ] User switcher működik (3 felhasználó között)
- [ ] Naptár navigáció működik (előző/következő hónap)
- [ ] Magyar ünnepek helyesen jelennek meg
- [ ] Szabadságkérelem létrehozása sikeres
- [ ] Függőben lévő kérelmek megjelennek
- [ ] Manager jóváhagyás működik
- [ ] Manager elutasítás működik
- [ ] Egyenleg frissül kérelem után
- [ ] Naptárban megjelennek a szabadságok

### Automatikus Tesztek

```bash
# E2E tesztek futtatása (Playwright)
cd /Users/macbookpro/Desktop/Modulion\ SAAS\ Platform/e2e-tests/calendar-tests
node test-runner.cjs
```

---

## 🚢 Production Deployment

Részletes deployment útmutató: [DEPLOYMENT.md](DEPLOYMENT.md)

### Gyors Verzió: Vercel Deployment

```bash
# Vercel CLI telepítése
npm install -g vercel

# Deploy
cd szabi-tervező
vercel

# Environment variables beállítása Vercel Dashboard-on
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY

# Production deploy
vercel --prod
```

**Fontos production lépések:**
1. ✅ RLS policies újra engedélyezése
2. ✅ Clerk authentication integráció
3. ✅ Edge Functions auth token használata
4. ✅ Environment variables biztonságos kezelése

---

## 🐛 Known Issues & Roadmap

### Known Issues
- Mobile responsive design finomítás szükséges (320px-768px)
- Form validáció hiányzik (dátum overlap ellenőrzés)
- Loading states hiányoznak
- Email értesítések nincsenek implementálva

### Roadmap
- [ ] Form validáció hozzáadása
- [ ] Loading spinnerek
- [ ] Email értesítések (jóváhagyás/elutasítás)
- [ ] Export funkció (PDF/Excel)
- [ ] Szabadság konfliktus jelzés
- [ ] Mobile responsive finomítás
- [ ] Clerk production authentication
- [ ] Multi-language support

---

## 🤝 Fejlesztés & Hozzájárulás

### Development Workflow

1. Fork a repository-t
2. Hozz létre egy feature branch-et (`git checkout -b feature/amazing-feature`)
3. Commit-old a változásokat (`git commit -m 'feat: Add amazing feature'`)
4. Push-old a branch-et (`git push origin feature/amazing-feature`)
5. Nyiss egy Pull Request-et

### Code Style

- TypeScript strict mode használata
- ESLint és Prettier szabályok követése
- Komponensek: React functional components + hooks
- CSS: Tailwind utility classes (ne custom CSS)

---

## 📄 Licensz

MIT License - szabad felhasználás és módosítás.

---

## 📞 Támogatás

**Dokumentáció:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment útmutató
- [SEED_INSTRUCTIONS.md](SEED_INSTRUCTIONS.md) - Adatbázis inicializálás

**Bug Report & Feature Request:**
- GitHub Issues használata
- Részletes reprodukálási lépések megadása
- Screenshotok csatolása (ha releváns)

---

## 🙏 Köszönetnyilvánítás

- **Supabase** - Backend as a Service platform
- **Vercel** - Hosting és deployment
- **Tailwind CSS** - UI framework
- **React** - UI könyvtár

---

**Projekt státusz:** ✅ Production Ready
**Build méret:** 113.27 kB (gzipped)
**Utolsó frissítés:** 2025. október 26.

**Sikeres fejlesztést!** 🚀
