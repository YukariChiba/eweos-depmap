# depmap

## usage

```bash
yarn build

yarn start bygroup [group]

yarn start bylist <package1> [package2] ... [packageN]
```

## configs

`src/data/bootstrap.json`:
```json
{
  "no_makedepends": [
    ...pkgnames // ignore makedepends if --bootstrap
  ],
  "remove_depends": {
    pkgname: [ ...pkgnames ] // remove some depends if --bootstrap
  }
```
`src/data/ignorelist.json`:
```json
{
  pkgname: [ ...pkgnames ] // remove some depends if not --no-ignorelist
}
```
`src/data/presets.json`:
```json
{
  presetname: {
    "description": description,
    "groups": [...groupnames], // groups in preset
    "packages": [...pkgnames] // packages in preset
  }
}
```

## templates

### python transition

```bash
yarn start bylist $(pacman -Fq /usr/lib/python3.*/ | sed 's@main/@@' | xargs) --bootstrap
```
