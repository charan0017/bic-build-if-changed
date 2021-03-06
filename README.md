<h1 align="center">  
   bic-build-if-changed
</h1>

<h4 align="center">
Build your packages only if they changed since the last build.
</h4>

&nbsp;

## How it works

1. Look for `package.json` for `bic` config (example config - `"bic": ["src"]`).

2. Crawl the folders that are defined in config and generates a combined SHA-1 hash of all the files in defined folders. The hashes are stored in `./node_modules/bic-build-if-changed/cache`.

3. If the stored hash of the project folders is outdated, then `bic` will execute `npm run build`
   in the relevant project folder.

&nbsp;

## Usage

1. Install the package:

```sh
npm i bic-build-if-changed -D
# or
yarn add bic-build-if-changed -D
```

2. Edit your `package.json` module to customize the behavior:

```js
// Only the "src" & "public" directories:
"bic": ["src", "public"],
// Disable bic for a package:
"bic": false,
// Use default directories ("src"):
"bic": true,
```

3. Use the package: (using with npm)
```sh
npm run build-if-changed
# or
npm run bic
# you can use -force (or) -F flag to Force Re-Build
npm run bic -F
```
3. Use the package: (using with yarn)
```sh
yarn build-if-changed
# or
yarn bic
# you can use -force (or) -F flag to Force Re-Build
yarn bic -F
```

&nbsp;

## Notes

- Only bic config directories are watched, by default `./src` directory is only watched.

&nbsp;

## Inspiration
[https://github.com/alloc/build-if-changed](https://github.com/alloc/build-if-changed)