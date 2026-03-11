#!/usr/bin/env node
/**
 * Seed worship songs into Firestore.
 *
 * Usage:
 *   # Set GOOGLE_APPLICATION_CREDENTIALS to your service account key, then:
 *   node scripts/seed-worship-songs.mjs
 *
 *   # Or pass the key path directly:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/seed-worship-songs.mjs
 *
 *   # To skip duplicates (checks by title+artist), add --skip-existing:
 *   node scripts/seed-worship-songs.mjs --skip-existing
 */

import { initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  // ── Bethel Music ──────────────────────────────────────────
  {
    title: 'Goodness of God',
    artist: 'Bethel Music',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]I love You, Lord
[D]Oh Your mercy never [A]fails me
[A]All my days, [E]I've been held in Your [D]hands
[A]From the moment that I [D]wake up
[A]Until I lay my [E]head
[A]Oh, I will sing of the [D]goodness of God

[A]All my life You have been [D]faithful
[A]All my life You have been so, [E]so good
[D]With every breath that I am able
[A]Oh, I will sing of the [E]goodness of [A]God

[A]I love Your voice
[D]You have led me through the [A]fire
[A]In the darkest night [E]You are close like no [D]other
[A]I've known You as a [D]Father
[A]I've known You as a [E]Friend
[A]And I have lived in the [D]goodness of God`,
    notes: 'Great congregational song. Can use capo 2 and play in G shapes.',
    bpm: 68,
    tags: ['praise', 'worship', 'congregational'],
  },
  {
    title: 'Reckless Love',
    artist: 'Bethel Music',
    originalKey: 'C',
    format: 'chordpro',
    content: `[Am]Before I spoke a [C]word, You were singing over [G]me
[Am]You have been so, so [C]good to [G]me
[Am]Before I took a [C]breath, You breathed Your life in [G]me
[Am]You have been so, so [C]kind to [G]me

[G]Oh, the overwhelming, [C]never-ending, reckless [Em]love of God
[D]Oh, it chases me down, fights 'til I'm found, [C]leaves the ninety-nine
[G]I couldn't earn it, [C]I don't deserve it, still [Em]You give Yourself away
[D]Oh, the overwhelming, [C]never-ending, reckless [G]love of God`,
    notes: 'Build dynamics throughout. Softer on verses, big on chorus.',
    bpm: 86,
    tags: ['worship', 'love', 'grace'],
  },
  {
    title: 'Raise a Hallelujah',
    artist: 'Bethel Music',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]I raise a halle[E]lujah, in the presence of my [B]enemies
[B]I raise a halle[F#]lujah, louder than the [E]unbelief
[B]I raise a halle[E]lujah, my weapon is a [B]melody
[B]I raise a halle[F#]lujah, heaven comes to [E]fight for me

[B]I'm gonna sing, in the [E]middle of the storm
[B]Louder and louder, you're gonna hear my [F#]praises roar
[B]Up from the ashes, [E]hope will arise
[B]Death is defeated, the [F#]King is a[E]live`,
    notes: 'Powerful anthem. Can play in A with capo 2.',
    bpm: 150,
    tags: ['praise', 'anthem', 'warfare'],
  },
  {
    title: 'No Longer Slaves',
    artist: 'Bethel Music',
    originalKey: 'E',
    format: 'chordpro',
    content: `[E]You unravel me with a [B]melody
[C#m]You surround me with a [A]song
[E]Of deliverance from my [B]enemies
[C#m]Till all my fears are [A]gone

[E]I'm no longer a slave to [B]fear
[C#m]I am a child of [A]God
[E]I'm no longer a slave to [B]fear
[C#m]I am a child of [A]God

[E]From my mothers womb [B]You have chosen me
[C#m]Love has called my [A]name
[E]I've been born again [B]into Your family
[C#m]Your blood flows through my [A]veins`,
    notes: 'Builds dynamically. Great bridge section for extended worship.',
    bpm: 72,
    tags: ['worship', 'freedom', 'identity'],
  },
  {
    title: 'Holy Forever',
    artist: 'Bethel Music',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]A thousand genera[Em]tions falling [C]down in worship
[G]To sing the song of [Em]ages to the [D]Lamb
[G]And all who've gone be[Em]fore us and [C]all who will believe
[G]Will sing the song of [Em]ages and the [D]whole earth will sing

[G]Holy, holy, [Em]holy is the Lord
[C]Holy, holy, [D]holy is the Lord
[G]God Almighty, [Em]Who was and is to [C]come
[D]God Almighty, [G]holy forever

