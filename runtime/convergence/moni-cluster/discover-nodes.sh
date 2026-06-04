#!/usr/bin/env bash

mkdir -p reports

tailscale status > reports/tailscale-status.txt

echo "Discovery completed"
