# Overview

# Get Started

## Development

1. Create a `.env` file inside the `./functions` directory
1. Get your Google API key and paste it inside the `.env` so that the line looks like `GOOGLE_PLACES_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
1. Run `make setup` from the root of this repository to install dependencies
1. Run `make start` from the root of this repository to start the application
1. When done, run `make deploy` from the root of this repository, **confirm you are using a staging project** to avoid whacking the production please

## Notes

1. If application doesn't react to changes in code (which it will not for some reason), interrupt it with ctrl + c and run `make start` again.
1. To clear the cache, run `make clean`

# Functions
Following functions are available:

- [Place Autocomplete](#place-autocomplete)
- [Place Info](#place-info)
- [Random Place](#random-place)

## Place Autocomplete

| URL Parameter | Required | Description |
| --- | --- | --- |
| `text` | **REQUIRED** | A query text to use |
| `session` | **REQUIRED** | Specifies a UUIDv4 string |

### Example Paths for Place Autocomplete

- `/placeAutocomplete?session=d613bdfd-f07f-4983-b28e-038d70fee6d1&text=city%20hall`

## Place Info

| URL Parameter | Required | Description |
| --- | --- | --- |
| `placeid` | **REQUIRED** | Specifies the place ID of a Google Places place |
| `session` | **REQUIRED** | Specifies a UUIDv4 string |

### Example Paths for Place Info

- `/placeInfo?placeid=ChIJWV12i6wX2jERCov6IHNK9rw&session=307c6f49-2e37-42b0-a622-7868490f89d1`

## Random Place

| URL Parameter | Required | Description |
| --- | --- | --- |
| `text` | **REQUIRED** | Specifies the query text |
| `lat` | **REQUIRED** | Latitude of area |
| `lng` | **REQUIRED** | Longitude of area |
| `rad` | **REQUIRED** | Radius in metres within `:lat` and `:lng` to search for |

### Example Paths for Random Place

- `/placeRandom?text=coffee&lat=1.3345455&&lon=103.8673043&rad=500`

# User Flows (MSSes)

The intended user flow for the web application are as follows:

- [Random Next Place](#random-next-place-user-flow)

## Random Next Place User Flow

1. User enters web application
1. User searches for their location using text (hits [Place Autocomplete](#place-autocomplete))
1. User confirms their location by selecting the location (hits [Place Info](#place-info))
1. User sees a random place to go to (hits [Random Place](#random-place))
1. User happily goes there (:

# Licensing

All rights reserved.
