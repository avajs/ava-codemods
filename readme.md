# ava-codemods [![Build Status](https://travis-ci.org/jamestalmage/ava-codemods.svg?branch=master)](https://travis-ci.org/jamestalmage/ava-codemods)

> Codemods for AVA

Codemods to simplify upgrading [AVA](https://github.com/sindresorhus/ava) versions.

## Install

```
$ npm install --global ava-codemods
```


## Usage

Simply run `ava-codemods` in your terminal and answer a few questions.

## Supported codemods

### Upgrading to 0.14

- Renaming `t.ok()` to `t.truthy()`
- Renaming `t.notOk()` to `t.falsy()`
- Renaming `t.same()` to `t.deepEqual()`
- Renaming `t.notSame()` to `t.notDeepEqual()`

## License

MIT © [James Talmage](http://github.com/jamestalmage)
