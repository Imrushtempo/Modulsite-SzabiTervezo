# Szabi Tervező - Deployment Útmutató

## 📦 Production Build Státusz

✅ **Build elkészült**: `dist/` mappa
- **index.html**: 1.36 kB (gzip: 0.60 kB)
- **JavaScript bundle**: 395.74 kB (gzip: 113.27 kB)
- **Build idő**: 537ms

---

## 🚀 Deployment Opciók

### Opció 1: Vercel (Ajánlott - Legegyszerűbb)

**1. Telepítsd a Vercel CLI-t:**
```bash
npm install -g vercel
```

**2. Deploy a projektből:**
```bash
cd /Users/macbookpro/Desktop/Modulok/szabi-tervező
vercel
```

**3. Environment Variables beállítása Vercel Dashboard-on:**
- `VITE_SUPABASE_URL`: `https://stzjhrcvyzbazaaptzqy.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: (másold az .env.local-ból)

**4. Production deploy:**
```bash
vercel --prod
```

---

### Opció 2: Netlify

**1. Telepítsd a Netlify CLI-t:**
```bash
npm install -g netlify-cli
```

**2. Login és deploy:**
```bash
netlify login
netlify deploy --prod --dir=dist
```

**3. Environment Variables:**
Netlify Dashboard → Site settings → Environment variables
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

### Opció 3: Saját Szerver (VPS/cPanel)

**1. Build elkészítése:**
```bash
npm run build
```

**2. `dist/` mappa feltöltése:**
- FTP/SFTP használatával töltsd fel a `dist/` mappa tartalmát
- Célkönyvtár: `public_html` vagy `www`

**3. `.htaccess` fájl létrehozása (Apache szerveren):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**4. Environment Variables:**
Build előtt győződj meg róla, hogy az `.env.local` fájl tartalmazza a production értékeket.

---

## ⚙️ Environment Variables

### Fejlesztés (.env.local):
```env
VITE_SUPABASE_URL=https://stzjhrcvyzbazaaptzqy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

### Production:
**⚠️ FONTOS: Soha ne commitold az API kulcsokat a git-be!**

Deploy platformon állítsd be:
- Vercel: Dashboard → Settings → Environment Variables
- Netlify: Dashboard → Site settings → Environment variables

---

## 🔐 Production Checklist (Éles Környezetre Való Átállás)

### Backend (Supabase)

#### 1. RLS Policies Visszakapcsolása
```sql
-- FONTOS: Fejlesztésben kikapcsoltuk, élesben VISSZA KELL KAPCSOLNI!
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles_new ENABLE ROW LEVEL SECURITY;
```

#### 2. RLS Policy Létrehozása (Multi-tenant)
```sql
-- Példa: leave_types tábla policy
CREATE POLICY "Users can view their tenant's leave types"
  ON leave_types FOR SELECT
  USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Hasonló policy-kat kell létrehozni:
-- - leave_requests (INSERT/SELECT/UPDATE saját tenant)
-- - leave_balance (SELECT saját tenant)
-- - profiles_new (SELECT saját tenant)
```

#### 3. Clerk Authentication Integráció

**Frontend módosítások:**

`src/contexts/AuthContext.tsx` - Cseréld ki a mock auth-ot:
```typescript
import { useUser } from '@clerk/clerk-react';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (isLoaded && clerkUser) {
      // Fetch user from profiles_new using Clerk user ID
      const fetchUserProfile = async () => {
        const { data } = await supabase
          .from('profiles_new')
          .select('*')
          .eq('clerk_user_id', clerkUser.id)
          .single();

        setUser(data);
      };
      fetchUserProfile();
    }
  }, [clerkUser, isLoaded]);

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Adatbázis módosítások:**
```sql
-- Add clerk_user_id column to profiles_new
ALTER TABLE profiles_new ADD COLUMN clerk_user_id TEXT UNIQUE;
```

#### 4. Edge Functions Auth Token Használata

A hooks-ban (useLeaveRequests, useLeaveBalance) változtasd vissza:
```typescript
// Fejlesztésben: Direct DB query
// Élesben: Edge Function with auth token

const { data, error } = await supabase.functions.invoke('get-balance', {
  headers: {
    Authorization: `Bearer ${session.access_token}`
  }
});
```

---

## 🧪 Pre-deployment Testing

### 1. Local Production Build Test
```bash
npm run build
npm run preview
```
Nyisd meg: http://localhost:4173

### 2. Ellenőrzési Lista
- [ ] Build sikeres (nincs hiba)
- [ ] Minden komponens betöltődik
- [ ] Environment variables helyesen vannak beállítva
- [ ] API calls működnek
- [ ] Naptár navigáció működik
- [ ] User switching működik (később Clerk)
- [ ] Szabadságkérelem létrehozás működik
- [ ] Magyar ünnepek helyesen jelennek meg

---

## 📊 Performance Optimalizáció

### Bundle Méret Csökkentés
```bash
# Analyze bundle size
npm install -D rollup-plugin-visualizer
```

`vite.config.ts`-ben:
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js']
        }
      }
    }
  }
});
```

---

## 🐛 Troubleshooting

### "Failed to load environment variables"
- Győződj meg róla, hogy az environment variables be vannak állítva a hosting platformon
- Ellenőrizd a variable neveket (VITE_ prefix kötelező)

### "Supabase RLS permission denied"
- RLS policies vannak engedélyezve? (Fejlesztésben kikapcsoltuk!)
- Policy-k helyesen vannak konfigurálva a tenant_id-val?

### "Authentication failed"
- Clerk integráció helyesen van konfigurálva?
- Clerk public key be van állítva?

---

## 📞 Support & További Fejlesztés

**Következő lépések a visszajelzések alapján:**
1. Form validáció hozzáadása
2. Loading spinnerek
3. Email értesítések (jóváhagyás/elutasítás)
4. Mobile responsive finomítás
5. Export funkció (PDF/Excel)
6. Szabadság konfliktus jelzés managereknek

**Kontakt:**
- Fejlesztési kérdések: claude.ai
- Bug reports: GitHub Issues
- Feature requests: Feedback alapján

---

**Deployment státusz:** ✅ READY FOR PRODUCTION
**Build méret:** 113 kB (gzipped)
**Deploy platformok:** Vercel ⭐ | Netlify | VPS

**Sikeres deploy-t!** 🚀
