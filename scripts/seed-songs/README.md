# Worship Songs Seed Scripts

One-time scripts to populate the Firestore `worshipSongs` collection.

## Usage

```bash
# Set your Firebase service account key
export GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccountKey.json

# Run any batch (--skip-existing prevents duplicates)
node scripts/seed-songs/01-bethel-elevation-hillsong-core.mjs --skip-existing
```

Requires `firebase-admin` (`pnpm add -D firebase-admin`).

## Batches

| Script | Songs | Description |
|--------|-------|-------------|
| `01-bethel-elevation-hillsong-core.mjs` | 20 | Bethel, Elevation Worship, Hillsong core songs |
| `02-mixed-artists.mjs` | 54 | Tomlin, Wickham, Kari Jobe, Daigle, Maverick City, Redman, others |
| `03-major-artists-expanded.mjs` | 100 | Hillsong, Bethel, Jesus Culture, Elevation, Maverick City, Tomlin, Casting Crowns, MercyMe, Crowder, Redman, Wickham |
| `04-indie-gospel-hymn-writers.mjs` | 100 | Getty, Townend, Shane & Shane, Maher, Rend Collective, We The Kingdom, UPPERROOM, Housefires, Cobbs, McDowell, Houghton, Dulaney, Gateway, Baloche, Carnes, Barrett, Gayle, Bowe |
| `05-classic-modern-international.mjs` | 100 | Planetshakers, Michael W. Smith, Delirious?, Vineyard, Crowder, Newsboys, Third Day, Wells, Lake, Raine, DOE, Frank, Wilson, hymns, Spanish, Hughes, Zschech, Cook, Ligertwood |
| `06-favorite-artists-deep-cuts.mjs` | 150 | Bethel, Elevation, Jesus Culture, UPPERROOM, Vineyard, Brooke Ligertwood, Brandon Lake, Chris Tomlin, Kari Jobe deep cuts |
| `07-remove-camp-add-riddle.mjs` | 15 | Removes Jeremy Camp, adds Jeremy Riddle songs |

## Songs by Artist (527 total)

| Artist | Songs |
|--------|------:|
| Bethel Music | 35 |
| Elevation Worship | 34 |
| Chris Tomlin | 29 |
| Jesus Culture | 24 |
| Hillsong Worship | 22 |
| Brandon Lake | 21 |
| UPPERROOM | 20 |
| Vineyard Worship | 20 |
| Brooke Ligertwood | 19 |
| Kari Jobe | 18 |
| Hillsong UNITED | 15 |
| Jeremy Riddle | 15 |
| Maverick City Music | 12 |
| Traditional Hymns (Modern) | 11 |
| Casting Crowns | 9 |
| Phil Wickham | 9 |
| Keith & Kristyn Getty | 8 |
| Matt Redman | 8 |
| MercyMe | 8 |
| Crowder | 7 |
| Delirious? | 6 |
| Gateway Worship | 6 |
| Hillsong Young & Free | 6 |
| Israel Houghton | 6 |
| Michael W. Smith | 6 |
| Planetshakers | 6 |
| Rend Collective | 6 |
| Tauren Wells | 6 |
| Third Day | 6 |
| Todd Dulaney | 6 |
| We The Kingdom | 6 |
| All Sons & Daughters | 5 |
| Charity Gayle | 5 |
| Cody Carnes | 5 |
| Dante Bowe | 5 |
| David Crowder Band | 5 |
| Housefires | 5 |
| Matt Maher | 5 |
| Newsboys | 5 |
| Pat Barrett | 5 |
| Paul Baloche | 5 |
| Shane & Shane | 5 |
| Tasha Cobbs Leonard | 5 |
| William McDowell | 5 |
| Darlene Zschech | 4 |
| DOE | 4 |
| Forrest Frank | 4 |
| Naomi Raine | 4 |
| Passion | 4 |
| Stuart Townend | 4 |
| Tim Hughes | 4 |
| Amanda Cook | 3 |
| Anne Wilson | 3 |
| CityAlight | 2 |
| Lauren Daigle | 2 |
| Cory Asbury | 1 |
| Danilo Montero | 1 |
| Leeland | 1 |
| Marcos Witt | 1 |
| Sean Feucht | 1 |
| Vertical Worship | 1 |
| Zach Williams | 1 |
