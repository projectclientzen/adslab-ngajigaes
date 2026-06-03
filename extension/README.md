# ADS LAB Collector — Ngajigaes

Chrome Extension untuk scrape Meta Ads Library → Supabase.
Mengumpulkan iklan kompetitor (copy, CTA, funnel type, landing page URL) untuk menu "ADS LAB Kompetitor".

## Install

1. Buka Chrome → `chrome://extensions`
2. Aktifkan **Developer mode** (toggle kanan atas)
3. Klik **Load unpacked** → pilih folder `extension/` ini
4. Extension muncul di toolbar

## Konfigurasi

1. Klik icon extension → buka **⚙️ Konfigurasi Supabase**
2. Isi:
   - **SUPABASE_URL** — `https://xxx.supabase.co`
   - **SUPABASE_ANON_KEY** — `eyJ...`
3. Klik **Simpan Konfigurasi**

> Pakai Supabase yang sama dengan dashboard ngajigaes.

## Cara Pakai

1. Buka **Meta Ads Library**: https://www.facebook.com/ads/library
2. Cari kompetitor (mis. "ngaji online", "belajar quran")
3. Extension auto-scroll + scrape → data masuk Supabase tabel `ads_detail`
4. Popup menampilkan progress: dedup counter + scroll status
5. Data muncul di dashboard → menu **Ad Intelligence**

## Fitur

- **GraphQL interceptor** — capture landing page URL (LP detection ~95%)
- **IntersectionObserver scroll** — auto-scroll reliable di 300+ iklan
- **Deduplication** — by Library ID, no double insert
- **Funnel classifier** — auto-klasifikasi LP / CTWA / Visit Profile / Lead Form
- **Field capture** — ad copy, creative type, CTA button, date active
