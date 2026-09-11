# Magnet — Inđija

Statički jednostranični sajt teretane Magnet. Bez build koraka, bez zavisnosti — čist HTML, CSS i JavaScript.

## Hostovanje na GitHub Pages

1. Napravi repozitorijum i otpremi sadržaj ovog foldera u koren (`index.html` mora biti u korenu).
2. Settings → Pages → Source: `Deploy from a branch`, grana `main`, folder `/ (root)`.
3. Sajt je za minut dostupan na `https://<korisnik>.github.io/<repo>/`.

Za sopstveni domen (npr. `magnet-indjija.rs`): u Settings → Pages upiši domen, pa kod registrara podesi `A` zapise ka GitHub Pages IP adresama i `CNAME` za `www`.

## Fajlovi

    index.html          cela stranica
    site.js             animacije i interakcije
    images/             sve fotografije, logo, favicon, og slika
    .nojekyll           isključuje Jekyll obradu na GitHub Pages

## Zamena fotografija

Prebriši fajlove u `images/` **pod istim imenima** — ništa u kodu ne treba menjati.

| Fajl | Šta prikazuje | Format |
|---|---|---|
| `hero.jpg` | Širok kadar cele teretane, vidi se visina | 1920×1080 |
| `prostor.jpg` | Edge-to-edge kadar za sekciju „Prostor" | 2400×1200 |
| `trener-01.jpg` … `trener-10.jpg` | Portreti trenera | 800×1000 (4:5) |
| `cafe.jpg` | Sport Cafe | 1200×800 |
| `galerija-01.jpg` … `galerija-07.jpg` | Oprema, zone, atmosfera | min. 1200px |
| `og-image.jpg` | Za deljenje na mrežama | 1200×630 |
| `logo-magnet.png` | Logo (bela slova, crveni magnet) | vektorski izvoz |
| `favicon.svg` | Samo crveni magnet | 64×64 |

Portreti trenera su trenutno privremene pločice sa inicijalima. Svih deset pravih portreta snimiti istog dana, na istom mestu, istim objektivom i u istom svetlu, kadrirano 4:5 — mreža se vizuelno raspada ako uslovi variraju.

## Izmena sadržaja

Podaci koji se najčešće menjaju su na dnu `index.html`, u `<script>` bloku pre `site.js`:

- `window.MAGNET_TRENERI` — ime, specijalnost, kategorije za filter, oznake, biografija, sertifikati, Instagram, termini
- `window.MAGNET_UTISCI` — utisci članova (karusel)
- `window.MAGNET_GALERIJA` — opisi fotografija u galeriji (alt tekst)

Kartice trenera u HTML-u nose `data-tcard="<id>"` — pri dodavanju ili uklanjanju trenera treba izmeniti i karticu u HTML-u i unos u `MAGNET_TRENERI`.

Cene, raspored grupnih treninga, radno vreme i tekstovi menjaju se direktno u `index.html`.

## Ostaje da se potvrdi

- Cena za **Magnet Premium** i **Magnet Akademiju** (sada stoji „Na upit")
- Raspored grupnih treninga — trenutni je predlog
- Potpis izrade sajta u futeru (`Izrada sajta — TODO`)

## Tehnički detalji

- Animacije: CSS prelazi i `@keyframes` + `IntersectionObserver`; sve poštuje `prefers-reduced-motion`
- Intro sa logom pušta se jednom po sesiji (`sessionStorage`), traje 0.95s
- Fontovi: Archivo i Chivo sa Google Fonts, `display=swap`
- Mapa: Google Maps embed, bez API ključa
- SEO: `HealthClub` JSON-LD, Open Graph i Twitter kartice, `lang="sr-Latn-RS"`
