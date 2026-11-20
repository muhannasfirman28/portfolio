# MUHAMMAD ANNAS FIRMAN — GRIDO1 Racing Systems

Renditions satu halaman, satu file: **`index.html`**. HTML, CSS, dan JS murni —
tanpa bundler, tanpa framework, tanpa build step. Hanya **three.js** dan **Lenis**
yang ditarik lewat import map; seluruh spring solver, ticker, scroll trigger,
text reveal, sticky stack, circuit trace, halftone, chequered dissolve,
contour backdrop dan loader ditulis tangan di dalam file.

Hero scene menampilkan **foto Anda sendiri** sebagai portrait depth-parallax,
dengan **helm Mercedes `helmet3.glb`** (Draco) yang memang di atasnya — sesuai spek.
Foto Anda juga menggantikan foto di **paddock, footer, dan ketujuh plate timeline**.

## Menjalankan

```bash
node serve.cjs
```

Server lokal jalan, browser langsung terbuka:

```
  Muhammad Annas Firman — Portfolio
  http://127.0.0.1:8137/
  Ctrl+C untuk stop.
```

Stop dengan **Ctrl+C**. Varian:

```bash
node serve.cjs --no-open    # layani saja, jangan buka browser
PORT=3000 node serve.cjs    # port lain
```

Kalau port 8137 sedang dipakai, script otomatis naik ke 8138, 8139, dan seterusnya.

Atau buka langsung file-nya: `start index.html` (Windows) / `open index.html` (macOS).

## Isi

| Blok | Isi |
|---|---|
| Hero | Masthead, nama 96px, meta rows, dua panel bracket, scene WebGL: portrait depth-parallax + helm yang *burn away* lalu muncul hanya di jalur kursor |
| The season so far | Chequered dissolve, peta sirkuit 2560×1440 (8.004 dot halftone, grid axes, hub + ping), lap 6 detik + reticle kursor |
| From campus to career | Timeline 7 foto di plate stepped-corner, rail paralaks 3 lapis, tahun assemble huruf lalu settle 40% |
| From the paddock | Masthead 96px, race report, tombol chamfered, portrait paralaks, strip kalender 5 seri |
| Keep pushing forward | Tepi cyan + panel hitam, kontur putih 10%, figur helm-setelan, nav letter-by-letter |

## Yang berbeda dari sumber asli

Perubahan visual: **semua foto orang memakai foto Anda**.

| Slot | Pengganti |
|---|---|
| Hero (4 peta `person-diffuse/depth/alpha/normal`) | dibangkitkan dari foto Anda (PIL: alpha → cut-out, luminansi + alpha → depth, sobel depth → normal), disuntik sebagai data URI di `ME` |
| `paddock/portrait.webp` | crop & penempatan kepala disamakan dengan aset asli |
| `footer/body.webp` | foto Anda; mask CSS 69% tetap berlaku |
| `footer/helmet.webp` | **render 3D `helmet3.glb`** ke PNG transparan (bukan foto) |
| `timeline/2012…2026.webp` (7 plat) | plat baru: crop bervariasi + warna glow berbeda per tahun (`TL_IMG`) |

Semua yang lain persis sesuai spek: `helmet3.glb` (Draco) + HDRI `studio-light.hdr`,
logo `grido1-logo.webp`, bendera Italia, 4 ikon statistik paddock, seluruh copy,
token, angka, dan timing.

Adaptasi teknis untuk satu file statis: seluruh `href="/…"` multi-halaman
diarahkan ke anchor satu halaman (`#hero`, `#season-heading`, `#timeline-heading`,
`#paddock-heading`, `#footer-heading`) agar tidak ada link mati.

## Dependensi

| Jenis | Sumber |
|---|---|
| three.js `0.185.0` + addons | `cdn.jsdelivr.net` (import map) |
| lenis `1.3.26` | `cdn.jsdelivr.net` |
| Draco decoder | `cdn.jsdelivr.net/npm/three@0.185.0/examples/jsm/libs/draco/gltf/` |
| Font Oswald + Space Grotesk | Google Fonts |
| Aset UI/branding (logo, bendera, ikon statistik, peta sirkuit, mask) | `storage.getlayers.ai/assets/kimi-04a9449ab2/…` (12 file) |
| Foto (hero 4 peta, paddock, footer body+helm, 7 plat timeline) | tertanam sebagai data URI dari foto Anda |

## Aksesibilitas

Satu `<h1>`; setiap blok `<section>` dengan `<h2>`; masthead `<header>` dengan
`<nav aria-label="Primary">`; veil `role="status"`. Setiap text reveal menyimpan
salinan plain yang visually-hidden dan menandai span animasinya `aria-hidden`.
Gambar dekoratif `alt=""`; canvas `aria-hidden`. Menu sheet `role="dialog"
aria-modal="true"` dengan fokus ke tombol close dan `Escape`. Focus ring
`:focus-visible` selalu terlihat. `prefers-reduced-motion` dihormati.

## Catatan

Scaffold Next.js yang semula ada di repo ini sudah dihapus — `index.html` adalah
satu-satunya entry point. Rincian di `BUILD-NOTES.md`.