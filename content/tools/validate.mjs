#!/usr/bin/env node
/**
 * Validates the content store.
 *
 *   node content/tools/validate.mjs             # errors + warnings
 *   node content/tools/validate.mjs --strict    # warnings also fail — this is the CI gate
 *   node content/tools/validate.mjs --notices   # also print advisory notices
 *
 * Exit code 1 on any error. This is the gate WP-2's `npm run validate:content` wraps.
 */

import { loadStore, validateStore } from "./rules.mjs";

const strict = process.argv.includes("--strict");
const showNotices = process.argv.includes("--notices");
const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const store = loadStore();
const { errors, warnings, notices } = validateStore(store);

const byFile = (list) => {
  const map = new Map();
  for (const item of list) {
    if (!map.has(item.file)) map.set(item.file, []);
    map.get(item.file).push(item);
  }
  return map;
};

const report = (list, mark, colour) => {
  for (const [file, items] of byFile(list)) {
    console.log(`\n${colour(mark)} ${c.bold(file)}`);
    for (const item of items) {
      console.log(`    ${c.dim(item.path)}`);
      console.log(`    ${item.message}`);
    }
  }
};

if (errors.length) report(errors, "✖", c.red);
if (warnings.length) report(warnings, "▲", c.yellow);
if (showNotices && notices.length) report(notices, "·", c.blue);

const published = store.steps.filter(
  (s) => s.data.status !== "coming-soon",
).length;
const comingSoon = store.steps.length - published;
const tasks = store.steps.reduce(
  (n, s) =>
    n +
    (s.data.sections ?? []).reduce((m, sec) => m + (sec.tasks ?? []).length, 0),
  0,
);

console.log(
  `\n${c.dim("─".repeat(60))}\n` +
    `${store.catalog.steps.length} steps in the catalog · ${store.steps.length} authored ` +
    `(${published} published, ${comingSoon} coming-soon) · ${tasks} tasks\n` +
    `${errors.length ? c.red(`${errors.length} errors`) : c.green("0 errors")} · ` +
    `${warnings.length ? c.yellow(`${warnings.length} warnings`) : c.green("0 warnings")}` +
    (notices.length
      ? ` · ${c.dim(`${notices.length} notices${showNotices ? "" : " (--notices to show)"}`)}`
      : ""),
);

if (errors.length || (strict && warnings.length)) process.exit(1);
