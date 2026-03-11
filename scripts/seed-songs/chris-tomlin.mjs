#!/usr/bin/env node
/**
 * Seed Chris Tomlin worship songs into Firestore.
 * Usage: GOOGLE_APPLICATION_CREDENTIALS=./key.json node scripts/seed-songs/chris-tomlin.mjs --skip-existing
 */
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  {
    title: "How Great Is Our God",
    artist: "Chris Tomlin",
    originalKey: "C",
    format: "chordpro",
    content: `[C]The splendor of the King, [Am]clothed in majesty
[F]Let all the earth rejoice, [C]all the earth rejoice
[C]He wraps Himself in light, [Am]and darkness tries to hide
[F]And trembles at His voice, [C]trembles at His voice

[C]How great is our God, [Am]sing with me
[F]How great is our God, [G]and all will see
[C]How great, [Am]how great [F]is our [C]God

[C]Age to age He stands, [Am]and time is in His hands
[F]Beginning and the end, [C]beginning and the end
[C]The Godhead three in one, [Am]Father Spirit Son
[F]The Lion and the Lamb, [C]the Lion and the Lamb`,
    notes: "One of the most sung worship songs ever. Simple and singable.",
    bpm: 78,
    tags: ["praise","worship","classic"],
  },
  {
    title: "Amazing Grace (My Chains Are Gone)",
    artist: "Chris Tomlin",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Amazing grace how [G/B]sweet the [C]sound
[G]That saved a [C]wretch like [G]me
[G]I once was lost but [G/B]now I'm [C]found
[G]Was blind but [D]now I [G]see

[G]My chains are [D]gone, I've been set [Em]free
[C]My God, my [G]Savior has [D]ransomed me
[G]And like a [D]flood His mercy [Em]reigns
[C]Unending [G]love, a[D]mazing [G]grace

[G]'Twas grace that [G/B]taught my [C]heart to fear
[G]And grace my [C]fears re[G]lieved
[G]How precious [G/B]did that [C]grace appear
[G]The hour I [D]first be[G]lieved`,
    notes: "Modern classic. Hymn verses with the powerful \"My Chains Are Gone\" chorus.",
    bpm: 64,
    tags: ["hymn","grace","congregational"],
  },
  {
    title: "Good Good Father",
    artist: "Chris Tomlin",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Oh, I've heard a thousand [E]stories of what they think You're [F#m]like
But I've heard the tender [D]whisper of love in the dead of night
[A]And You tell me that You're [E]pleased and that I'm never [F#m]alone

[A]You're a good, good [E]Father
[F#m]It's who You are, [D]it's who You are, [A]it's who You are
[A]And I'm loved by [E]You
[F#m]It's who I am, [D]it's who I am, [A]it's who I am

[A]Oh, and I've seen many [E]searching for answers far and [F#m]wide
But I know we're all [D]searching for answers only You provide
[A]'Cause You know just what we [E]need before we say a [F#m]word`,
    notes: "Tender, personal worship. Great for intimate settings.",
    bpm: 72,
    tags: ["worship","father","identity"],
  },
  {
    title: "Holy Is the Lord",
    artist: "Chris Tomlin",
    originalKey: "G",
    format: "chordpro",
    content: `[G]We stand and lift up our [D]hands
[Em]For the joy of the Lord [C]is our strength
[G]We bow down and wor[D]ship Him now
[Em]How great, [C]how awesome is He

[G]And together we [D]sing
[Em]Everyone [C]sing

[G]Holy is the [D]Lord God Al[Em]mighty
[C]The earth is filled with His [G]glory
[G]Holy is the [D]Lord God Al[Em]mighty
[C]The earth is filled with His [G]glory
[C]The earth is filled with His [G]glory`,
    notes: "High energy praise. Great opener.",
    bpm: 126,
    tags: ["praise","holiness","congregational"],
  },
  {
    title: "Our God",
    artist: "Chris Tomlin",
    originalKey: "Em",
    format: "chordpro",
    content: `[Em]Water You turned into [C]wine
[G]Opened the eyes of the [D]blind
[Em]There's no one like [C]You
[G]None like [D]You

[Em]Into the darkness You [C]shine
[G]Out of the ashes we [D]rise
[Em]There's no one like [C]You
[G]None like [D]You

[C]Our God is greater, [D]our God is stronger
[Em]God You are higher than [C]any other
[C]Our God is Healer, [D]awesome in power
Our [Em]God, our [C]God

[Em]And if Our God is for [C]us
[G]Then who could ever [D]stop us
[Em]And if our God is with [C]us
[G]Then what could stand a[D]gainst`,
    notes: "Anthemic. Full band, big dynamics on the chorus.",
    bpm: 105,
    tags: ["praise","anthem","power"],
  },
  {
    title: "Is He Worthy",
    artist: "Chris Tomlin",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Do you feel the [E]world is broken?
[F#m]We do [D]
[A]Do you feel the [E]shadows deepen?
[F#m]We do [D]
[A]But do you know that [E]all the dark won't
[F#m]Stop the light from [D]getting through?
[A]We do [E]
[A]Do you wish that [E]you could see it
[F#m]All made [D]new?
[A]We do [E]

[A]Is all cre[E]ation groaning?
[F#m]It is [D]
[A]Is a new cre[E]ation coming?
[F#m]It is [D]
[A]Is the glory [E]of the Lord to be the
[F#m]Light within our [D]midst?
[A]It is [E]
[A]Is it good that [E]we remind our[F#m]selves of [D]this?
[A]It is [E]`,
    notes: "Call and response format. Powerful in congregational settings.",
    bpm: 68,
    tags: ["worship","declaration","hope"],
  },
  {
    title: "Whom Shall I Fear",
    artist: "Chris Tomlin",
    originalKey: "A",
    format: "chordpro",
    content: `[A]You hear me when I [E]call
[F#m]You are my morning [D]song
[A]Though darkness fills the [E]night
[F#m]It cannot hide the [D]light

[A]I know who goes be[E]fore me
[F#m]I know who stands be[D]hind
[A]The God of angel [E]armies
[F#m]Is always by my [D]side`,
    notes: "Powerful declaration of God as protector. Great opener.",
    bpm: 78,
    tags: ["worship","courage","protection"],
  },
  {
    title: "Jesus Messiah",
    artist: "Chris Tomlin",
    originalKey: "D",
    format: "chordpro",
    content: `[D]He became sin, who [G]knew no sin
[Bm]That we might be[A]come His righ[D]teousness
[D]He humbled Himself and [G]carried the cross
[Bm]Love so a[A]mazing, love so a[D]mazing

[D]Jesus Mes[G]siah, Name above all [Bm]names
[A]Blessed Re[D]deemer, Emman[G]uel
[Bm]The rescue for [A]sinners, the ransom from [D]heaven
[G]Jesus Mes[A]siah, Lord of [D]all`,
    notes: "Christological anthem. Reverent and majestic. Full band on chorus.",
    bpm: 74,
    tags: ["worship","Jesus","salvation","atonement"],
  },
  {
    title: "Even So Come",
    artist: "Chris Tomlin",
    originalKey: "B",
    format: "chordpro",
    content: `[B]All of crea[E]tion, all of the [G#m]earth
[F#]Make straight a highway, a [E]path for the Lord
[B]Jesus is [E]coming [G#m]soon[F#]

[B]Even so come, [E]Lord Jesus come
[G#m]Even so come, [F#]Lord Jesus come
[B]Take Your [E]bride, take Your [G#m]bride
[F#]Even so come, Lord Jesus come`,
    notes: "Second coming theme. Builds urgency and anticipation through repetition.",
    bpm: 72,
    tags: ["worship","second coming","hope","prayer"],
  },
  {
    title: "At the Cross (Love Ran Red)",
    artist: "Chris Tomlin",
    originalKey: "A",
    format: "chordpro",
    content: `[A]There's a place where [E]mercy reigns
[F#m]And never dies
[D]There's a place where [A]streams of grace
[E]Flow deep and wide

[A]At the cross, at the [E]cross
[F#m]I surrender my [D]life
[A]I'm in awe of [E]You
[F#m]I'm in awe of [D]You
[A]Where Your love ran [E]red
[F#m]And my sin washed [D]white`,
    notes: "Powerful cross-focused anthem. Simple progression, deep lyrics.",
    bpm: 73,
    tags: ["worship","cross","surrender","grace"],
  },
  {
    title: "Indescribable",
    artist: "Chris Tomlin",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]From the highest of [F]heights
[Gm]To the depths of the [Eb]sea
[Bb]Creation's revealing Your [F]majesty
[Gm]From the colors of [Eb]fall
[Bb]To the fragrance of [F]spring

[Bb]Indescribable, [F]uncontainable
[Gm]You placed the stars in the [Eb]sky
[Bb]And You know them by [F]name
[Gm]You are a[Eb]mazing God`,
    notes: "Laura Story co-write. Creation praise, soaring melody on chorus.",
    bpm: 82,
    tags: ["worship","creation","majesty","awe"],
  },
  {
    title: "I Will Follow",
    artist: "Chris Tomlin",
    originalKey: "E",
    format: "chordpro",
    content: `[E]Where You go, I'll [B]go
[C#m]Where You stay, I'll [A]stay
[E]When You move, I'll [B]move
[C#m]I will fol[A]low

[E]All Your ways are [B]good
[C#m]All Your ways are [A]sure
[E]I will trust in [B]You alone
[C#m]Higher than my [A]sight
[E]I will fol[B]low [C#m]You[A]`,
    notes: "Commitment anthem. Driving pop-rock feel, great singalong.",
    bpm: 136,
    tags: ["worship","commitment","following"],
  },
  {
    title: "Nobody Loves Me Like You",
    artist: "Chris Tomlin",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Morning light, a [D]brand new mercy
[Em]Reaching in, [C]reaching out
[G]Gently lifting [D]every burden
[Em]Oh You remove [C]my doubt

[G]Nobody loves me like [D]You love me, Jesus
[Em]Nobody turns my [C]heart like You do
[G]Nobody loves me like [D]You love me
[Em]Nobody, [C]nobody`,
    notes: "Simple and joyful. Light acoustic feel, easy for congregations.",
    bpm: 120,
    tags: ["worship","love","joy"],
  },
  {
    title: "Resurrection Power",
    artist: "Chris Tomlin",
    originalKey: "C",
    format: "chordpro",
    content: `[C]You called me from the [G]grave by name
[Am]You called me out of [F]all my shame
[C]I see the old has [G]passed away
[Am]The new has [F]come

[C]Now I have resurrection [G]power
[Am]Living on the [F]inside
[C]Resurrection [G]power
[Am]I feel it [F]come alive
[C]Jesus, You have [G]given us freedom
[Am]No longer [F]bound, I'm walking in power`,
    notes: "Energetic and bold, Easter-ready anthem. Builds to big finish.",
    bpm: 140,
    tags: ["worship","resurrection","power","Easter"],
  },
  {
    title: "Sovereign",
    artist: "Chris Tomlin",
    originalKey: "B",
    format: "chordpro",
    content: `[B]Sovereign over [E]us
[G#m]Sovereign over [F#]all
[B]Where You are is [E]where I want to be
[G#m]In Your arms I [F#]fall

[B]You are sov[E]ereign
[G#m]You are sov[F#]ereign
[B]And there's no one [E]like You [F#]Lord`,
    notes: "From the Burning Lights album. Reverent and grand.",
    bpm: 72,
    tags: ["worship","sovereignty","trust"],
  },
  {
    title: "Awake My Soul (Tomlin)",
    artist: "Chris Tomlin",
    originalKey: "E",
    format: "chordpro",
    content: `[E]Awake my soul, [B]awake my soul
[C#m]And sing, sing a [A]new song
[E]Let all that is with[B]in me
[C#m]Cry holy, holy, [A]holy

[E]God of mercy, [B]God of grace
[C#m]Awake my soul and [A]sing
[E]Awake my [B]soul [A]`,
    notes: "Psalm 57:8. Call to worship energy.",
    bpm: 126,
    tags: ["worship","awakening","praise"],
  },
  {
    title: "Home",
    artist: "Chris Tomlin",
    originalKey: "G",
    format: "chordpro",
    content: `[G]This world is not my [D]home
[Em]I'm just passing [C]through
[G]Where You are is [D]where I belong
[Em]I'm coming [C]home to You

[G]Home, where the [D]heart is
[Em]Home, where Your [C]love is
[G]Heaven is my [D]home [C]`,
    notes: "Eternal perspective song. Bittersweet hope.",
    bpm: 68,
    tags: ["worship","heaven","hope"],
  },
  {
    title: "Praise Is the Highway",
    artist: "Chris Tomlin",
    originalKey: "A",
    format: "chordpro",
    content: `[A]Praise is the [E]highway
[F#m]Into Your [D]presence
[A]Praise is the [E]pathway
[F#m]To Your [D]throne

[A]We ride on the [E]highway of praise
[F#m]Lifting our voices [D]to the King
[A]Praise is the [E]highway [D]Lord`,
    notes: "Uptempo praise. Great for opening a worship set.",
    bpm: 134,
    tags: ["worship","praise","celebration"],
  },
  {
    title: "Faithful",
    artist: "Chris Tomlin",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Faithful, for[A]ever You are faithful
[Bm]Father to the [G]fatherless
[D]You uphold the [A]one who feels forsaken
[Bm]You are [G]faithful God

[D]Faithful, [A]faithful
[Bm]Through every [G]season You are faithful
[D]Through every [A]storm You are [G]faithful`,
    notes: "From the And If Our God Is for Us album. Reassuring.",
    bpm: 70,
    tags: ["worship","faithfulness","comfort"],
  },
  {
    title: "God of This City",
    artist: "Chris Tomlin",
    originalKey: "Bb",
    format: "chordpro",
    content: `[Bb]You're the God of this [F]city
[Gm]You're the King of these [Eb]people
[Bb]You're the Lord of this [F]nation
[Gm]You [Eb]are

[Bb]Greater things have yet to [F]come
[Gm]And greater things are still to be [Eb]done
[Bb]In this [F]city [Eb]`,
    notes: "Originally by Bluetree, popularized by Tomlin. City-wide vision.",
    bpm: 78,
    tags: ["worship","city","mission"],
  },
  {
    title: "Everlasting God",
    artist: "Chris Tomlin",
    originalKey: "B",
    format: "chordpro",
    content: `[B]Strength will rise as we [E]wait upon the Lord
[B]Wait upon the Lord, we will [E]wait upon the Lord

[B]Our God, You reign for[E]ever
[G#m]Our hope, our strong de[F#]liverer
[B]You are the ever[E]lasting God
[G#m]The everlasting [F#]God`,
    notes: "Isaiah 40:28-31 anthem. Drive the rhythm on the chorus.",
    bpm: 124,
    tags: ["worship","strength","waiting"],
  },
  {
    title: "We Fall Down (Tomlin)",
    artist: "Chris Tomlin",
    originalKey: "E",
    format: "chordpro",
    content: `[E]We fall down, we [B]lay our crowns
[C#m]At the feet of [A]Jesus
[E]The greatness of [B]mercy and love
[C#m]At the feet of [A]Jesus

[E]And we cry holy, holy, [B]holy
[C#m]And we cry holy, holy, [A]holy
[E]And we cry holy, holy, [B]holy is the [A]Lamb`,
    notes: "Tomlin's early classic. Key of E version for guitar-led worship.",
    bpm: 64,
    tags: ["worship","reverence","classic"],
  },
  {
    title: "Not to Us",
    artist: "Chris Tomlin",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Not to us, but to [A]Your name
[Bm]Be the glory, be the [G]praise
[D]Not to us, but to [A]Your name
[Bm]Be the glory, be the [G]praise

[D]The cross before me, the [A]world behind
[Bm]No turning back, raise the [G]banner high
[D]It's not for [A]us, it's all for [G]You`,
    notes: "Psalm 115:1. Humble adoration song.",
    bpm: 76,
    tags: ["worship","humility","glory"],
  },
  {
    title: "Forever (Chris Tomlin)",
    artist: "Chris Tomlin",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Give thanks to the [C]Lord
[Em]Our God and [D]King
[G]His love endures for[C]ever [D]

[G]Forever God is [C]faithful
[Em]Forever God is [D]strong
[G]Forever God is [C]with us
[Em]Forever [D]forever`,
    notes: "Psalm 136. Early Tomlin anthem that shaped modern worship.",
    bpm: 122,
    tags: ["worship","eternal","classic"],
  },
  {
    title: "Unfailing Love",
    artist: "Chris Tomlin",
    originalKey: "A",
    format: "chordpro",
    content: `[A]You have my [E]heart
[F#m]And I am [D]Yours forever
[A]You are my [E]strength
[F#m]God of grace and [D]power

[A]And everything You [E]hold in Your hand
[F#m]Still You make time for [D]me
[A]I can't under[E]stand
[F#m]Your unfailing [D]love for [A]me`,
    notes: "Classic Tomlin. Warm and personal.",
    bpm: 70,
    tags: ["worship","love","devotion"],
  },
  {
    title: "Made to Worship",
    artist: "Chris Tomlin",
    originalKey: "E",
    format: "chordpro",
    content: `[E]Before the day, before the [B]light
[C#m]Before the world revolved a[A]round the sun
[E]God on high stepped [B]down into time
[C#m]And wrote the story of His [A]love for everyone

[E]We were made to [B]worship
[C#m]We were made to [A]love
[E]We were made for [B]so much more than [A]we could ever dream`,
    notes: "Purpose declaration. Strong melody, singable chorus.",
    bpm: 126,
    tags: ["worship","purpose","creation"],
  },
  {
    title: "I Lift My Hands",
    artist: "Chris Tomlin",
    originalKey: "Ab",
    format: "chordpro",
    content: `[Ab]Be still, there is a [Eb]healer
[Fm]His love is deeper than the [Db]sea
[Ab]His mercy is un[Eb]failing
[Fm]His arms a fortress for the [Db]weak

[Ab]I lift my hands to be[Eb]lieve again
[Fm]You are my refuge, You are my [Db]strength
[Ab]As I pour out my [Eb]heart
[Fm]These things I re[Db]member
[Ab]You are faithful [Eb]God for[Db]ever`,
    notes: "Matt Maher co-write. Deep well of comfort.",
    bpm: 66,
    tags: ["worship","faith","comfort"],
  },
  {
    title: "Love",
    artist: "Chris Tomlin",
    originalKey: "D",
    format: "chordpro",
    content: `[D]Love put a face on the [A]God that we were searching for
[Bm]Love hung on a tree and [G]bled
[D]Love opened the door that [A]we could never open
[Bm]Love made a way for the [G]dead to live again

[D]Love, [A]love, [Bm]love
[G]Nothing can separate us from the [D]love of God`,
    notes: "Romans 8:38. Story of the gospel through the lens of love.",
    bpm: 72,
    tags: ["worship","love","gospel"],
  },
  {
    title: "Crown Him (Majesty)",
    artist: "Chris Tomlin",
    originalKey: "G",
    format: "chordpro",
    content: `[G]Crown Him with many [D]crowns
[Em]The Lamb upon His [C]throne
[G]Hark how the heavenly [D]anthem drowns
[Em]All music but its [C]own

[G]Majesty, [D]majesty
[Em]Crown Him Lord of [C]all
[G]Majesty, [D]Lord of all`,
    notes: "Classic hymn reimagined by Tomlin. Grand and majestic.",
    bpm: 76,
    tags: ["worship","majesty","hymn","classic"],
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
