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

| Script | Songs | Artists |
|--------|-------|---------|
| `01-bethel-elevation-hillsong-core.mjs` | 20 | Bethel, Elevation Worship, Hillsong |
| `02-mixed-artists.mjs` | 54 | Tomlin, Wickham, Kari Jobe, Daigle, Maverick City, Redman, others |
| `03-major-artists-expanded.mjs` | 100 | Hillsong (all), Bethel, Jesus Culture, Elevation, Maverick City, Tomlin, Casting Crowns, MercyMe, Crowder, Redman, Wickham |
| `04-indie-gospel-hymn-writers.mjs` | 100 | Getty, Townend, Shane & Shane, Maher, Rend Collective, We The Kingdom, UPPERROOM, Housefires, Cobbs, McDowell, Houghton, Dulaney, Gateway, Baloche, Carnes, Barrett, Gayle, Bowe |
| `05-classic-modern-international.mjs` | 100 | Planetshakers, Michael W. Smith, Delirious?, Vineyard, Crowder, Newsboys, Jeremy Camp, Third Day, Wells, Lake, Raine, DOE, Frank, Wilson, hymns, Spanish, Hughes, Zschech, Cook, Ligertwood |
| `06-favorite-artists-deep-cuts.mjs` | 150 | Bethel, Elevation, Jesus Culture, UPPERROOM, Jeremy Camp, Vineyard, Brooke Ligertwood, Brandon Lake, Chris Tomlin, Kari Jobe |

**Total: ~533 songs seeded**
