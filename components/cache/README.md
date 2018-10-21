# API Cache POC
A deprecated, short-lived POC for caching using the Firebase realtime database.

## Overview
This component contains six functions for getting and setting a cache in Firebase.

- `getPlaceAutocompleteCache`
- `getPlaceInfoCache`
- `getPlacesCache`
- `setPlaceAutocompleteCache`
- `setPlaceInfoCache`
- `setPlacesCache`

See more [in the code itself](./index.js).

# Running this locally
1. Follow the setup [in the root README.md](../../README.md) first before continuing
1. Go to your **Google cloud console**
1. On the left drawer navigation menu, go to **IAM & Admin**
1. On the left navigation menu, go to **Service accounts**
1. Click on **Create service account** and select **Project Owner** for the roles
1. Click on **Create Key** and select **JSON**
1. Save the file as `./credentials.json` in this directory
1. Run `npm start` in this directory
