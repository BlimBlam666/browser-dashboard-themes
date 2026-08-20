import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = path.resolve("extension");
const manifest = JSON.parse(await readFile(path.join(root, "manifest.json"), "utf8"));
const failures = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

requireCondition(manifest.manifest_version === 3, "manifest_version must be 3");
requireCondition(Boolean(manifest.chrome_url_overrides?.newtab), "a New Tab override is required");
requireCondition(Boolean(manifest.side_panel?.default_path), "a default side panel is required");
requireCondition(!manifest.host_permissions, "host_permissions must remain absent");
requireCondition(!manifest.permissions.includes("tabs"), "the broad tabs permission must remain absent");
requireCondition(!manifest.permissions.includes("history"), "history permission must remain absent");
requireCondition(manifest.optional_permissions.includes("bookmarks"), "bookmarks should be optional");
requireCondition(manifest.optional_permissions.includes("topSites"), "topSites should be optional");

const referenced = [
  manifest.chrome_url_overrides.newtab,
  manifest.side_panel.default_path,
  manifest.background.service_worker,
  manifest.options_page,
  ...Object.values(manifest.icons),
  ...Object.values(manifest.action.default_icon)
];

for (const relative of referenced) {
  try {
    requireCondition((await stat(path.join(root, relative))).isFile(), `${relative} is not a file`);
  } catch {
    failures.push(`missing referenced file: ${relative}`);
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

const runtimeFiles = await walk(root);
for (const file of runtimeFiles.filter((item) => /\.(html|js)$/i.test(item))) {
  const content = await readFile(file, "utf8");
  requireCondition(!/<script(?![^>]*\bsrc=)[^>]*>/i.test(content), `${path.relative(root, file)} contains inline script`);
  requireCondition(!/https?:\/\/[^\s"']+\.js\b/i.test(content), `${path.relative(root, file)} references remote JavaScript`);
  requireCondition(!/\beval\s*\(/.test(content), `${path.relative(root, file)} uses eval`);
  requireCondition(!/document\.write\s*\(/.test(content), `${path.relative(root, file)} uses document.write`);
}

for (const file of runtimeFiles.filter((item) => /\.html$/i.test(item))) {
  const content = await readFile(file, "utf8");
  const relativePage = path.relative(root, file);
  const ids = [...content.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  requireCondition(new Set(ids).size === ids.length, `${relativePage} contains duplicate element IDs`);
  requireCondition(!/\son[a-z]+\s*=/i.test(content), `${relativePage} contains an inline event handler`);

  const labels = [...content.matchAll(/<label[^>]+for="([^"]+)"/g)].map((match) => match[1]);
  for (const target of labels) requireCondition(ids.includes(target), `${relativePage} labels missing ID: ${target}`);

  const localAssets = [...content.matchAll(/(?:href|src)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((value) => !value.startsWith("#") && !/^[a-z]+:/i.test(value));
  for (const asset of localAssets) {
    try {
      requireCondition((await stat(path.resolve(path.dirname(file), asset))).isFile(), `${relativePage} reference is not a file: ${asset}`);
    } catch {
      failures.push(`${relativePage} references missing asset: ${asset}`);
    }
  }
}

for (const file of runtimeFiles.filter((item) => /\.css$/i.test(item))) {
  const content = await readFile(file, "utf8");
  requireCondition(!/@import\b/i.test(content), `${path.relative(root, file)} imports remote or additional CSS`);
  const openBraces = [...content].filter((character) => character === "{").length;
  const closeBraces = [...content].filter((character) => character === "}").length;
  requireCondition(openBraces === closeBraces, `${path.relative(root, file)} has unbalanced braces`);
}

if (failures.length) {
  console.error(`Extension validation failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log(`Extension validation passed (${runtimeFiles.length} runtime files checked).`);
