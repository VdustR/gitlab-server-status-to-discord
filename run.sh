#!/bin/bash
PWD_BAK=$PWD
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
cd "${DIR}" && \
yarn start && \
cd "${PWD_BAK}"