[G]Your name is the [Em]highest, Your [C]name is the greatest
[G]Your name stands a[Em]bove them all
[G]All thrones and do[Em]minions, all [C]powers and positions
[G]Your name stands a[Em]bove them [D]all`,
    notes: 'Powerful chorus. Let the room ring on "holy forever."',
    bpm: 138,
    tags: ['praise', 'worship', 'holiness'],
  },

  // ── Elevation Worship ─────────────────────────────────────
  {
    title: 'Graves into Gardens',
    artist: 'Elevation Worship',
    originalKey: 'C',
    format: 'chordpro',
    content: `[C]I searched the world but it couldn't [Am]fill me
[F]Man's empty praise and [C]treasures that fade
[C]Are never enough
[C]Then You came along and put me [Am]back together
[F]And every desire is [C]now satisfied here in Your love

[Am]Oh there's [F]nothing better than You
[C]There's nothing [G]better than You
[Am]Lord there's [F]nothing
[C]Nothing is better than [G]You

[C]You turn mourning to [Am]dancing
[F]You give beauty for [C]ashes
[C]You turn shame into [Am]glory
[F]You're the only one who [G]can
[C]You turn graves into [Am]gardens
[F]You turn bones into [C]armies
[C]You turn seas into [Am]highways
[F]You're the only one who [G]can`,
    notes: 'Great build song. Start soft, build through the chorus.',
    bpm: 72,
    tags: ['worship', 'testimony', 'transformation'],
  },
  {
    title: 'Jireh',
    artist: 'Elevation Worship',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]I'll never be more [G#m]loved than I am right now
[E]Wasn't holding You up
So there's nothing I can do to [B]let You down
[B]It doesn't take a [G#m]trophy to make You proud
[E]I'll never be more [F#]loved than I am right [B]now

