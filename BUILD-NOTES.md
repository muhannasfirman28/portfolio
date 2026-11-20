# Build Notes

Renditions satu-halaman dari **MUHAMMAD ANNAS FIRMAN — GRIDO1 Racing Systems** sesuai
spek, dengan **pengecualian visual** yang diminta: seluruh foto orang (hero, paddock,
footer, timeline) memakai foto Anda sendiri. Copy, judul, navigasi, token, angka, dan
timing tetap persis seperti sumber asli.

## Asal

Sumber asli adalah layer getlayers.ai. Versi live yang jadi referensi implementasi:
`https://sitemovento.vercel.app/`.

## Yang dipertahankan 1:1 dari spek

- **Helm**: `hero/scene/helmet3.glb` (801 KB, Draco) + `DRACOLoader` dari CDN three.js,
  `RGBELoader` + `PMREMGenerator` untuk `studio-light.hdr`, `noise.webp` repeat-wrapped.
- **Efek hero**: portrait depth-parallax (4 peta tekstur), helm *burn away* mahkota→dagu
  dengan front cyan glow, reveal trail hanya di jalur kursor + pace gate, idle sweep,
  wireframe wave 3.1s, relight dari normal map, backdrop kontur.
- **7 foto timeline** `timeline/2012…2026.webp` beserta copy tiap entri.
- **Paddock**: `paddock/portrait.webp`, 4 ikon statistik, strip kalender 5 seri + bracket
  live + pulse.
- **Footer**: `footer/body.webp` (setelan, termask 69%, di-grade gelap agar figure
  menyatu ke latar hitam seperti template; skin leher/dada diredam dengan sliver
  leher sempit agar proporsi wajah/helm seperti template) + `footer/helmet.webp`,
  `footer/logo-mask.png` sebagai wordmark cyan.
- **Branding**: `grido1-logo.webp`, `flag-italy.webp`, `icon-rookie.svg`,
  `mercedes-logo.webp`, `circuit-spa.webp` (tidak dipakai lagi sejak §8),
  `play-button.svg`, `helmet-mask.png` untuk veil.
- **Token, angka, timing** — seluruh nilai Tier‑1/Tier‑2, `DEFAULT_PARAMS`, `SPRINGS`,
  `DEFAULT_PARAMS`, CIRCUIT_PATH, MAP data, dot lattice, dan semua parameter bawaan.

## Penggantian foto (hero, paddock, footer, timeline)

### 1. Hero — 4 peta tekstur

Sumber asli memakai empat peta tekstur untuk portrait:

| Sumber asli | Pengganti |
|---|---|
| `hero/scene/person-diffuse.webp` (2048²) | peta warna dari foto Anda (1024²) |
| `hero/scene/person-depth.webp` (512²) | depth palsu (alpha + luminansi) |
| `hero/scene/person-alpha.webp` (2048²) | alpha foto Anda (1024²) |
| `hero/scene/person-normal.webp` (512²) | normal map (sobel dari depth) |

Keempatnya dibuat dengan PIL + numpy (`make_maps_v2.py`), disuntikkan sebagai data URI
lewat konstanta `ME` di dalam `<script type="module">`, dipetakan langsung ke
`loadTexture()`. Komposisi disamakan dengan peta asli: puncak kepala di 25% kanvas,
leher di ~68%, sehingga helm wireframe dan seluruh rantai animasi hero (burn, reveal
trail, wave, relight) duduk di posisi benar tanpa menyentuh `DEFAULT_PARAMS`.

### 2. Paddock & footer

| Slot | Sumber asli | Pengganti (final) |
|---|---|---|
| `paddock/portrait.webp` (1350×1165) | Kimi | foto Anda, crop & posisi kepala disamakan (bbox asli 210,29) |
| `footer/body.webp` (1536×1024) | Kimi setengah-wajah | **Ferrari F1 Driver Portrait Cutout.png** (1087×1446, alpha) → WebP q80, menggantikan foto/helm lama |
| `footer/helmet.webp` (1536×1024) | helm cetak | **dihapus** — diminta tanpa helm/kepala lama |

Grade footer body dilakukan bertahap tanpa menyentuh CSS/HTML (struktur footer tetap
1:1 dengan template):

- `grade_footer_body2.py` — kemeja putih diredupkan (lum ~242→41) + fade bawah
  `1 − smoothstep(0.60, 1.0, y)·0.78` sehingga latar CTA gelap (kontras ~1.1:1 → 4.6:1).
- `grade_footer_body3.py` — dibangun ulang dari `mapsv2.json` (tanpa double-grade).
  Skin hangat di zona terlihat ditekan ke ~10% kecerahan, kecuali **sliver leher
  sempit** (baris gambar 733–803, pusat x≈824, lebar setengah 90→18 px, tepi
  feathered). Ini menghilangkan kesan "leher/dada telanjang berlebih" sambil
  menyisakan leher terang kecil di bawah helm. Helm tidak diubah.
- `grade_footer_body4.py` — **final**. Diagnosis lanjutan menunjukkan ukuran helm
  dan rasio kepala:helm sudah sama dengan template (helm ours kolom 418–1113 vs
  template 411–1121; rasio lebar kepala/helm 0,84 vs 0,85), sehingga yang salah
  bukan ukuran, melainkan **kulit wajah/rahang yang terlalu banyak terekspos**.
  Gate supresi skin dinaikkan dari baris gambar ~672 ke ~140 (puncak wajah),
  sehingga seluruh wajah gelap di semua viewport; sliver leher disetel ulang ke
  baris 690–755, pusat x≈765, lebar setengah 120→30 px agar menempel di bawah
  helm seperti template. Ukuran helm & CSS tetap 1:1.

Hasil terukur (area hangat / lebar baris maks / posisi pita / CTA):

| Viewport | OURS final | Template |
|---|---|---|
| 1440×900 | 5.831 px / 180 px / y678–718 / 19 | 6.587 px / 227 px / y671–720 / 15 |
| 1479×800 | 10.667 px / 241 px / y616–656 / 18 | 12.376 px / 268 px / y594–667 / 18 |

Sebelum perbaikan, pada 1479×800 kulit wajah menyebar sampai pita y505–714
(lebar 493 px). Kini pita leher kompak menempel di bawah helm dan stabil di
kedua viewport. CTA tetap gelap (luminansi ~12 pada gambar, ~18–19 di halaman).

**Catatan (superseded):** seluruh graded body v2–v4 dan render helm 3D di atas
sudah tidak dipakai. Figure footer diganti total dengan foto cutout — Ferrari,
lalu **Mercedes-AMG Petronas** sebagai versi final (lihat bawah); catatan grading
di atas dipertahankan hanya sebagai riwayat.

### 3. Figure footer — Ferrari F1 Driver Portrait Cutout (final)

Permintaan: section terakhir tidak memakai helm/kepala lagi, diganti foto
`Ferrari F1 Driver Portrait Cutout.png` yang sudah ditaruh di folder proyek,
dengan ukuran yang pas. Dua opsi dikonfirmasi user: **seluruh foto muat** dan
**merah tetap terang penuh**.

- `swap_footer_ferrari.py` — encode PNG → WebP q80/method 6 (135.678 bytes,
  132 KB, alpha terjaga), ganti **hanya** data-URI `<img class="ft-body">`
  (width/height → 1087/1446, `alt=""` karena grup `aria-hidden="true"`), dan
  **hapus** elemen `<img class="ft-helmet">` beserta aturan CSS-nya.
