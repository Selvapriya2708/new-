#!/bin/bash
cd frontend
# Disable Angular analytics using environment variable
export NG_CLI_ANALYTICS=false
npx ng serve --host 0.0.0.0 --port 5000 --disable-host-check