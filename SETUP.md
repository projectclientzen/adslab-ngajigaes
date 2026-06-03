# Setup Guide — ADS LAB Ngajigaes.id

Panduan dari demo (mock data) → usable (data Ngajigaes asli).

---

## Environment Variables

Set di **Netlify → Site `ngajigaes-dashboard` → Site configuration → Environment variables**.

### Frontend (dashboard baca data)

| Variable | Nilai | Sumber |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase → Settings → API → anon public |
| `NEXT_PUBLIC_NETLIFY_URL` | `https://ngajigaes-dashboard.netlify.app` | URL site ini sendiri |

### Backend Functions (tarik data Meta → Supabase)

| Variable | Nilai | Sumber |
|---|---|---|
| `SUPABASE_URL` | sama dengan di atas | Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Supabase → Settings → API → service_role (rahasia!) |
| `META_ACCESS_TOKEN_NGAJIGAES` | long-lived token | Meta (lihat di bawah) |
| `META_ACCOUNT_ID_NGAJIGAES` | `act_1234567890` | Meta Ads Manager |

> **Reuse Supabase lama:** copy `SUPABASE_URL` + key dari site `adslabzen` (Netlify → adslabzen → Environment variables). Schema sudah include brand `ngajigaes`.

---

## Meta API — Step by Step

### 1. Buat Meta Business App
1. Buka https://developers.facebook.com/apps
2. **Create App** → tipe **Business**
3. Beri nama (mis. "Ngajigaes ADS LAB")

### 2. Tambah produk Marketing API
1. Di dashboard app → **Add Product** → **Marketing API** → Set Up

### 3. Request Permissions
- `ads_read` — baca data iklan
- `read_insights` — baca metrik performa
- (Approval: 1-7 hari untuk akun production)

### 4. Generate Access Token (long-lived)
1. **Tools → Graph API Explorer**
2. Pilih app + permission `ads_read`, `read_insights`
3. Generate token → ini short-lived (1 jam)
4. Convert ke long-lived (60 hari) via:
   ```
   GET https://graph.facebook.com/v20.0/oauth/access_token?
     grant_type=fb_exchange_token&
     client_id={APP_ID}&
     client_secret={APP_SECRET}&
     fb_exchange_token={SHORT_TOKEN}
   ```
5. Token hasil = `META_ACCESS_TOKEN_NGAJIGAES`

### 5. Cari Ad Account ID
1. Buka **Ads Manager** Ngajigaes
2. ID akun format `act_XXXXXXXXXX` (di URL atau dropdown akun)
3. = `META_ACCOUNT_ID_NGAJIGAES`

---

## Test Data Fetch

Setelah env vars di-set + redeploy:

```bash
# Trigger manual fetch
curl -X POST "https://ngajigaes-dashboard.netlify.app/.netlify/functions/meta-fetch?brand=ngajigaes"
```

Atau klik tombol **"Sync Meta"** di header dashboard (admin mode).

Function `meta-fetch-scheduled` auto-jalan tiap 4 jam.

---

## Chrome Extension (riset kompetitor)

1. Clone folder `extension/` dari repo `adslab` lama
2. Chrome → `chrome://extensions` → Developer mode → Load unpacked
3. Set Supabase key di extension storage:
   ```js
   chrome.storage.local.set({
     SUPABASE_URL: 'https://xxx.supabase.co',
     SUPABASE_ANON_KEY: 'eyJ...'
   })
   ```
4. Buka Meta Ads Library → extension auto-scrape → data masuk Supabase
5. Muncul di menu **ADS LAB Kompetitor**

---

## Checklist Go-Live

- [ ] Supabase URL + anon key → Netlify FE env
- [ ] Supabase service_role key → Netlify BE env
- [ ] Meta app + permission approved
- [ ] Meta token + account ID → Netlify BE env
- [ ] Redeploy site
- [ ] Test `meta-fetch` → cek data masuk Supabase
- [ ] (opsional) Install Chrome Extension untuk kompetitor
