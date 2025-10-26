# 🌱 Szabi Tervező - Test Adatok Betöltése

## Gyors megoldás: Supabase SQL Editor

1. Menj a **Supabase Dashboard**-ra: https://supabase.com/dashboard/project/stzjhrcvyzbazaaptzqy

2. Kattints a **SQL Editor** menüre (bal oldali menüben)

3. Hozz létre egy **New Query**-t és másold be az alábbi SQL-t:

```sql
-- SEED DATA FOR SZABI TERVEZŐ
-- Ezt futtasd a Supabase SQL Editorban

-- 1. Leave Types
INSERT INTO leave_types (id, tenant_id, name, code, is_paid, color, requires_approval)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', 'Éves szabadság', 'ANNUAL', true, '#3B82F6', true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000099', 'Fizetés nélküli', 'UNPAID', false, '#9CA3AF', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000099', 'Orvosi', 'MEDICAL', true, '#EF4444', true)
ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color;

-- 2. Leave Balance
INSERT INTO leave_balance (tenant_id, user_id, leave_type_id, year, total_days, used_days, pending_days)
VALUES
  -- Kovács Anna
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 2025, 20, 5, 0),
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 2025, 5, 0, 0),
  -- Szabó Gábor
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 2025, 20, 2, 3),
  ('00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 2025, 5, 1, 0)
ON CONFLICT (tenant_id, user_id, leave_type_id, year) DO UPDATE
SET total_days = EXCLUDED.total_days, used_days = EXCLUDED.used_days, pending_days = EXCLUDED.pending_days;

-- 3. Sample Leave Requests
INSERT INTO leave_requests (id, tenant_id, user_id, leave_type_id, start_date, end_date, days_count, status, reason, approved_by, approved_at)
VALUES
  -- Approved
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2025-02-10', '2025-02-14', 5, 'approved', 'Családi nyaralás', '00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days'),
  -- Pending
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2025-03-15', '2025-03-17', 3, 'pending', 'Hosszú hétvége', NULL, NULL),
  -- Rejected
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2025-02-20', '2025-02-21', 2, 'rejected', 'Üzleti találkozó', NULL, NULL),
  -- Another Pending
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '2025-03-05', '2025-03-05', 1, 'pending', 'Orvosi vizsgálat', NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Ellenőrzés
SELECT 'Leave Types:', COUNT(*) FROM leave_types WHERE tenant_id = '00000000-0000-0000-0000-000000000099'
UNION ALL
SELECT 'Leave Balances:', COUNT(*) FROM leave_balance WHERE tenant_id = '00000000-0000-0000-0000-000000000099'
UNION ALL
SELECT 'Leave Requests:', COUNT(*) FROM leave_requests WHERE tenant_id = '00000000-0000-0000-0000-000000000099';
```

4. Kattints a **RUN** gombra (vagy Cmd/Ctrl + Enter)

5. Ellenőrizd, hogy a kimenet ezt mutatja:
   ```
   Leave Types: 3
   Leave Balances: 4
   Leave Requests: 4
   ```

6. **Készen vagy!** Nyisd meg: http://localhost:3000

---

## Az alkalmazás tesztelése

### Mock Userek

Az AuthContext 3 mock usert használ:

1. **Nagy Péter (Manager)** - `company_admin`
   - ID: `00000000-0000-0000-0000-000000000001`
   - Látja a pending requests-eket
   - Jóváhagyhat/elutasíthat

2. **Kovács Anna (Munkavállaló)** - `staff`
   - ID: `00000000-0000-0000-0000-000000000002`
   - Éves szabadság: 15/20 maradt
   - Van 1 jóváhagyott és 1 pending kérelme

3. **Szabó Gábor (Munkavállaló)** - `staff`
   - ID: `00000000-0000-0000-0000-000000000003`
   - Éves szabadság: 15/20 maradt
   - Van 1 pending és 1 elutasított kérelme

### Tesztelési Workflow

1. **Munkavállaló nézet** (Kovács Anna)
   - Lásd az egyenleget
   - Hozz létre új kérelmet
   - Ellenőrizd hogy megjelenik a naptárban (sárga = pending)

2. **Manager nézet** (Nagy Péter)
   - Válts usert a header-ben
   - Lásd a pending requests listát
   - Hagyj jóvá egy kérelmet
   - Ellenőrizd hogy zöldre vált a naptárban

3. **Elutasítás tesztelése**
   - Manager módban utasíts el egy kérelmet
   - Add meg az indoklást
   - Ellenőrizd hogy piros és áthúzott lesz

---

## Problémamegoldás

### "No leave types available"
- Futtasd le az SQL-t a Supabase SQL Editorban
- Ellenőrizd hogy a tenant_id egyezik: `00000000-0000-0000-0000-000000000099`

### "Unauthorized" vagy "Permission denied"
- Ellenőrizd hogy az `.env.local` fájl létezik és tartalmazza a Supabase credentials-öket
- Indítsd újra a dev server-t: `npm run dev`

### "Failed to fetch"
- Ellenőrizd hogy a Supabase Edge Functions futnak
- Nézd meg a browser console-t (F12)
- Ellenőrizd a Network tab-ot

---

✅ Ha minden működik, látnod kellene:
- 3 szabadság típust
- Egyenleg megjelenítést típusonként
- Naptárt a jóváhagyott/pending/elutasított kérelmekkel
- Manager esetén: Pending requests listát jóváhagyási gombokkal
