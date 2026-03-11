#!/usr/bin/env node
/**
 * Seed Vineyard Worship worship songs into Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./key.json node scripts/seed-songs/vineyard-worship.mjs --skip-existing
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  {
    title: "Come Now Is the Time to Worship",
    artist: "Vineyard Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Come, now is the time to [A]worship
[Em]Come, now is the time to [G]give your heart
[D]Come, just as you are to [A]worship
[Em]Come, just as you are be[G]fore your God
[D]Come

[G]One day every tongue will [D]confess You are God
[G]One day every knee will [Em]bow
[G]Still the greatest treasure re[D]mains for those
[G]Who gladly [A]choose You [D]now`,
    notes: "Classic call to worship, acoustic-driven",
    bpm: 108,
    tags: ["worship","classic","call-to-worship"],
  },
  {
    title: "Hungry (Falling on My Knees)",
    artist: "Vineyard Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Hungry I come to [D/F#]You
[Em]For I know You satis[C]fy
[G]I am empty [D/F#]but I know
[Em]Your love does not run [C]dry

[G]So I wait for [D/F#]You
[Em]So I wait for [C]You

[G]I'm falling on my [D]knees
[Em]Offering all of [C]me
[G]Jesus You're all this [D]heart is living for
[Em]I'm falling on my [C]knees
[G]I'm falling on my [D]knees
[Em]Offering all of [C]me`,
    notes: "Reverent and longing, keep volume low",
    bpm: 72,
    tags: ["worship","devotional","intimate"],
  },
  {
    title: "Breathe on Me",
    artist: "Vineyard Worship",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Breathe on me, [G/B]breath of God
[Am]Fill me with [F]life anew
[C]That I may [G/B]love what Thou dost love
[Am]And do what [F]Thou wouldst [G]do

[C]Breathe on me, [G/B]breath of God
[Am]Until my [F]heart is pure
[C]Until with [G/B]Thee I will one [Am]will
[F]To do and [G]to en[C]dure

[F]Holy Spirit [G]breathe on me
[Am]Set my heart on [F]fire
[C]Breathe on me [G]breath of God
[Am]You are my [F]one de[C]sire`,
    notes: "Prayerful and gentle, great for prayer ministry",
    bpm: 68,
    tags: ["worship","prayer","holy-spirit"],
  },
  {
    title: "Refiner's Fire",
    artist: "Vineyard Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Purify my [D]heart
[Em]Let me be as [C]gold
[G]And precious [D]silver
[Em]Purify my [C]heart
[G]Let me be as [D]gold
[Em]Pure [C]gold

[C]Refiner's [D]fire
[G]My heart's one de[Em]sire
[C]Is to be [D]holy
[G]Set apart for [Em]You Lord
[C]I choose to [D]be holy
[Em]Set apart for [C]You my Master
[G]Ready to do [D]Your will`,
    notes: "Classic Vineyard song, Brian Doerksen, gentle and sincere",
    bpm: 76,
    tags: ["worship","classic","holiness"],
  },
  {
    title: "Change My Heart Oh God",
    artist: "Vineyard Worship",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Change my heart oh [F]God
[G]Make it ever [C]true
[C]Change my heart oh [F]God
[G]May I be like [C]You

[F]You are the [G]potter
[Am]I am the [F]clay
[F]Mold me and [G]make me
[Am]This is what I [G]pray

[C]Change my heart oh [F]God
[G]Make it ever [C]true
[C]Change my heart oh [F]God
[G]May I be like [C]You`,
    notes: "Eddie Espinosa classic, simple and singable",
    bpm: 80,
    tags: ["worship","classic","prayer"],
  },
  {
    title: "Isn't He",
    artist: "Vineyard Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Isn't He [C]beautiful
[D]Isn't He [G]wonderful
[G]Isn't He, [C]isn't He, [D]isn't He

[G]Beautiful, [C]beautiful
[D]Lord of [G]all
[G]Prince of [C]Peace, Son of [D]God isn't [G]He`,
    notes: "Classic Vineyard simplicity. Let it loop with gentle builds.",
    bpm: 66,
    tags: ["worship","adoration","classic"],
  },
  {
    title: "Holy and Anointed One",
    artist: "Vineyard Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Jesus, [A]Jesus
[Bm]Holy and A[G]nointed One
[D]Jesus [A] [G]

[D]Your name is like [A]honey on my lips
[Bm]Your Spirit like [G]water to my soul
[D]Your Word is a [A]lamp unto my [G]feet
[D]Jesus I [A]love [G]You`,
    notes: "John Barnett classic. Intimate and reverent.",
    bpm: 64,
    tags: ["worship","classic","intimacy"],
  },
  {
    title: "Sweetly Broken",
    artist: "Vineyard Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]To the cross I [D]look
[Em]To the cross I [C]cling
[G]Of its suffering [D]I do drink
[Em]Of its work I do [C]sing

[G]Sweetly broken, [D]wholly surrendered
[Em]Sweetly broken, [C]wholly given to [G]You`,
    notes: "Jeremy Riddle song. Communion-ready atmosphere.",
    bpm: 68,
    tags: ["worship","cross","surrender"],
  },
  {
    title: "Draw Me Close",
    artist: "Vineyard Worship",
    originalKey: "F",
    format: "chordpro",
    content: `[F]Draw me close to [C]You
[Dm]Never let me [Bb]go
[F]I lay it all down [C]again
[Dm]To hear You say that [Bb]I'm Your friend

[F]You are my de[C]sire
[Dm]No one else will [Bb]do
[F]Nothing else could take Your [C]place
[Dm]To feel the warmth of [Bb]Your em[F]brace`,
    notes: "Kelly Carpenter classic. One of Vineyard's most beloved.",
    bpm: 62,
    tags: ["worship","classic","intimacy"],
  },
  {
    title: "Let It Rise",
    artist: "Vineyard Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Let the glory of the [D]Lord
[Em]Rise among [C]us
[G]Let the glory of the [D]Lord
[Em]Rise among [C]us

[G]Let the praises of the [D]King
[Em]Rise among [C]us
[G]Let it [D]rise [Em] [C]`,
    notes: "Holland Davis classic. Great corporate worship opener.",
    bpm: 76,
    tags: ["worship","glory","praise"],
  },
  {
    title: "More Love More Power",
    artist: "Vineyard Worship",
    originalKey: "Em",
    format: "chordpro",
    content: `[Em]More love, more [C]power
[D]More of You in my [Em]life
[Em]More love, more [C]power
[D]More of You in my [Em]life

[Em]I will worship [C]You with all of my [D]heart
[Em]I will worship [C]You with all of my [D]mind
[Em]I will worship [C]You with all of my [D]strength
[Em]You are my [C]Lord [D] [Em]`,
    notes: "Jude Del Hierro classic. Simple, powerful prayer.",
    bpm: 70,
    tags: ["worship","prayer","classic"],
  },
  {
    title: "You Are Good (Vineyard)",
    artist: "Vineyard Worship",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Lord You are [E]good
[F#m]And Your mercy endures for[D]ever
[A]Lord You are [E]good
[F#m]And Your mercy endures for[D]ever

[A]People from every [E]nation and tongue
[F#m]From generation to gener[D]ation
[A]We worship You, halle[E]lujah [D]`,
    notes: "Psalm 100:5 celebration. Joyful and energetic.",
    bpm: 128,
    tags: ["worship","goodness","celebration"],
  },
  {
    title: "Hallelujah Your Love Is Amazing",
    artist: "Vineyard Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Your love is a[D]mazing
[Em]Steady and un[C]changing
[G]Your love is a [D]mountain
[Em]Firm beneath my [C]feet

[G]Hallelujah, halle[D]lujah
[Em]Hallelujah, Your [C]love makes me sing
[G]Hallelujah, halle[D]lujah
[Em]Hallelujah, Your [C]love makes me [G]sing`,
    notes: "Brenton Brown song. Joyful, singable, great opener.",
    bpm: 120,
    tags: ["worship","love","joy"],
  },
  {
    title: "We Fall Down",
    artist: "Vineyard Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]We fall down, we [A]lay our crowns
[Bm]At the feet of [G]Jesus
[D]The greatness of [A]mercy and love
[Bm]At the feet of [G]Jesus

[D]And we cry holy, holy, [A]holy
[Bm]And we cry holy, holy, [G]holy
[D]And we cry holy, holy, [A]holy is the [G]Lamb`,
    notes: "Chris Tomlin wrote this during Vineyard era. Reverent.",
    bpm: 64,
    tags: ["worship","reverence","classic"],
  },
  {
    title: "Step by Step",
    artist: "Vineyard Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]O God You are my [C]God
[D]And I will ever [G]praise You
[G]O God You are my [C]God
[D]And I will ever [G]praise You

[G]I will seek You in the [C]morning
[D]And I will learn to walk in Your [G]ways
[G]And step by step You [C]lead me
[D]And I will follow You all of my [G]days`,
    notes: "Rich Mullins / Vineyard classic. Singable and timeless.",
    bpm: 74,
    tags: ["worship","classic","following"],
  },
  {
    title: "Seek First",
    artist: "Vineyard Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Seek ye first the [A]kingdom of God
[Bm]And His righteous[G]ness
[D]And all these things shall be [A]added unto you
[Bm]Allelu, allelu[G]ia

[D]Ask and it shall be [A]given unto you
[Bm]Seek and ye shall [G]find
[D]Knock and it shall be [A]opened unto [G]you
[Bm]Allelu, allelu[G]ia`,
    notes: "Matthew 6:33. Traditional Vineyard arrangement. Timeless.",
    bpm: 70,
    tags: ["worship","scripture","classic"],
  },
  {
    title: "I Could Sing of Your Love Forever",
    artist: "Vineyard Worship",
    originalKey: "E",
    format: "chordpro",
    content: `[E]Over the mountains and the [B]sea
[C#m]Your river runs with love for [A]me
[E]And I will open up my [B]heart
[C#m]And let the Healer set me [A]free

[E]I could sing of Your love for[B]ever
[C#m]I could sing of Your love for[A]ever
[E]I could sing of Your love for[B]ever
[C#m]I could sing of Your love for[A]ever`,
    notes: "Martin Smith / Delirious classic covered by Vineyard. Iconic.",
    bpm: 118,
    tags: ["worship","love","classic"],
  },
  {
    title: "Spirit of God",
    artist: "Vineyard Worship",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Spirit of God fall [G]fresh on me
[Am]Fill me anew, fill [F]me anew
[C]Spirit of God fall [G]fresh on me
[Am]Melt me, mold me, [F]use me

[C]Living breath of [G]God
[Am]Come breathe on [F]us
[C]Spirit of [G]God [F]come`,
    notes: "Vineyard intimacy at its best. Soft, expectant.",
    bpm: 62,
    tags: ["worship","spirit","prayer"],
  },
  {
    title: "I Love You Lord (Vineyard)",
    artist: "Vineyard Worship",
    originalKey: "F",
    format: "chordpro",
    content: `[F]I love You [C]Lord
[Dm]And I lift my [Bb]voice
[F]To worship [C]You
[Dm]Oh my soul re[Bb]joice

[F]Take joy my [C]King
[Dm]In what You [Bb]hear
[F]May it be a [C]sweet sweet [Dm]sound
[Bb]In Your [F]ear`,
    notes: "Laurie Klein classic. One of the simplest, most beloved worship songs.",
    bpm: 58,
    tags: ["worship","love","classic"],
  },
  {
    title: "All I Need Is You",
    artist: "Vineyard Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]All I need is [A]You Lord
[Bm]Is You Lord, is [G]You Lord
[D]All I need is [A]You Lord
[Bm]Is You [G]Lord

[D]One thing I [A]ask, one thing I [Bm]seek
[G]To see Your [D]beauty
[A]To find You in the [Bm]place
[G]I am in`,
    notes: "Brian Johnson / early Bethel meets Vineyard. Minimal arrangement.",
    bpm: 68,
    tags: ["worship","simplicity","devotion"],
  },
];

const skipExisting = process.argv.includes('--skip-existing');

async function main() {
  const col = db.collection('worshipSongs');
  let existingKeys = new Set();
  if (skipExisting) {
    const snapshot = await col.get();
    for (const doc of snapshot.docs) {
      const d = doc.data();
      existingKeys.add(`${d.title}|||${d.artist}`);
    }
    console.log(`Found ${existingKeys.size} existing songs in Firestore.`);
  }
  let batch = db.batch();
  let count = 0;
  let batchCount = 0;
  for (const song of SONGS) {
    const key = `${song.title}|||${song.artist}`;
    if (skipExisting && existingKeys.has(key)) {
      console.log(`  SKIP: ${song.title} - ${song.artist}`);
      continue;
    }
    const ref = col.doc();
    batch.set(ref, {
      ...song,
      createdBy: 'seed-script',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    count++;
    batchCount++;
    console.log(`  ADD:  ${song.title} - ${song.artist}`);
    if (batchCount >= 450) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
    }
  }
  if (batchCount > 0) await batch.commit();
  console.log(`\nSeeded ${count} songs (total in script: ${SONGS.length}).`);
}

main().catch((err) => { console.error('Seed failed:', err); process.exit(1); });