- CSS `.ft-body` ditulis ulang (penyimpangan disengaja dari "CSS footer 1:1
  dengan template", hanya 1 aturan ini):
  `position:absolute; z-index:10; left:50%; bottom:0; height:100%; width:auto;
  transform:translateX(-50%); object-fit:contain;`
  Mask 69%, `aspect-ratio`, `object-fit:cover`, dan `bottom:-1.225%` dibuang.
  Layout teks, CTA, nav, timeline, dan hero **tidak disentuh**.
- Karena suit merah terang penuh berada tepat di belakang tombol, ditambahkan
  **scrim gelap minimal khusus di balik `.ft-cta`** (`::before`,
  `rgb(9 10 11 / 0.55)`, `clip-path` mengikuti chamfer slab). Merah di luar
  tombol tetap terang; tidak ada fade/redup pada gambar.

Terukur dari render (1440×900 / 1479×800 / 768 tablet):

| Viewport | figure body | CTA contrast (cyan) | red-frac di atas CTA |
|---|---|---|---|
| 1440×900 | x382–1058, h900 (utuh) | 7,39:1 | 0,94 |
| 1479×800 | x439–1040, h800 (utuh) | 7,88:1 | 0,85 |
| 768 tablet (skala 0,87) | x146–668, h695 (utuh) | 8,72:1 | 0,85 |

`spec.cjs` tetap hijau di desktop 1440 + mobile 390: `errors []`,
`http4xx []`, `imgsBad 0`, `hScroll false`, `tlRows 7`, `canvases 8`.
`imgsOk` turun 20 → **19** karena elemen helm dihapus (bukan error). Figure
tetap `display:none` di ≤639px sesuai CSS template.

### 3b. Figure footer — Mercedes-AMG Petronas (final)

Permintaan terakhir: foto footer diganti `Mercedes-AMG Petronas Driver
Portrait.png`. Berbeda dari Ferrari, file ini **RGB berlatar putih** (bukan
cutout transparan), jadi latarnya dibuang dulu. Opsi user: **cutout transparan**.

- `swap_footer_mercedes.py` — cutout via **flood-fill dari tepi** melalui piksel
  putih (`lum>195` + spread<24), lalu trim fringe putih di batas potongan.
  Hasil: transparan **44,4%**, sudut TL/TR/BR alpha 0, BL (jas gelap) utuh,
  bbox subjek baris **72–1445**, piksel gelap subjek **retained 100%**.
- Encode WebP q80/m6 **RGBA** (109.294 bytes, 107 KB — lebih kecil dari Ferrari
  132 KB). Injeksi **hanya** data-URI `.ft-body` + `width/height` → 1088/1446.
- **Tidak ada perubahan CSS/HTML lain**: rasio 1088×1446 = 0,752 ≈ Ferrari,
  jadi `.ft-body` (`height:100%; width:auto; object-fit:contain`) tetap pas.
  Scrim `.ft-cta` tetap dipakai (jas gelap → kontras makin tinggi).

Terukur (1440×900 / 1479×800 / 768 tablet):

| Viewport | figure body | near-white dlm figure | CTA contrast |
|---|---|---|---|
| 1440×900 | x381–1059, h900 (utuh) | 1,9% (tak ada kotak putih) | 5,63:1 |
| 1479×800 | x439–1041, h800 (utuh) | 1,4% | 5,54:1 |
| 768 tablet | x146–668, h695 (utuh) | 1,9% | 10,55:1 |

`spec.cjs` tetap hijau: `errors []`, `http4xx []`, `imgsBad 0`, `hScroll false`,
`tlRows 7`, `canvases 8`, `imgsOk 19`. Escape "near-white" di tablet sempat
terbaca salah karena mengambil sampel area section sebelumnya — setelah
diukur relatif terhadap kotak figure, hasilnya bersih.

Ukuran setelah Mercedes: **770,1 KB**; setelah peta gelap: **773,0 KB**;
final setelah Racing Portrait: **793,9 KB** (batas ~1,2 MB).

### 3c. Figure footer — Mercedes-AMG Petronas Racing Portrait (final)

Permintaan terakhir: ganti figure dengan `Mercedes-AMG Petronas Racing
Portrait.png`. Berbeda dari file "Driver Portrait" sebelumnya (RGB berlatar
putih yang harus di-cutout), file ini **sudah RGBA cutout bersih** (1088×1445,
transparan **45,7%**, sudut atas alpha 0, jas bawah opaque, tepi tanpa halo
putih). Opsi user: **pakai apa adanya** — termasuk headroom transparan ~200 baris
di atas kepala (figure jadi ~9% lebih pendek dari versi sebelumnya).

- `swap_footer_mercedes_racing.py` — encode apa adanya ke WebP q80/m6 RGBA
  (125.772 bytes, 123 KB), ganti **hanya** data-URI `.ft-body` dan
  `width/height` → 1088/1445.
- **Tidak ada perubahan CSS/HTML lain**: rasio 0,7529 ≈ 0,7523 sebelumnya,
  sehingga `.ft-body` (`height:100%; width:auto; object-fit:contain`,
  bottom-anchored) tetap pas. Scrim `.ft-cta` tetap.
- Terukur (1440×900 / 1479×800 / 768 tablet): figure utuh, **tidak ada kotak
  putih** (near-white 2,0% / 1,4% / 2,0% — semuanya highlight dalam subjek),
  kontras CTA cyan **5,62:1 / 5,40:1 / 10,62:1**, `hScroll false`. Di ≤639px
  figure tetap `display:none`.
- `spec.cjs` hijau: `errors []`, `http4xx []`, `imgsBad 0`, `hScroll false`,
  `tlRows 7`, `canvases 9`, `imgsOk 19`.

Render helm memakai three.js 0.185.0 + Draco + `studio-light.hdr` persis seperti konfigurasi
halaman (ruang, PMREM, FOV 35, skala `HEAD_HEIGHT`), diarahkan lurus depan, lalu dipadatkan
ke plat footer lewat `fit_helmet.py`.

### 3. Timeline — 7 plat

`timeline/2012…2026.webp` diganti 7 plat RGB 1420×1016 buatan `make_maps_v2.py`:
latar gradien gelap + glow radial berwarna berbeda per tahun, grain halus, vignette, dan
figure dengan **crop serta posisi bervariasi** (close-up, medium, side). Disuntikkan sebagai
`const TL_IMG` (data URI) sebelum `const TIMELINE`, direferensikan template baris:
`TL_IMG[entry.year] || ASSET_BASE_URL + '/timeline/' + entry.year + '.webp'`.

### 4. SEASON — lintasan diganti peta Indonesia

Permintaan: bagian lintasan pada section kedua diganti peta Indonesia memakai
`<iframe>` Google Maps embed yang dikirim user. Opsi dikonfirmasi: **ganti
seluruh background**, **peta statis** (`pointer-events:none`), dan **gradient
scrim** agar teks tetap terbaca.

- HTML: `.season-map > iframe + .season-map-scrim` disisipkan di dalam
  `<section data-season>`, tepat sebelum `.flag-band`. Atribut `width`/`height`
  dari snippet dibuang — ukuran diatur CSS (`inset:0; width:100%; height:100%`).
  `title="Peta Indonesia"`, `loading="lazy"`, `referrerpolicy`, `allowfullscreen`
  dipertahankan.
- CSS: `.circuit-frame` diberi **`display:none`**, **tidak dihapus**. Alasan:
  `seasonBlock()` masih memegang referensi ke `mapBox`, `mapSvgHost`,
  `halftoneCanvas`, `traceCanvas` — menghapusnya akan memicu `pageerror`.
  Semua fungsi terkait sudah guard terhadap ukuran nol (`bake()`,
  `draw()`, `fitStage()` early-return), sehingga aman. Efek samping positif:
  `canvases` tetap **8** sesuai gate.
- `.season-map-scrim`: dua gradient — vertikal (fade atas/bawah, menggantikan
  `mask-image` circuit lama) + horizontal (pekat di kiri tempat heading/copy,
  memudar ke kanan supaya peta tetap jelas).
- `pointer-events:none` pada `.season-map` dan iframe: peta tidak menangkap
  wheel, smooth-scroll Lenis tidak terganggu. (Konsekuensi: peta tidak bisa
  di-zoom/drag — sesuai pilihan statis.)

Terukur dari render (desktop 1440×900 / 1479×800 / 768 tablet / 390 mobile):

| Viewport | iframe = section | peta ter-render | kontras heading cyan | kontras copy putih |
|---|---|---|---|---|
| 1440×900 | 1440×900 | 91% colourful | 4,87:1 | 10,65:1 |
| 1479×800 | 1479×800 | 92% colourful | 4,53:1 | 11,21:1 |
| 768 tablet | 768×1024 | 77% colourful | 4,62:1 | 15,30:1 |
| 390 mobile | 390×680 | 62% colourful | 5,78:1 | 15,95:1 |

Heading adalah teks besar (syarat 3:1), jadi 4,5+:1 sudah aman. `spec.cjs`
tetap hijau: `errors []`, `http4xx []`, `imgsBad 0`, `hScroll false`,
`tlRows 7`, `canvases 8`, `imgsOk 19`. URL embed dicek terlebih dahulu:
**HTTP 200**. Peta butuh internet saat dibuka (situs sudah bergantung CDN).
Figure footer tetap `display:none` di ≤639px; peta SEASON **tetap tampil** di
mobile.

### 4b. SEASON — peta gelap (final, menggantikan iframe Google)

Permintaan: latar peta jadi hitam, yang muncul hanya peta Indonesianya —
"seperti terlihat lintasan, tapi peta". embed Google `pb=` **tidak bisa**
di-dark-theme, jadi opsi yang dipilih user: **ganti ke peta bertema gelap**
memakai **MapLibre GL JS 5.6.1 + gaya `dark` OpenFreeMap** (keyless; CORS `*`).

- `swap_season_darkmap.py`:
  - `<head>`: CSS + JS MapLibre dari unpkg (pin 5.6.1, eksternal — tidak di-inline).
  - `.season-map > iframe` → `.season-map-gl` + `.season-map-scrim` + kredit
    teks `© OpenStreetMap contributors · © OpenMapTiles` (ODbL).
  - `.circuit-frame { display:none }` **tetap** (syarat `seasonBlock()`).
  - `pointer-events:none`, `interactive:false`, semua control dimatikan; peta statis.
- Gaya OpenFreeMap di-`fetch`, lalu **dibersihkan & diwarnai ulang** sebelum
  `setStyle`:
  - layer `symbol` dan `fill-pattern` dibuang → **nol request glyph/sprite**;
  - source `ne2_shaded` (0 pemakai) dan `sprite` dibuang → nol request raster;
  - warna asli terbalik untuk kebutuhan ini: daratan `rgb(12,12,12)` **lebih
    gelap** dari laut `rgb(27,27,29)` (kontras 1,14:1). Diubah jadi daratan
    `rgb(72,78,88)`, laut `rgb(6,7,8)`, batas negara `rgb(110,116,128)`.
  - `fitBounds([[95,-11],[141.5,6]])` + re-fit saat resize → Indonesia utuh di
    semua viewport.
- Map dibangun **eager** dengan style kosong, lalu ganti setelah style selesai
  di-fetch → kanvas ada sejak awal, hitungan gate stabil. Guard
  `window.maplibregl` + `try/catch` + `map.on("error",…)` → kalau CDN/WebGL
  gagal, section tetap hitam tanpa `pageerror`/`console.error`.
- Scrim di-ringankan (tengah vertikal 0,30→0,18; kanan 0,10→0,04; kiri
  0,72→0,70) supaya daratan tampak, dengan fade atas/bawah 0,95 tetap.
- **Deviasi gate disengaja**: `canvases` **8 → 9** (1 kanvas WebGL MapLibre).
  Field lain tetap hijau: `errors []`, `http4xx []`, `imgsBad 0`,
  `hScroll false`, `tlRows 7`, `imgsOk 19`, desktop 1440 + mobile 390.

Terukur dari render (1440×900 / 1479×800 / 768 / 390):

| Viewport | daratan vs laut | kontras copy | kontrol | hScroll |
|---|---|---|---|---|
| 1440×900 | 1,72:1 | 9,01:1 | 0 | false |
| 1479×800 | 1,73:1 | 11,05:1 | 0 | false |
| 768 tablet | 1,80:1 | 7,03:1 | 0 | false |
| 390 mobile | 1,74:1 | 13,46:1 | 0 | false |

Laut ≈ `rgb(7,8,9)` (hitam, menyatu dengan `rgb(10 11 12)` section), daratan
≈ `rgb(53,57,64)`. WebGL diverifikasi `antialias:false`, ukuran buffer sama dengan
section, tidak ada 4xx/console error saat render. Butuh internet untuk CDN +
tile (situs sudah bergantung CDN).

### 4c. Timeline - RIWAYAT HIDUP (final)

Section "from campus / to career" diganti jadi **riwayat hidup** berisi 4
pendidikan + 1 pengalaman sesuai konten yang diberikan:

| # | Rentang (teks besar) | Isi |
|---|---|---|
| 1 | 2010 — 2016 | Sekolah Dasar Islam Al-Munawwarah · Elementary School |
| 2 | 2016 — 2019 | SMP Islam Pariskian · Junior High School |
| 3 | 2019 — 2022 | SMAN 6 Kota Serang · Senior High School |
| 4 | 2022 — 2026 | Universitas Bina Bangsa · S1 Sistem Informasi · E-Business Concentration |
| 5 | 2025 — 2026 | Full-Stack Web Developer Intern · Dinas Kominfo Banten · Laravel/PHP/MySQL |

- Label nav **education → riwayat** di 3 tempat (nav atas, footer nav, array
  `LINKS`); heading 2 baris `riwayat` / `hidup.`; komentar section ikut.
- Copy kini dirender di **semua** baris (sebelumnya hanya baris `centre`),
  dengan blok `# EDUCATION` / `# EXPERIENCE`, rentang, judul tebal, dan detail.
  Di desktop copy baris samping otomatis ditempatkan di seberang plat
  (`.align-left` / `.align-right`).
- Gambar untuk tahun baru (`2010`, `2016`, `2022`, `2025`) **404** di CDN,
  sehingga entri memakai field `img` yang memetakan ke 5 data-URI `TL_IMG`
  yang sudah ada — tidak ada request baru, `imgsBad 0`.
- Keputusan user: copy **tetap tampil di HP**, sehingga aturan lama
  `.tl-copy { display:none }` diganti layout statis di bawah plat. Layout
  stack ini diperluas ke **≤1023px** karena pada tablet copy panjang meluber
  dari baris pendek; rail disembunyikan ≤1023px supaya tidak mismatch.
- **Deviasi gate disengaja**: `tlRows` **7 → 5**, `imgsOk` **19 → 17**,
  `rvWords` 172 → 195, `srOnly` 38 → 36. Field lain tetap hijau:
  `errors []`, `http4xx []`, `imgsBad 0`, `hScroll false`, `canvases 9`,
  desktop 1440 + mobile 390.
- Terukur di 1440 / 768 / 390: kelima copy terlihat (opacity 1 setelah gate),
  tidak ada tumpang tindih plat/copy, tidak ada hScroll, semua gambar OK,
  tidak ada console/page error.

### 5. Bahasa F1/racing → bahasa portofolio + bendera Indonesia (final)

Semua kata F1/racing yang tidak relevan untuk portofolio diganti. Keputusan user:
**English saja**, **kata saja** (visual tetap), angka **diambil dari data riwayat**,
label nav **home / about / riwayat / proyek / kontak**.

| Sebelum | Sesudah |
|---|---|
| title `GRID01 Racing Systems`; meta `rookie Mercedes-AMG F1 season` | `Information Systems Portfolio`; deskripsi mahasiswa S1 Sistem Informasi + full-stack developer |
| nav `Driver · SEASON · next race · store · Garage` | `home · about · riwayat · proyek · kontak · say hello` (`#season-heading`/`#footer-heading` ikut dipetakan ulang) |
| hero: `flag-italy.webp` + `Italy` | **inline SVG merah `#CE1126`/putih**, `alt="Indonesia"` |
| hero: `icon-rookie.svg` + `rookie season_2026` | ikon grad-cap SVG inline + `Information Systems · 2026` |
| hero: `mercedes-logo.webp` + `Mercedes-AMG F1 Team` | ikon grad-cap SVG inline + `Universitas Bina Bangsa` |
| panel 1 `next race / belgian gp / spa-francorchamps / 27 jul 2026` | `current focus / information systems / universitas bina bangsa / 2022 — 2026` |
| panel 2 `Season stats — Races 12 / Podiums 3 / Points 118` | `profile stats — Schools 4 / Internship 1 / Years 16` |
| `watch trailer 01:26` | `explore portfolio / 5 sections`, target `#season-heading` |
| SEASON `the season / so far`, intro balapan, plate `F1 / 2026`, `P1 in the championship / 6 wins / 9 podiums` | `about / me`, intro Laravel-PHP-MySQL, plate `IS / 2026`, `4 schools completed / 1 internship / 16 years of study` |
| PADDOCK `from the / paddock`, laporan podium, `read story`, kartu `hungarian gp / silverstone` | `selected / work`, laporan Knowledge Base, `view project`, kartu `knowledge base system / dinas kominfo banten / nov 2025 — feb 2026` |
| paddock stats `P4 / +12 / P1 / 118` | `1 / 3 / 4 / 2026` (`experience / core stack / months / graduation`) |
| kalender `round 11–15` + GP Eropa | `01–05` + `elementary / junior high / senior high / university / internship`; highlight `live` dipindah ke kartu `university` |
| footer `GRID01 Racing Systems`, `legal documents`, veil `Loading Grido1…` | `Muhammad Annas Firman`, `view resume`, `Loading portfolio` |

- Kenapa SVG inline: `flag-indonesia.webp` **dan** `flag-id.webp` keduanya **404** di
  CDN, jadi pakai data-URI SVG merah/putih (nol request baru, nol `http4xx`). Ikon
  grad-cap juga inline dengan hex accent `#02d2e3` supaya tidak ada dependensi baru.
- Komentar CSS/HTML/JS ikut diganti (`2 — ABOUT`, `4 — SELECTED WORK`); class/ID
  CSS (`pw-f1`, `hero-garage`, `data-paddock`, `season-heading`, …) **sengaja dipertahankan**
  karena merupakan hook, bukan teks yang terlihat.
- Perbaikan fit kalender: teks baru lebih panjang dari nama GP lama. Di tablet kartu
  menyusut (lebar `cqw`, font min 17 px) sehingga kata meluber — ditambah override
  `.cal-*` 10 px hanya di 640–1023 px, dan kartu `05` dilebarkan `76 → 114`. Terukur
  semua nama/date muat di 1440 / 768 / 390, tidak ada tabrakan kartu, `live` tetap di
  kartu ke-4.
- **Deviasi gate terukur (bukan error)**: `hasHelmetText` **true → false** (kata
  "Mercedes" tak lagi ada di `textContent`; kanvas helmet 3D tetap ada), `rvWords`
  195 → **199**, `nav` memakai 5 label baru, `remoteImgs` 10 → **8**. `imgsOk`
  tetap **17**, `tlRows 5`, `canvases 9`.
- Field wajib tetap hijau: `errors []`, `http4xx []`, `imgsBad 0`, `hScroll false`,
  desktop 1440 + mobile 390. Cek tambahan `portfolio_copy_check.cjs` di
  1440/768/390: nol kata terlarang (`F1`, `paddock`, `podium`, `championship`,
  `Italy`, `GRID01`, `next race`, `store`, `Driver`, `SEASON`, …), nol teks wajib
  hilang, flag inline termuat, `liveIndex === 3`, nol console/page error.

### Adaptasi teknis yang menyertainya

1. `loadTexture()` kini menerima URL absolut/data URI: `file.indexOf("data:") === 0
   ? file : ASSETS + "/" + file`. Tanpa ini, data URI akan diprefix path CDN dan gagal
   (HTTP 400) — ini bug yang ketangkap pada run pertama.
2. Fallback tanpa WebGL (`hero-fallback`) ikut memakai foto Anda: `data-src` kini berisi
   data URI, dan JS-nya mendeteksinya sebelum menempel `ASSET_BASE_URL`.
3. Seluruh `href="/…"` multi-halaman dipetakan ke anchor satu halaman
   (`#hero`, `#season-heading`, `#timeline-heading`, `#paddock-heading`,
   `#footer-heading`) agar tidak ada link mati di satu file statis; array `LINKS`
   di menu mobile ikut.
4. Favicon SVG inline (data URI) supaya tidak ada request `/favicon.ico` yang gagal.
5. CTA hero "view profile": `svg.cta-arrow` beserta 7 baris CSS-nya dihapus sesuai
   permintaan. Border/chamfer SVG dan `.cta-flood` tetap; label jadi satu-satunya
   child dan otomatis center (`justify-content:center`, offset terukur 0 px di
   1440/768/390). Hover flood + perubahan warna label tetap berfungsi.

### 6. Copy kanonik EN/ID + switcher bahasa (final)

Permintaan: seluruh teks yang terlihat harus **murni Inggris** di mode `en` dan
**murni Indonesia** di mode `id` — tidak ada campuran. Visual (helm 3D, pita
bendera chequered, peta Indonesia, timeline, figure footer, CTA `view profile`
tidak berubah; foto circuit kemudian diganti diagram stack web (§8). Yang
diterjemahkan **hanya kata**.

#### Glosarium

| Kunci | English | Bahasa Indonesia |
|---|---|---|
| nav | `home · about · journey · projects · contact · get in touch →` | `beranda · tentang · riwayat · proyek · kontak · hubungi saya` |
| title | `MUHAMMAD ANNAS FIRMAN — Information Systems Portfolio` | `MUHAMMAD ANNAS FIRMAN — Portofolio Sistem Informasi` |
| hero | `Information Systems · 2026`, `current focus`, `information systems`, `universitas bina bangsa`, `profile stats`, `Schools / Internship / Years`, `explore portfolio · 6 sections`, `view profile` | `Sistem Informasi · 2026`, `fokus saat ini`, `sistem informasi`, `universitas bina bangsa`, `statistik profil`, `Sekolah / Magang / Tahun`, `jelajahi portofolio · 6 bagian`, `lihat profil` |
| about | `about / me.`, intro Laravel-PHP-MySQL, `schools completed / internship / years of study.` | `tentang / saya.`, intro Laravel-PHP-MySQL, `sekolah selesai / magang / tahun belajar.` |
| timeline | `my / journey.`, `Education / Experience`, `Elementary / Junior High / Senior High School`, `Bachelor of Information Systems…`, `Full-Stack Web Developer Intern`, `November 2025 — February 2026`, detail Knowledge Base | `riwayat / hidup.`, `Pendidikan / Pengalaman`, `Sekolah Dasar / SMP / SMA`, `Sarjana Sistem Informasi…`, `Magang Full-Stack Web Developer`, `November 2025 — Februari 2026`, detail sistem Knowledge Base |
| work | `selected / work.`, `view project`, `experience / core stack / months / graduation` | `karya / terpilih.`, `lihat proyek`, `pengalaman / stack utama / bulan / lulus` |
| meet card | `knowledge base system · dinas kominfo banten · nov 2025 — feb 2026` | `sistem knowledge base · dinas kominfo banten · nov 2025 — feb 2026` |
| calendar | `elementary / junior high / senior high / university / internship` | `SD / SMP / SMA / Kuliah / Magang` |
| footer | `keep pushing / forward.`, `view resume`, `© 2026 … All rights reserved.` | `terus / bergerak maju.`, `lihat CV`, `© 2026 … Seluruh hak cipta dilindungi.` |
| a11y | `Primary / Footer / Open menu / Close menu / Loading portfolio / Language` | `Navigasi utama / Navigasi bawah / Buka menu / Tutup menu / Memuat portofolio / Bahasa` |

**Kata yang sengaja identik di kedua bahasa** (proper noun / fakta, tidak
diterjemahkan): `Annas_001`, `MUHAMMAD ANNAS FIRMAN`, `Universitas Bina Bangsa`,
`Sekolah Dasar Islam Al-Munawwarah`, `SMP Islam Pariskian`, `SMAN 6 Kota Serang`,
`Dinas Komunikasi, Informatika, Statistik dan Persandian Provinsi Banten`,
`IS / 2026`, `Knowledge Base`, rentang tahun `2010 — 2016` … `2025 — 2026`.
Angka tetap dari data riwayat: `Schools 4`, `Internship 1`, `Years 16`; paddock
`1`, `3`, `4`, `2026`. Kredit ODbL `.season-map-credit` tetap terlihat.

#### Switcher

- Pill `EN / ID` ditempatkan di `.hero-head`, **di luar** `.hero-nav`, supaya
  `spec.cjs` tetap menghitung tepat 5 tautan nav. Di ≤1279 px switcher
  dicerminkan ke dalam `.sheet-top` menu burger (sama-sama `aria-pressed`).
- Tombol memakai `role="group"`, `aria-label` terlokalikan, dan `aria-pressed`
  yang disinkronkan di kedua switcher. Aktif = cyan, nonaktif = 50% opacity;
  fokus/hover memakai token `--accent` dan `--duration-fast`.
- Urutan resolusi bahasa awal: `?lang=id|en` → `localStorage['lang']` →
  `navigator.language` (prefix `id`) → `en`. `applyLang()` menyimpan pilihan
  ke `localStorage`, mengubah `document.documentElement.lang`, `document.title`,
  dan meta description.

#### Mesin i18n

- Kamus datar `I18N = { en, id }` dengan akses `t(key)` berbasis dotted-key;
  aksen `'` (bukan `&rsquo;`) dipakai di dictionary supaya teks hasil reveal
  sama persis dengan sumber `.sr-only`.
- Node statis/dihasilkan memakai `data-i18n="key"`; node bernilai HTML memakai
  `data-i18n-html="key"` (detail timeline); atribut memakai
  `data-i18n-attr="attr:key"` (`aria-label`, `alt`). `applyLang()` melakukan
  swap in-place tanpa me-render ulang baris/gambar/kanvas.
- Konten generatif ikut diterjemahkan di tempat: `TIMELINE`, `CAL_ROUNDS`,
  paddock `STATS` + meet card, `LINKS` sheet, `alt` gambar timeline, dan semua
  aria-label. Gate `tlRows 5`, `canvases 9` tidak berubah.
- **`setText()` vs reveal engine**: `buildReveal()` memecah teks menjadi
  `.rv-u` dan menyimpan aslinya di `.sr-only`, dengan `data-rv-done` agar tidak
  di-init ulang. Saat bahasa berganti, `setText()` membuka dan memecah ulang
  node `.rv` yang sudah selesai. Bug ditemukan dan diperbaiki: `data-rv=""`
  adalah string kosong (falsy), sehingga pengecekan harus
  `el.hasAttribute("data-rv") && el.dataset.rvDone`, bukan `el.dataset.rv`.
  Tanpa ini teks berubah tapi `.sr-only`/`.rv-u` hilang setelah toggle.

#### Deviasi gate per bahasa

Gate wajib `spec.cjs` (default/EN, 1440 + 390): `errors []`, `http4xx []`,
`imgsBad 0`, `hScroll false`, `tlRows 5`, `canvases 9`, `imgsOk 17`,
`rvWords 202`, `srOnly 36`, `hasHelmetText false`, `remoteImgs 8`.
Mode `id` tidak mengubah angka-angka tersebut — hanya string. Field yang
berubah sesuai bahasa: `title`, meta description, `lang`, 5 label nav,
`aria-label`, dan `alt` timeline. Tidak ada error/4xx/overflow baru di kedua
bahasa pada 1440 / 768 / 390.

#### Verifikasi bilingual

| Cek | Hasil |
|---|---|
| `node --check` modul yang diekstrak | OK |
| `spec.cjs` (1440 + 390, EN) | hijau, angka di atas |
| `i18n_check.cjs` (`?lang=en` + `?lang=id` @ 1440/768/390) | `missing []`, `leftovers []`, `clipped 0`, `calOverlaps 0`, `overflow false`, `errs 0` |
| Toggle header EN→ID→EN | nav, `aria-pressed`, heading, `sr-only`/`.rv-u`, aria-label ikut berganti; teks reveal tersusun ulang |
| `localStorage` persistence | `lang=id` bertahan setelah reload tanpa query |
| Switcher sheet (390) | nav sheet ID, `Tutup menu`, pressed state header & sheet sinkron |
| `reveal_check.cjs` | `broken 0`, `errs 0` — `.sr-only` dan `.rv-u` hadir & cocok di semua phase |

`i18n_check.cjs` kini **menggantikan** tiga skrip lama yang ekspektasinya
sudah basi (`portfolio_copy_check.cjs`, `tl_content_check.cjs`,
`copy_geom_check.cjs`): kata terlarang F1 dan proper noun diuji per bahasa,
heading diuji dari `.sr-only` yang sudah di-reveal (bukan `textContent`
mentah), dan deteksi tumpang-tindih kalender ikut dimasukkan. Skrip lama
dibiarkan apa adanya sebagai arsip, bukan gate.

### 7. Showcase "Projects & Certificates" (final)

Section keenam ditambahkan setelah `selected work` dan sebelum footer untuk
menampung sertifikat serta proyek lain di luar satu proyek magang yang sudah
diceritakan di paddock. Nav atas dan footer **tetap lima tautan** — gate
`spec.cjs` tidak berubah. Tombol `view project` di paddock kini melompat ke
`#showcase` (sebelumnya menunjuk ke dirinya sendiri).

#### Keputusan

| Hal | Keputusan | Alasan |
|---|---|---|
| Konten awal | 4 kartu: 1 proyek nyata + 3 placeholder | User mengisi data sendiri nanti; tidak ada angka/klaim baru yang dibuat-buat |
| Penempatan | Section baru `#showcase`, nav tetap 5 | Menjaga ekspektasi `spec.cjs` |
| Visual | Ikon SVG inline, tanpa `<img>`/`<canvas>` baru | `imgsOk 17`, `remoteImgs 8`, `canvases 9` tidak berubah |
| Filter | `<button aria-pressed>` asli, `flex-wrap`, focus ring 2px | Keyboard + focus terlihat; label tidak terpotong saat bahasa berubah |
| Layout | 2 kolom ≥768px, 1 kolom <768px | Kartu tetap readable di 390px |
| Bahasa | Satu kunci `showcase.*` per bahasa; node generate pakai `data-i18n` | Toggle EN/ID langsung tanpa render ulang |

Satu-satunya proyek nyata memakai fakta yang sudah ada: sistem Knowledge Base
di Dinas Kominfo Banten, `2025 — 2026`, Laravel/PHP/MySQL. Tiga kartu lain
ditandai eksplisit `placeholder — replace with your details` /
`placeholder — ganti dengan detail Anda`.

#### Cara mengisi placeholder

Semua entri ada di satu array `SHOWCASE` di akhir modul:

```js
const SHOWCASE = [
  { id: "kb-system", type: "project", year: "2025 — 2026", href: "#paddock-heading" },
  { id: "project-slot", type: "project", year: "—", placeholder: true },
  { id: "certificate-slot-1", type: "certificate", year: "—", placeholder: true },
  { id: "certificate-slot-2", type: "certificate", year: "—", placeholder: true },
];
```

- `id` → kunci teks di `I18N.en.showcase.cards` **dan** `I18N.id.showcase.cards`.
- `type` → `project` atau `certificate` (menentukan ikon dan filter).
- `year` → bebas diisi; pakai `—` untuk menandakan tahun belum ada.
- `href` → opsional; jika diisi, kartu mendapat tautan `view detail`.
- `placeholder: true` → memunculkan badge placeholder; hapus setelah data asli diisi.

Menambah kartu = menambah entri + satu kunci teks per bahasa. Filter otomatis
mengikuti `type`; tidak ada hard-coded jumlah kartu.

#### Verifikasi showcase

| Cek | Hasil |
|---|---|
| `spec.cjs` (1440 + 390) | hijau; `errors []`, `http4xx []`, `imgsBad 0`, `hScroll false`, `tlRows 5`, `canvases 9`, `imgsOk 17` |
| `rvWords` / `srOnly` | 202→**205**, 36→**38** (3 unit kata + 2 `.sr-only` dari heading baru) |
| `i18n_check.cjs` (EN/ID @ 1440/768/390) | `missing []`, `leftovers []`, `clipped 0`, `overflow false`, `errs 0` |
| `showcase_check.cjs` | 4 kartu, tipe `project/project/certificate/certificate`, 2 kolom desktop & tablet / 1 kolom mobile, tanpa clipping |
| Keyboard | Tab sampai chip mendapat `:focus-visible` (outline solid 2px); Enter & Space mengubah `aria-pressed` dan menyaring kartu |
| Toggle EN→ID pada kartu generate | teks, badge, placeholder, dan filter ikut berganti |
| `prefers-reduced-motion` | 0 dari 7 unit reveal/naik tersisa dengan opacity < 1 |
| Kontrast teks | minimum **9.08:1** (semua selector showcase, desktop & mobile) |

`remove-ai-slops` dijalankan **terbatas hanya pada blok baru** di `index.html`.
Hasilnya: sentinel `year: ""` + fallback `|| "—"` diganti nilai `—` eksplisit,
dan pemanggilan `wireEntrance(grid)` yang duplikat dengan `wireEntrance(document)`
dihilangkan. Guard klik filter, `data-placeholder`, override reduced-motion,
`inView(... fireGate("showcase"))`, ikon SVG, dan `:focus-visible` sengaja
dipertahankan karena semuanya load-bearing. Semua gate di atas dijalankan ulang
setelah pembersihan dan tetap hijau.

Aturan ">250 pure LOC" tidak dipakai karena file ini memang disengaja
single-file; pengecualian ini dicatat, bukan dijadikan alasan refactor seluruh
file.

### 8. Hero — circuit diganti diagram stack web (final)

Permintaan: gambar circuit di panel kanan hero diganti visual bertema
portofolio. Dipilih **diagram stack web** — tiga plate chamfer
`browser → API → database` dengan konektor putus-putus cyan.

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Node | `<img data-hero-map src="…/circuit-spa.webp">` | `<svg data-hero-map viewBox="0 0 312 199" aria-hidden="true">` |
| Request | 1 gambar remote | 0 (SVG inline) |
| Aksesibilitas | `alt=""` | `aria-hidden="true"`, `focusable="false"` — dekoratif; teks di sampingnya sudah menjelaskan |
| CSS | `object-fit` / `object-position` | dihapus; ukuran box & breakpoint tidak berubah |

SVG memakai `currentColor` untuk struktur dan `var(--accent)` untuk konektor,
tanpa teks di dalamnya — jadi tidak ada string i18n baru. `.circuit-frame` di
section SEASON tetap `display:none` dan tidak disentuh.

Dampak gate: `imgsOk 17→16`, `remoteImgs 8→7`; field lain tetap (`errors []`,
`http4xx []`, `imgsBad 0`, `hScroll false`, `tlRows 5`, `canvases 9`, nav 5,
`rvWords 205`, `srOnly 38`).

Verifikasi: `node --check`, `spec.cjs`, `i18n_check.cjs`, `showcase_check.cjs`,
`reveal_check.cjs`, `hero_svg_check.cjs` — semuanya hijau. Geometri SVG 78×50 px
di 1440 / 768 / 720, 0 px di 390 (panel memang hidden), tanpa overflow.

### 9. Skills marquee infinite di slide "my journey" (final)

Permintaan: daftar 21 skill ditambahkan sebagai marquee loop tanpa mengubah
elemen yang sudah ada.

| Aspek | Implementasi |
|---|---|
| Posisi | Blok baru setelah `[data-tl-rows]`, masih di dalam `.tl-wrap` / `[data-timeline]` |
| Konten | 21 skill persis sesuai daftar; dua set identik, set ke-2 `aria-hidden="true"` |
| Loop | `translate3d(0) → translate3d(-50%)` pada track berisi dua set sama lebar, sehingga sambungannya mulus |
| Aksesibilitas | `role="group"` + `aria-label`, tombol jeda/play dengan `aria-pressed`, label ikut berganti bahasa |
| Gerak | 34s linear infinite; jeda saat `:hover` / `:focus-within`; `prefers-reduced-motion` mematikan animasi, menyembunyikan duplikat, dan membuat viewport scroll horizontal |
| Gaya | Token timeline yang sudah ada: `--surface-black`, `--foreground-on-dark`, `--accent`, `--font-display`, dengan fade tepi via `mask-image` |

Tidak ada `<img>`, `<canvas>`, `data-rv`, atau `.sr-only` baru, jadi semua field
gate tetap: `errors []`, `http4xx []`, `imgsBad 0`, `hScroll false`, `tlRows 5`,
`canvases 9`, `rvWords 205`, `srOnly 38`, `imgsOk 16`, `remoteImgs 7`. Key I18N
baru hanya tiga (`skills.label`, `skills.pause`, `skills.play`) untuk label
aksesibilitas — nama skill sengaja identik di EN/ID karena proper noun teknis.

Verifikasi: `node --check`, `spec.cjs`, `i18n_check.cjs`, `showcase_check.cjs`,
`reveal_check.cjs`, `hero_svg_check.cjs`, `marquee_check.cjs`, dan
`marquee_i18n_check.cjs` — semuanya hijau. Probe marquee di 1440 / 768 / 390:
21 item per set, lebar kedua set identik (sambungan eksak), tidak overlap dengan
baris terakhir, tanpa hScroll, animasi berjalan, hover menjeda, toggle mengubah
`aria-pressed`, label, dan ikon. Reduced-motion: `animation:none`, duplikat
tersembunyi, toggle tersembunyi, ke-21 item tetap dapat diakses via scroll.

### 10. Form kontak `mailto:` di footer (final)

Permintaan: kartu "New Portfolio Contact Message" di section terakhir dengan
Sender Name, Sender Email, Subject, Message, dan Submission Date, dengan email
pengirim mudah diakses untuk membalas. Dipilih **form `mailto:`**, bukan
backend, karena file tetap single-file.

| Aspek | Implementasi |
|---|---|
| Posisi | Trigger + panel hanya di dalam `[data-footer]`, setelah `.ft-socials` |
| Trigger | Chamfered `.slab` kecil, `aria-expanded` + `aria-controls`,default tertutup supaya figur helm tidak tertutup |
| Panel | `role`-less overlay dengan judul, tombol tutup, dan 4 field (`Submission Date` dihasilkan otomatis saat submit) |
| Pengiriman | `window.location.href = mailto:` ke `CONTACT_TO`, subject `New Portfolio Contact Message — <subjek> — <nama>` |
| Balasan | `Reply to: <email>` menjadi **baris pertama body** dan diulang di akhir; klien email otomatis menjadikannya tautan |
| Lokal | Tanggal memakai `toLocaleString` `en-US` / `id-ID`; seluruh label & body mengikuti `LANG` |
| A11y | Fokus masuk ke field pertama saat buka, kembali ke trigger saat tutup; `Escape` dan klik di luar menutup; `:focus-visible` pada semua kontrol |

`CONTACT_TO = "muhannasfirman28@gmail.com"` — email asli pemilik portofolio
sudah dipasang (placeholder `your.email@example.com` dan TODO-nya dihapus).
Tidak ada `<img>`, `<canvas>`, `data-rv`, atau
`.sr-only` baru, sehingga semua field gate tetap (`rvWords 205`, `srOnly 38`,
`imgsOk 16`, `canvases 9`, `tlRows 5`, `errors []`, `http4xx []`, `hScroll false`).

Verifikasi: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, dan `contact_check.cjs` — semuanya
hijau. Probe kontak di 1440 / 768 / 390: trigger tidak menimpa logo, judul,
nav, copy, CTA, maupun sosial; buka/tutup, `aria-expanded`, fokus, Escape, dan
validasi kosong benar. Isi `mailto:` EN dan ID memuat kelima field dengan email
pengirim di baris pertama dan terakhir.

### 11. Foto "selected work" → `Young Man in Black Hoodie Cutout.png`

Permintaan: ganti foto di section **selected work** (`[data-paddock]`) dengan file
yang dikirim, lalu sesuaikan. File asli `1247×1261` RGBA, ±1,66 MB, dengan
subjek cutout transparan yang memenuhi ~94% lebar kanvas dan mulai ~4% dari atas.

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Sumber | WebP data URI lama (81.711 karakter) | `Young Man in Black Hoodie Cutout.png` |
| Konversi | — | Pillow WebP RGBA, resize 0,85 → **1060×1072**, `quality=78`, `method=6`, alpha lossy (`exact=False`) |
| Base64 | 81.711 | 100.843 karakter (+19 KB) |
| `aspect-ratio` | `1.15881` | `1060/1072` (rasio asli gambar baru) |
| `object-fit` | `cover` | `contain` — cutout tidak dipangkas secara internal |
| `--fig-fit` | default `1` | `0.94` di `[data-paddock]` (desktop: kepala tidak terpotong saat parallax) |
| Tablet `--fig-x-override` | `65.7%` | `50%` (pemotongan kiri/kanan simetris, 67 px per sisi) |
| Mobile `--fig-x-override` | `48.5%` | `50%` (simetris, 101 px per sisi — lebih sedikit dari foto lama) |

Ukuran final `index.html`: **854,0 KB** (sebelumnya 835,3 KB). Tetap single-file:
gambar ditanam sebagai `data:image/webp;base64,...`, bukan file eksternal.
Elemen `<img class="pd-fig">` tetap satu-satunya dan tetap berada di dalam
`[data-pd-fig-layer]` yang `aria-hidden`, jadi tidak menambah `imgsOk`,
`remoteImgs`, atau atribut a11y baru. `rebuild.py` tidak dijalankan.

Verifikasi: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, `marquee_i18n_check.cjs`,
`contact_check.cjs`, `hero_svg_check.cjs` — semuanya hijau. Probe khusus
`paddock_fig_check.cjs` di 1440 / 768 / 390: gambar termuat (`naturalWidth 1060`),
`errors []`, `hScroll false`, tidak ada clipping vertikal; desktop figur seluruhnya
di dalam section (`519..1373` dari `1440`), tablet dan mobile memotong simetris
sesuai desain full-bleed. Nilai gate terdokumentasi tidak berubah: `rvWords 205`,
`srOnly 38`, `imgsOk 16`, `imgsBad 0`, `remoteImgs 7` (sebelum §12), `tlRows 5`,
`canvases 9`, `errors []`, `http4xx []`, `hScroll false`.

### 12. Lambang stat "selected work" → ikon semantik

Permintaan: lambang pada baris stat **experience / core stack / months /
graduation** diganti yang berkaitan agar nyambung dengan labelnya.

| Label | Sebelum | Sesudah |
|---|---|---|
| experience / pengalaman | `icon-flag.svg` | briefcase |
| core stack / stack utama | `icon-bars.svg` | tumpukan layer |
| months / bulan | `icon-trophy.svg` | kalender |
| graduation / lulus | `icon-gauge.svg` | topi wisuda |

Folder aset remote hanya berisi ke-4 ikon balapan lama; nama ikon semantik
(`icon-briefcase`, `icon-code`, `icon-calendar`, `icon-graduation`, dll.)
menghasilkan 404. Karena itu ikon baru dibuat sebagai SVG solid cyan `#02D2E3`,
viewBox `0 0 31 31`, dan ditanam di `STATS` sebagai
`data:image/svg+xml;charset=utf-8,<encoded>` lewat helper `svgIcon()`. Elemen
`<img width="31" height="31" alt="" aria-hidden="true">` tetap dipakai, jadi
struktur DOM dan aksesibilitas tidak berubah; `ASSET_BASE_URL` masih dipakai
untuk aset lain.

Dampak gate yang disengaja: **`remoteImgs 7 → 3`** (empat ikon tidak lagi
remote). Field lain tetap: `imgsOk 16`, `imgsBad 0`, `rvWords 205`,
`srOnly 38`, `tlRows 5`, `canvases 9`, `errors []`, `http4xx []`,
`hScroll false`. Probe `stat_icons_check.cjs` di 1440 / 768 / 390: 4 baris,
ke-4 ikon `loaded: true` dengan `naturalWidth 31`, kotak `31x31` di desktop &
tablet, tidak ada response 4xx. Di mobile panel stat memang disembunyikan
(perilaku lama), sehingga kotak ikon dilaporkan `0x0` — bukan regresi.

Verifikasi: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, `marquee_i18n_check.cjs`,
`contact_check.cjs`, `hero_svg_check.cjs`, `paddock_fig_check.cjs` — semuanya
hijau. `rebuild.py` tidak dijalankan.

### 13. Tautan GitHub/LinkedIn dan Download CV

Permintaan: tambah GitHub & LinkedIn di bagian contact, dan tombol **Download CV**
di home yang bisa langsung diklik pengunjung.

| Bagian | Implementasi |
|---|---|
| Contact (footer) | `.ft-socials` sekarang 5 tautan: `inst`, `x`, `youtube`, `github`, `linkedin` |
| URL GitHub/LinkedIn | Placeholder `https://github.com/your-username` dan `https://linkedin.com/in/your-profile`, diberi komentar `TODO: ganti dengan profil GitHub dan LinkedIn kamu` |
| Home (hero) | `.hero-cta-group` baru membungkus CTA `view profile` + tautan `download CV`; grid 3 kolom `.hero-actions` tetap utuh |
| Download CV | `<a class="hero-download" href="cv.pdf" download>` dengan ikon unduh inline; fokus-visible dan hover accent |
| File CV | **Tidak dibuat** — TODO di markup: taruh `cv.pdf` di folder yang sama dengan `index.html`. Sebelum file ada, klik akan 404 (gate tidak terpengaruh karena `<a>` tidak di-fetch otomatis) |
| I18N | `hero.downloadCv`: EN `download CV`, ID `unduh CV`. Nama `github`/`linkedin` adalah proper noun identik di kedua bahasa |

Probe `contact_cv_check.cjs` di EN/ID × 1440/768/390: tautan `href="cv.pdf"` +
atribut `download` benar; grup CTA sejajar dengan CTA lama (220 px desktop/tablet,
342 px mobile), tidak menimpa trailer maupun sosial hero; 5 tautan footer tidak
menimpa judul, nav, CTA, copy, maupun trigger kontak; `hScroll false`; `bad []`.

Gate: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, `marquee_i18n_check.cjs`,
`contact_check.cjs`, `hero_svg_check.cjs`, `paddock_fig_check.cjs`,
`stat_icons_check.cjs` — semuanya hijau. Tidak ada `<img>`/`<canvas>`/`<a>` baru
yang dihitung gate (kecuali tautan biasa), sehingga `imgsOk 16`, `remoteImgs 3`,
`rvWords 205`, `srOnly 38`, `tlRows 5`, `canvases 9`, `errors []`, `http4xx []`,
`hScroll false` tetap. `rebuild.py` tidak dijalankan.

### 14. Hapus Instagram/YouTube & pindahkan Download CV ke bawah nama

Permintaan: Instagram dan YouTube dihapus; tombol Download CV yang sebelumnya
berupa tautan teks kecil di `.hero-actions` tidak terlihat, jadi dipindah.

| Perubahan | Detail |
|---|---|
| Sosial hero | `.hero-socials` sekarang hanya `x` (`inst`, `youtube` dihapus) |
| Sosial footer | `.ft-socials` sekarang `x`, `github`, `linkedin`; `inst`, `youtube` dihapus |
| Download CV | Tautan teks `.hero-download` dihapus; tombol `.cta cta-download` baru dipasang di dalam `.hero-identity`, tepat setelah `</ul>` `.hero-meta` (di bawah nama + info Indonesia/field/school) |
| Tampilan tombol | Chamfered penuh mengikuti `.cta` (220×50 desktop/tablet, 342×56 mobile), ikon unduh inline di dalam `.cta-label`, `href="cv.pdf" download`, `TODO` file CV tetap |
| CSS lama dihapus | `.hero-cta-group`, `@media (min-width:640px)`-nya, `.hero-download` + hover/svg/focus-visible |
| CSS baru | `.cta-download { margin-top: 1rem }`, label flex dengan ikon, `:focus-visible` |
| Jarak desktop | `.hero-identity` (≥1280 px) dulu `gap: 6.0625rem` sehingga tombol melayang 97 px di bawah meta; gap diubah ke `0` dan `6.0625rem` dipindah ke `margin-top` `.hero-meta` — jarak nama↔meta tetap 97 px, jarak meta↔tombol jadi 16 px |

Probe `hero_cv_probe.cjs` + `contact_cv_check.cjs` di EN/ID × 1440/768/390:
tombol `visible: true`, `dlTextFits: true`, `gapMetaDl 16`, `href="cv.pdf"`,
`download` ada; tidak menimpa nama, meta, panel, maupun `.hero-actions`; sosial
hero persis `["x"]`, sosial footer persis `x/github/linkedin`; `hScroll false`,
`bad []`.

Gate: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, `marquee_i18n_check.cjs`,
`contact_check.cjs`, `hero_svg_check.cjs`, `paddock_fig_check.cjs`,
`stat_icons_check.cjs` — semuanya hijau. Nilai gate tidak berubah:
`imgsOk 16`, `imgsBad 0`, `remoteImgs 3`, `rvWords 205`, `srOnly 38`,
`tlRows 5`, `canvases 9`, `errors []`, `http4xx []`, `hScroll false`.
`rebuild.py` tidak dijalankan.

### 15. Pill switch EN/ID melayang + sinkron URL

Permintaan: dibuat fitur switch agar bisa tinggal ganti-ganti EN/ID; pilihan:
pill melayang yang selalu terlihat, dan URL ikut diperbarui.

Catatan: switch `EN / ID` di header sudah ada dan ternyata tampil di semua
breakpoint (di 390 px berada di x197–266, y25–61), tetapi ikut hilang saat
scroll. Jadi penambahan bersifat **additive** — switch lama dipertahankan.

| Item | Implementasi |
|---|---|
| Markup | `.lang-float` statis sebelum `<script type="module">`, `role="group"`, `data-i18n-attr="aria-label:a11y.language"`, 2 tombol `data-lang="en|id"` dengan `aria-pressed` |
| CSS | `position: fixed; right: 1rem; bottom: 8.5rem; z-index: 40` (di bawah veil/menu 50 & asset banner 90), background gelap + border accent, hover/`focus-visible` memakai `.lang-btn` yang sudah ada |
| Posisi | Diukur aman di 1440/768/390 saat hero maupun footer: kotak 84×38 px di x1340/668/290, `hits: []` terhadap header, hero actions, panel stat, `.cta-download`, footer socials/CTA, dan trigger contact |
| Form contact | `body:has(#contact-panel:not([hidden])) .lang-float { opacity: 0; pointer-events: none; }` — pill mengalah saat panel mailto dibuka |
| JS | Tidak ada binding baru: `bindLangButtons(document)` sudah mengikat semua `[data-lang]` |
| URL | `applyLang(lang, updateUrl = true)` kini `history.replaceState()` dengan `new URL(location.href)` + `searchParams.set("lang", lang)`, menjaga query/hash lain, dibungkus `try/catch` untuk `file://`. Panggilan awal diubah jadi `applyLang(LANG, false)` agar URL tetap bersih sampai pengguna benar-benar mengklik |

Probe `lang_float_check.cjs` di 1440/768/390: `floatCount 1`, `visible true`,
tidak ada overlap; awal `urlHasLang false`; klik ID → `?lang=id`, `<html lang="id">`,
nav `beranda`, tombol CV `unduh CV`; klik EN → `?lang=en`, `home`, `download CV`.
`aria-pressed` ke-4 tombol (header + pill) selalu sinkron. Saat panel contact
dibuka: `opacity 0`, `pointerEvents none`. `bad []`, `hScroll false`.

Gate: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, `marquee_i18n_check.cjs`,
`contact_check.cjs`, `hero_svg_check.cjs`, `paddock_fig_check.cjs`,
`stat_icons_check.cjs`, `contact_cv_check.cjs` — semuanya hijau. Nilai gate
tidak berubah: `imgsOk 16`, `imgsBad 0`, `remoteImgs 3`, `rvWords 205`,
`srOnly 38`, `tlRows 5`, `canvases 9`, `errors []`, `http4xx []`,
`hScroll false`. `rebuild.py` tidak dijalankan.

### 16. Pill dipindah ke atas & switch lama disembunyikan

Permintaan: pill di kanan bawah menghalangi teks; dipindah ke bagian atas dan
switch lama tidak dipakai lagi.

| Perubahan | Detail |
|---|---|
| Posisi pill | `bottom: 8.5rem; right: 1rem` → `top: 0`, dipadatkan jadi 79×28 px (`min-height` tombol 1.5rem, padding 0.05rem) |
| Offset | <1280 px: `right: 5rem` (x609 tablet, x231 mobile) — lepas dari logo & burger. ≥1280 px: `right: 20rem` (x1105) — panel stat punya parallax dan bergeser sampai x1143 saat scroll, jadi pill sengaja lebih kiri |
| Switch lama | `.hero-head .lang-switch` dan `.sheet-top .lang-switch` → `display: none`. Elemen tetap di DOM (sheet dibuat JS), jadi binding & `aria-pressed` tidak berubah |
| Sheet | `.sheet-top .sheet-close { margin-left: auto; }` menggantikan `margin-left:auto` yang dulu ada di switch, agar tombol close tetap di kanan |
| Efek samping layout | Switch header lama menyumbang tinggi ~36 px; setelah disembunyikan header turun ke y≈24 (390 px), sehingga burger ikut naik — itulah sebabnya pill tidak bisa lagi `right: 2px` |

Probe `lang_float_check.cjs` di 1440/768/390, scroll atas/tengah/bawah: pill
`visible true`, `hits []` terhadap logo, nav, switch lama, `hero-garage`,
burger, hero actions, panel stat, `.cta-download`, footer socials/CTA, dan
trigger contact; `hScroll false`; `bad []`. Switch header `display: none` di
ketiga breakpoint, switch sheet `display: none` di tablet/mobile, tombol close
sheet tetap di kanan. Klik ID/EN tetap mengubah teks + `?lang=id|en`, dan pill
memudar saat form contact terbuka.

Gate: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, `marquee_i18n_check.cjs`,
`contact_check.cjs`, `hero_svg_check.cjs`, `paddock_fig_check.cjs`,
`stat_icons_check.cjs`, `contact_cv_check.cjs`, `hero_cv_probe.cjs`,
`lang_float_check.cjs` — semuanya hijau. Nilai gate tidak berubah:
`imgsOk 16`, `imgsBad 0`, `remoteImgs 3`, `rvWords 205`, `srOnly 38`,
`tlRows 5`, `canvases 9`, `errors []`, `http4xx []`, `hScroll false`.
`rebuild.py` tidak dijalankan.

### 17. Lima plat "my journey" yang benar-benar berbeda (semua foto)

Permintaan akhir: **foto saja**, jangan gambar circuit/motif, tapi tetap beda
satu sama lain. (Iterasi antara sempat memakai 3 motif + 2 foto dan disetujui
sebagai "campuran"; user lalu membatalkannya — iterasi itu tidak dipertahankan.)

Masalah awal: `TL_IMG` sebenarnya sudah berisi 5 data URI berbeda, tetapi
kelimanya berasal dari satu foto yang sama dengan gradien gelap + glow + crop
yang mirip. Rata-rata RGB ≈ 41–70 dan jarak piksel terdekat hanya **12**, jadi
secara visual terbaca sebagai satu gambar yang diulang.

| Baris | Tahun | Perlakuan foto | Pencahayaan |
|---|---|---|---|
| 1 | 2010—2016 | subjek kecil di kanan, *wide low-key* | glow cyan kiri-bawah |
| 2 | 2016—2019 | foto dibalik, crop sisi kiri, duotone ice-cyan | glow ice kanan-atas |
| 3 | 2019—2022 | fragmen sisi wajah, hampir monokrom | glow cyan kiri |
| 4 | 2022—2026 | potret medium lebar, duotone cyan-ice | glow cyan kanan-bawah |
| 5 | 2025—2026 | close-up kontras tinggi | glow cyan kiri-atas |

Baris 3 sengaja bukan close-up wajah supaya tidak menyerupai baris 5. Baris 4–5
dipertahankan dari iterasi sebelumnya; baris 1–3 diganti dari motif ke foto.

| Aspek | Awal | Final |
|---|---|---|
| Sumber | 5× foto yang sama, beda crop/glow | 5× perlakuan foto yang sama, crop + grade + arah cahaya beda |
| `minDiff` (jarak piksel 12×12 antar pasangan) | 12 | **26** (10 pasangan semuanya ≥26) |
| Ukuran plat | 1420×1016 | 1420×1016 (tetap) |
| `alt` EN/ID | generik `education 1…5` | mendeskripsikan perlakuan foto, EN/ID terpisah |
| `remoteImgs` | 3 | 3 (semua plat tetap data URI) |

Perlakuan dirender deterministik lewat canvas di Playwright lalu diekspor ke
WebP q82 dan ditanam sebagai data URI. Sengaja **tidak** memakai image generator
untuk wajah sintetis: portofolio ini memakai foto Anda sendiri. Token tetap
`--accent` cyan `#02d2e3`, ice, dan dasar ink `#090a0b`; grain + vignette
dipertahankan agar kelima plat tetap satu tema.

Perubahan dibatasi pada 5 string di `TL_IMG` dan 10 string `alt` di
`COPY_EN`/`COPY_ID` (6 di antaranya diperbarui saat motivasi diganti dari motif
ke foto). Tidak ada helper, abstraksi, dependency, komentar baru, atau
perubahan markup/CSS/logika parallax. Fallback
`ASSET_BASE_URL + '/timeline/' + (entry.img || entry.year) + '.webp'` sengaja
dibiarkan.

Probe `tl_images_check.cjs` di 1440/768/390 × EN/ID: `rows 5`, `count 5`,
`loaded 5` (semua `naturalWidth 1420` / `naturalHeight 1016`), `uniqueSrc 5`,
`minDiff 26`, `hScroll false`, `bad []`, dan `alt` sudah sesuai bahasa.

Gate: `node --check`, `spec.cjs`, `i18n_check.cjs`, `reveal_check.cjs`,
`showcase_check.cjs`, `marquee_check.cjs`, `marquee_i18n_check.cjs`,
`contact_check.cjs`, `hero_svg_check.cjs`, `paddock_fig_check.cjs`,
`stat_icons_check.cjs`, `contact_cv_check.cjs`, `hero_cv_probe.cjs`,
`lang_float_check.cjs`, `tl_images_check.cjs` — semuanya hijau. Nilai gate tidak
berubah: `imgsOk 16`, `imgsBad 0`, `remoteImgs 3`, `rvWords 205`, `srOnly 38`,
`tlRows 5`, `canvases 9`, `errors []`, `http4xx []`, `hScroll false`.
`rebuild.py` tidak dijalankan.

### 18. Penanda "Serang, Indonesia" di tengah peta about me

Permintaan: teks **Serang, Indonesia** berada di tengah-tengah peta about me,
tampak seperti pin Google Maps.

Keputusan: overlay CSS murni sebagai **sibling** dari `.season-map`, bukan
`maplibregl.Marker`. Alasannya: `seasonDarkMap()`, `BOUNDS`, `fitBounds()`, gaya
peta, dan kredit ODbL tidak perlu disentuh; tidak ada canvas atau gambar remote
baru; pin tetap terlihat walaupun tile gagal dimuat. Marker ditempatkan pada
pusat geometris peta (`left/top:50%`, `translate(-50%,-50%)`, `z-index:1`) —
bukan koordinat geografis — sesuai permintaan "di tengah-tengah".

Markup baru (setelah `.season-map`, sebelum `.flag-band`):

```html
<div class="season-map-marker">
  <span class="season-map-pin" aria-hidden="true"></span>
  <span class="season-map-label">Serang, Indonesia</span>
</div>
```

Tiga rule CSS baru: `.season-map-marker` (flex, `nowrap`, `pointer-events:none`),
`.season-map-pin` (teardrop `border-radius:50% 50% 50% 0` + `rotate(-45deg)`,
memakai `--accent` dan `--accent-muted`; titik tengah dari `::after`), dan
`.season-map-label` (chip gelap `rgb(10 11 12 / 0.82)` dengan border putih 22%,
teks `var(--foreground-on-dark)`). Tanpa emoji, SVG, font, dependency, komentar,
atau helper baru; tanpa animasi sehingga reduced-motion tidak terpengaruh.

Aksesibilitas: `.season-map` tetap `aria-hidden="true"` dan kreditnya utuh.
Karena marker berada di luar elemen itu, labelnya tetap terbaca screen reader;
hanya pin kosong yang `aria-hidden`. Tidak ada `.sr-only` baru. `data-i18n`
sengaja tidak dipakai karena "Serang, Indonesia" adalah proper noun yang identik
di EN/ID — menambah dua entri identik hanya duplication. Jumlah
`[aria-hidden="true"]` naik 287 → 288 (bukan nilai gate).

Probe baru `map_marker_check.cjs` (baseline dijalankan sebelum edit) di
1440/768/390 x EN: teks persis `Serang, Indonesia`, label satu baris, pusat
marker berimpitan dengan pusat peta (`dx 0`, `dy 0`), marker sepenuhnya di dalam
peta, dan nol overlap dengan `.season-head`, `.season-intro`, `.season-plate`,
`.season-map-credit`, serta `.lang-float`. Kredit tetap terlihat.

Dua script probe lama (`i18n_check.cjs`, `reveal_check.cjs`) masih mengklik
`.hero-head [data-lang]` yang sudah disembunyikan sejak §16; keduanya
diselaraskan ke `.lang-float [data-lang]`. Ini perbaikan harness di `%TEMP%\pw`,
bukan perubahan produk.

Gate: `node --check`, probe marker, `spec.cjs`, `i18n_check.cjs`, `check.cjs`,
`final.cjs`, `season_dark_check.cjs`, `season_map_check.cjs`,
`lang_float_check.cjs`, `tl_images_check.cjs`, `tl_diff_check.cjs`,
`marquee_check.cjs`, `marquee_i18n_check.cjs`, `showcase_check.cjs`,
`contact_check.cjs`, `contact_cv_check.cjs`, `cta_check.cjs`,
`hero_cv_probe.cjs`, `stat_icons_check.cjs`, `paddock_fig_check.cjs`,
`reveal_check.cjs`, `smoke.cjs`, `copy_geom_check.cjs`, `verify_mobile.cjs`.
Nilai gate tidak berubah: `errors []`, `http4xx []`, `hScroll false`,
`imgsOk 16`, `imgsBad 0`, `remoteImgs 3`, `rvWords 205`, `srOnly 38`,
`tlRows 5`, `canvases 9`. `rebuild.py` tidak dijalankan.

### 19. Dua sertifikat asli di showcase (final)

Data dari pengguna menggantikan dua `certificate-slot` placeholder:

| id | judul EN | judul ID | penerbit |
| --- | --- | --- | --- |
| `cert-bnsp` | Certified Back End Developer – BNSP | sama (nama sertifikasi resmi) | Badan Nasional Sertifikasi Profesi (BNSP) |
| `cert-ept` | English Proficiency Test (EPPT) Preparation Course | Kursus Persiapan English Proficiency Test (EPPT) | Language Center · Universitas Bina Bangsa |

Deskripsi EN/ID memakai teks yang dikirim pengguna (koma trailing dirapikan);
ID diterjemahkan. Judul BNSP sengaja tidak diterjemahkan karena merupakan nama
sertifikasi resmi. Tahun tidak dikirim, jadi `year: "—"` (bukan placeholder).

Gambar: `BNSP SERTIFIKAT.jpeg` (1041×1536) dan `sertifikat toefl.jpeg`
(1052×1500) dikonversi ke WebP quality 58 (105.120 dan 153.690 byte) lalu
disimpan sebagai konstanta `CERT_IMAGES` berisi data URI di dalam modul. File
JPEG asli tetap ada di root sebagai sumber, tetapi **tidak** direferensikan
`index.html` — seluruh halaman tetap self-contained.

Keputusan penting: preview **bukan** tag `<img>`, melainkan
`<div class="sc-cert-preview" role="img" data-i18n-attr="aria-label:…">`
dengan `background-image: url(data:image/webp;base64,…)`. Ini menjaga
`imgsOk 16`, `imgsBad 0`, dan `remoteImgs 3` tetap tidak berubah; `<img>` baru
akan menaikkan `imgsOk` menjadi 18. `aria-label` mengikuti bahasa aktif melalui
handler `data-i18n-attr` yang sudah ada. `background-size: contain` +
`background-position: center` membuat seluruh sertifikat terlihat (letterbox),
tanpa memotong tanda tangan atau tanggal.

Tautan unduh memakai `href` data URI yang sama dengan atribut
`download="BNSP-SERTIFIKAT.webp"` / `download="sertifikat-toefl.webp"` dan label
lokal baru `showcase.downloadCertificate`. Tidak ada modal, window baru, atau
dependency. Probe `cert_download_check.cjs` memastikan event `download` Chromium
terpicu di desktop dan mobile, nama file sesuai, dan 12 byte pertama adalah
header WebP `RIFF....WEBP` dengan ukuran 105.120 / 153.690 byte.

Perubahan lain: +1 rule CSS `.sc-cert-preview`, +2 entri `SHOWCASE`,
+2 konstanta data URI, +3 kunci i18n baru per bahasa
(`downloadCertificate`, `certBnspAlt`, `certEptAlt`), +2 blok `cards`. Tidak ada
helper, komentar, library, atau perubahan pada filter/grid/timeline/peta.

`index.html`: 841.524 → 1.188.964 byte (~1,16 MB). Probe baru
`cert_check.cjs` dijalankan baseline **sebelum** edit, lalu di 1440/768/390 ×
EN/ID: judul/meta/deskripsi persis, tidak ada placeholder pada kartu sertifikat,
preview ber-`role="img"` dengan `aria-label` sesuai bahasa, `backgroundImage`
dan `href` diawali `data:image/webp;base64,`, filter sertifikat menampilkan
tepat 2 kartu, tidak ada overflow/clipping, dan semua angka gate tidak berubah.

`node --check` PASS. `rebuild.py` tidak dijalankan.

### 20. Dua proyek asli di showcase (final)

Data dari pengguna mengisi dua kartu project yang sebelumnya satu asli dan satu
placeholder:

- `kb-system` → **Knowledge Base Management System — SPBE Knowledge** (Dinas
  Kominfo Banten, 2025 — 2026).
- `project-slot` → **`boarding-house`**: **Boarding House Management System —
  Digital Payment Integration** (Kost Ibu Zulfah, Midtrans).

Jumlah kartu tetap 4 (2 project + 2 sertifikat) agar `showcase_check` tetap
hijau. Flag `placeholder` kini nol di seluruh showcase; kunci `project-slot`
sudah tidak ada.

Deskripsi 2 paragraf, 8 `Key Features`, `Tech Stack`, dan `Role` mengikuti teks
pengguna persis di EN; ID diterjemahkan. KOST juga memuat `Methodology:
Waterfall` dan `Testing: Black Box Testing` (`Pengujian Black Box` di ID).
Nama teknologi, `SPBE Knowledge`, `Kost Ibu Zulfah`, dan `Midtrans` sengaja
tidak diterjemahkan. Tahun KOST tidak diberikan → `year: "—"` (netral, bukan
placeholder).

Struktur konten baru bersifat terstruktur, **bukan** HTML di dictionary:
`desc` memakai `\n\n` + `white-space: pre-line`; `features[]` dirender sebagai
`<ul>` dengan `data-i18n="…features.0 … 7"`; `stack`, `method`, `testing`,
`role` dirender sebagai baris `.sc-spec` dengan `data-sc-field`. Key baru:
`featuresLabel`, `stackLabel`, `methodLabel`, `testingLabel`, `roleLabel`
(EN/ID). `t()` sudah mendukung lookup bersarang sehingga tidak ada helper baru.
Tidak ada `.rv-u` atau `.sr-only` baru.

Gambar: hanya **2** file KB yang tersedia di folder (`KNOWLEDGE BASE PROJECT1/
2.jpeg`) sesuai konfirmasi pengguna; 3 file KOST lengkap. Kelimanya dikonversi
ke WebP q55 (31.876, 14.202, 42.988, 28.492, 13.688 byte) lalu disimpan di
konstanta `PROJECT_IMAGES = { kb: [...], kost: [...] }`. Sama seperti
sertifikat, thumbnail memakai `<div class="sc-shot" role="img">` dengan
`background-image` data URI, **bukan** `<img>`, agar `imgsOk 16`, `imgsBad 0`,
dan `remoteImgs 3` tidak berubah. `aria-label` per screenshot lokal via
`data-i18n-attr`. Tidak ada lightbox, modal, atau tautan unduh palsu untuk
proyek.

Perbaikan terkait: cabang `detail` yang sebelumnya memakai `entry.image` kini
memakai `entry.file`, supaya kartu project tidak mendapat tautan "download
certificate". `kb-system` tetap memiliki "view detail"; `boarding-house`
sengaja tanpa tautan.

CSS baru: `.sc-desc` (`white-space: pre-line`), `.sc-specs`, `.sc-label`,
`.sc-features`, `.sc-spec`, `.sc-shots`, `.sc-shot` (grid `auto-fit`,
`aspect-ratio: 16/10`, `background-size: contain`). Tidak ada library,
komentar, atau dependency baru.

`index.html`: 1.188.964 → 1.372.830 byte (~1,34 MB). Probe baru
`project_check.cjs` dijalankan baseline **sebelum** edit, lalu di 1440/768/390
× EN/ID: judul/meta/deskripsi/8 fitur/stack/role/method/testing persis, nol
placeholder, 2 dan 3 thumbnail dengan `data:image/webp;base64,` dan
`aria-label` sesuai bahasa, filter project tepat 2 kartu, tanpa
clipping/overflow. `cert_check.cjs` disesuaikan: placeholder 1 → 0 dan batas
ukuran harness 1,2 → 1,6 MB (perbaikan probe, bukan produk).

`node --check` PASS. `rebuild.py` tidak dijalankan.

## Verifikasi

Playwright + Chromium headless, desktop 1440 dan mobile 390:

| Cek | Hasil |
|---|---|
| Console error | **0** |
| HTTP ≥ 400 | **0** |
| Veil | siluet helm muncul → terangkat → dilepas |
| Scene WebGL | 8 canvas aktif, helm Draco + HDRI termuat |
| Gambar | 20 termuat, **0 rusak** (10 sisa CDN = ikon/logo UI) |
| Tekstur hero | 4 peta foto Anda termuat (tanpa prefix CDN) |
| Foto section | paddock + footer body/helmet + 7 plat timeline = data URI |
| Reveal teks | 172 unit `.rv-u` `aria-hidden` + 38 `.sr-only` |
| Timeline | 7 baris, `TL_IMG` terpakai |
| Overflow horizontal | tidak ada (desktop 1440 + mobile 390) |
| Judul / copy | `MUHAMMAD ANNAS FIRMAN — GRIDO1 Racing Systems`, `muhammad annas firman`, `Annas_001` |
| Ukuran file | **803,1 KB** (batas ~1.2 MB) |

## Cara membangun ulang aset

Skrip di `%TEMP%\build-assets\` (butuh Python 3 + Pillow + numpy, jalankan dengan
`python -I` karena ada `inspect.py` lama yang men-shadow stdlib):

1. `make_maps_v2.py` — semua peta/plan baru → `mapsv2.json`
   (hero 4 peta, paddock, footer body, 7 plat timeline).
2. Render helm: serve `%TEMP%\build-assets\helmet\` lalu
   `node %TEMP%\pw\render_helmet.cjs` → `helmet-raw.png`;
   `fit_helmet.py` memasukkannya ke `mapsv2.json` sebagai `footer/helmet`.
3. `patch_images.py` — menyuntikkan `mapsv2.json` ke `index.html` in-place
   (ME, hf-person, paddock, footer, `TL_IMG`). Idempoten-ish: selalu simpan
   salinan `index.html` sebelum dijalankan.
4. `preview_v2.py` — pratinjau PNG komposit untuk cek visual.

`rebuild.py` menyusun ulang `index.html` dari nol dari sumber asli — **jangan**
dijalankan lagi setelah patch manual (akan menghapus perbaikan `data:` guard,
favicon, dan semua foto).