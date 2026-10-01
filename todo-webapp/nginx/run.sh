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
# its own /docker-entrypoint.d/*.sh scripts. Two prior fixes rewrote a config
# file in place -- first at /etc/nginx/conf.d (chmod'd writable for any UID),
# then entirely under /tmp -- and the pod still redeployed ResourcesDegraded
# on both, which rules out write-permission and read-only-root-fs theories:
# whatever is wrong survives both. So this build resolves the sibling address
# exactly as before, but never writes the rendered config anywhere on disk --
# it pipes straight into nginx's stdin instead.

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

# Background the whole pipe so `wait` tracks nginx (the last stage, $!) as a
# real foreground job: a signal sent to this script's own PID 1 is forwarded
# to nginx explicitly below, rather than relying on shell-specific pipeline
# exec optimizations that may or may not hand nginx PID 1 itself.
envsubst '$DNS_RESOLVERS $API_BACKEND $API_CONTEXT' < /etc/nginx/aep/default.conf.template \
    | nginx -c /dev/stdin -g 'daemon off;' &
NGINX_PID=$!
trap 'kill -TERM "$NGINX_PID" 2>/dev/null' TERM INT
wait "$NGINX_PID"
