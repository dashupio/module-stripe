Dashup Module Stripe
&middot;
[![Latest Github release](https://img.shields.io/github/release/dashup/module-stripe.svg)](https://github.com/dashup/module-stripe/releases/latest)
=====

A connect interface for stripe on [dashup](https://dashup.io).

## Contents
* [Get Started](#get-started)
* [Connect interface](#connect)

## Get Started

This stripe connector adds stripes functionality to Dashup stripes:

```json
{
  "url" : "https://dashup.io", 
  "key" : "[dashup module key here]"
}
```

To start the connection to dashup:

`npm run start`

## Deployment

1. `docker build -t dashup/module-stripe .`
2. `docker run -d -v /path/to/.dashup.json:/usr/src/module/.dashup.json dashup/module-stripe`