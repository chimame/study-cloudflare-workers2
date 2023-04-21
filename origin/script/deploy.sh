#!/bin/sh

CI_COMMIT_SHA=latest
DATABASE_URL=$DATABASE_URL_FOR_MIGRATE

# setting gcloud account
gcloud auth login
gcloud config set project $GCP_PROJECT_ID

# build container image
gcloud builds submit . --config=./cloudbuild.yml --substitutions=TAG_NAME=$CI_COMMIT_SHA

# execute database migrate
npx prisma migrate deploy

# deploy application
gcloud run deploy todo-nextjs \
  --image gcr.io/$GCP_PROJECT_ID/my-origin-test:$CI_COMMIT_SHA \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port '3000' \
  --set-env-vars DATABASE_URL=$DATABASE_URL_FOR_CONNECTION_POOLING
