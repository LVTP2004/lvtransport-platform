#!/bin/bash
cd /home/ubuntu/lvtransport-platform
pnpm --filter @lvtransport/web dev --host 0.0.0.0 --port 5173
