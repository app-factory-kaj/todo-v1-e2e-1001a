import createClient from "openapi-fetch";
import type { paths } from "./generated/todo-api";

// Same-origin: nginx proxies /api/* to the todo-api sibling (see
// nginx/default.conf + nginx/15-aep-api-proxy.sh). Never the public gateway
// URL, never a window._env_ key.
export const todoApi = createClient<paths>({ baseUrl: "/api" });
