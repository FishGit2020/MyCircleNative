#!/usr/bin/env node
/**
 * Seed Hillsong UNITED worship songs into Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./key.json node scripts/seed-songs/hillsong-united.mjs --skip-existing
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  {
    title: "Oceans (Where Feet May Fail)",
    artist: "Hillsong UNITED",
    originalKey: "D",
    format: "chordpro",
    content: `[Bm]You call me out upon the [A/C#]waters
[D]The great un[A]known where feet may [Bm]fail
[Bm]And there I find You in the [A/C#]mystery
[D]In oceans [A]deep my faith will [Bm]stand

[A]And I will [D]call upon Your Name
[G]And keep my [Bm]eyes above the [A]waves
When oceans [D]rise
My soul will [G]rest in Your em[Bm]brace
For I am [D]Yours [A]and You are [Bm]mine

[Bm]Your grace a[A/C#]bounds in deepest [D]waters
[D]Your sovereign [A]hand will be my [Bm]guide
[Bm]Where feet may [A/C#]fail and fear sur[D]rounds me
[D]You've never [A]failed and You won't start [Bm]now

[D]Spirit lead me where my [A]trust is without borders
[Bm]Let me walk upon the [G]waters
[D]Wherever You would [A]call me
[D]Take me deeper than my [A]feet could ever wander
[Bm]And my faith will be made [G]stronger
[D]In the presence of my [A]Savior`,
    notes: "Iconic song. Extended bridge section works well for prayer moments.",
    bpm: 66,
    tags: ["worship","faith","prayer"],
  },
  {
    title: "So Will I (100 Billion X)",
    artist: "Hillsong UNITED",
    originalKey: "G",
    format: "chordpro",
    content: `[G]God of creation
[Em]There at the start, before the [C]beginning of time
[G]With no point of reference
[Em]You spoke to the dark and [C]fleshed out the wonder of [D]light

[G]And as You speak
[Em]A hundred billion [C]galaxies are born
[G]In the vapor of Your [Em]breath the planets form
[C]If the stars were made to [D]worship so will I

[G]God of Your promise
[Em]You don't speak in vain, no [C]syllable empty or void
[G]For once You have spoken
[Em]All nature and science [C]follow the sound of Your [D]voice

[G]And as You speak
[Em]A hundred billion [C]creatures catch Your breath
[G]Evolving in pur[Em]suit of what You said
[C]If it all reveals Your [D]nature so will I`,
    notes: "Poetic and expansive. Let the dynamics breathe. Great for reflection.",
    bpm: 67,
    tags: ["worship","creation","devotion"],
  },
  {
    title: "Even When It Hurts (Praise Song)",
    artist: "Hillsong UNITED",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]Take this fainted heart
[Gm]Take these tainted hands
[Eb]Wash me in Your love
[F]Come like grace again

[Bb]Even when my strength is lost
[Gm]I'll praise You
[Eb]Even when I have no song
[F]I'll praise You
[Bb]Even when it's hard to find the [Gm]words
[Eb]Louder then I'll sing Your [F]praise

[Bb]I will only sing Your [Gm]praise
[Eb]I will only sing Your [F]praise

[Bb]Take this mountain weight
[Gm]Take these ocean tears
[Eb]Hold me through the trial
[F]Come like hope again`,
    notes: "Vulnerable worship moment. Acoustic arrangement works well.",
    bpm: 71,
    tags: ["worship","lament","perseverance"],
  },
  {
    title: "Touch the Sky",
    artist: "Hillsong UNITED",
    originalKey: "E",
    format: "chordpro",
    content: `[E]What fortune lies beyond the stars
[B]Those dazzling heights too vast to see
[C#m]Oh I got lost in [A]empty living
[E]Oh I found my life in [B]bleeding love
[C#m]Poured out, pouring [A]in

[E]What treasure waits within Your scars
[B]This gift of freedom, gold can't buy
[C#m]I bought the world and [A]sold my heart
[E]You traded heaven [B]to have me again
[C#m]My God, my [A]friend

[E]My heart beating, my soul breathing
[B]I found my life when I laid it down
[C#m]Upward falling, [A]spirit soaring
[E]I touch the sky when my knees hit the [B]ground`,
    notes: "Anthemic with a big chorus. Full band energy.",
    bpm: 140,
    tags: ["praise","surrender","anthem"],
  },
  {
    title: "Alive",
    artist: "Hillsong UNITED",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]I was lost with a [Eb]broken heart
[F]You picked me up, [Bb]now I'm standing tall
[Bb]I was dead in the [Eb]dark
[F]Now I'm alive in [Bb]Your love

[Bb]You cut through all the [Eb]lies and shame
[F]You rose to call me [Bb]by my name
[Bb]The price was paid, [Eb]chains fall away
[F]I'm not the [Bb]same

[Bb]I'm alive, I'm a[Eb]live, I'm alive, I'm a[F]live
[Bb]You make me come a[Eb]live, alive, a[F]live
[Bb]My dead bones [Eb]rose, my eyes are [F]open wide
[Bb]I'm alive, I'm a[Eb]live, I'm alive, I'm a[F]live`,
    notes: "High energy declaration. Great for youth worship.",
    bpm: 136,
    tags: ["praise","life","celebration"],
  },
  {
    title: "Another in the Fire",
    artist: "Hillsong UNITED",
    originalKey: "A",
    format: "chordpro",
    content: `[A]There's a grace when the [E]heart is under fire
[F#m]Another way when the [D]walls are closing in
[A]And when I look at the [E]space between
[F#m]Where I used to be and this [D]reckoning

[A]I know I will never be [E]alone
[F#m]There was another in the [D]fire
[A]Standing next to [E]me
[F#m]There was another in the [D]water
[A]Holding back the [E]sea

[A]And I can see the [E]light in the darkness
[F#m]As the darkness [D]bows to Him
[A]I can hear the [E]roar in the heavens
[F#m]As the space between [D]wears thin`,
    notes: "Based on Daniel 3. Powerful declaration of God's presence.",
    bpm: 69,
    tags: ["worship","faith","presence"],
  },
  {
    title: "Relentless",
    artist: "Hillsong UNITED",
    originalKey: "E",
    format: "chordpro",
    content: `[E]I will trust in You alone
[B]My hope and my strength
[C#m]When the storms of life [A]surround me
[E]You remain the [B]same

[E]You are relentless [B]in Your love
[C#m]You don't give [A]up
[E]Your love is relentless [B]toward me
[C#m]You won't let [A]go`,
    notes: "Build intensity through the chorus, electric guitar driven",
    bpm: 76,
    tags: ["worship","declaration","trust"],
  },
  {
    title: "Empires",
    artist: "Hillsong UNITED",
    originalKey: "G",
    format: "chordpro",
    content: `[G]In the shadow of the [D]cross
[Em]Let the whole world [C]see
[G]The wonder of Your [D]name
[Em]That lives in [C]me

[G]Oh Your love is like a [D]fire
[Em]Burns through the [C]empires
[G]Let Your kingdom [D]come
[Em]Your will be [C]done`,
    notes: "Anthemic feel, build with full band on chorus",
    bpm: 68,
    tags: ["worship","anthem","kingdom"],
  },
  {
    title: "Not Today",
    artist: "Hillsong UNITED",
    originalKey: "B",
    format: "chordpro",
    content: `[B]The enemy has no [E]hold on me
[G#m]I am free from [F#]his chains
[B]He thought he had me [E]in his grip
[G#m]But I will rise [F#]again

[B]Not today, [E]not today
[G#m]Fear you have no [F#]hold on me
[B]Not today, [E]not today
[G#m]I am walking [F#]free`,
    notes: "Driving rhythm, strong declaration song for spiritual warfare",
    bpm: 140,
    tags: ["worship","spiritual warfare","freedom"],
  },
  {
    title: "Love Is War",
    artist: "Hillsong UNITED",
    originalKey: "Em",
    format: "chordpro",
    content: `[Em]What fear has [C]held us now
[G]That love has [D]not set free
[Em]Through battle [C]scars You showed
[G]Your victory [D]complete

[Em]Love is war, love is [C]war
[G]You fought for me with [D]arms nailed wide
[Em]Love is war, love is [C]war
[G]Death could not hold [D]You down`,
    notes: "Intense and passionate, keep the energy building throughout",
    bpm: 132,
    tags: ["worship","cross","victory"],
  },
  {
    title: "Here Now (Madness)",
    artist: "Hillsong UNITED",
    originalKey: "Ab",
    format: "chordpro",
    content: `[Ab]Spirit of the living [Eb]God
[Fm]Come fall afresh on [Db]me
[Ab]Come wake me from the [Eb]dead
[Fm]Lead me in a [Db]way I've never been

[Ab]You are here now [Eb]here now
[Fm]Oh this is holy [Db]ground
[Ab]You are here now [Eb]here now
[Fm]Oh this is [Db]madness`,
    notes: "Ethereal intro building to explosive chorus, keys-driven",
    bpm: 70,
    tags: ["worship","Holy Spirit","presence"],
  },
  {
    title: "Captain",
    artist: "Hillsong UNITED",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Through the calm and [D]through the storm
[Em]Through the loss and [C]through the war
[G]Through it all You are [D]faithful
[Em]And I will trust in [C]You

[G]Oh my Captain, [D]my Captain
[Em]My eyes are on [C]You
[G]Oh my Captain, [D]my Captain
[Em]Lead me [C]through`,
    notes: "Steady tempo, builds confidence, great for congregational singing",
    bpm: 74,
    tags: ["worship","trust","faithfulness"],
  },
  {
    title: "Echoes",
    artist: "Hillsong UNITED",
    originalKey: "A",
    format: "chordpro",
    content: `[A]From the deepest [E]ocean
[F#m]To the highest [D]mountain
[A]Your voice resounds [E]through the heavens
[F#m]And the earth [D]trembles

[A]Echoes of Your [E]glory
[F#m]Echoes of Your [D]mercy
[A]All creation [E]singing
[F#m]Echoes of [D]You`,
    notes: "Spacious arrangement, big reverb on vocals, U2-inspired guitars",
    bpm: 128,
    tags: ["worship","creation","glory"],
  },
  {
    title: "Say the Word",
    artist: "Hillsong UNITED",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Impossible is [G]just a word
[Am]Thrown around by [F]those who've never dared
[C]But You have never [G]failed to come through
[Am]Every promise [F]kept and proved

[C]Say the word, [G]say the word
[Am]And it is [F]done
[C]Say the word, [G]say the word
[Am]And mountains [F]move`,
    notes: "Faith-building anthem, simple progression, great call-and-response",
    bpm: 72,
    tags: ["worship","faith","declaration"],
  },
  {
    title: "Never Alone",
    artist: "Hillsong UNITED",
    originalKey: "D",
    format: "chordpro",
    content: `[D]You call me out [A]upon the waters
[Bm]Where feet may [G]fail
[D]But through the flood [A]You are faithful
[Bm]Closer than the [G]air I breathe

[D]I am never [A]alone
[Bm]You are with me, [G]You are with me
[D]I am never [A]alone
[Bm]You will never [G]leave`,
    notes: "Intimate verse building to confident chorus, acoustic-led",
    bpm: 66,
    tags: ["worship","comfort","presence"],
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
