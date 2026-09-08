#!/usr/bin/env node
/**
 * Checks every source and task link in the content store still resolves.
 *
 *   node content/tools/link-check.mjs
 *   node content/tools/link-check.mjs --step buy-used-car
 *
 * This is what makes re-review cheap. Israeli government pages get reorganised often, and
 * a step whose "official source" 404s is worse than one with no source at all — it looks
 * authoritative and is not. Run it before bumping any `lastReviewed`.
 *
 * Exit code 1 if any link is dead. Network failures are reported separately from 4xx/5xx,
 * because a timeout is not evidence a page is gone.
 */

import { loadStore } from "./rules.mjs";

const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  blue: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

// Some Israeli government stacks reject unfamiliar agents outright. Identify as a normal
// browser; the goal is to observe what a reader would get, not to announce a crawler.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const only = process.argv.includes("--step")
  ? process.argv[process.argv.indexOf("--step") + 1]
  : null;
const store = loadStore();

const links = new Map(); // url -> [{ step, where, label }]
const add = (url, step, where, label) => {
  if (typeof url !== "string" || !url.startsWith("https://")) return;
  if (!links.has(url)) links.set(url, []);
  links.get(url).push({ step, where, label });
};

for (const { data } of store.steps) {
  if (only && data.id !== only) continue;
  (data.sources ?? []).forEach((l, i) =>
    add(l.url, data.id, `sources[${i}]`, l.label),
  );
  (data.sections ?? []).forEach((section, si) =>
    (section.tasks ?? []).forEach((task, ti) =>
      (task.links ?? []).forEach((l, li) =>
        add(
          l.url,
          data.id,
          `sections[${si}].tasks[${ti}].links[${li}]`,
          l.label,
        ),
      ),
    ),
  );
}

console.log(
  `Checking ${links.size} unique URLs across ${only ? 1 : store.steps.length} steps…\n`,
);

const check = async (url) => {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": UA },
      });
      return { status: res.status, server: res.headers.get("server") ?? "" };
    } finally {
      clearTimeout(timer);
    }
  };

  // A HEAD may be rejected at the network level, not just with a status — several
  // Israeli government stacks drop it outright. A throw here is NOT evidence the page is
  // gone, so it must fall through to GET rather than abort the check.
  let head = null;
  try {
    head = await attempt("HEAD");
    if (head.status < 400) return head;
  } catch {
    /* fall through to GET */
  }

  try {
    return await attempt("GET");
  } catch (error) {
    return { error: error.name === "AbortError" ? "timeout" : error.message };
  }
};

/**
 * gov.il and friends sit behind a Cloudflare bot challenge that answers automated
 * requests with 403 while serving the page perfectly to a real browser. Reporting those
 * as dead links is worse than not checking at all: gov.il is the single most important
 * source domain in this project, so a checker that cries wolf on it trains reviewers to
 * ignore the whole report. They get their own bucket and do not fail the run.
 */
const isChallenge = ({ status, server }) =>
  (status === 403 || status === 503) &&
  /cloudflare|akamai|rdwr|incapsula/i.test(server ?? "");

const entries = [...links.entries()];
const dead = [];
const unreachable = [];
const challenged = [];

const CONCURRENCY = 8;
let cursor = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < entries.length) {
      const [url, uses] = entries[cursor++];
      const result = await check(url);
      if (result.error) {
        unreachable.push({ url, uses, reason: result.error });
        process.stdout.write(c.yellow("?"));
      } else if (isChallenge(result)) {
        challenged.push({
          url,
          uses,
          status: result.status,
          server: result.server,
        });
        process.stdout.write(c.blue("~"));
      } else if (result.status >= 400) {
        dead.push({ url, uses, status: result.status });
        process.stdout.write(c.red("✖"));
      } else {
        process.stdout.write(c.green("."));
      }
    }
  }),
);

const show = (title, list, colour, detail) => {
  if (!list.length) return;
  console.log(`\n\n${colour(title)}`);
  for (const item of list) {
    console.log(`  ${item.url}  ${c.dim(detail(item))}`);
    for (const use of item.uses)
      console.log(
        `      ${c.dim(`${use.step} → ${use.where}`)}  ${use.label ?? ""}`,
      );
  }
};

show(
  "Dead links — fix or replace before the next review:",
  dead,
  c.red,
  (i) => `HTTP ${i.status}`,
);
show(
  "Unreachable — could not confirm, re-check by hand:",
  unreachable,
  c.yellow,
  (i) => i.reason,
);
show(
  "Bot-challenged — NOT dead. Open in a real browser to confirm during review:",
  challenged,
  c.blue,
  (i) => `HTTP ${i.status} via ${i.server}`,
);

console.log(
  `\n\n${c.dim("─".repeat(60))}\n` +
    `${links.size} URLs · ${c.green(`${links.size - dead.length - unreachable.length - challenged.length} ok`)} · ` +
    `${dead.length ? c.red(`${dead.length} dead`) : "0 dead"} · ` +
    `${unreachable.length ? c.yellow(`${unreachable.length} unreachable`) : "0 unreachable"} · ` +
    `${challenged.length ? c.blue(`${challenged.length} bot-challenged`) : "0 bot-challenged"}`,
);

if (dead.length) process.exit(1);
