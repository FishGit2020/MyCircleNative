#!/usr/bin/env node
/**
 * Seed Kari Jobe worship songs into Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./key.json node scripts/seed-songs/kari-jobe.mjs --skip-existing
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  {
    title: "Revelation Song",
    artist: "Kari Jobe",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Worthy is the [Am]Lamb who was slain
[C]Holy, holy is [G]He
[D]Sing a new song [Am]to Him who sits on
[C]Heaven's mercy [G]seat

[D]Holy, holy, [Am]holy is the Lord God Al[C]mighty
[G]Who was and is and [D]is to come
[D]With all creation [Am]I sing praise to the [C]King of kings
[G]You are my every[D]thing and I will adore You

[D]Clothed in rainbows [Am]of living color
[C]Flashes of lightning, [G]rolls of thunder
[D]Blessing and honor, [Am]strength and glory
[C]And power be to [G]You, the only wise King`,
    notes: "Prophetic worship. Let it breathe and build.",
    bpm: 66,
    tags: ["worship","revelation","holiness"],
  },
  {
    title: "The Blessing",
    artist: "Kari Jobe",
    originalKey: "C",
    format: "chordpro",
    content: `[C]The Lord bless you and [G]keep you
[Am]Make His face shine upon [F]you
And be gracious to [C]you
The Lord turn His [G]face toward you
[Am]And give you [F]peace

[C]Amen, [G]amen, [Am]amen
[F]Amen, [C]amen, [G]amen

[Am]May His [F]favor be upon you
[C]And a thousand [G]generations
[Am]And your [F]family and your children
[C]And their [G]children and their children

[Am]May His [F]presence go before you
[C]And behind you [G]and beside you
[Am]All a[F]round you and within you
[C]He is [G]with you, He is with you`,
    notes: "Benediction song. Powerful extended worship. Based on Numbers 6:24-26.",
    bpm: 72,
    tags: ["worship","blessing","prayer"],
  },
  {
    title: "Forever (We Sing Hallelujah)",
    artist: "Kari Jobe",
    originalKey: "G",
    format: "chordpro",
    content: `[G]The moon and stars they [Em]wept
[C]The morning sun was [G]dead
[G]The Savior of the [Em]world was fallen
[C]His body on the [D]cross
[C]His blood poured out for [D]us
[G]The weight of every [Em]curse upon Him

[G]One final breath He [Em]gave
[C]As heaven looked a[G]way
[G]The Son of God was [Em]laid in darkness
[C]A battle in the [D]grave
[C]The war on death was [D]waged
[G]The power of hell for[Em]ever broken

[G]The ground began to [Em]shake, the stone was rolled [C]away
[G]His perfect love could [Em]not be overcome
[C]Now death where is your [D]sting, our resurrected [Em]King
[C]Has rendered you de[D]feated

[G]Forever He is [Em]glorified, forever He is [C]lifted high
[G]Forever He is [Em]risen, He is a[C]live, He is a[D]live`,
    notes: "Resurrection anthem. Builds from somber verse to explosive chorus.",
    bpm: 74,
    tags: ["worship","resurrection","victory"],
  },
  {
    title: "I Am Not Alone",
    artist: "Kari Jobe",
    originalKey: "B",
    format: "chordpro",
    content: `[B]When I walk through [E]deep waters
[G#m]I know that You will [F#]be with me
[B]When I'm standing [E]in the fire
[G#m]I will not be over[F#]come

[B]I am not a[E]lone
[G#m]I am not a[F#]lone
[B]You will go be[E]fore me
[G#m]You will never [F#]leave me`,
    notes: "Isaiah 43:2. Powerful reassurance anthem.",
    bpm: 72,
    tags: ["worship","comfort","promise"],
  },
  {
    title: "Speak to Me (Kari Jobe)",
    artist: "Kari Jobe",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Speak to me, [E]speak to me
[F#m]Holy Spirit [D]come
[A]Open my ears to [E]hear Your voice
[F#m]Above the noise of [D]this world

[A]Speak, for Your [E]servant hears
[F#m]Quiet the storm in [D]me
[A]Speak to me [E]Lord [D]`,
    notes: "1 Samuel 3:10 inspired. Meditative and still.",
    bpm: 60,
    tags: ["worship","listening","prayer"],
  },
  {
    title: "Heal Our Land",
    artist: "Kari Jobe",
    originalKey: "G",
    format: "chordpro",
    content: `[G]If My people will [D]humbly pray
[Em]Turn from their sin and [C]seek My face
[G]I will hear from [D]heaven
[Em]And heal their [C]land

[G]Heal our land, [D]heal our land
[Em]Lord we cry [C]out to You
[G]Heal our [D]land [C]Lord`,
    notes: "2 Chronicles 7:14. Corporate prayer and repentance.",
    bpm: 68,
    tags: ["worship","prayer","nation"],
  },
  {
    title: "First Love",
    artist: "Kari Jobe",
    originalKey: "C",
    format: "chordpro",
    content: `[C]Take me back to my [G]first love
[Am]Where my heart was [F]fully Yours
[C]Take me back to the [G]beginning
[Am]When I lived for [F]You alone

[C]You're my first [G]love
[Am]Nothing compares to [F]You
[C]You're my first [G]love [F]Lord`,
    notes: "Revelation 2:4. Returning to devotion. Tender.",
    bpm: 66,
    tags: ["worship","devotion","return"],
  },
  {
    title: "You Are for Me",
    artist: "Kari Jobe",
    originalKey: "E",
    format: "chordpro",
    content: `[E]So I will not [B]fear
[C#m]You are for [A]me
[E]So I will not [B]fear
[C#m]You are for [A]me

[E]I know who goes be[B]fore me
[C#m]I know who stands be[A]hind
[E]The God of angel [B]armies
[C#m]Is always by my [A]side`,
    notes: "Romans 8:31 declaration. Builds in confidence.",
    bpm: 74,
    tags: ["worship","courage","assurance"],
  },
  {
    title: "We Are",
    artist: "Kari Jobe",
    originalKey: "E",
    format: "chordpro",
    content: `[E]We are the [B]light of the world
[C#m]We are a city on a [A]hill
[E]We are the [B]light of the world
[C#m]We gotta, we gotta, we gotta let the [A]light shine

[E]We are, we [B]are
[C#m]Called to be [A]Your hands and feet
[E]We are, we [B]are the body of [A]Christ`,
    notes: "Matthew 5:14. Mission and identity anthem.",
    bpm: 128,
    tags: ["worship","mission","identity"],
  },
  {
    title: "Keeper of My Heart",
    artist: "Kari Jobe",
    originalKey: "D",
    format: "chordpro",
    content: `[D]You are the keeper [A]of my heart
[Bm]You hold it all to[G]gether
[D]When the world is [A]falling apart
[Bm]You hold me [G]together

[D]Keeper of my [A]heart
[Bm]Nothing can [G]pull me apart from You
[D]Keeper of my [A]heart [G]`,
    notes: "Intimate love song to God. Piano-driven.",
    bpm: 66,
    tags: ["worship","love","intimacy"],
  },
  {
    title: "Let the Heavens Open",
    artist: "Kari Jobe",
    originalKey: "F",
    format: "chordpro",
    content: `[F]Let the heavens [C]open
[Dm]Let Your glory [Bb]fall
[F]Rain down, rain [C]down on us
[Dm]We need You [Bb]Lord

[F]Open up the [C]heavens
[Dm]We wanna see [Bb]You
[F]Let the heavens [C]open [Bb]now`,
    notes: "Atmospheric, building worship. Great for prayer sets.",
    bpm: 70,
    tags: ["worship","heaven","prayer"],
  },
  {
    title: "Breathe on Us",
    artist: "Kari Jobe",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Breathe on us, [D]breathe on us
[Em]Holy Spirit [C]come breathe on us
[G]Like a rushing [D]wind
[Em]Like a holy [C]flame

[G]Breathe on us [D]Lord
[Em]Bring life where [C]there is none
[G]Breathe on [D]us [C]Lord`,
    notes: "Ezekiel 37 valley of dry bones inspiration. Desperate prayer.",
    bpm: 64,
    tags: ["worship","spirit","prayer"],
  },
  {
    title: "Steady My Heart",
    artist: "Kari Jobe",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Wish it could be [E]easy
[F#m]Why is life so [D]messy
[A]Why is pain a [E]part of us
[F#m]There are days I [D]feel like
[A]Nothing ever [E]goes right

[A]Steady my heart [E]Lord
[F#m]Even when I [D]can't see
[A]I will trust in [E]You [D]Lord`,
    notes: "Honest vulnerability. Women's ministry favorite.",
    bpm: 68,
    tags: ["worship","trust","honesty"],
  },
  {
    title: "Fall Afresh",
    artist: "Kari Jobe",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Fall afresh on [A]me
[Bm]Spirit of the [G]living God
[D]Fall afresh on [A]me
[Bm]Come and fill this [G]place

[D]Awaken my [A]soul
[Bm]Come awaken my [G]soul
[D]Come and fill this [A]place
[Bm]Let us see Your [G]face`,
    notes: "Gateway Worship era. Spirit invitation song.",
    bpm: 62,
    tags: ["worship","spirit","renewal"],
  },
  {
    title: "Hands to the Heavens",
    artist: "Kari Jobe",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]With our hands to the [F]heavens
[Gm]Alive in Your pre[Eb]sence
[Bb]O God, when You [F]come
[Gm]Blessed are we who are [Eb]hungry

[Bb]Hands to the [F]heavens
[Gm]We lift our [Eb]voices
[Bb]Be glorified [F]Lord [Eb]`,
    notes: "Physical expression worship. Encourage the room.",
    bpm: 76,
    tags: ["worship","praise","expression"],
  },
  {
    title: "Lead Me to the Cross",
    artist: "Kari Jobe",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Savior I come, [E]quiet my soul
[F#m]Remember re[D]demption's hill
[A]Where Your blood was [E]spilled
[F#m]For my ran[D]som

[A]Lead me to the [E]cross
[F#m]Where Your love poured [D]out
[A]Bring me to my [E]knees
[F#m]Lord I lay me [D]down`,
    notes: "Originally Brooke Fraser / Hillsong, Kari Jobe version. Communion.",
    bpm: 66,
    tags: ["worship","cross","surrender"],
  },
  {
    title: "Beautiful",
    artist: "Kari Jobe",
    originalKey: "Eb",
    format: "chordpro",
    content: `[Eb]I see Your face in [Bb]every sunrise
[Cm]The colors of the [Ab]morning are inside Your eyes
[Eb]The world awakens [Bb]in the light of the day
[Cm]I look up to the [Ab]sky and say

[Eb]You're beautiful, [Bb]beautiful
[Cm]God You're beautiful, [Ab]beautiful
[Eb]Everything You are is [Bb]beautiful [Ab]`,
    notes: "From her debut album. Simple adoration of God's beauty.",
    bpm: 70,
    tags: ["worship","beauty","creation"],
  },
  {
    title: "The Garden",
    artist: "Kari Jobe",
    originalKey: "D",
    format: "chordpro",
    content: `[D]I had all but [A]given up
[Bm]Desperate for a [G]sign from love
[D]Something good, some[A]thing kind
[Bm]Bringing peace to [G]every corner of my mind

[D]Then I saw the [A]garden
[Bm]You had planted [G]for me
[D]In the middle of my [A]darkest night
[Bm]It was blooming [G]beautifully
[D]Faith was the evi[A]dence
[Bm]Of what only [G]You could do`,
    notes: "From the Garden album. Personal testimony of hope in grief.",
    bpm: 64,
    tags: ["worship","hope","healing","testimony"],
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
