# The Private Museum, v2: "After hours"

## Brief
Subject: a fictional private collection of five high-jewellery pieces. Audience: clients of a
maison and design juries. Job: make one visitor feel the collection was opened for them alone.
Constraints from the owner: plain HTML/CSS/JS, folders /assets/{architecture,jewellery,details,video,textures},
/js/{scroll,transitions,interactions}, /css. Horizontal travel driven by vertical scroll. Dark, spotlit, mystical.
Assumptions (placeholders): every carat weight, origin and anecdote is fictional exhibition copy. The
contact address viewing@theprivatemuseum.example is a placeholder.

## Concepts considered
1. After hours (chosen). The museum is closed and dark; your pointer is the only light. Each vitrine
   wakes when you reach it and sleeps behind you. Anchor: jewellery only exists when light hits it.
   Originality 4, fit 5, feasibility 4, portability 2.
2. The cutter's loupe: every view is through a 10x loupe ring. Strong but reads as a product zoom tool. 3/4/5/3.
3. Provenance ledger: the journey as a handwritten inventory. Too literary for a visual brief. 3/3/4/2.

## Concept card
Idea:        The collection sleeps in the dark; you carry the light, and each jewel wakes only for you.
Metaphor:    a closed museum walked with a torch; gallery lamps that switch on with a tungsten flicker.
Signature:   the torch. Your pointer reveals the lit photograph through the lights-off photograph of the
             same room (two pixel-aligned plates), then the pin-spot flickers on, dust hangs in the beam,
             facets glint at their real positions (detected from the photographs).
Emotion:     hush, then a small gasp when the lamp comes on.
Motion verb: wake like a lamp. Things are revealed by light (opacity, masks, glints), never slid in.
Screenshot:  a black room with a warm circle of light catching half a diamond necklace.

## System
Palette: ground #050404 (night), ink #ede6da (lamplit paper), muted #9a8f82, line rgba(237,230,218,.16),
accent #e3b06f (tungsten), curtain #000.
Type: Bodoni Moda (display and reading, optical sizes, italic for names); Instrument Sans for museum labels
(12 to 13 px, uppercase, tracking .16em). Display tracking -0.03em to -0.045em.
Grid: 12 columns, 4vw margins on desktop, 20 px on phones. Labels hang from the left margin.
Shape: no radii, hairlines only. Ease: cubic-bezier(.22,1,.36,1) (expo out); lamps use a flicker curve.
Hover treatments: links: a light passes across the word and a hairline grows from the centre.
Images and catalogue rows: they wake (lights-off plate to lit plate).
Idle state: the torch drifts slowly around the jewel when the pointer is still; glints twinkle; dust drifts.

## Pages
index (the walk), catalogue (inventory ledger), objects/<name> (one per jewel), 404 (this room is closed).
Phone: vertical walk, 4:5 crops, lamps wake as each vitrine reaches the centre, drag to move the light.
Reduced motion: every lamp on, no torch, no smooth scroll, all text visible.
