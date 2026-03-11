# Worship Songs Seed Scripts

One-time scripts to populate the Firestore `worshipSongs` collection.

## Usage

```bash
# Set your Firebase service account key
export GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json

# Run any per-artist script (--skip-existing prevents duplicates)
node scripts/seed-songs/bethel-music.mjs --skip-existing
```

Requires `firebase-admin` (`pnpm add -D firebase-admin`).

## Per-Artist Scripts

| Script | Songs | Artist(s) |
|--------|------:|-----------|
| `bethel-music.mjs` | 35 | Bethel Music |
| `elevation-worship.mjs` | 34 | Elevation Worship |
| `chris-tomlin.mjs` | 29 | Chris Tomlin |
| `jesus-culture.mjs` | 24 | Jesus Culture |
| `hillsong-worship.mjs` | 21 | Hillsong Worship |
| `brandon-lake.mjs` | 21 | Brandon Lake |
| `upperroom.mjs` | 20 | UPPERROOM |
| `vineyard-worship.mjs` | 20 | Vineyard Worship |
| `brooke-ligertwood.mjs` | 19 | Brooke Ligertwood |
| `kari-jobe.mjs` | 18 | Kari Jobe |
| `hillsong-united.mjs` | 15 | Hillsong UNITED |
| `jeremy-riddle.mjs` | 15 | Jeremy Riddle |
| `maverick-city-music.mjs` | 12 | Maverick City Music |
| `traditional-modern.mjs` | 11 | Traditional (Modern) |
| `phil-wickham.mjs` | 9 | Phil Wickham |
| `casting-crowns.mjs` | 9 | Casting Crowns |
| `matt-redman.mjs` | 8 | Matt Redman |
| `mercyme.mjs` | 8 | MercyMe |
| `keith-and-kristyn-getty.mjs` | 8 | Keith & Kristyn Getty |
| `crowder.mjs` | 7 | Crowder |
| `tauren-wells.mjs` | 6 | Tauren Wells |
| `hillsong-young-and-free.mjs` | 6 | Hillsong Young & Free |
| `rend-collective.mjs` | 6 | Rend Collective |
| `we-the-kingdom.mjs` | 6 | We The Kingdom |
| `israel-houghton.mjs` | 6 | Israel Houghton |
| `todd-dulaney.mjs` | 6 | Todd Dulaney |
| `planetshakers.mjs` | 6 | Planetshakers |
| `michael-w-smith.mjs` | 6 | Michael W. Smith |
| `delirious.mjs` | 6 | Delirious? |
| `third-day.mjs` | 6 | Third Day |
| `shane-and-shane.mjs` | 5 | Shane & Shane |
| `matt-maher.mjs` | 5 | Matt Maher |
| `housefires.mjs` | 5 | Housefires |
| `all-sons-and-daughters.mjs` | 5 | All Sons & Daughters |
| `tasha-cobbs-leonard.mjs` | 5 | Tasha Cobbs Leonard |
| `william-mcdowell.mjs` | 5 | William McDowell |
| `gateway-worship.mjs` | 5 | Gateway Worship |
| `paul-baloche.mjs` | 5 | Paul Baloche |
| `cody-carnes.mjs` | 5 | Cody Carnes |
| `pat-barrett.mjs` | 5 | Pat Barrett |
| `dante-bowe.mjs` | 5 | Dante Bowe |
| `david-crowder-band.mjs` | 5 | David Crowder Band |
| `newsboys.mjs` | 5 | Newsboys |
| `stuart-townend.mjs` | 4 | Stuart Townend |
| `charity-gayle.mjs` | 4 | Charity Gayle |
| `naomi-raine.mjs` | 4 | Naomi Raine |
| `doe.mjs` | 4 | DOE |
| `forrest-frank.mjs` | 4 | Forrest Frank |
| `tim-hughes.mjs` | 4 | Tim Hughes |
| `darlene-zschech.mjs` | 4 | Darlene Zschech |
| `other-artists.mjs` | 22 | Passion (3), Anne Wilson (3), Amanda Cook (3), Lauren Daigle (2), CityAlight (2), Cory Asbury (1), Leeland (1), Vertical Worship (1), Zach Williams (1), Sean Feucht (1), Various (Spanish) (1), Marcos Witt (1), Danilo Montero (1), David Crowder (1) |

**Total: 518 songs across 51 scripts**

## Songs by Artist

| Artist | Songs |
|--------|------:|
| Bethel Music | 35 |
| Elevation Worship | 34 |
| Chris Tomlin | 29 |
| Jesus Culture | 24 |
| Hillsong Worship | 21 |
| Brandon Lake | 21 |
| UPPERROOM | 20 |
| Vineyard Worship | 20 |
| Brooke Ligertwood | 19 |
| Kari Jobe | 18 |
| Hillsong UNITED | 15 |
| Jeremy Riddle | 15 |
| Maverick City Music | 12 |
| Traditional (Modern) | 11 |
| Phil Wickham | 9 |
| Casting Crowns | 9 |
| Matt Redman | 8 |
| MercyMe | 8 |
| Keith & Kristyn Getty | 8 |
| Crowder | 7 |
| Tauren Wells | 6 |
| Hillsong Young & Free | 6 |
| Rend Collective | 6 |
| We The Kingdom | 6 |
| Israel Houghton | 6 |
| Todd Dulaney | 6 |
| Planetshakers | 6 |
| Michael W. Smith | 6 |
| Delirious? | 6 |
| Third Day | 6 |
| Shane & Shane | 5 |
| Matt Maher | 5 |
| Housefires | 5 |
| All Sons & Daughters | 5 |
| Tasha Cobbs Leonard | 5 |
| William McDowell | 5 |
| Gateway Worship | 5 |
| Paul Baloche | 5 |
| Cody Carnes | 5 |
| Pat Barrett | 5 |
| Dante Bowe | 5 |
| David Crowder Band | 5 |
| Newsboys | 5 |
| Stuart Townend | 4 |
| Charity Gayle | 4 |
| Naomi Raine | 4 |
| DOE | 4 |
| Forrest Frank | 4 |
| Tim Hughes | 4 |
| Darlene Zschech | 4 |
| Passion | 3 |
| Anne Wilson | 3 |
| Amanda Cook | 3 |
| Lauren Daigle | 2 |
| CityAlight | 2 |
| Cory Asbury | 1 |
| Leeland | 1 |
| Vertical Worship | 1 |
| Zach Williams | 1 |
| Sean Feucht | 1 |
| Various (Spanish) | 1 |
| Marcos Witt | 1 |
| Danilo Montero | 1 |
| David Crowder | 1 |
