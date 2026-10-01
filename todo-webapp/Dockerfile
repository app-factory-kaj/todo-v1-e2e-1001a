FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/15-aep-api-proxy.sh /docker-entrypoint.d/15-aep-api-proxy.sh
# The entrypoint script rewrites default.conf in place at container start (it
# substitutes the resolved sibling address into it). A plain COPY leaves that
# file root-owned with no group write, so the rewrite silently fails whenever
# the platform runs this pod as a non-root UID — the drop-in script exits
# non-zero, and the stock nginx entrypoint (itself `set -e`) aborts before
# nginx ever starts. There is no way to know in advance which UID/GID the
# platform will run the pod as, so these are opened to any caller rather than
# a specific group — they are internal-only paths inside this single-purpose
# container, and this keeps working when run as root too.
RUN chmod +x /docker-entrypoint.d/15-aep-api-proxy.sh && \
    chmod -R a+rwX /etc/nginx/conf.d /var/cache/nginx /var/run
EXPOSE 9090
CMD ["nginx", "-g", "daemon off;"]
