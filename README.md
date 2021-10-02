# ScreepsExcutor

![](https://img.shields.io/badge/language-typescript-blue.svg)

This project is generate from [screeps-typescript-starter](https://github.com/screepers/screeps-typescript-starter).It's really an excellent template for newbie in this game.

## Getting Started

### Install Dependency

```bash
npm install
```

or

```bash
yarn install
```

### Deploy To Your Own Room

Copy config file.

```bash
cp screeps.json.sample screeps.json
```

And then you should get your own (token)[https://screeps.com/a/#!/account/auth-tokens] from screeps.com and write it to `screeps.json`.

Push to your room.

```
# yarn
yarn push-main
#npm
npm run push-main
```

## Documentation

The type definitions for Screeps come from [typed-screeps](https://github.com/screepers/typed-screeps). If you find a problem or have a suggestion, please open an issue there.

To visit the docs, [click here](https://screepers.gitbook.io/screeps-typescript-starter/).
