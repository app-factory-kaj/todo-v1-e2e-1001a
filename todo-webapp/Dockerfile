FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# The platform runs this pod under an arbitrary, non-root UID with a
# read-only root filesystem, so nothing under /etc or /var can be written at
# container start -- a prior fix that merely chmod'd these paths still failed
# for exactly that reason (permission bits don't matter against a read-only
# mount). These two files stay static and read-only in the image;
# 15-aep-api-proxy.sh resolves the sibling address and the cluster DNS
# resolver, then writes the actual running config fresh under /tmp -- the one
# path guaranteed writable under any UID and under a read-only root
# filesystem alike. CMD below points nginx at that generated config.
COPY nginx/nginx.conf /etc/nginx/aep/nginx.conf
COPY nginx/default.conf /etc/nginx/aep/default.conf.tmpl
COPY nginx/15-aep-api-proxy.sh /docker-entrypoint.d/15-aep-api-proxy.sh
RUN chmod +x /docker-entrypoint.d/15-aep-api-proxy.sh && \
    rm -f /etc/nginx/conf.d/default.conf
EXPOSE 9090
CMD ["nginx", "-c", "/tmp/nginx-runtime/nginx.conf", "-g", "daemon off;"]
