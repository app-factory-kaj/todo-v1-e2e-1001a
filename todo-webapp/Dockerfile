FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm i
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# The rendered config is piped straight into nginx's stdin at container start
# (nginx/run.sh) rather than written anywhere on disk: two prior fixes each
# rewrote a config file in place -- first at /etc/nginx/conf.d (chmod'd
# writable for any UID), then entirely under /tmp -- and the pod still
# redeployed ResourcesDegraded on both, which rules out write-permission and
# read-only-root-fs theories. This removes every runtime disk write from the
# equation at once, so the stock conf.d/default.conf is unused and removed.
COPY nginx/default.conf.template /etc/nginx/aep/default.conf.template
COPY nginx/run.sh /usr/local/bin/aep-run.sh
RUN chmod +x /usr/local/bin/aep-run.sh && rm -f /etc/nginx/conf.d/default.conf
EXPOSE 9090
CMD ["/usr/local/bin/aep-run.sh"]
