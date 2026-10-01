FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# The config is rendered at container start (nginx/run.sh) onto /dev/shm --
# its own tmpfs mount, writable independent of the root filesystem -- and
# loaded with `nginx -c`. Earlier fixes wrote a rendered config in place
# under /etc/nginx/conf.d, then under /tmp, then piped it into nginx's stdin;
# all three still redeployed ResourcesDegraded (the stdin pipe for an
# unrelated reason: nginx sizes its config read from fstat(), which reports 0
# for a pipe). The stock conf.d/default.conf is unused and removed.
COPY nginx/default.conf.template /etc/nginx/aep/default.conf.template
COPY nginx/run.sh /usr/local/bin/aep-run.sh
RUN chmod +x /usr/local/bin/aep-run.sh && rm -f /etc/nginx/conf.d/default.conf
EXPOSE 9090
CMD ["/usr/local/bin/aep-run.sh"]
