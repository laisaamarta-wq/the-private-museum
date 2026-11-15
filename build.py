#!/usr/bin/env python3
"""Builds the static pages of The Private Museum (v2) from one content source."""
import json, html as H
from pathlib import Path

SITE = 'https://theprivatemuseum.example'   # placeholder production URL
OUT = Path('/home/claude/v2/site')
NUM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']
FONTS = ''
LIBS = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>'
        '<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js" defer></script>')

OBJECTS = [
  dict(stats=[('212', 'diamonds'), ('141.6 ct', 'in total'), ('30.08 ct', 'D flawless pear')], rarity='A D colour, internally flawless pear above 30 carats reaches the market only a handful of times in a decade.', slug='aurora', name='Aurora', type='Diamond waterfall bib', fx=0.5, fy=0.51, lean=0.45, dust='255,226,184',
       spec='Platinum, 212 diamonds, a 30.08 carat D colour pear',
       details=[('Metal', 'Platinum'), ('Diamonds', '212 pear and round brilliants, 141.6 carats in total'),
                ('Centre stone', 'Pear shape, 30.08 carats, D colour, internally flawless'), ('Hours at the bench', '2,140'), ('Room', 'I, the grey marble salon')],
       alt='Aurora, a five tier diamond necklace on a black velvet bust inside a glass vitrine, lit from above by a single pin-spot',
       dalt='The same vitrine with the gallery lights off; only a few facets catch the dark',
       malt='Close view of the Aurora pear diamond and the tiers above it, throwing small rainbows of fire',
       macro='The pear at the end of the fall, 30.08 carats',
       lede='Five tiers that fall like light running down a wall, ending in one pear shaped diamond that seems to hold the whole fall in a drop.',
       body=['The pear was cut from a rough of 71 carats over eleven months. The cutter would only work on it in the morning, when the north light in his room was even, and stopped each day at noon.',
             'Every one of the 212 stones below it was chosen to lead the eye downward. The tiers are articulated on fine platinum hinges, so the necklace moves like water when it is worn and lies perfectly still on the bust.']),
  dict(stats=[('11', 'unheated sapphires'), ('96.4 ct', 'of Ceylon blue'), ('1,680', 'hours at the bench')], rarity='Almost every blue sapphire sold today has been heated to deepen its colour. Eleven matched stones that never were is a rare thing.', slug='notte', name='Notte', type='Sapphire collar', fx=0.5, fy=0.53, lean=0.35, dust='196,206,255',
       spec='Eleven cushion sapphires, 96.4 carats, unheated',
       details=[('Metal', 'Platinum and white gold'), ('Sapphires', 'Eleven cushions from Ratnapura, Sri Lanka, 96.4 carats, unheated'),
                ('Diamonds', 'Round brilliant halos and marquise links'), ('Hours at the bench', '1,680'), ('Room', 'II, the blue silk salon')],
       alt='Notte, a collar of eleven blue sapphires framed in diamonds on a midnight blue velvet bust, in a dark stone niche under a small lamp',
       dalt='The stone niche with its lamp switched off; the sapphires keep a faint blue',
       malt='Close view of the central cushion sapphire of Notte and its diamond halo on blue velvet',
       macro='The central cushion, the darkest blue of the eleven',
       lede='Named for the colour the sky over the Adriatic turns an hour after sunset, when the blue has stopped being day and is not yet night.',
       body=['Each sapphire was matched twice: once in north daylight, and once again by a single candle. A stone stayed in the collar only if it held its blue in both.',
             'The eleven cushions graduate by less than a tenth of a millimetre from the centre outward. Between them, marquise diamonds work as hinges, so the collar closes around the neck like a hand.']),
  dict(stats=[('31', 'Paraíba tourmalines'), ('58 ct', 'matched to one blue'), ('4 years', 'to match them')], rarity='Paraíba tourmaline was only discovered in the late 1980s. Its neon blue comes from copper, and fine stones are often called rarer than diamonds.', slug='laguna', name='Laguna', type='Paraíba tourmaline riviera', fx=0.5, fy=0.5, lean=0.3, dust='170,236,240',
       spec='Thirty one Paraíba tourmalines, 58 carats',
       details=[('Metal', 'Platinum'), ('Tourmalines', 'Thirty one copper bearing Paraíba from Mozambique, 58 carats, matched to one blue'),
                ('Diamonds', 'Pavé surrounds on every stone'), ('Hours at the bench', '1,310'), ('Room', 'III, the pool room')],
       alt='Laguna, a riviera of electric turquoise Paraíba tourmalines on a black marble slab beside a gilded reflecting pool in a gold veined marble room',
       dalt='The pool room with its pin-spot off; the tourmalines glow faintly, like something alive under water',
       malt='Close view of the point of the Laguna riviera, turquoise Paraíba tourmalines in diamond surrounds, mirrored in black water',
       macro='Thirty one stones, one blue',
       lede='Turquoise that looks lit from inside, laid in a slow wave so the necklace still reads as water when nothing moves.',
       body=['Copper is what makes a Paraíba glow. These stones were found in Mozambique and cut shallow, to let as much light out of them as possible.',
             'Matching them took four years: thirty one stones of one exact blue, so the eye reads a single stream of water rather than a row of gems. The room was built around a pool so the necklace would always have its reflection.']),
  dict(stats=[('2', 'fancy intense pinks'), ('10.13 ct', 'together'), ('18.4 ct', 'of white diamonds')], rarity='The mine that gave the world most of its pink diamonds closed in 2020. Pinks of this size may never come out of the ground again.', slug='rosa', name='Rosa', type='Pink diamond chandelier earrings', fx=0.5, fy=0.5, lean=0.45, dust='255,214,220',
       spec='Two fancy intense pink pears, 10.13 carats together',
       details=[('Metal', 'Platinum and rose gold'), ('Pink diamonds', 'Two pear shapes, fancy intense pink, 5.02 and 5.11 carats'),
                ('White diamonds', 'Pear and marquise cascades, 18.4 carats'), ('Hours at the bench', '760'), ('Room', 'IV, the onyx room')],
       alt='Rosa, a pair of pink diamond chandelier earrings hanging from a gilded stand in a vitrine, in a room of glowing pink onyx and gold',
       dalt='The onyx room with its pin-spot off; the walls still glow faintly pink and the earrings hold two small sparks',
       malt='Close view of a Rosa earring, a cascade of white diamonds ending in a pear shaped pink diamond',
       macro='The pair, two pinks found three years apart',
       lede='Two pink diamonds that were never meant to meet: found three years apart, matched by eye on the same afternoon.',
       body=['Pink diamonds of this size almost never come out of the ground, and the mine that gave most of them has closed. Each of these two waited in a different vault until the house could find its twin.',
             'The cascades above them are made of white pears and marquises that move independently, so the earrings never stop catching light, even when the wearer is still.']),
  dict(stats=[('20.18 ct', 'unheated ruby'), ('34', 'diamonds in the halo'), ('Mogok', 'Burma')], rarity='Most rubies are heated to improve their colour. An unheated Burmese ruby above twenty carats is among the rarest coloured stones on earth.', slug='cuore', name='Cuore', type='Heart ruby pendant', fx=0.5, fy=0.5, lean=0.3, dust='255,190,170',
       spec='An unheated Burmese ruby of 20.18 carats',
       details=[('Metal', 'Platinum and rose gold'), ('Ruby', 'Heart shape, 20.18 carats, Mogok, Burma, unheated'),
                ('Diamonds', 'A halo of 34 and a rivière chain'), ('Hours at the bench', '920'), ('Room', 'V, the oxblood room')],
       alt='Cuore, a large heart shaped ruby in a diamond halo hanging on a diamond chain above an oxblood velvet cushion',
       dalt='The oxblood room in the dark; the ruby keeps a low red ember',
       malt='Close view of the Cuore ruby, deep red with a halo of diamonds, above red velvet',
       macro='Pigeon blood red, 20.18 carats, in its halo',
       lede='Pigeon blood is the name of a colour, not a promise. This ruby has it in daylight, under tungsten and in the dark.',
       body=['The rough came out of the Mogok valley in Burma and was never heated. Its silk, the fine needles inside it, softens the red so the colour seems to sit just under the surface.',
             'The heart was the cutter\'s idea, not the client\'s. He said the stone already had the shape and only needed permission.']),
  dict(stats=[('25.40 ct', 'Muzo emerald'), ('64', 'diamonds, double halo'), ('Minor', 'oil only')], rarity='Nearly every emerald is oiled to hide its fissures. A Muzo stone this size with only minor oil is exceptional.', slug='smeraldo', name='Smeraldo', type='Emerald cocktail ring', fx=0.5, fy=0.47, lean=0.6, dust='200,240,200',
       spec='A Muzo emerald of 25.40 carats, emerald cut',
       details=[('Metal', 'Platinum and yellow gold'), ('Emerald', 'Emerald cut, 25.40 carats, Muzo, Colombia, minor oil'),
                ('Diamonds', 'A double halo of 64 round brilliants'), ('Hours at the bench', '410'), ('Room', 'VI, the malachite room')],
       alt='Smeraldo, a large emerald cut emerald ring in a double diamond halo, upright on a black marble column in a malachite room',
       dalt='The malachite room with its pin-spot off; the emerald keeps a deep green glow',
       malt='Close view of the Smeraldo emerald, its step facets and the garden of inclusions inside, ringed with diamonds',
       macro='A Muzo emerald of 25.40 carats in its double halo',
       lede='A green so warm it almost turns to gold. Cutters call what lives inside an emerald its garden; this one has a whole park.',
       body=['Muzo is the oldest emerald mine in Colombia and gives the warmest green. The rough was cut as a step cut, long and calm, so the eye walks into the stone like into a room.',
             'The double halo is set low and close, a frame and not a crown. The ring was made to be worn on the right hand, where it is seen when you speak.']),
  dict(stats=[('7.41 ct', 'oval diamond'), ('7', 'natural pearls'), ('3', 'generations to gather them')], rarity="Natural pearls grow without any human help, and only a tiny fraction of wild oysters ever holds one. Seven that match is a lifetime's search.", slug='corona', name='Corona', type='Sunray tiara', fx=0.5, fy=0.58, lean=0.35, dust='236,232,224',
       spec='Platinum, a 7.41 carat oval diamond, natural pearls',
       details=[('Metal', 'Platinum'), ('Centre stone', 'Oval diamond, 7.41 carats, E colour'),
                ('Pearls', 'Seven natural saltwater drops'), ('Diamonds', 'Baguette and brilliant rays'), ('Room', 'VII, the rotunda')],
       alt='Corona, a diamond and pearl sunray tiara under a glass dome on a black column, lit by a shaft of light',
       dalt='The tiara under its dome with the light switched off',
       malt='Close view of the Corona oval diamond, its rays and two pearl drops, in a shaft of light',
       macro='The whole sunrise, seven pearls and an oval diamond',
       lede='A sunrise made for a wedding that never took place. It has been worn twice since, both times by daughters of the house.',
       body=['Each ray is a line of baguette diamonds set edge to edge, so the tiara reads as light rather than metal from across a room.',
             'The seven pearls are natural, gathered over three generations. They hang free on platinum loops and turn slightly whenever the wearer does.']),
]

