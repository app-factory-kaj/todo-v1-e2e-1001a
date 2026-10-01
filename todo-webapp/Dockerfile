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
RUN chmod +x /docker-entrypoint.d/15-aep-api-proxy.sh
EXPOSE 9090

# Five earlier fixes (writable conf.d, /tmp, reverting to this very asset,
# piping into nginx's stdin, rendering onto /dev/shm) each changed HOW the
# config reaches disk and every one of them still redeployed
# ResourcesDegraded -- including the plain, unmodified version of this asset.
# The one thing none of them touched is `worker_processes auto;`, which the
# base image's own nginx.conf sets: in a container capped to a small memory
# limit but scheduled on a node with many cores, `auto` forks one worker per
# HOST core and can OOM the process before it ever binds :9090 -- a crash
# indistinguishable from every other "container exits at startup" failure,
# and one that would persist unchanged across all five attempts above.
# Capped here, with no file to template and nothing to write at runtime.
CMD ["nginx", "-g", "daemon off; worker_processes 1;"]
