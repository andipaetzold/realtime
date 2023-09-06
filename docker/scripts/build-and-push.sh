#!/bin/sh

docker buildx build -t andipaetzold/realtime:$1 --platform linux/amd64,linux/arm64/v8 --push .