[B]Jireh, You are e[G#m]nough
[E]Jireh, You are e[F#]nough
[B]And I will be con[G#m]tent in every circum[E]stance
[F#]You are [B]Jireh, You are enough

[B]I wasn't holding [G#m]You up
So there's nothing I can do to [E]let You down
[B]It doesn't take a [G#m]trophy to make You proud
[E]I'll never be more [F#]loved than I am right [B]now`,
    notes: 'Peaceful, reflective song. Keep dynamics gentle.',
    bpm: 69,
    tags: ['worship', 'provision', 'peace'],
  },
  {
    title: 'O Come to the Altar',
    artist: 'Elevation Worship',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]Are you hurting and [E]broken within
[F#m]Overwhelmed by the [D]weight of your sin
[A]Jesus is [E]calling
[A]Have you come to the [E]end of yourself
[F#m]Do you thirst for a [D]drink from the well
[A]Jesus is [E]calling

[A]O come to the [E]altar
[F#m]The Father's arms are open [D]wide
[A]Forgiveness was [E]bought with
[F#m]The precious blood of [D]Jesus Christ

[A]Leave behind your [E]regrets and mistakes
[F#m]Come today there's no [D]reason to wait
[A]Jesus is [E]calling
[A]Bring your sorrows and [E]trade them for joy
[F#m]From the ashes a [D]new life is born
[A]Jesus is [E]calling`,
    notes: 'Altar call song. Use for invitation moments.',
    bpm: 67,
    tags: ['worship', 'altar call', 'invitation'],
  },
  {
    title: 'Do It Again',
    artist: 'Elevation Worship',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]Walking around these walls
[G#m]I thought by now they'd fall
[E]But You have never failed me yet
[F#]Waiting for change to come
[B]Knowing the battle's won
[G#m]For You have never failed me yet

[E]Your promise still [F#]stands
[G#m]Great is Your faith[B]fulness
[E]Faithfulness
[F#]I'm still in Your [B]hands

[B]This is my confidence
[G#m]You've never failed me yet
[B]I've seen You move, You [E]move the mountains
And I believe, I'll see You [F#]do it again
[B]You made a way, where there was [G#m]no way
And I believe, I'll see You [E]do it again`,
    notes: 'Testimony song. Good for building faith. Play with conviction.',
    bpm: 72,
    tags: ['praise', 'faith', 'testimony'],
  },
  {
    title: 'RATTLE!',
    artist: 'Elevation Worship',
    originalKey: 'F',
    format: 'chordpro',
    content: `[F]Saturday was si[Am]lent
[Bb]Surely it was [F]through
[F]But since when has [Am]impossible
[Bb]Ever stopped [C]You

[F]This is the sound of [Am]dry bones rattling
[Bb]This is the praise make a [F]dead man walk again
[F]Open the grave, I'm [Am]coming out
[Bb]I'm gonna live, gonna [C]live again

[F]On the third day, [Am]heaven threw a party
[Bb]The stone was rolled a[C]way
[F]On the third day, [Am]those walking dead
[Bb]Became the [C]living
[F]You blew the [Am]trumpet and the [Bb]walls came down
[F]Death couldn't [Am]hold You down [Bb]  [C]`,
    notes: 'High energy! Full band arrangement. Great for opening.',
    bpm: 140,
    tags: ['praise', 'anthem', 'resurrection'],
  },

  // ── Hillsong Worship / Hillsong UNITED ────────────────────
  {
    title: 'What a Beautiful Name',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    format: 'chordpro',
    content: `[D]You were the Word at the [A]beginning
[Bm]One with God the Lord Most [G]High
[D]Your hidden glory in [A]creation
[Bm]Now revealed in You our [G]Christ

[D]What a beautiful [A]Name it is
[Bm]What a beautiful [G]Name it is
[D]The Name of [A]Jesus Christ my [Bm]King
[G]What a beautiful [D]Name it is
[A]Nothing com[Bm]pares to this
[G]What a beautiful [D]Name it is
The Name of [A]Jesus

[D]You didn't want heaven with[A]out us
[Bm]So Jesus, You brought heaven [G]down
[D]My sin was great, Your love was [A]greater
[Bm]What could separate us [G]now`,
    notes: 'Signature Hillsong song. Let it breathe. Big dynamics on the bridge.',
    bpm: 68,
    tags: ['worship', 'Jesus', 'name'],
  },
  {
    title: 'Oceans (Where Feet May Fail)',
    artist: 'Hillsong UNITED',
    originalKey: 'D',
    format: 'chordpro',
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
    notes: 'Iconic song. Extended bridge section works well for prayer moments.',
    bpm: 66,
    tags: ['worship', 'faith', 'prayer'],
  },
  {
    title: 'Who You Say I Am',
    artist: 'Hillsong Worship',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]Who am I that the [D]highest King
[Em]Would welcome [C]me
[G]I was lost but He [D]brought me in
[Em]Oh His love for [C]me
[Em]Oh His [D]love for [C]me

[G]Who the Son sets free
[D]Oh is free indeed
[Em]I'm a child of [C]God, yes I am

[G]In my Father's house
[D]There's a place for me
[Em]I'm a child of [C]God, yes I am

[G]Free at last, He has [D]ransomed me
[Em]His grace runs [C]deep
[G]While I was a slave to [D]sin
[Em]Jesus died for [C]me
[Em]Yes He [D]died for [C]me

[Em]I am [D]chosen, not for[C]saken
[Em]I am [D]who You say I [C]am
[Em]You are [D]for me, not a[C]gainst me
[Em]I am [D]who You say I [C]am`,
    notes: 'Strong identity anthem. Great for youth and congregational worship.',
    bpm: 136,
    tags: ['worship', 'identity', 'freedom'],
  },
  {
    title: 'Cornerstone',
    artist: 'Hillsong Worship',
    originalKey: 'C',
    format: 'chordpro',
    content: `[C]My hope is built on nothing less
Than [Am]Jesus' blood and [F]righteousness
[C]I dare not trust the sweetest frame
But [Am]wholly trust in [G]Jesus' name

[F]Christ alone, [Am]Cornerstone
[G]Weak made strong, in the [F]Savior's love
Through the [Am]storm, He is [G]Lord
Lord of [C]all

[C]When darkness seems to hide His face
I [Am]rest on His un[F]changing grace
[C]In every high and stormy gale
My [Am]anchor holds with[G]in the veil

[C]When He shall come with trumpet sound
Oh [Am]may I then in [F]Him be found
[C]Dressed in His righteousness alone
[Am]Faultless, stand be[G]fore the throne`,
    notes: 'Classic hymn adaptation. Simple and powerful.',
    bpm: 73,
    tags: ['hymn', 'worship', 'foundation'],
  },
  {
    title: 'Hosanna',
    artist: 'Hillsong Worship',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]I see the King of Glory
[C]Coming on the clouds with fire
[Em]The whole earth shakes, [C]the whole earth shakes
[G]I see His love and mercy
[C]Washing over all our sin
[Em]The people sing, [C]the people sing

[G]Hosanna, [D]hosanna
[Em]Hosanna in the [C]highest
[G]Hosanna, [D]hosanna
[Em]Hosanna in the [C]highest

[G]I see a generation
[C]Rising up to take their place
[Em]With selfless faith, [C]selfless faith
[G]I see a near revival
[C]Stirring as we pray and seek
[Em]We're on our knees, [C]we're on our knees

[Em]Heal my heart and [C]make it clean
[G]Open up my [D]eyes to the things unseen
[Em]Show me how to [C]love like You have loved me
[G]Break my heart for [D]what breaks Yours`,
    notes: 'Classic Hillsong anthem. Big, bold, and declarative.',
    bpm: 132,
    tags: ['praise', 'anthem', 'declaration'],
  },
  {
    title: 'Mighty to Save',
    artist: 'Hillsong Worship',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]Everyone needs compas[E]sion
[F#m]A love that's never [D]failing
[A]Let mercy [E]fall on [D]me
[A]Everyone needs for[E]giveness
[F#m]The kindness of a [D]Savior
[A]The hope of [E]na[D]tions

[A]Savior, He can move the [E]mountains
[F#m]My God is mighty to [D]save
[A]He is mighty to [E]save
[A]Forever, Author of [E]salvation
[F#m]He rose and conquered the [D]grave
[A]Jesus conquered the [E]grave

[A]So take me as You [E]find me
[F#m]All my fears and [D]failures
[A]Fill my life [E]a[D]gain
[A]I give my life to [E]follow
[F#m]Everything I be[D]lieve in
[A]Now I sur[E]ren[D]der`,
    notes: 'One of the most popular worship songs worldwide. Easy to lead.',
    bpm: 69,
    tags: ['worship', 'salvation', 'congregational'],
  },
  {
    title: 'Shout to the Lord',
    artist: 'Hillsong Worship',
    originalKey: 'Bb',
    format: 'chordpro',
    content: `[Bb]My Jesus, my [Dm]Savior
[Eb]Lord there is none [Bb]like You
[Gm]All of my days [Dm]I want to praise
[Eb]The wonders of Your [F]mighty love

[Bb]My comfort, my [Dm]shelter
[Eb]Tower of refuge and [Bb]strength
[Gm]Let every breath, [Dm]all that I am
[Eb]Never cease to [F]worship You

[Bb]Shout to the Lord, [Dm]all the earth, let us sing
[Eb]Power and majesty, [Bb]praise to the King
[Gm]Mountains bow down [Dm]and the seas will roar
[Eb]At the sound of Your [F]name
[Bb]I sing for joy at the [Dm]work of Your hands
[Eb]Forever I'll love You, [Bb]forever I'll stand
[Gm]Nothing compares to the [Dm]promise I have
[Eb]In [F]You`,
    notes: 'Timeless classic by Darlene Zschech. Great opener or closer.',
    bpm: 76,
    tags: ['worship', 'classic', 'praise'],
  },
  {
    title: 'So Will I (100 Billion X)',
    artist: 'Hillsong UNITED',
    originalKey: 'G',
    format: 'chordpro',
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
    notes: 'Poetic and expansive. Let the dynamics breathe. Great for reflection.',
    bpm: 67,
    tags: ['worship', 'creation', 'devotion'],
  },
  {
    title: 'Even When It Hurts (Praise Song)',
    artist: 'Hillsong UNITED',
    originalKey: 'Bb',
    format: 'chordpro',
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
    notes: 'Vulnerable worship moment. Acoustic arrangement works well.',
    bpm: 71,
    tags: ['worship', 'lament', 'perseverance'],
  },
  {
    title: 'King of Kings',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    format: 'chordpro',
    content: `[D]In the darkness we were [A]waiting
[Bm]Without hope, without [G]light
[D]Till from heaven You [A]came running
[Bm]There was mercy in Your [G]eyes

[D]To fulfil the law and [A]prophets
[Bm]To a virgin came the [G]Word
[D]From a throne of endless [A]glory
[Bm]To a cradle in the [G]dirt

[D]Praise the Father, [A]praise the Son
[Bm]Praise the Spirit, [G]three in one
[D]God of glory, [A]majesty
[Bm]Praise forever to the [G]King of Kings

[D]To reveal the kingdom [A]coming
[Bm]And to reconcile the [G]lost
[D]To redeem the whole [A]creation
[Bm]You did not despise the [G]cross`,
    notes: 'Majestic hymn. Builds with each verse. Great for communion.',
    bpm: 66,
    tags: ['worship', 'hymn', 'Jesus'],
  },
];

// ─── Main ───────────────────────────────────────────────────
const skipExisting = process.argv.includes('--skip-existing');

async function main() {
  const col = db.collection('worshipSongs');

  // Optionally check for existing songs to avoid duplicates
  let existingKeys = new Set();
  if (skipExisting) {
    const snapshot = await col.get();
    for (const doc of snapshot.docs) {
      const d = doc.data();
      existingKeys.add(`${d.title}|||${d.artist}`);
    }
    console.log(`Found ${existingKeys.size} existing songs in Firestore.`);
  }

  const batch = db.batch();
  let count = 0;

  for (const song of SONGS) {
    const key = `${song.title}|||${song.artist}`;
    if (skipExisting && existingKeys.has(key)) {
      console.log(`  SKIP: ${song.title} - ${song.artist} (already exists)`);
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
    console.log(`  ADD:  ${song.title} - ${song.artist}`);
  }

  if (count === 0) {
    console.log('\nNo new songs to add.');
    return;
  }

  await batch.commit();
  console.log(`\nSeeded ${count} worship songs into Firestore.`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
