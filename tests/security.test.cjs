const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const axios = require("axios");

const root = path.join(__dirname, "..");

function loadApi(window) {
  const source = fs.readFileSync(path.join(root, "lib/api.js"), "utf8")
    .replace('import axios from "axios";', "")
    .replace("export default api;", "globalThis.testApi = api;")
    .replace("export const fetcher", "const fetcher");
  const context = { axios, window };
  vm.runInNewContext(source, context);
  return context.testApi;
}

for (const [method, url] of [
  ["post", "/admin/logout"],
  ["post", "/admin/totp/setup"],
  ["post", "/admin/jobs/fixture-id/cancel"],
  ["delete", "/admin/offers/fixture-id"],
]) {
  test(`${method.toUpperCase()} ${url} sends the backend CSRF header without a body`, async () => {
    const api = loadApi();
    let request;
    api.defaults.adapter = async (config) => {
      request = config;
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    };
    await api[method](url);
    assert.equal(request.headers.get("X-Requested-With"), "XMLHttpRequest");
    assert.equal(request.withCredentials, true);
    assert.equal(request.data, undefined);
  });
}

const logoutModule = import(`data:text/javascript;base64,${Buffer.from(
  fs.readFileSync(path.join(root, "lib/logout.js"), "utf8")
).toString("base64")}`);

test("logout navigates only after the backend confirms success", async () => {
  const { signOutAdmin } = await logoutModule;
  const events = [];
  let confirm;
  const pending = signOutAdmin({ post: async (url) => {
    events.push(url);
    await new Promise((resolve) => { confirm = resolve; });
  } }, (url) => { events.push(url); });
  assert.deepEqual(events, ["/admin/logout"]);
  confirm();
  await pending;
  assert.deepEqual(events, ["/admin/logout", "/login"]);
});

test("a rejected logout never navigates away and propagates the failure", async () => {
  const { signOutAdmin } = await logoutModule;
  const failure = new Error("CSRF validation failed");
  let navigated = false;
  await assert.rejects(signOutAdmin({ post: async () => { throw failure; } },
    () => { navigated = true; }), (error) => error === failure);
  assert.equal(navigated, false);
});


test("logout 401 does not trigger the global login redirect", async () => {
  const browser = { location: { pathname: "/admin/dashboard", href: "/admin/dashboard" } };
  const api = loadApi(browser);
  const failure = new Error("Unauthorized");
  api.defaults.adapter = async (config) => {
    failure.config = config;
    failure.response = { status: 401 };
    throw failure;
  };
  await assert.rejects(api.post("/admin/logout"), (error) => error === failure);
  assert.equal(browser.location.href, "/admin/dashboard");
});

test("other expired authenticated requests still redirect to login", async () => {
  const browser = { location: { pathname: "/admin/dashboard", href: "/admin/dashboard" } };
  const api = loadApi(browser);
  api.defaults.adapter = async (config) => {
    const failure = new Error("Unauthorized");
    failure.config = config;
    failure.response = { status: 401 };
    throw failure;
  };
  await assert.rejects(api.get("/admin/me"));
  assert.equal(browser.location.href, "/login");
});
