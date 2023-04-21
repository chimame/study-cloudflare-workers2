#!/bin/sh

npm ci
npx prisma migrate deploy

exec "$@"
