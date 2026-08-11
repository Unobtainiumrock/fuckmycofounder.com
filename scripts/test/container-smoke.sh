#!/usr/bin/env bash
set -euo pipefail

image_name="fmcf-foundation:ci"
container_name="fmcf-foundation-ci"

cleanup() {
  docker rm --force "${container_name}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

wait_for_liveness() {
  for attempt in {1..30}; do
    if curl --fail --silent http://127.0.0.1:4320/api/health/live >/dev/null; then
      return
    fi
    if [[ "${attempt}" == "30" ]]; then
      docker logs "${container_name}"
      return 1
    fi
    sleep 1
  done
}

stop_gracefully() {
  docker stop --timeout 10 "${container_name}" >/dev/null
  exit_code="$(docker inspect --format '{{.State.ExitCode}}' "${container_name}")"
  if [[ "${exit_code}" != "0" && "${exit_code}" != "143" ]]; then
    docker logs "${container_name}"
    return 1
  fi
  docker rm "${container_name}" >/dev/null
}

docker build --build-arg BUILD_ID=container-ci --tag "${image_name}" .
docker run --name "${container_name}" --publish 127.0.0.1:4320:3000 \
  --env APP_ENV=test --env BUILD_ID=runtime-override \
  --detach "${image_name}" >/dev/null
wait_for_liveness
curl --fail --silent http://127.0.0.1:4320/api/health/ready | grep --quiet '"ready"'
curl --fail --silent --include http://127.0.0.1:4320/api/health/live | \
  tr -d '\r' | grep --ignore-case --quiet '^x-build-id: container-ci$'
stop_gracefully

docker run --name "${container_name}" --publish 127.0.0.1:4320:3000 \
  --env APP_ENV=test \
  --env DATABASE_URL=postgres://unavailable_test:unavailable@127.0.0.1:1/unavailable_test \
  --env REQUIRE_DATABASE=true --detach "${image_name}" >/dev/null
wait_for_liveness
ready_status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  http://127.0.0.1:4320/api/health/ready)"
[[ "${ready_status}" == "503" ]]
stop_gracefully

trap - EXIT
