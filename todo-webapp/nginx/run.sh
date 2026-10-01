#!/bin/sh
# Copyright (c) 2026, WSO2 LLC. (https://www.wso2.com).
#
# WSO2 LLC. licenses this file to you under the Apache License,
# Version 2.0 (the "License"); you may not use this file except
# in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

# This is the container's CMD, run by the stock nginx:alpine entrypoint after
# its own /docker-entrypoint.d/*.sh scripts. Two earlier fixes rewrote a
# config file in place -- first at /etc/nginx/conf.d (chmod'd writable for
# any UID), then entirely under /tmp -- and the pod still redeployed
# ResourcesDegraded on both, so a third fix removed every runtime disk write
# by piping the rendered config straight into `nginx -c /dev/stdin`.
#
# That pipe is its own bug, independent of permissions: nginx sizes its
# config read off fstat(), which reports size 0 for a pipe, so it treats the
# config as empty and exits immediately at startup -- a container that never
# comes up, which is consistent with ResourcesDegraded never clearing.
#
# This renders into a real file on /dev/shm instead. /dev/shm is its own
# tmpfs mount, separate from the root filesystem, so it stays writable even
# when the root filesystem is read-only and /tmp is not -- and because it is
# a real file, nginx reads it the normal way.

set -e

DNS_RESOLVERS="$(awk '/^nameserver/ {print $2}' /etc/resolv.conf | tr '\n' ' ' | sed 's/ $//')"
if [ -z "$DNS_RESOLVERS" ]; then
    echo "aep-run: no nameservers in /etc/resolv.conf; /api will 502"
    DNS_RESOLVERS="127.0.0.11"
fi

# Primary sibling address: todo-api. OpenChoreo and the platform inject these
# two env vars on the pod.
#
# Two lanes exist and they are NOT interchangeable:
#
#   TODO_API_GATEWAY_URL  the API gateway. It validates the caller's bearer
#                         token and injects the X-User-* identity headers the
#                         backend authorizes on. Set by the platform for a
#                         sibling whose design declares `exposesAPI.auth`.
#                         Carries a context path prefix.
#   TODO_API_URL          the project Service, reached directly. Nothing
#                         validates a token and nothing injects identity.
#
# Always prefer the gateway when the platform offers it. Browser traffic is
# untrusted, and this proxy is the one hop that would otherwise carry it into
# the project's trusted lane with no authentication in between.
API_URL="${TODO_API_GATEWAY_URL:-}"
API_LANE="gateway (token validated, identity injected)"
if [ -z "$API_URL" ]; then
    API_URL="${TODO_API_URL:-}"
    API_LANE="direct Service (NO token validation)"
fi

# Split the injected address into host:port and the context path prefix.
API_BACKEND="$(echo "${API_URL}" | sed -e 's|^https\{0,1\}://||' -e 's|/.*$||')"
API_CONTEXT="$(echo "${API_URL}" | sed -e 's|^https\{0,1\}://[^/]*||' -e 's|/$||')"

if [ -z "$API_BACKEND" ]; then
    echo "aep-run: no sibling API address injected; /api will 502 until one is"
    API_BACKEND="127.0.0.1:9"
    API_CONTEXT=""
fi

echo "aep-run: /api -> ${API_BACKEND}${API_CONTEXT}  [${API_LANE}]"

export DNS_RESOLVERS API_BACKEND API_CONTEXT

CONF=/dev/shm/aep-nginx.conf
envsubst '$DNS_RESOLVERS $API_BACKEND $API_CONTEXT' < /etc/nginx/aep/default.conf.template > "$CONF"

# exec replaces this script with nginx, so nginx runs as PID 1 and receives
# container signals (TERM, QUIT) directly -- no backgrounding or signal
# forwarding needed now that the pipe is gone.
exec nginx -c "$CONF" -g 'daemon off;'
