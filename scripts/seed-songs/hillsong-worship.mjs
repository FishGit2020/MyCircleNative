#!/usr/bin/env node
/**
 * Seed Hillsong Worship worship songs into Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./key.json node scripts/seed-songs/hillsong-worship.mjs --skip-existing
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  {
    title: "What a Beautiful Name",
    artist: "Hillsong Worship",
    originalKey: "D",
    format: "chordpro",
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
    notes: "Signature Hillsong song. Let it breathe. Big dynamics on the bridge.",
    bpm: 68,
    tags: ["worship","Jesus","name"],
  },
  {
    title: "Who You Say I Am",
    artist: "Hillsong Worship",
    originalKey: "G",
    format: "chordpro",
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
    notes: "Strong identity anthem. Great for youth and congregational worship.",
    bpm: 136,
    tags: ["worship","identity","freedom"],
  },
  {
    title: "Cornerstone",
    artist: "Hillsong Worship",
    originalKey: "C",
    format: "chordpro",
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
    notes: "Classic hymn adaptation. Simple and powerful.",
    bpm: 73,
    tags: ["hymn","worship","foundation"],
  },
  {
    title: "Hosanna",
    artist: "Hillsong Worship",
    originalKey: "G",
    format: "chordpro",
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
    notes: "Classic Hillsong anthem. Big, bold, and declarative.",
    bpm: 132,
    tags: ["praise","anthem","declaration"],
  },
  {
    title: "Mighty to Save",
    artist: "Hillsong Worship",
    originalKey: "A",
    format: "chordpro",
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
    notes: "One of the most popular worship songs worldwide. Easy to lead.",
    bpm: 69,
    tags: ["worship","salvation","congregational"],
  },
  {
    title: "Shout to the Lord",
    artist: "Hillsong Worship",
    originalKey: "Bb",
    format: "chordpro",
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
    notes: "Timeless classic by Darlene Zschech. Great opener or closer.",
    bpm: 76,
    tags: ["worship","classic","praise"],
  },
  {
    title: "King of Kings",
    artist: "Hillsong Worship",
    originalKey: "D",
    format: "chordpro",
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
    notes: "Majestic hymn. Builds with each verse. Great for communion.",
    bpm: 66,
    tags: ["worship","hymn","Jesus"],
  },
  {
    title: "Broken Vessels (Amazing Grace)",
    artist: "Hillsong Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]All these pieces, [D]broken and scattered
[Em]In mercy [C]gathered, mended and whole
[G]Empty-handed [D]but not forsaken
[Em]I've been set [C]free, I've been set free

[G]Amazing grace, how [D]sweet the sound
[Em]That saved a [C]wretch like me
[G]Oh I once was [D]lost but now I'm found
[Em]Was blind but [C]now I see

[G]Oh I can see You [D]now, oh I can see the [Em]love in Your eyes
[C]Laying Yourself down, [G]raising up the broken to [D]life`,
    notes: "Modern hymn arrangement with a powerful bridge.",
    bpm: 74,
    tags: ["worship","grace","restoration"],
  },
  {
    title: "O Praise the Name (Anastasis)",
    artist: "Hillsong Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]I cast my mind to [A]Calvary
[Bm]Where Jesus bled and [G]died for me
[D]I see His wounds, His [A]hands, His feet
[Bm]My Savior on that [G]cursed tree

[D]His body bound and [A]drenched in tears
[Bm]They laid Him down in [G]Joseph's tomb
[D]The entrance sealed by [A]heavy stone
[Bm]Messiah still and [G]all alone

[D]O praise the Name of the [A]Lord our God
[Bm]O praise His Name for[G]evermore
[D]For endless days we will [A]sing Your praise
[Bm]Oh Lord, oh Lord our [G]God`,
    notes: "Hymn-like. Simple melody, builds with each verse. Great for communion.",
    bpm: 73,
    tags: ["hymn","worship","resurrection"],
  },
  {
    title: "Open Heaven/River Wild",
    artist: "Hillsong Worship",
    originalKey: "E",
    format: "chordpro",
    content: `[E]Your love is like a [B]river wild
[C#m]Breaking through at [A]every wall
[E]Your love is like the [B]wind in my sails
[C#m]Carry me [A]through

[E]Open heaven over [B]me
[C#m]Your love raining [A]down
[E]Open heaven over [B]me
[C#m]Let Your glory [A]come down`,
    notes: "Big Hillsong anthem feel, full band from chorus",
    bpm: 138,
    tags: ["worship","revival","Holy Spirit"],
  },
  {
    title: "Let There Be Light",
    artist: "Hillsong Worship",
    originalKey: "A",
    format: "chordpro",
    content: `[A]In the beginning [E]You spoke
[F#m]And chaos turned to [D]order
[A]In the darkness [E]Your word
[F#m]Brought life and [D]hope forever

[A]Let there be light, [E]let there be light
[F#m]In every [D]corner of my soul
[A]Let there be light, [E]let there be light
[F#m]Your glory [D]shining through`,
    notes: "Majestic opening, build dynamically through each section",
    bpm: 72,
    tags: ["worship","light","creation"],
  },
  {
    title: "I Surrender",
    artist: "Hillsong Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]I surrender [A]all to You
[Bm]All I am and [G]all I do
[D]Every dream I [A]lay it down
[Bm]At the cross where [G]mercy found me

[D]I surrender, [A]I surrender
[Bm]I want to know [G]You more
[D]I surrender, [A]I surrender
[Bm]I open every [G]door`,
    notes: "Tender and intimate, acoustic guitar-led with gentle build",
    bpm: 68,
    tags: ["worship","surrender","devotion"],
  },
  {
    title: "New Wine",
    artist: "Hillsong Worship",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]In the crushing, [F]in the pressing
[Gm]You are making [Eb]new wine
[Bb]In the soil I [F]now surrender
[Gm]You are breaking [Eb]new ground

[Bb]So I yield to [F]You and to Your
[Gm]Careful hand, [Eb]make me new
[Bb]Make me Your [F]vessel
[Gm]Make me new [Eb]wine`,
    notes: "Prayerful and reflective, crescendo on the bridge",
    bpm: 64,
    tags: ["worship","surrender","transformation"],
  },
  {
    title: "Awake My Soul",
    artist: "Hillsong Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]God of mercy [D]sweet the sound
[Em]Of my Savior's [C]name
[G]In my darkest [D]hour You found me
[Em]Lifted me [C]again

[G]Awake my soul, [D]awake my soul
[Em]And sing, [C]sing
[G]His love is all [D]I need
[Em]Awake my [C]soul and sing`,
    notes: "Uplifting and energetic, great congregational opener",
    bpm: 140,
    tags: ["worship","praise","joy"],
  },
  {
    title: "This I Believe (The Creed)",
    artist: "Hillsong Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Our Father ever[D]lasting
[Em]The all creating [C]One
[G]God Almighty [D]through Your
[Em]Holy Spirit con[C]ceiving

[G]This I believe, [D]in God the Father
[Em]I believe in [C]Christ the Son
[G]I believe in the [D]Holy Spirit
[Em]Our God is [C]three in one`,
    notes: "Declaration of faith, strong and steady, based on the Apostles Creed",
    bpm: 74,
    tags: ["worship","creed","declaration"],
  },
  {
    title: "Thank You Jesus For the Blood",
    artist: "Hillsong Worship",
    originalKey: "C",
    format: "chordpro",
    content: `[C]I was a wretch, [G]I remember who I was
[Am]I was lost, I was [F]blind, I was running out of time
[C]Sin separated, [G]the breach was far too wide
[Am]But from the far side [F]of the chasm You held me in Your sight

[C]Thank You Jesus [G]for the blood applied
[Am]Thank You Jesus, [F]it has washed me white
[C]Thank You Jesus, [G]You have saved my life
[Am]Brought me from the [F]darkness into glorious light`,
    notes: "Testimony song, reflective verses build to exuberant chorus",
    bpm: 78,
    tags: ["worship","blood","salvation","testimony"],
  },
  {
    title: "From the Inside Out",
    artist: "Hillsong Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]A thousand times I've [A]failed
[Bm]Still Your mercy re[G]mains
[D]And should I stumble a[A]gain
[Bm]I'm caught in Your [G]grace

[D]Everlasting, [A]Your light will shine when
[Bm]All else [G]fades
[D]Never ending, [A]Your glory goes be[Bm]yond all [G]fame`,
    notes: "Classic Hillsong anthem, builds from quiet acoustic to full band",
    bpm: 73,
    tags: ["worship","grace","devotion"],
  },
  {
    title: "The Power of the Cross",
    artist: "Hillsong Worship",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Oh to see the [G]dawn of the [D]darkest [A]day
[D]Christ on the [G]road to [A]Calva[D]ry
[D]Tried by sinful [G]men, [D]torn and [A]beaten then
[D]Nailed to a [G]cross of [A]wood[D]

[D]This the power [G]of the [D]cross
[Bm]Christ became sin [G]for [A]us
[D]Took the blame, [G]bore the [D]wrath
[Bm]We stand for[G]given [A]at the [D]cross`,
    notes: "Hymn-like, reverent, Keith Getty co-write. Good for communion.",
    bpm: 66,
    tags: ["worship","cross","communion","hymn"],
  },
  {
    title: "Forever Reign",
    artist: "Hillsong Worship",
    originalKey: "G",
    format: "chordpro",
    content: `[G]You are good, [D]You are good
[Em]When there's nothing [C]good in me
[G]You are love, [D]You are love
[Em]On display for [C]all to see

[G]Oh I'm running to Your [D]arms
[Em]I'm running to Your [C]arms
[G]The riches of Your [D]love
[Em]Will always be e[C]nough
[G]Nothing compares to Your em[D]brace
[Em]Light of the [C]world forever reign`,
    notes: "Joyful and triumphant, great energy for opening worship",
    bpm: 144,
    tags: ["worship","praise","joy","declaration"],
  },
  {
    title: "Tell the World",
    artist: "Hillsong Worship",
    originalKey: "E",
    format: "chordpro",
    content: `[E]When the sun is [B]shining down on me
[C#m]And the world's all [A]as it should be
[E]Bless Your name [B]I'll sing
[C#m]Oh when the dark[A]ness closes in

[E]Tell the world that [B]Jesus lives
[C#m]Tell the world that [A]He died for us
[E]Tell the world that [B]He lives again
[C#m]Oh tell the [A]world`,
    notes: "Energetic missions anthem, driving beat, great for closing",
    bpm: 138,
    tags: ["worship","missions","evangelism"],
  },
  {
    title: "Beneath the Waters",
    artist: "Hillsong Worship",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Beneath the waters [E]I will go
[F#m]Where Your love has [D]called me
[A]Buried in this [E]living flood
[F#m]Raised to life with [D]You my God

[A]All to You, I'm [E]leaving behind
[F#m]Stepping into [D]faith
[A]Beneath the [E]waters
[F#m]Dead to this [D]world, alive in Christ`,
    notes: "Baptism anthem, reverent verse building to declarative chorus",
    bpm: 72,
    tags: ["worship","baptism","new life"],
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
