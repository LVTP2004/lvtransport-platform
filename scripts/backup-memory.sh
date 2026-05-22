#!/usr/bin/env bash

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d-%H%M%S")

tar -czf \
~/lvtransport-backups/memory-$TIMESTAMP.tar.gz \
~/lvtransport-platform/.memory

echo "✅ memory backup created"
