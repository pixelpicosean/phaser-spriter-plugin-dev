# Spriter animation plugin for Phaser 3 (WIP)

Dev project for [Spriter](https://brashmonkey.com) plugin for Phaser 3.

## How to run

- Prepare: `yarn`
- Development: `yarn start`
- Build: `yarn build`

## Folders

- assets: raw assets, you can put images and texture packer files here, export atlas to `media` folder
- media: image, atlas, sound and whatever you need to ship with the final game
- src: source code locates here, `main.js` is the entry

## Known issues

- Animation y scale is not correct (should turn upside down)
- Phaser 3.13.0 camera is buggy, unless its position is not `(0, 0)`
