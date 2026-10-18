const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const swc = require("next/dist/build/swc");

async function render(file, extra = {}) {
  await swc.loadBindings();
  const { code } = swc.transformSync(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    filename: file,
    jsc: { target: "es2020", parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  });
  const jsx = (type, props) => ({ type, props });
  const modules = {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "next/link": "Link",
    "next/router": { useRouter: () => ({ pathname: "/admin/marketing" }) },
    "@/components/admin-layout": "AdminLayout",
    ...extra,
  };
  const context = { exports: {}, require(name) {
    assert.ok(name in modules, `Retired tool must not import a request client: ${name}`);
    return modules[name];
  } };
  vm.runInNewContext(code, context, { filename: file });
  return context.exports.default({});
}

function nodes(tree, predicate) {
  if (tree == null || typeof tree !== "object") return [];
  if (Array.isArray(tree)) return tree.flatMap((node) => nodes(node, predicate));
  const children = typeof tree.type === "function" ? tree.type(tree.props) : tree.props?.children;
  return (predicate(tree) ? [tree] : []).concat(nodes(children, predicate));
}

test("retired marketing has a clear notice and no unusable editor or save request", async () => {
  const tree = await render("pages/admin/marketing.jsx");
  const notice = nodes(tree, (node) => node.props?.role === "status")[0];
  assert.match(notice.props.children, /retired/);
  assert.match(notice.props.children, /no longer load or save/);
  assert.equal(nodes(tree, (node) => ["form", "textarea", "input", "button"].includes(node.type)).length, 0);
  assert.deepEqual(nodes(tree, (node) => node.type === "Link").map((node) => node.props.href), ["/admin/billboard", "/admin/collections"]);
});

test("navigation labels the retained marketing link as retired", async () => {
  const tree = await render("components/sidebar.jsx");
  const link = nodes(tree, (node) => node.type === "Link" && node.props.href === "/admin/marketing")[0];
  assert.equal(link.props.children, "Marketing inputs (retired)");
});
