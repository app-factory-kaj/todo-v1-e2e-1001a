// This app has no sign-in and no browser-visible dependency address: todo-api
// is reached same-origin at /api (nginx proxies it from pod env). There is
// nothing this app needs out of window._env_ today, but the platform still
// mounts /env-config.js, and we still verify it loaded.
type Env = Record<string, never>;

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;
