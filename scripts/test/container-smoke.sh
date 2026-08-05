#!/usr/bin/env bash
set -euo pipefail

image_name="fmcf-foundation:ci"
container_name="fmcf-foundation-ci"

cleanup() {
  docker stop --timeout 10 "${container_name}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker build --tag "${image_name}" .
docker run --rm --name "${container_name}" --publish 127.0.0.1:4320:3000 \
  --env APP_ENV=test --env BUILD_ID=container-ci --detach "${image_name}"

for attempt in {1..30}; do
  if curl --fail --silent http://127.0.0.1:4320/api/health/live >/dev/null; then
    break
  fi
  if [[ "${attempt}" == "30" ]]; then
    docker logs "${container_name}"
    exit 1
  fi
  sleep 1
done

curl --fail --silent http://127.0.0.1:4320/api/health/ready | grep --quiet '"ready"'
docker stop --timeout 10 "${container_name}"
trap - EXIT
