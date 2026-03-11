#!/usr/bin/env node
/**
 * Seed batch 2 — 50 more worship songs into Firestore.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./path/to/key.json node scripts/seed-worship-songs-batch2.mjs --skip-existing
 */

import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const SONGS = [
  // ── Chris Tomlin ──────────────────────────────────────────
  {
    title: 'How Great Is Our God',
    artist: 'Chris Tomlin',
    originalKey: 'C',
    format: 'chordpro',
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
    notes: 'One of the most sung worship songs ever. Simple and singable.',
    bpm: 78,
    tags: ['praise', 'worship', 'classic'],
  },
  {
    title: 'Amazing Grace (My Chains Are Gone)',
    artist: 'Chris Tomlin',
    originalKey: 'G',
    format: 'chordpro',
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
    notes: 'Modern classic. Hymn verses with the powerful "My Chains Are Gone" chorus.',
    bpm: 64,
    tags: ['hymn', 'grace', 'congregational'],
  },
  {
    title: 'Good Good Father',
    artist: 'Chris Tomlin',
    originalKey: 'A',
    format: 'chordpro',
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
    notes: 'Tender, personal worship. Great for intimate settings.',
    bpm: 72,
    tags: ['worship', 'father', 'identity'],
  },
  {
    title: 'Holy Is the Lord',
    artist: 'Chris Tomlin',
    originalKey: 'G',
    format: 'chordpro',
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
    notes: 'High energy praise. Great opener.',
    bpm: 126,
    tags: ['praise', 'holiness', 'congregational'],
  },
  {
    title: 'Our God',
    artist: 'Chris Tomlin',
    originalKey: 'Em',
    format: 'chordpro',
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
    notes: 'Anthemic. Full band, big dynamics on the chorus.',
    bpm: 105,
    tags: ['praise', 'anthem', 'power'],
  },
  {
    title: 'Is He Worthy',
    artist: 'Chris Tomlin',
    originalKey: 'A',
    format: 'chordpro',
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
    notes: 'Call and response format. Powerful in congregational settings.',
    bpm: 68,
    tags: ['worship', 'declaration', 'hope'],
  },

  // ── Phil Wickham ──────────────────────────────────────────
  {
    title: 'Battle Belongs',
    artist: 'Phil Wickham',
    originalKey: 'C',
    format: 'chordpro',
    content: `[C]When all I see is the battle
[G]You see my victory
[Am]When all I see is a mountain
[F]You see a mountain moved
[C]And as I walk through the shadow
[G]Your love surrounds me
[Am]There's nothing to fear now
[F]For I am safe with You

[C]So when I fight I'll fight on my knees
[G]With my hands lifted high
[Am]Oh God the battle belongs to You
[F]And every fear I lay at Your feet
[C]I'll sing through the night
[G]Oh God the battle be[Am]longs to [F]You`,
    notes: 'Declarative anthem. Great for spiritual warfare sets.',
    bpm: 144,
    tags: ['praise', 'warfare', 'anthem'],
  },
  {
    title: 'House of the Lord',
    artist: 'Phil Wickham',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]We worship the God who was
[Bm]We worship the God who is
[C]We worship the God who ever[D]more will be
[G]He opened the prison doors
[Bm]He parted the raging sea
[C]My God, He holds the vic[D]tory

[G]There's joy in the [Bm]house of the Lord
[C]There's joy in the [D]house of the Lord today
[G]And we won't be [Bm]quiet
[C]We shout out Your [D]praise
[G]There's joy in the [Bm]house of the Lord
[C]Our God is [D]surely in this [G]place
And we won't be quiet
[C]We shout out Your [D]praise`,
    notes: 'Joyful and energetic. Great opener or closer.',
    bpm: 128,
    tags: ['praise', 'joy', 'celebration'],
  },
  {
    title: 'Great Things',
    artist: 'Phil Wickham',
    originalKey: 'D',
    format: 'chordpro',
    content: `[D]Come let us worship our [A]King
[Bm]Come let us bow at His [G]feet
[D]He has done great [A]things
[D]See what our Savior has [A]done
[Bm]See how the victory's [G]won
[D]He has done great [A]things

[D]He has done great [A]things
[Bm]Oh, hero of [G]heaven You conquered the grave
[D]You free every [A]captive and break every chain
[Bm]Oh God, You have done [G]great things

[D]We dance in Your [A]freedom, awake and alive
[Bm]Oh Jesus, our [G]Savior, Your name lifted high
[D]Oh God, You have done [A]great things`,
    notes: 'Celebration song. Full band, big energy.',
    bpm: 100,
    tags: ['praise', 'celebration', 'victory'],
  },
  {
    title: 'Living Hope',
    artist: 'Phil Wickham',
    originalKey: 'C',
    format: 'chordpro',
    content: `[C]How great the chasm that [Am]lay between us
[F]How high the mountain I [C]could not climb
[C]In desperation I [Am]turned to heaven
[F]And spoke Your name into the [G]night

[C]Then through the darkness Your [Am]loving-kindness
[F]Tore through the shadows of my [C]soul
[C]The work is finished, the [Am]end is written
[F]Jesus Christ, my living [G]hope

[Am]Hallelujah, [F]praise the One who set me free
[C]Hallelujah, death has lost its [G]grip on me
[Am]You have broken every [F]chain
There's salvation in Your [C]name
[G]Jesus Christ, my living [C]hope`,
    notes: 'Easter anthem. Builds beautifully to the chorus.',
    bpm: 74,
    tags: ['worship', 'hope', 'resurrection'],
  },
  {
    title: 'This Is Amazing Grace',
    artist: 'Phil Wickham',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]Who breaks the power of sin and darkness
[G#m]Whose love is mighty and so much stronger
[E]The King of Glory, the King above all kings

[B]Who shakes the whole earth with holy thunder
[G#m]And leaves us breathless in awe and wonder
[E]The King of Glory, the King above all kings

[B]This is amazing grace, [G#m]this is unfailing love
[E]That You would take my place, [F#]that You would bear my cross
[B]You laid down Your life, [G#m]that I would be set free
[E]Oh, Jesus, I sing for [F#]all that You've done for me`,
    notes: 'Anthem of grace. Big, bold chorus. Play in A with capo 2.',
    bpm: 100,
    tags: ['praise', 'grace', 'anthem'],
  },

  // ── Kari Jobe ─────────────────────────────────────────────
  {
    title: 'Revelation Song',
    artist: 'Kari Jobe',
    originalKey: 'D',
    format: 'chordpro',
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
    notes: 'Prophetic worship. Let it breathe and build.',
    bpm: 66,
    tags: ['worship', 'revelation', 'holiness'],
  },
  {
    title: 'The Blessing',
    artist: 'Kari Jobe',
    originalKey: 'C',
    format: 'chordpro',
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
    notes: 'Benediction song. Powerful extended worship. Based on Numbers 6:24-26.',
    bpm: 72,
    tags: ['worship', 'blessing', 'prayer'],
  },
  {
    title: 'Forever (We Sing Hallelujah)',
    artist: 'Kari Jobe',
    originalKey: 'G',
    format: 'chordpro',
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
    notes: 'Resurrection anthem. Builds from somber verse to explosive chorus.',
    bpm: 74,
    tags: ['worship', 'resurrection', 'victory'],
  },

  // ── Lauren Daigle ─────────────────────────────────────────
  {
    title: 'You Say',
    artist: 'Lauren Daigle',
    originalKey: 'Bb',
    format: 'chordpro',
    content: `[Bb]I keep fighting voices in my [F]mind that say I'm not enough
[Gm]Every single lie that tells me [Eb]I will never measure up
[Bb]Am I more than just the sum of [F]every high and every low
[Gm]Remind me once again just who I [Eb]am because I need to know

[Bb]You say I am [F]loved when I can't feel a thing
[Gm]You say I am [Eb]strong when I think I am weak
[Bb]And You say I am [F]held when I am falling short
[Gm]And when I don't be[Eb]long, oh You say I am Yours
[Bb]And I believe, [F]oh I believe
[Gm]What You say of [Eb]me, I believe`,
    notes: 'Identity anthem. Gentle but powerful. Piano-driven.',
    bpm: 120,
    tags: ['worship', 'identity', 'encouragement'],
  },
  {
    title: 'Rescue',
    artist: 'Lauren Daigle',
    originalKey: 'Bb',
    format: 'chordpro',
    content: `[Bb]You are not hidden, [F]there's never been a moment
[Gm]You were forgotten, [Eb]You are not hopeless
[Bb]Though you have been broken, [F]Your innocence stolen
[Gm]I hear you whisper under[Eb]neath your breath

[Bb]I hear you whisper, [F]you have nothing left

[Bb]I will send out an [F]army to find you
[Gm]In the middle of the [Eb]darkest night, it's true
[Bb]I will rescue [F]you

[Bb]There is no distance [F]that cannot be covered
[Gm]Over and over, [Eb]You're not defenseless
[Bb]I'll be Your shelter, [F]I'll be Your armor`,
    notes: 'Comforting song. Good for moments of ministry.',
    bpm: 65,
    tags: ['worship', 'comfort', 'rescue'],
  },

  // ── Maverick City Music ───────────────────────────────────
  {
    title: 'Promises',
    artist: 'Maverick City Music',
    originalKey: 'C',
    format: 'chordpro',
    content: `[C]God of Abraham, [Am]You're the God of covenant
[F]And of faithful [G]promises
[C]Time and time again [Am]You have proven
[F]You'll do just what [G]You said

[C]Though the storms may come and the [Am]winds may blow
[F]I'll remain stead[G]fast
[C]And let my heart learn when [Am]You speak a word
[F]It will come to [G]pass

[C]Great is Your faith[Am]fulness to me
[F]Great is Your faith[G]fulness to me
[C]From the rising [Am]sun to the setting same
[F]I will praise Your [G]name
[C]Great is Your faith[Am]fulness to me`,
    notes: 'Declaration of faithfulness. Steady build throughout.',
    bpm: 71,
    tags: ['worship', 'faithfulness', 'promise'],
  },
  {
    title: 'Breathe',
    artist: 'Maverick City Music',
    originalKey: 'E',
    format: 'chordpro',
    content: `[E]This is the air I breathe
[B]This is the air I breathe
[C#m]Your holy presence [A]living in me

[E]This is my daily bread
[B]This is my daily bread
[C#m]Your very word [A]spoken to me

[E]And I, [B]I'm desperate for You
[C#m]And I, [A]I'm lost without You

[E]This is the air I breathe
[B]This is the air I breathe
[C#m]Your holy presence [A]living in me`,
    notes: 'Intimate worship. Acoustic, gentle, prayerful.',
    bpm: 60,
    tags: ['worship', 'intimacy', 'prayer'],
  },
  {
    title: 'Jireh (feat. Chandler Moore)',
    artist: 'Maverick City Music',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]I'll never be more [G#m]loved than I am right now
