# Bit Block Boom 2024 - NWC

This repository is filled with comments to help you learn about building on Nostr and implementing NWC.

Here is a link to the accompanying slides: https://docs.google.com/presentation/d/1Cx_PmmofEKw8pqwdfSVhe2p25kUet1dUGLd1jUFFqcs/edit?usp=sharing 

## Using this Repo

First, follow the below instructions on running the app to get things up and running.

Then, checkout the `unfinished` branch to see some fill in the blanks.

```
git checkout unfinished
```

Next, go through the code snippets at the end of the above slideshow and find where they go in the project. If you want to learn, do not just copy and paste, write the code out even if it's word for word.

Finally, read through all the comments, break things, and implement more NWC methods.

Refer to [NIP47](https://github.com/nostr-protocol/nips/blob/master/47.md) for any protocol questions.

## Running the App

### Reccommended

Use nix.

Install nix from [Determinate Systems](https://determinate.systems/posts/determinate-nix-installer/)

Just copy the below into your terminal to install nix on your system.

```
curl --proto '=https' --tlsv1.2 -sSf -L https://install.determinate.systems/nix | sh -s -- install
```

NOTE: If you install nix another way, make sure you enable [experimental features](https://nixos.wiki/wiki/Flakes)

Then start the app with

```
npm run dev
```

### Also Works

Make sure you have [Node.js](https://nodejs.org/en/download) installed.

```
npm install
```

And run the app with

```
npm run dev
```
