const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const swc = require("next/dist/build/swc");

const address = "0x1111111111111111111111111111111111111111";
const first = { id: "11111111-1111-4111-8111-111111111111", address, name: "First artist", network: "Ethereum", is_drop: true };
const second = { ...first, id: "22222222-2222-4222-8222-222222222222", name: "Second artist" };

// Compile and exercise the real page handlers without a browser or backend.
async function page(file, data, state = [], query = { address }) {
  await swc.loadBindings();
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const { code } = swc.transformSync(source, {
    filename: file,
    jsc: { target: "es2020", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const requests = [];
  const routes = [];
  const browser = { location: { href: "" } };
  let stateIndex = 0;
  const jsx = (type, props) => ({ type, props });
  const api = Object.fromEntries(["post", "patch"].map((method) => [method, async (url, body) => {
    requests.push({ method, url, body: JSON.parse(JSON.stringify(body)) });
    return { data: { updated: 1 } };
  }]));
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: { useState: (initial) => [stateIndex < state.length ? state[stateIndex++] : (stateIndex++, initial), () => {}] },
    swr: (key) => typeof data === "function" ? data(key) : ({ data, mutate: () => {} }),
    "next/router": { useRouter: () => ({ query, push: (url) => routes.push(url) }) },
    "next/link": "Link",
    "@/components/admin-layout": "AdminLayout",
    "@/components/data-table": { DataTable: "DataTable", BulkActionBar: "BulkActionBar", MonoAddress: "MonoAddress", StatusPill: "StatusPill" },
    "@/lib/api": { __esModule: true, default: api, fetcher: () => {} },
  };
  const context = { exports: {}, require: (name) => {
    if (!(name in modules)) throw new Error(`Unexpected import: ${name}`);
    return modules[name];
  }, window: browser, URLSearchParams, confirm: () => true, alert: () => {} };
  vm.runInNewContext(code, context, { filename: file });
  return { tree: context.exports.default(), requests, routes, browser };
}

function nodes(tree, predicate, expand = false) {
  if (tree == null || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap((entry) => nodes(entry, predicate, expand));
  const found = predicate(tree) ? [tree] : [];
  const children = expand && typeof tree.type === "function" ? tree.type(tree.props) : tree.props?.children;
  return found.concat(nodes(children, predicate, expand));
}

for (const [file, key, route] of [
  ["pages/admin/collections/index.jsx", "collections", "collections"],
  ["pages/admin/drops/index.jsx", "drops", "drops"],
]) {
  test(`${route} list routes shared-address siblings by unique collection ID`, async () => {
    const view = await page(file, { [key]: [first, second] });
    const table = nodes(view.tree, (node) => node.type === "DataTable")[0];
    for (const row of [first, second]) {
      table.props.onRowClick(row);
      assert.equal(view.browser.location.href, `/admin/${route}/${row.id}`);
    }
    if (route === "collections") {
      assert.notEqual(table.props.selectionKey(first), table.props.selectionKey(second));
      assert.equal(table.props.selectionKey(first), first.id);
    }
  });
}

test("bulk flags send only selected collection IDs, never a shared address", async () => {
  const view = await page("pages/admin/collections/index.jsx", { collections: [first, second] }, [1, "", new Set([second.id])]);
  const bulk = nodes(view.tree, (node) => node.type === "BulkActionBar")[0];
  await bulk.props.actions[0].onClick();
  assert.deepEqual(view.requests, [{ method: "post", url: "/admin/collections/bulk-flags", body: { ids: [second.id], flag: "is_featured", value: true } }]);
});

test("collection detail writes and maintenance jobs retain the loaded collection ID", async () => {
  const view = await page("pages/admin/collections/[address].jsx", { collection: second });
  const flag = nodes(view.tree, (node) => node.props?.label === "Featured")[0];
  await flag.props.onChange(true);
  assert.equal(view.requests[0].url, `/admin/collections/${second.id}/flags`);
  const jobs = nodes(view.tree, (node) => node.props?.kind?.startsWith("collection."));
  assert.equal(jobs.length, 4);
  for (const job of jobs) {
    assert.equal(job.props.params.collectionId, second.id);
    await job.type(job.props).props.onClick();
  }
  assert.equal(view.requests.length, 5);
});

test("shared collection maintenance cannot be launched from the page", async () => {
  for (const shared of [{ is_shared_parent: true }, { partition_strategy: "creator" }]) {
    const view = await page("pages/admin/collections/[address].jsx", { collection: { ...second, ...shared } });
    const jobs = nodes(view.tree, (node) => node.props?.kind?.startsWith("collection."));
    assert.equal(jobs.length, 4);
    for (const job of jobs) {
      const button = job.type(job.props);
      assert.equal(button.props.disabled, true);
      await button.props.onClick();
    }
    assert.deepEqual(view.requests, []);
  }
});

test("drop publication uses the diagnosed UUID even on a legacy address link", async () => {
  const view = await page("pages/admin/drops/[address].jsx", { drop: second, surfaces: {}, findings: [] });
  const buttons = nodes(view.tree, (node) => node.type === "button" && node.props.onClick);
  assert.equal(buttons.length, 2);
  await buttons[0].props.onClick();
  await buttons[1].props.onClick();
  assert.deepEqual(view.requests.map(({ url, body }) => ({ url, body })), [
    { url: `/admin/drops/${second.id}/push-live`, body: { startNow: false } },
    { url: `/admin/drops/${second.id}/push-live`, body: { startNow: true } },
  ]);
});

test("takedown links and restore actions target each sibling's UUID", async () => {
  const view = await page("pages/admin/takedowns.jsx", { collections: [first, second], nfts: [] });
  const links = nodes(view.tree, (node) => node.type === "Link", true);
  assert.deepEqual(links.map((node) => node.props.href), [first, second].map((row) => `/admin/collections/${row.id}`));
  const restores = nodes(view.tree, (node) => node.type === "button" && node.props.children === "Restore", true);
  await restores[1].props.onClick();
  assert.deepEqual(view.requests, [{ method: "patch", url: `/admin/collections/${second.id}/flags`, body: { is_deactivated: false } }]);
});


test("retired recommendation APIs show errors rather than false empty results", async () => {
  const view = await page("pages/admin/recommendations.jsx", () => ({ error: { response: { status: 410 } } }));
  const alerts = nodes(view.tree, (node) => node.props?.role === "alert", true);
  assert.equal(alerts.length, 2);
  assert.ok(alerts.every((node) => node.props.children.includes("retired")));
  assert.equal(nodes(view.tree, (node) => node.type === "li" && node.props.children === "None", true).length, 0);
});

test("recommendation loading and transient errors remain distinct from an empty response", async () => {
  const view = await page("pages/admin/recommendations.jsx", (key) => key === "/getting-recommendation-collection"
    ? { isLoading: true }
    : { error: { response: { status: 503 } } });
  assert.equal(nodes(view.tree, (node) => node.props?.role === "status", true).length, 1);
  const alerts = nodes(view.tree, (node) => node.props?.role === "alert", true);
  assert.equal(alerts.length, 1);
  assert.match(alerts[0].props.children, /could not be loaded/);
  assert.equal(nodes(view.tree, (node) => node.type === "li" && node.props.children === "None", true).length, 0);
});

test("successful empty recommendation responses still show the empty state", async () => {
  const view = await page("pages/admin/recommendations.jsx", () => ({ data: { collections: [] } }));
  assert.equal(nodes(view.tree, (node) => node.type === "li" && node.props.children === "None", true).length, 2);
  assert.equal(nodes(view.tree, (node) => node.props?.role === "alert", true).length, 0);
});