[E]Wasn't holding You up, so there's nothing I can do to [B]let You down
[B]Doesn't take a [G#m]trophy to make You proud
[E]I'll never be more [F#]loved than I am right [B]now

[B]Jireh, You are e[G#m]nough
[E]Jireh, You are e[F#]nough

[B]I will be con[G#m]tent in every circum[E]stance
You are [F#]Jireh, You are e[B]nough

[B]Already [G#m]enough, already [E]enough, already [F#]enough`,
    notes: 'Same song as Elevation version but with Chandler Moore ad-libs. Gentle and free.',
    bpm: 69,
    tags: ['worship', 'provision', 'contentment'],
  },
  {
    title: 'Refiner',
    artist: 'Maverick City Music',
    originalKey: 'E',
    format: 'chordpro',
    content: `[E]I want to be tried by [B]fire, purified
[C#m]You take whatever You de[A]sire
Lord here I [E]am

[E]I wanna be more like [B]You, and all I need
[C#m]I know I'll find it in [A]You
So take my [E]life

[E]Refiner's [B]fire, my heart's one de[C#m]sire
Is to be [A]holy
[E]Set apart for [B]You, Lord
I choose to be [C#m]holy
[A]Set apart for You my [E]master
[B]Ready to do Your [C#m]will`,
    notes: 'Surrender song. Acoustic led, intimate moment.',
    bpm: 68,
    tags: ['worship', 'surrender', 'holiness'],
  },
  {
    title: 'Man of Your Word',
    artist: 'Maverick City Music',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]Miracle worker, [Em]promise keeper
[C]Light in the darkness, [D]my God
[G]That is who You are [Em]
[C]That is who You are [D]

[G]Way maker, [Em]chain breaker
[C]That is who You [D]are

[G]This mountain, it may [Em]look so big
[C]But God we know that [D]You are bigger
[G]This sickness, it may [Em]look so big
[C]But God we know that [D]You are bigger

[G]You're the man of Your [Em]word
[C]You never have and never [D]will
[G]Change Your mind, You're [Em]faithful
[C]You have been and always [D]will be good`,
    notes: 'Declaration anthem. Works great with a worship team.',
    bpm: 82,
    tags: ['praise', 'faithfulness', 'declaration'],
  },

  // ── Hillsong (more) ──────────────────────────────────────
  {
    title: 'Broken Vessels (Amazing Grace)',
    artist: 'Hillsong Worship',
    originalKey: 'G',
    format: 'chordpro',
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
    notes: 'Modern hymn arrangement with a powerful bridge.',
    bpm: 74,
    tags: ['worship', 'grace', 'restoration'],
  },
  {
    title: 'O Praise the Name (Anastasis)',
    artist: 'Hillsong Worship',
    originalKey: 'D',
    format: 'chordpro',
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
    notes: 'Hymn-like. Simple melody, builds with each verse. Great for communion.',
    bpm: 73,
    tags: ['hymn', 'worship', 'resurrection'],
  },
  {
    title: 'Touch the Sky',
    artist: 'Hillsong UNITED',
    originalKey: 'E',
    format: 'chordpro',
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
    notes: 'Anthemic with a big chorus. Full band energy.',
    bpm: 140,
    tags: ['praise', 'surrender', 'anthem'],
  },
  {
    title: 'Alive',
    artist: 'Hillsong UNITED',
    originalKey: 'Bb',
    format: 'chordpro',
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
    notes: 'High energy declaration. Great for youth worship.',
    bpm: 136,
    tags: ['praise', 'life', 'celebration'],
  },
  {
    title: 'Another in the Fire',
    artist: 'Hillsong UNITED',
    originalKey: 'A',
    format: 'chordpro',
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
    notes: 'Based on Daniel 3. Powerful declaration of God\'s presence.',
    bpm: 69,
    tags: ['worship', 'faith', 'presence'],
  },

  // ── Bethel Music (more) ───────────────────────────────────
  {
    title: 'King of My Heart',
    artist: 'Bethel Music',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]Let the King of my heart be the [Em]mountain where I run
[C]The fountain I drink from, oh [D]He is my song
[G]Let the King of my heart be the [Em]shadow where I hide
[C]The ransom for my life, oh [D]He is my song

[G]You are [Em]good, good, [C]oh [D]
[G]You are [Em]good, good, [C]oh [D]

[G]Let the King of my heart be the [Em]wind inside my sails
[C]The anchor in the waves, oh [D]He is my song
[G]Let the King of my heart be the [Em]fire inside my veins
[C]The echo of my days, oh [D]He is my song`,
    notes: 'Joyful and intimate. Builds to a beautiful "You are good" refrain.',
    bpm: 128,
    tags: ['worship', 'devotion', 'joy'],
  },
  {
    title: 'Great Are You Lord',
    artist: 'Bethel Music',
    originalKey: 'D',
    format: 'chordpro',
    content: `[D]You give life, You are love
[F#m]You bring light to the darkness
[G]You give hope, You restore
[A]Every heart that is broken
[D]Great are You, [A]Lord

[D]It's Your breath in our lungs
[F#m]So we pour out our praise
[G]We pour out our praise
[D]It's Your breath in our lungs
[F#m]So we pour out our praise to [G]You only

[D]And all the earth will shout Your [F#m]praise
[G]Our hearts will cry, these bones will say
[D]Great are You, [A]Lord`,
    notes: 'Simple and singable. Works great with just acoustic guitar.',
    bpm: 78,
    tags: ['worship', 'praise', 'breath'],
  },
  {
    title: 'Build My Life',
    artist: 'Bethel Music',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]Worthy of every [C]song we could ever sing
[Em]Worthy of all the [D]praise we could ever bring
[G]Worthy of every [C]breath we could ever breathe
[Em]We live for [D]You

[G]Jesus the Name a[C]bove every other name
[Em]Jesus the only [D]one who could ever save
[G]Worthy of every [C]breath we could ever breathe
[Em]We live for [D]You, we live for [G]You

[G]Holy, there is no [C]one like You
[Em]There is none be[D]side You
[G]Open up my eyes in [C]wonder
[Em]And show me who You [D]are and fill me
[G]With Your heart and lead me
[C]In Your love to those a[Em]round me
[D]I will build my life upon Your love
It is a firm foun[G]dation`,
    notes: 'One of the most popular modern worship songs. Simple to lead.',
    bpm: 68,
    tags: ['worship', 'devotion', 'foundation'],
  },
  {
    title: 'Tremble',
    artist: 'Bethel Music',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]Jesus, Jesus, [E]You make the darkness tremble
[F#m]Jesus, Jesus, [D]You silence fear
[A]Jesus, Jesus, [E]You make the darkness tremble
[F#m]Jesus, [D]Jesus

[A]Your name is a light that the [E]shadows can't deny
[F#m]Your name is a light that the [D]shadows can't deny
[A]Your name cannot be over[E]come
[F#m]Your name cannot be over[D]come

[A]Peace, bring it all to [E]peace
[F#m]The storms surround[D]ing me
[A]Let it break at Your [E]name`,
    notes: 'Spiritual warfare song. Start gentle, build to powerful declaration.',
    bpm: 72,
    tags: ['worship', 'warfare', 'name of Jesus'],
  },
  {
    title: 'Stand in Your Love',
    artist: 'Bethel Music',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]When darkness tries to [E]roll over my bones
[F#m]When sorrow comes to [D]steal the joy I own
[A]When brokenness and [E]pain is all I know
[F#m]I won't be [D]shaken, I won't be shaken

[A]My fear doesn't [E]stand a chance
[F#m]When I stand in Your [D]love
[A]My fear doesn't [E]stand a chance
[F#m]When I stand in Your [D]love

[A]Shame no longer [E]has a place to hide
[F#m]I am not a [D]captive to the lies
[A]I'm not afraid to [E]leave my past behind
[F#m]I won't be [D]shaken, I won't be shaken`,
    notes: 'Confident declaration. Good for building faith.',
    bpm: 73,
    tags: ['worship', 'courage', 'love'],
  },

  // ── Elevation Worship (more) ──────────────────────────────
  {
    title: 'See A Victory',
    artist: 'Elevation Worship',
    originalKey: 'E',
    format: 'chordpro',
    content: `[E]The weapon formed against me [B]won't prosper
[C#m]Every chain the [A]enemy tries to use
[E]God has given me [B]authority
[C#m]What the devil meant for [A]evil
God will turn it for my [E]good

[E]I'm gonna see a [B]victory
[C#m]I'm gonna see a [A]victory
[E]For the battle be[B]longs to You, Lord
[C#m]I'm gonna see a [A]victory
[E]I'm gonna see a [B]victory
[C#m]For the battle be[A]longs to You, Lord`,
    notes: 'Warfare anthem. Declare with confidence!',
    bpm: 80,
    tags: ['praise', 'victory', 'warfare'],
  },
  {
    title: 'Resurrecting',
    artist: 'Elevation Worship',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]The head that once was [D]crowned with thorns
[Em]Is crowned with glory [C]now
[G]The Savior knelt to [D]wash our feet
[Em]Now at His feet we [C]bow

[G]The One who wore our [D]sin and shame
[Em]Now robed in majes[C]ty
[G]The radiance of [D]perfect love
[Em]Now shines for all to [C]see

[G]Your name, [D]Your name is victo[Em]ry
[C]All praise will rise to [G]Christ our King

[G]The fear that held us [D]now gives way
[Em]To Him who is our [C]peace
[G]His final breath [D]upon the cross
[Em]Is now alive in [C]me`,
    notes: 'Majestic resurrection hymn. Perfect for Easter.',
    bpm: 66,
    tags: ['worship', 'resurrection', 'majesty'],
  },
  {
    title: 'Won\'t Stop Now',
    artist: 'Elevation Worship',
    originalKey: 'C',
    format: 'chordpro',
    content: `[C]Whatever it looks like, [Am]whatever may come
[F]I will praise through the fire, [G]I will praise through the storm
[C]I trust Your plan and [Am]purpose, Lord
[F]You've never let me [G]down

[C]You didn't bring me [Am]out this far
[F]To leave me in the [G]desert
[C]You didn't fill me [Am]up to empty me
[F]So I know You [G]won't stop now

[C]You won't stop [Am]now, You won't stop [F]now
[G]You won't stop [C]now`,
    notes: 'Faith declaration. Medium energy, build on the chorus.',
    bpm: 76,
    tags: ['worship', 'faith', 'perseverance'],
  },
  {
    title: 'Praise',
    artist: 'Elevation Worship',
    originalKey: 'Bb',
    format: 'chordpro',
    content: `[Bb]I'll praise in the [F]pain, I'll praise in the [Gm]valley
[Eb]I'll praise when it all falls apart
[Bb]I'll praise when the [F]walls start closing [Gm]in
[Eb]Your name is my battle cry

[Bb]I'll praise my way [F]out, I'll praise 'til it [Gm]turns around
[Eb]I'll praise the impossible

[Bb]Let it rise [F]up, let it [Gm]overflow
[Eb]Let it reach what seems impossible
[Bb]Let it break [F]through every [Gm]barricade
[Eb]I can see You moving mountains
[Bb]Praise, [F]praise, [Gm]praise
[Eb]Praise His name`,
    notes: 'High energy anthem of praise through trials. Full band.',
    bpm: 140,
    tags: ['praise', 'anthem', 'breakthrough'],
  },
  {
    title: 'Same God',
    artist: 'Elevation Worship',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]I'm calling on the [E]God of Jacob
[F#m]Whose power is the [D]same
[A]If He opened up the [E]Red Sea
[F#m]He can make a [D]way

[A]I'm calling on the [E]God of mercy
[F#m]Whose promise still re[D]mains
[A]He's the same God, [E]same God
[F#m]He's the same [D]God

[A]The God who was, the [E]God who is
[F#m]The God who is to [D]come
[A]The God who was, the [E]God who is
[F#m]The God who is to [D]come
[A]He's the same [E]God, [F#m]He's the same [D]God`,
    notes: 'Declaration of God\'s unchanging nature. Good for building faith.',
    bpm: 71,
    tags: ['worship', 'faithfulness', 'declaration'],
  },

  // ── Cory Asbury ───────────────────────────────────────────
  {
    title: 'The Father\'s House',
    artist: 'Cory Asbury',
    originalKey: 'Ab',
    format: 'chordpro',
    content: `[Ab]Sometimes on this journey I get [Eb]lost in my mistakes
[Fm]What looks to me like [Db]a dead end
Is just a new beginning

[Ab]Fear is just a shadow but [Eb]it's nothing in the light
[Fm]I don't have to see the [Db]ending
As long as God is in it

[Ab]Lay down what I want and [Eb]find what I need
[Fm]There is freedom [Db]in surrender

[Ab]Welcome home, [Eb]set a place at the table
[Fm]There's no darkness [Db]in the Father's house
[Ab]There's singing and [Eb]dancing
[Fm]I've come back to the [Db]Father's house`,
    notes: 'Prodigal son theme. Joyful and welcoming. Capo 1 play G shapes.',
    bpm: 114,
    tags: ['worship', 'home', 'grace'],
  },

  // ── Matt Redman ───────────────────────────────────────────
  {
    title: '10,000 Reasons (Bless the Lord)',
    artist: 'Matt Redman',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]Bless the Lord, [Em]oh my soul, [C]oh my soul
[G]Worship His [D]holy name
[Em]Sing like [C]never before, [G]oh my [D]soul
[G]I'll worship Your holy name

[G]The sun comes up, [Em]it's a new day dawning
[C]It's time to sing Your [D]song again
[G]Whatever may pass and [Em]whatever lies before me
[C]Let me be singing when the [D]evening comes

[G]You're rich in love and [Em]You're slow to anger
[C]Your name is great and [D]Your heart is kind
[G]For all Your goodness [Em]I will keep on singing
[C]Ten thousand reasons for my [D]heart to find`,
    notes: 'One of the most popular worship songs of the decade. Simple and powerful.',
    bpm: 73,
    tags: ['worship', 'praise', 'classic'],
  },
  {
    title: 'Blessed Be Your Name',
    artist: 'Matt Redman',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]Blessed be Your name in the [E]land that is plentiful
[B]Where Your streams of a[F#]bundance flow, [E]blessed be Your name
[B]Blessed be Your name when I'm [E]found in the desert place
[B]Though I walk through the [F#]wilderness, [E]blessed be Your name

[B]Every blessing You [E]pour out I'll turn back to praise
[B]When the darkness [F#]closes in, Lord, [E]still I will say

[B]Blessed be the name of the [E]Lord, blessed be Your name
[B]Blessed be the name of the [F#]Lord
[E]Blessed be Your glorious [B]name`,
    notes: 'Classic worship anthem for all seasons. Easy to lead.',
    bpm: 128,
    tags: ['worship', 'praise', 'all seasons'],
  },
  {
    title: 'Heart of Worship',
    artist: 'Matt Redman',
    originalKey: 'D',
    format: 'chordpro',
    content: `[D]When the music [A]fades, all is stripped a[Em]way
[G]And I simply [D]come
[D]Longing just to [A]bring something that's of [Em]worth
[G]That will bless Your [A]heart

[D]I'll bring You more than a [A]song
[Em]For a song in itself is [G]not what You have re[D]quired
[D]You search much deeper with[A]in
[Em]Through the way things ap[G]pear, You're looking into my [A]heart

[D]I'm coming back to the [A]heart of worship
[Em]And it's all about [G]You, all about [D]You Jesus
[D]I'm sorry Lord for the [A]thing I've made it
[Em]When it's all about [G]You, all about [D]You Jesus`,
    notes: 'Back to basics worship. Acoustic, intimate, stripped down.',
    bpm: 72,
    tags: ['worship', 'intimacy', 'classic'],
  },

  // ── Leeland ───────────────────────────────────────────────
  {
    title: 'Way Maker',
    artist: 'Leeland',
    originalKey: 'E',
    format: 'chordpro',
    content: `[E]You are here, moving in our midst
[B]I worship You, I worship You
[C#m]You are here, working in this place
[A]I worship You, I worship You

[E]Way maker, miracle worker
[B]Promise keeper, light in the darkness
[C#m]My God, that is who You are
[A]Way maker, miracle worker
[E]Promise keeper, light in the darkness
[B]My God, that is who You are

[E]You are here, touching every heart
[B]I worship You, I worship You
[C#m]You are here, healing every life
[A]I worship You, I worship You`,
    notes: 'Originally by Sinach. One of the biggest worship songs worldwide.',
    bpm: 68,
    tags: ['worship', 'miracle', 'declaration'],
  },

  // ── Passion ───────────────────────────────────────────────
  {
    title: 'Glorious Day',
    artist: 'Passion',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]I was buried beneath my [C]shame
[Em]Who could carry that [D]kind of weight
[G]It was my tomb, 'til [C]I met You

[G]I was breathing but [C]wasn't alive
[Em]All my failures I [D]tried to hide
[G]It was my tomb, 'til [C]I met You

[G]You called my name and [C]I ran out of that grave
[Em]Out of the darkness [D]into the glorious day
[G]You called my name and [C]I ran out of that grave
[Em]Out of the darkness [D]into the glorious [G]day`,
    notes: 'Celebration of new life. Energetic chorus, full band.',
    bpm: 76,
    tags: ['praise', 'resurrection', 'freedom'],
  },
  {
    title: 'God You\'re So Good',
    artist: 'Passion',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]Amazing, [G#m]so amazing, [E]how can it be
[F#]True that You'd love me

[B]God You're so good, [G#m]God You're so good
[E]God You're so good, [F#]You're so good to me

[B]Faithful, [G#m]so faithful, [E]is Your love for me
[F#]For all my days

[B]Beautiful, [G#m]beautiful, [E]there is nothing that
[F#]Compares to You

[B]Healing, [G#m]forgiving, [E]Your love never ends
[F#]You are so good`,
    notes: 'Simple chorus. Great for congregational worship.',
    bpm: 74,
    tags: ['worship', 'goodness', 'praise'],
  },
  {
    title: 'Worthy of Your Name',
    artist: 'Passion',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]No eye has seen and [E]no ear has heard
[F#m]The depths of Your [D]love, Lord
[A]No mind could fathom the [E]love that You showed
[F#m]When You left the [D]heavens

[A]To break into our [E]darkness
[F#m]With the blazing light of [D]hope

[A]We're calling [E]worthy, worthy, [F#m]worthy
[D]Worthy of Your name
[A]You're worthy, [E]worthy, [F#m]worthy
[D]Worthy of Your name, [A]Jesus`,
    notes: 'Bold declaration. Builds well with a worship team.',
    bpm: 70,
    tags: ['worship', 'worthy', 'declaration'],
  },

  // ── Brandon Lake ──────────────────────────────────────────
  {
    title: 'Gratitude',
    artist: 'Brandon Lake',
    originalKey: 'G',
    format: 'chordpro',
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
    notes: 'Joyful praise. Let the gratitude overflow. Full energy.',
    bpm: 81,
    tags: ['praise', 'gratitude', 'joy'],
  },

  // ── Vertical Worship ──────────────────────────────────────
  {
    title: 'Yes I Will',
    artist: 'Vertical Worship',
    originalKey: 'Bb',
    format: 'chordpro',
    content: `[Bb]I count on one thing
[F]The same God that never fails
[Gm]Will not fail me now
[Eb]You won't fail me now

[Bb]In the waiting, the [F]same God who's never late
[Gm]Is working all things [Eb]out

[Bb]Yes I will, lift You [F]high in the lowest valley
[Gm]Yes I will, bless Your [Eb]name
[Bb]Yes I will, sing for [F]joy when my heart is heavy
[Gm]All my days, yes I [Eb]will

[Bb]I choose to praise, to [F]give You my best in trial
[Gm]Through fire or rain, [Eb]yes I will`,
    notes: 'Declaration of praise. Great for building faith.',
    bpm: 73,
    tags: ['worship', 'praise', 'faith'],
  },

  // ── Zach Williams ─────────────────────────────────────────
  {
    title: 'Chain Breaker',
    artist: 'Zach Williams',
    originalKey: 'Am',
    format: 'chordpro',
    content: `[Am]If you've been walking the [F]same old road for [C]miles and miles
[Am]If you've been hearing the [F]same old voice tell the [C]same old lies
[Am]If you've been hoping for [F]something more from your [C]life
[Dm]If you've been reaching in the dark for [E]answers

[Am]If you've got [F]pain, He's a [C]pain taker
[Am]If you feel [F]lost, He's a [C]way maker
[Am]If you need [F]freedom or [C]saving
[Dm]He's a prison-shaking [E]Savior
[Am]If you got [F]chains, He's a [C]chain breaker`,
    notes: 'Powerful anthem of freedom. Southern rock worship feel.',
    bpm: 83,
    tags: ['praise', 'freedom', 'chains'],
  },

  // ── Brooke Ligertwood ─────────────────────────────────────
  {
    title: 'Nicea (Holy, Holy, Holy)',
    artist: 'Brooke Ligertwood',
    originalKey: 'C',
    format: 'chordpro',
    content: `[C]Holy, holy, [F]holy, [C]Lord God Al[G]mighty
[Am]Early in the [F]morning our [C]song shall rise to [G]Thee
[C]Holy, holy, [F]holy, [C]merciful and [G]mighty
[F]God in three [C]persons, [G]blessed Trini[C]ty

[C]Holy, holy, [F]holy, [C]all the saints a[G]dore Thee
[Am]Casting down their [F]golden crowns a[C]round the glassy [G]sea
[C]Cherubim and [F]seraphim [C]falling down be[G]fore Thee
[F]Which wert and [C]art and [G]evermore shalt [C]be

[Am]You are [F]holy, there is [G]no one like You
[Am]You are [F]holy, there is [G]no one be[C]side You`,
    notes: 'Modern arrangement of the classic hymn. Beautiful and reverent.',
    bpm: 66,
    tags: ['hymn', 'holiness', 'worship'],
  },

  // ── Sean Feucht ───────────────────────────────────────────
  {
    title: 'Let Us Worship (No Weapon)',
    artist: 'Sean Feucht',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]No weapon formed against me [Em]shall remain
[C]I'll rejoice, I'll be [D]glad in the day that the Lord has made
[G]I won't live by what I [Em]see
[C]I'll not be moved by [D]the waves

[G]There's a war and I know it
[Em]There's a fight and I'll face it
[C]But I've got a word from the [D]Lord
[G]So I'll stand on every [Em]promise He has spoken
[C]'Cause I know that my [D]God doesn't lie

[G]Let us worship, [Em]let us worship
[C]Let us worship, [D]let us worship`,
    notes: 'Outdoor worship energy. Bold and declarative.',
    bpm: 130,
    tags: ['praise', 'warfare', 'declaration'],
  },

  // ── CityAlight ────────────────────────────────────────────
  {
    title: 'Yet Not I But Through Christ in Me',
    artist: 'CityAlight',
    originalKey: 'D',
    format: 'chordpro',
    content: `[D]What gift of grace is [A]Jesus my redeemer
[Bm]There is no more for [G]heaven now to give
[D]He is my joy, my [A]righteousness and freedom
[Bm]My steadfast love, my [G]deep and boundless peace

[D]To this I hold, my [A]hope is only Jesus
[Bm]For my life is [G]wholly bound to His
[D]Oh how strange and [A]divine, I can sing all is mine
[Bm]Yet not I, but through [G]Christ in [D]me

[D]The night is dark, but [A]I am not forsaken
[Bm]For by my side, the [G]Savior He will stay
[D]I labor on in [A]weakness and rejoicing
[Bm]For in my need, His [G]power is displayed`,
    notes: 'Modern hymn. Beautiful theology. Congregational favorite.',
    bpm: 78,
    tags: ['hymn', 'worship', 'grace'],
  },
  {
    title: 'Christ Is Mine Forevermore',
    artist: 'CityAlight',
    originalKey: 'G',
    format: 'chordpro',
    content: `[G]Mine are days that [D]God has numbered
[Em]I was made to [C]walk with Him
[G]Yet I look for [D]worldly treasure
[Em]And forsake the [C]King of kings

[G]But mine is hope in [D]my Redeemer
[Em]Though I fall, His [C]love is sure
[G]For Christ has paid for [D]every failing
[Em]I am His for[C]evermore

[G]Mine are tears in [D]times of sorrow
[Em]Darkness not yet [C]understood
[G]Through the valley [D]I must travel
[Em]Where I see my [C]Father's good`,
    notes: 'Hymn-style. Rich lyrics. Acoustic arrangement works beautifully.',
    bpm: 70,
    tags: ['hymn', 'assurance', 'worship'],
  },

  // ── Tauren Wells ──────────────────────────────────────────
  {
    title: 'Known',
    artist: 'Tauren Wells',
    originalKey: 'E',
    format: 'chordpro',
    content: `[E]In the middle of the [B]ocean
[C#m]You are there right [A]here beside me
[E]When I'm lost in the [B]shadows
[C#m]You see every[A]thing

[E]I'm fully [B]known and loved by You
[C#m]You won't let [A]go no matter what I do
[E]And it's not because I'm [B]worthy
[C#m]It's who You [A]are

[E]Nothing I could do could [B]make You love me less
[C#m]Nothing I could do could [A]make You love me more
[E]It's who You are, [B]it's who You are
[C#m]It's who You [A]are`,
    notes: 'Identity in Christ. Smooth pop worship feel.',
    bpm: 72,
    tags: ['worship', 'identity', 'love'],
  },

  // ── Casting Crowns ────────────────────────────────────────
  {
    title: 'Who Am I',
    artist: 'Casting Crowns',
    originalKey: 'B',
    format: 'chordpro',
    content: `[B]Who am I, that the [E]Lord of all the earth
[G#m]Would care to know my [F#]name
[B]Would care to feel my [E]hurt
[B]Who am I, that the [E]bright and morning star
[G#m]Would choose to light the [F#]way
[B]For my ever wandering [E]heart

[B]Not because of [E]who I am
[G#m]But because of [F#]what You've done
[B]Not because of [E]what I've done
[G#m]But because of [F#]who You are

[B]I am a flower quickly [E]fading
[G#m]Here today and gone to[F#]morrow
[B]A wave tossed in the [E]ocean
[G#m]A vapor in the [F#]wind
[B]Still You hear me when I'm [E]calling
[G#m]Lord You catch me when I'm [F#]falling
[B]And You've told me who I [E]am
[G#m]I am [F#]Yours, I am [B]Yours`,
    notes: 'Classic CCM worship song. Very singable.',
    bpm: 68,
    tags: ['worship', 'identity', 'classic'],
  },
  {
    title: 'Praise You in This Storm',
    artist: 'Casting Crowns',
    originalKey: 'A',
    format: 'chordpro',
    content: `[A]I was sure by now, [E]God You would have reached down
[F#m]And wiped our tears a[D]way, stepped in and saved the day
[A]But once again, I [E]say amen
[F#m]And it's still [D]raining

[A]And I'll praise You [E]in this storm
[F#m]And I will lift my [D]hands
[A]For You are who You [E]are
[F#m]No matter where I [D]am
[A]And every tear I've [E]cried
[F#m]You hold in Your [D]hand
[A]You never left my [E]side
[F#m]And though my heart is [D]torn
I will praise You in this [A]storm`,
    notes: 'Song for the hard seasons. Comforting and honest.',
    bpm: 66,
    tags: ['worship', 'storm', 'perseverance'],
  },
];

// ─── Main ───────────────────────────────────────────────────
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

  // Firestore batches limited to 500 ops, split if needed
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

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`\nSeeded ${count} worship songs into Firestore (total in script: ${SONGS.length}).`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
