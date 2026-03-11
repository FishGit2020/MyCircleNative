#!/usr/bin/env node
/**
 * Seed Brandon Lake worship songs into Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./key.json node scripts/seed-songs/brandon-lake.mjs --skip-existing
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  {
    title: "Gratitude",
    artist: "Brandon Lake",
    originalKey: "G",
    format: "chordpro",
    content: `[G]All my words fall short, I got [Em]nothing new
[C]How could I express all my [D]gratitude

[G]I could sing these songs as I [Em]often do
[C]But every song must end and [D]You never do

[G]So I throw up my [Em]hands and praise You again and again
[C]'Cause all that I have is a [D]hallelujah, hallelujah
[G]And I know it's not [Em]much but I've nothing else
[C]Fit for a King except for a [D]heart singing hallelujah

[G]Come on my soul, oh don't you get [Em]shy on me
[C]Lift up your song, 'cause you got a [D]lion inside of those lungs
[G]Get up and praise the [Em]Lord`,
    notes: "Joyful praise. Let the gratitude overflow. Full energy.",
    bpm: 81,
    tags: ["praise","gratitude","joy"],
  },
  {
    title: "Coat of Many Colors",
    artist: "Brandon Lake",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Every color tells a [G]story
[Am]Every thread a lesson [F]learned
[C]Through the tearing and the [G]mending
[Am]God was making something [F]beautiful

[C]He's putting on a [G]coat of many colors
[Am]He's weaving every [F]heartbreak into gold
[C]What the enemy meant for [G]evil
[Am]God has turned for [F]good
[C]A coat of many [G]colors
[Am]Tells the story of His [F]love`,
    notes: "Story-driven worship, vulnerable and personal",
    bpm: 78,
    tags: ["worship","testimony","redemption"],
  },
  {
    title: "I Need a Ghost",
    artist: "Brandon Lake",
    originalKey: "G",
    format: "chordpro",
    content: `[G]I've been running on [D]empty
[Em]I've been trying to [C]fill this void
[G]But nothing in this [D]world
[Em]Can give me what I [C]need

[G]I need a Ghost, the [D]Holy Ghost
[Em]Come fill me up, I [C]need You most
[G]More than the air I [D]breathe
[Em]More than a melody [C]I need
[G]I need a Ghost, the [D]Holy Ghost
[Em]Come set a fire [C]in my bones
[G]Spirit I'm calling [D]out
[Em]I can't live with[C]out You now`,
    notes: "Passionate cry for the Spirit, dynamic buildup",
    bpm: 124,
    tags: ["worship","holy-spirit","passion"],
  },
  {
    title: "Count 'Em",
    artist: "Brandon Lake",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Start from the beginning [G]go back to the start
[Am]Think of all the times He [F]healed your broken heart
[C]And when you lose your [G]focus and you can't see His hand
[Am]Count your bless[F]ings one by one

[C]Count em, count em, [G]count your blessings
[Am]One by one and [F]you will see
[C]Count em, count em, [G]count your blessings
[Am]Name them one by [F]one
[C]And it will surprise you [G]what the Lord has done
[Am]Count [F]em`,
    notes: "Joyful and grateful, clap-along energy",
    bpm: 126,
    tags: ["worship","gratitude","joy"],
  },
  {
    title: "More (Brandon Lake)",
    artist: "Brandon Lake",
    originalKey: "A",
    format: "chordpro",
    content: `[A]I've tasted and I've [E]seen
[F#m]But I want more of [D]You
[A]There's a longing in my [E]soul
[F#m]Only You can [D]fill

[A]More, I want [E]more
[F#m]More of Your presence [D]Lord
[A]More, give me [E]more
[F#m]I can never get e[D]nough
[A]Of Your love, of Your [E]grace
[F#m]Of Your power and Your [D]face
[A]I want more, [E]more
[F#m]Give me [D]more`,
    notes: "Intimate prayer building to passionate cry",
    bpm: 80,
    tags: ["worship","prayer","hunger"],
  },
  {
    title: "Graves to Gardens (Brandon Lake)",
    artist: "Brandon Lake",
    originalKey: "C",
    format: "chordpro",
    content: `[C]I searched the world but it [G]couldn't fill me
[Am]Man's empty praise and [F]treasures that fade
[C]Are never enough [G]
[Am]Then You came along and [F]put me back together

[C]And every part of me [G]cries out
[Am]More, more, [F]more

[C]You turn mourning to [G]dancing
[Am]You give beauty for [F]ashes
[C]You turn graves into [G]gardens
[Am]You turn bones into [F]armies
[C]You turn seas into [G]highways
[Am]You're the only one [F]who can
[C]You're the only one [G]who can`,
    notes: "Brandon Lake version emphasis, raw worship energy",
    bpm: 72,
    tags: ["worship","transformation","testimony"],
  },
  {
    title: "Praise Through It",
    artist: "Brandon Lake",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]I'm gonna praise through [F]it
[Gm]I'm gonna praise through [Eb]it
[Bb]When the night is [F]long
[Gm]And the battle [Eb]rages on

[Bb]I will praise through [F]it
[Gm]Every wall will [Eb]fall
[Bb]I'm gonna praise my [F]way [Eb]through`,
    notes: "Warfare worship. Keep energy high and relentless.",
    bpm: 130,
    tags: ["worship","praise","warfare"],
  },
  {
    title: "We Need the Fire",
    artist: "Brandon Lake",
    originalKey: "E",
    format: "chordpro",
    content: `[E]We need the fire [B]falling down
[C#m]Holy Spirit [A]come right now
[E]Like You did at [B]Pentecost
[C#m]Send the fire, [A]at any cost

[E]We need the [B]fire
[C#m]We need the [A]fire
[E]Holy Ghost [B]fire [A]`,
    notes: "Acts 2 Pentecost passion. Raw, urgent energy.",
    bpm: 134,
    tags: ["worship","fire","spirit"],
  },
  {
    title: "House of Miracles",
    artist: "Brandon Lake",
    originalKey: "G",
    format: "chordpro",
    content: `[G]This is the house of [D]miracles
[Em]This is where You [C]move
[G]Nothing is impos[D]sible
[Em]When we call on [C]You

[G]Miracles happen [D]here
[Em]In the presence of the [C]Lord
[G]This is the house of [D]miracles [C]`,
    notes: "Faith declaration over the house of God. Builds to climax.",
    bpm: 76,
    tags: ["worship","miracles","faith"],
  },
  {
    title: "Household of Faith",
    artist: "Brandon Lake",
    originalKey: "D",
    format: "chordpro",
    content: `[D]We are a household of [A]faith
[Bm]Built on the rock that is [G]Jesus
[D]Standing on promises [A]made
[Bm]Generation to gener[G]ation

[D]The gates of hell shall [A]not prevail
[Bm]Against the church He [G]built
[D]A household of [A]faith [G]`,
    notes: "Multigenerational anthem. Great for church families.",
    bpm: 78,
    tags: ["worship","church","faith"],
  },
  {
    title: "Tear Off the Roof",
    artist: "Brandon Lake",
    originalKey: "A",
    format: "chordpro",
    content: `[A]We're tearing off the [E]roof
[F#m]Nothing's gonna stop us [D]now
[A]We're bringing every[E]thing to Jesus
[F#m]Laying it all [D]down

[A]Like the friends who [E]tore the roof
[F#m]We will do what[D]ever it takes
[A]To get to [E]You [D]Lord`,
    notes: "Mark 2:1-12 reference. High-energy, faith-filled.",
    bpm: 138,
    tags: ["worship","faith","scripture"],
  },
  {
    title: "Keep on Praising",
    artist: "Brandon Lake",
    originalKey: "G",
    format: "chordpro",
    content: `[G]I'm gonna keep on [D]praising
[Em]Keep on praising Your [C]name
[G]Even when I [D]can't see it
[Em]I'll keep on [C]praising

[G]Through the storm, through the [D]fire
[Em]I keep on praising [C]higher
[G]Never gonna [D]stop, I keep on [C]praising`,
    notes: "Relentless praise energy. Great for pushing through.",
    bpm: 128,
    tags: ["worship","praise","perseverance"],
  },
  {
    title: "Fire",
    artist: "Brandon Lake",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Send Your fire [G]down
[Am]Let it burn in [F]us
[C]Holy fire [G]consume
[Am]Everything that's [F]not of You

[C]Fire, [G]fire
[Am]Fall on [F]us
[C]Holy Spirit [G]fire [F]come`,
    notes: "Short, intense worship moment. Loop-able for extended sets.",
    bpm: 80,
    tags: ["worship","fire","holiness"],
  },
  {
    title: "I Believe (Brandon Lake)",
    artist: "Brandon Lake",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]I believe in the [F]power of God
[Gm]I believe in the [Eb]name of Jesus
[Bb]I believe that the [F]Word is alive
[Gm]And it cuts like the [Eb]sharpest sword

[Bb]I believe, [F]I believe
[Gm]Lord I be[Eb]lieve
[Bb]Help my unbe[F]lief [Eb]`,
    notes: "Mark 9:24 conclusion. Bold statement of faith.",
    bpm: 74,
    tags: ["worship","faith","declaration"],
  },
  {
    title: "Ready to Praise",
    artist: "Brandon Lake",
    originalKey: "E",
    format: "chordpro",
    content: `[E]I came here [B]ready to praise
[C#m]Ready to give You [A]everything
[E]Nothing held [B]back
[C#m]I'm ready to [A]praise

[E]With everything I [B]am
[C#m]Every breath in my [A]lungs
[E]I came ready to [B]praise [A]`,
    notes: "High energy opener. Sets the tone for worship.",
    bpm: 136,
    tags: ["worship","praise","energy"],
  },
  {
    title: "Waking Up",
    artist: "Brandon Lake",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Something's waking [A]up inside of me
[Bm]Like a fire that [G]will not sleep
[D]Revival starting [A]in my soul
[Bm]I'm waking up to [G]who You are

[D]Waking up, [A]waking up
[Bm]To the truth that [G]sets me free
[D]Waking up [A]again [G]`,
    notes: "Ephesians 5:14 theme. Morning worship vibe.",
    bpm: 118,
    tags: ["worship","awakening","revival"],
  },
  {
    title: "Bethlehem",
    artist: "Brandon Lake",
    originalKey: "G",
    format: "chordpro",
    content: `[G]O little town of [D]Bethlehem
[Em]Where the Savior [C]came
[G]Heaven touched the [D]earth that night
[Em]Nothing was the [C]same

[G]In a manger [D]small and lowly
[Em]God became a [C]man
[G]Bethlehem, where [D]it all be[C]gan`,
    notes: "Christmas / Advent song. Reflective, wonder-filled.",
    bpm: 64,
    tags: ["worship","christmas","advent"],
  },
  {
    title: "Rivers",
    artist: "Brandon Lake",
    originalKey: "F",
    format: "chordpro",
    content: `[F]Rivers of living [C]water
[Dm]Flowing from the [Bb]throne
[F]Streams in the [C]desert
[Dm]You are never [Bb]done

[F]Like a river [C]rushing through
[Dm]Your Spirit flows and [Bb]makes all new
[F]Rivers of [C]life [Bb]`,
    notes: "John 7:38. Flowing, dynamic arrangement.",
    bpm: 72,
    tags: ["worship","spirit","life"],
  },
  {
    title: "Pour It Out (Brandon Lake)",
    artist: "Brandon Lake",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Pour it out, pour it [E]out
[F#m]Like perfume on Your [D]feet
[A]Pour it out, pour it [E]out
[F#m]This worship is for [D]You

[A]Nothing held [E]back
[F#m]Nothing too [D]precious
[A]I pour it [E]out at Your [D]feet`,
    notes: "Mary anointing Jesus. Extravagant worship theme.",
    bpm: 68,
    tags: ["worship","surrender","devotion"],
  },
  {
    title: "Overflow",
    artist: "Brandon Lake",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Let Your presence over[G]flow
[Am]Fill every corner [F]of my soul
[C]More than I can [G]hold
[Am]Let it over[F]flow

[C]Overflow, [G]overflow
[Am]Let Your love [F]overflow
[C]From my life to [G]everyone I [F]know`,
    notes: "Outward-focused worship. Joy and generosity.",
    bpm: 120,
    tags: ["worship","overflow","joy"],
  },
  {
    title: "Thank You Lord",
    artist: "Brandon Lake",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Thank You Lord for [D]all You've done
[Em]Thank You Lord for [C]every one
[G]Thank You for Your [D]faithful love
[Em]That never gives [C]up

[G]In the morning [D]I will praise
[Em]Through the night I'll [C]sing Your name
[G]Thank You [D]Lord [C]`,
    notes: "Gratitude anthem. Warm, congregational feel.",
    bpm: 74,
    tags: ["worship","gratitude","thanksgiving"],
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
