FROM node:22

WORKDIR /app

ENV CI=true
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

RUN npm install -g pnpm@9.15.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps ./apps
COPY packages ./packages
COPY tools ./tools
COPY scripts ./scripts
COPY moni-core ./moni-core

RUN pnpm install --frozen-lockfile

EXPOSE 5173

CMD ["pnpm", "dev:web", "--host", "0.0.0.0"]