def pic(base, root, alt, cls='', lazy=True, prio=False, mobile=True):
    a = H.escape(alt, quote=True)
    load = 'loading="lazy" ' if lazy else ''
    fp = 'fetchpriority="high" ' if prio else ''
    src = f'<source media="(max-width: 899px)" srcset="{root}{base}-m.webp" width="1080" height="1350">' if mobile else ''
    return (f'<picture class="{cls}">{src}'
            f'<img src="{root}{base}-1600.webp" srcset="{root}{base}-1600.webp 1600w, {root}{base}-2560.webp 2560w" '
            f'sizes="100vw" width="1600" height="679" alt="{a}" {load}{fp}decoding="async"></picture>')

def head(title, desc, path, root, extra_css=()):
    css = ''.join(f'<link rel="stylesheet" href="{root}css/{c}.css">' for c in ('base',) + tuple(extra_css))
    url = SITE + path
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{H.escape(title)}</title>
<meta name="description" content="{H.escape(desc, quote=True)}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#050404">
<meta property="og:type" content="website">
<meta property="og:site_name" content="The Private Museum">
<meta property="og:title" content="{H.escape(title, quote=True)}">
<meta property="og:description" content="{H.escape(desc, quote=True)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{H.escape(title, quote=True)}">
<meta name="twitter:description" content="{H.escape(desc, quote=True)}">
<meta name="twitter:image" content="{SITE}/assets/og.jpg">
<link rel="icon" href="{root}favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="{root}apple-touch-icon.png">
<link rel="preload" href="{root}assets/fonts/bodoni-moda-latin-opsz-italic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="{root}assets/fonts/instrument-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
{css}
<script>document.documentElement.classList.add('js');if(matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('rm')</script>
{LIBS}
'''

def frame(root, current):
    def item(href, label, key):
        cur = ' aria-current="page"' if key == current else ''
        return f'<a class="lit-link" href="{root}{href}"{cur}>{label}</a>'
    return f'''<a class="skip" href="#main">Skip to content</a>
<header class="frame">
  <a class="wordmark lit-link" href="{root}index.html" aria-label="The Private Museum, home"><em>The</em>Private Museum</a>
  <nav class="nav" aria-label="Main">
    {'<button class="sound" type="button" aria-pressed="false" aria-label="Gallery music"><span class="sound__bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="sound__label">Sound</span></button>' if current == 'home' else ''}
    <span class="nav__home">{item('index.html', 'Collection', 'home')}</span>
    {item('catalogue.html', 'Catalogue', 'catalogue')}
    {item('index.html#visit', '<span class="nav__long">Private </span>viewing', 'visit')}
  </nav>
</header>'''

def foot(root):
    return f'''<footer class="foot">
  <p class="foot__name">The Private Museum</p>
  <p class="foot__note">An exhibition of seven high jewellery pieces, open after the house has closed. The pieces, weights and stories shown here belong to this exhibition and are fictional.</p>
  <div class="foot__links">
    <a class="lit-link" href="{root}catalogue.html">Catalogue</a>
    <a class="lit-link" href="mailto:viewing@theprivatemuseum.example">viewing@theprivatemuseum.example</a>
  </div>
</footer>
<div class="curtain" aria-hidden="true"></div>'''

def scripts(root, *names):
    return ''.join(f'<script src="{root}js/{n}.js" defer></script>' for n in names)

# ---------------- index ----------------
def room(o, k):
    r = ''
    base = f'assets/jewellery/{o["slug"]}'
    return f'''
      <article class="room" id="{o['slug']}" data-room="{k}" data-slug="{o['slug']}" data-fx="{o['fx']}" data-fy="{o['fy']}" data-lean="{o['lean']}" data-dust="{o['dust']}" aria-labelledby="{o['slug']}-title">
        <div class="room__plates">
          {pic(base + '-dark', r, o['dalt'], 'plate plate--dark', lazy=k > 0)}
          {pic(base + '-lit', r, o['alt'], 'plate plate--lit', lazy=k > 0)}
          <div class="torch" aria-hidden="true">{pic(base + '-lit', r, '', 'torch__img', lazy=k > 0)}</div>
          <div class="glints" data-glints="room" aria-hidden="true"></div>
        </div>
        <div class="card">
          <p class="label card__room">Room {NUM[k]} of VII</p>
          <h2 class="card__name" id="{o['slug']}-title">{o['name']}</h2>
          <p class="card__type">{o['type']}</p>
          <dl class="stats">{''.join(f'<div><dt>{a}</dt><dd class="label">{b}</dd></div>' for a, b in o['stats'])}</dl>
          <a class="lit-link card__go" href="objects/{o['slug']}.html">Step closer to {o['name']}</a>
        </div>
        <figure class="room__macro">
          {pic(f'assets/details/{o["slug"]}-macro', r, o['malt'], 'macro__img')}
          <div class="glints" data-glints="macro" aria-hidden="true"></div>
          <figcaption class="macro__cap"><span class="label">Room {NUM[k]}, in detail</span><span class="macro__text">{o['macro']}</span><span class="macro__rarity">{o['rarity']}</span></figcaption>
        </figure>
      </article>'''

def index():
    rooms = ''.join(room(o, k) for k, o in enumerate(OBJECTS))
    words = ''.join(f'<span class="roomword" data-word="{k}" aria-hidden="true">{o["name"]}</span>' for k, o in enumerate(OBJECTS) if k)
    pil = ''.join('<img class="pilaster" src="assets/architecture/pilaster.webp" width="511" height="2600" alt="" aria-hidden="true" decoding="async">' for _ in range(2))
    rail = ''.join(f'<li><a href="#{o["slug"]}" data-goto="{k}"><span class="rail__num">{NUM[k]}</span><span class="rail__name">{o["name"]}</span></a></li>' for k, o in enumerate(OBJECTS))
    ld = {"@context": "https://schema.org", "@type": "ExhibitionEvent", "name": "The Private Museum, after hours",
          "description": "Seven high jewellery pieces in seven salons, shown to one visitor at a time, after the house has closed.",
          "url": SITE + '/', "image": SITE + '/assets/og.jpg', "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
          "location": {"@type": "Place", "name": "The Private Museum"}}
    return head('The Private Museum. Seven jewels, after hours',
                'A private museum of high jewellery, opened for one visitor after hours. Walk seven salons: diamonds, sapphires, Paraíba, pink diamonds, a heart ruby, a Muzo emerald and a sunray tiara.',
                '/', '', ('journey',)) + f'''<script type="application/ld+json">{json.dumps(ld)}</script>
</head>
<body class="home">
{frame('', 'home')}
<main id="main">
  <section class="journey" id="journey" aria-label="The walk through the collection">
    <div class="stage">
      <div class="prologue">
        <div class="pro pro--door">
          {pic('assets/architecture/door', '', 'Closed gilded bronze doors in a wall of honey marble, a line of golden light between them, flanked by two glowing torchères', 'plate plate--door', lazy=False, prio=True)}
          <div class="torch torch--door" aria-hidden="true">{pic('assets/architecture/door', '', '', 'torch__img', lazy=False)}</div>
        </div>
        {pic('assets/architecture/gallery', '', 'The enfilade: seven salons seen through gilded doorways, each with one vitrine glowing under its own lamp, a golden rotunda at the far end', 'pro pro--gallery')}
      </div>
      <div class="pro-glow" aria-hidden="true"></div>
      <div class="track">
        {rooms}
      </div>
      <div class="seams" aria-hidden="true">{pil}{words}</div>
      <canvas class="dust" aria-hidden="true"></canvas>
      <div class="vignette" aria-hidden="true"></div>
      <div class="intro">
        <p class="label intro__kicker">An exhibition of high jewellery, after hours</p>
        <h1 class="intro__title"><span class="intro__the">The</span> Private Museum</h1>
        <p class="intro__line">Seven jewels, seven salons. Tonight the house opens for one visitor.</p>
      </div>
      <p class="gallery-note"><span class="label">The enfilade</span><span class="gallery-note__text">Seven salons in a line, each with a lamp of its own. Walk on and they will wake for you.</span></p>
      <p class="hint label" aria-hidden="true"><span class="hint__light">Move your light</span><span class="hint__sep"></span><span>Scroll to enter</span></p>
      <p class="status label" aria-hidden="true"><span class="status__dot"></span><span class="status__text">Entrance, the doors are closed</span></p>
      <section class="finale" id="visit" aria-labelledby="visit-title">
        <div class="finale__img">
          {pic('assets/architecture/rotunda', '', 'The rotunda at the heart of the museum, every lamp lit: seven vitrines in a ring under a gilded dome', 'finale__pic')}
          <div class="finale__shade" aria-hidden="true"></div>
        </div>
        <div class="finale__text">
          <p class="label finale__kicker">The rotunda, every lamp lit</p>
          <h2 class="finale__title" id="visit-title">The house was <em>opened for you.</em></h2>
          <p class="finale__body">Private viewings take place after the house has closed, for one guest and one guide. Every piece can be held, tried on and seen by daylight in the room upstairs.</p>
          <p class="finale__actions"><a class="btn-lamp" href="mailto:viewing@theprivatemuseum.example?subject=Private%20viewing"><span>Request a private viewing</span></a><a class="lit-link label-link" href="catalogue.html">Read the catalogue</a></p>
        </div>
      </section>
    </div>
  </section>
  <nav class="rail" aria-label="Rooms of the collection"><ol>{rail}</ol><span class="rail__line" aria-hidden="true"><span></span></span></nav>
</main>
{foot('')}
<script src="js/glints.js" defer></script>
{scripts('', 'core', 'interactions/torch', 'transitions/curtain', 'scroll/journey', 'interactions/sound')}
</body>
</html>
'''

# ---------------- object pages ----------------
def obj_page(k):
    o = OBJECTS[k]; nx = OBJECTS[(k + 1) % 7]; root = '../'
    dl = ''.join(f'<div><dt class="label">{a}</dt><dd>{b}</dd></div>' for a, b in o['details'])
    body = ''.join(f'<p>{p}</p>' for p in o['body'])
    ld = {"@context": "https://schema.org", "@type": "VisualArtwork", "name": o['name'], "artform": "High jewellery",
          "description": o['lede'], "image": f"{SITE}/assets/details/{o['slug']}-macro-1600.webp", "url": f"{SITE}/objects/{o['slug']}.html"}
    return head(f"{o['name']}, {o['type'].lower()}. The Private Museum", o['lede'], f"/objects/{o['slug']}.html", root, ('pages',)) + f'''<script type="application/ld+json">{json.dumps(ld)}</script>
</head>
<body class="object" data-slug="{o['slug']}">
{frame(root, '')}
<main id="main">
  <section class="ohero" aria-labelledby="otitle">
    <div class="ohero__img">
      {pic(f'assets/details/{o["slug"]}-macro', root, o['malt'], 'ohero__pic', lazy=False, prio=True)}
      <div class="glints" data-glints="macro" data-slug="{o['slug']}" aria-hidden="true"></div>
      <div class="veil" aria-hidden="true"></div>
    </div>
    <div class="ohero__text">
      <p class="label">Room {NUM[k]} of VII</p>
      <h1 class="ohero__title" id="otitle">{o['name']}</h1>
      <p class="ohero__type">{o['type']}</p>
      <button class="btn-lamp lamp-toggle" type="button" aria-pressed="false"><span>Switch on the lamp</span></button>
    </div>
  </section>
  <section class="oinfo" aria-labelledby="oabout">
    <h2 class="visually-hidden" id="oabout">About {o['name']}</h2>
    <dl class="stats stats--page">{''.join(f'<div><dt>{a}</dt><dd class="label">{b}</dd></div>' for a, b in o['stats'])}</dl>
    <p class="oinfo__lede">{o['lede']}</p>
    <p class="oinfo__rarity"><span class="label">Why it is rare</span>{o['rarity']}</p>
    <div class="oinfo__body">{body}</div>
    <dl class="oinfo__spec">{dl}</dl>
  </section>
  <figure class="oroom" data-wake>
    <div class="oroom__plates">
      {pic(f'assets/jewellery/{o["slug"]}-dark', root, o['dalt'], 'plate plate--dark')}
      {pic(f'assets/jewellery/{o["slug"]}-lit', root, o['alt'], 'plate plate--lit')}
    </div>
    <figcaption class="label">{o['name']} in its room, before and after the lamp</figcaption>
  </figure>
  <nav class="onext" aria-label="Next room">
    <a class="onext__link" href="{nx['slug']}.html">
      <span class="label">Next room, {NUM[(k + 1) % 7]}</span>
      <span class="onext__name">{nx['name']}</span>
      <span class="onext__type">{nx['type']}</span>
    </a>
  </nav>
</main>
{foot(root)}
<script src="../js/glints.js" defer></script>
{scripts(root, 'core', 'interactions/torch', 'transitions/curtain', 'interactions/pages')}
</body>
</html>
'''

def catalogue():
    rows = ''
    for k, o in enumerate(OBJECTS):
        rows += f'''<li class="crow" data-i="{k}">
      <a class="crow__link" href="objects/{o['slug']}.html">
        <span class="crow__num label">{NUM[k]}</span>
        <span class="crow__name">{o['name']}</span>
        <span class="crow__type">{o['type']}</span>
        <span class="crow__spec label">{o['spec']}</span>
      </a>
      <figure class="crow__thumb" aria-hidden="true">
        {pic(f'assets/jewellery/{o["slug"]}-dark', '', '', 'plate plate--dark')}
        {pic(f'assets/jewellery/{o["slug"]}-lit', '', '', 'plate plate--lit')}
      </figure>
    </li>'''
    return head('Catalogue. The Private Museum', 'The inventory of the collection: seven pieces of high jewellery, their stones, weights and rooms.', '/catalogue.html', '', ('pages',)) + f'''</head>
<body class="catalogue">
{frame('', 'catalogue')}
<main id="main" class="cat">
  <header class="cat__head">
    <p class="label">Inventory of the collection</p>
    <h1 class="cat__title">Catalogue</h1>
    <p class="cat__intro">Seven pieces, one to a salon. Each line keeps its own lamp; open one to step closer.</p>
  </header>
  <ol class="cat__list">{rows}</ol>
</main>
{foot('')}
<script src="js/glints.js" defer></script>
{scripts('', 'core', 'interactions/torch', 'transitions/curtain', 'interactions/pages')}
</body>
</html>
'''

def notfound():
    return head('This room is closed. The Private Museum', 'The room you were looking for is closed for the night.', '/404.html', '', ('pages',)) + f'''<meta name="robots" content="noindex">
</head>
<body class="lost">
{frame('', '')}
<main id="main" class="lost__main">
  <div class="ohero__img lost__img">
    {pic('assets/architecture/door', '', 'Closed bronze doors with a thin line of light between them', 'ohero__pic', lazy=False, prio=True)}
    <div class="veil" aria-hidden="true"></div>
  </div>
  <div class="lost__text">
    <p class="label">Error 404</p>
    <h1 class="ohero__title">This room is closed.</h1>
    <p class="lost__line">Nothing is kept behind this door tonight. The collection is still open.</p>
    <a class="btn-lamp" href="index.html"><span>Return to the collection</span></a>
  </div>
</main>
<div class="curtain" aria-hidden="true"></div>
{scripts('', 'core', 'interactions/torch', 'transitions/curtain', 'interactions/pages')}
</body>
</html>
'''

(OUT / 'objects').mkdir(parents=True, exist_ok=True)
(OUT / 'index.html').write_text(index())
(OUT / 'catalogue.html').write_text(catalogue())
(OUT / '404.html').write_text(notfound())
for k, o in enumerate(OBJECTS):
    (OUT / 'objects' / f"{o['slug']}.html").write_text(obj_page(k))
urls = ['/', '/catalogue.html'] + [f"/objects/{o['slug']}.html" for o in OBJECTS]
(OUT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(f'<url><loc>{SITE}{u}</loc></url>' for u in urls) + '</urlset>\n')
(OUT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
(OUT / 'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#050404"/><radialGradient id="g"><stop offset="0" stop-color="#fff3dc"/><stop offset=".35" stop-color="#e3b06f"/><stop offset="1" stop-color="#e3b06f" stop-opacity="0"/></radialGradient><circle cx="32" cy="32" r="22" fill="url(#g)"/></svg>')
print('built', len(urls) + 1, 'pages')
