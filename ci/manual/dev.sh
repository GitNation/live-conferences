#!/usr/bin/env bash

export $(grep -v '^#' .env.local | xargs -d '\n')
echo $NETLIFY_AUTH_TOKEN
echo $NETLIFY_SITE_ID
NODE_OPTIONS=--inspect netlify dev
