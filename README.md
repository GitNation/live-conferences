# Live GitNation Conferences

## Usage

`yarn start:$key` to start locally
`yarn build:$key` to build static site

build will be located at `build/$key`

src of a conference: `src/conferences/$key`

### List of conference keys:

- qaconf
- jsn
- mlconf
- nodeconf
- qaconf
- rs
- ravd

## How to add a conference

1. Create a folder `src/conference/$key` where $key a reference to the conference
2. Put the source of conference into `src/conference/$key`
3. Create symlinks:

```shell
cd src/conference/$key/templates
ln -s ../../../partials partials
ln -s ../../../eventsBus eventsBus
ln -s ../../../ga ga
```

4. Add scripts to `package.json`:

`"build:$key": "CONF_CODE=$key yarn build"`

`"start:$key": "CONF_CODE=$key yarn start"`

5. Add the key to the list in this `README.md` [List of conference keys](#list-of-conference-keys)


## Credentials

FocusReactive 2020
