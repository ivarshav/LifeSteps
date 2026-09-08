#!/usr/bin/env node
/**
 * Scaffolds a step from the catalog, and keeps the nid registry in sync.
 *
 *   node content/tools/new-step.mjs --create vehicle lease-car "ליסינג פרטי" --tier 2
 *   node content/tools/new-step.mjs <step-id>   # scaffold an existing catalog entry
 *   node content/tools/new-step.mjs --all       # scaffold every entry with no file yet
 *   node content/tools/new-step.mjs --next <categoryId>   # print the next free nid
 *
 * `--create` is the whole add-a-step workflow: it allocates the nid from the category's
 * declared block, writes the catalog row, scaffolds the step file and the research
 * dossier, and claims the nid in the registry. No file is edited by hand.
 *
 * The registry is APPEND-ONLY. Deleting a step does not free its nid: share links in the
 * wild encode nids, so reuse silently repoints a real person's link (plan/docs/02 §3).
 */

import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  CONTENT_DIR,
  STEPS_DIR,
  RESEARCH_DIR,
  loadStore,
  nextStepNid,
  syncRegistry,
} from "./rules.mjs";

const store = loadStore();
const args = process.argv.slice(2);
const today = new Date().toISOString().slice(0, 10);

const die = (message) => {
  console.error(message);
  process.exit(1);
};

// ── --next: print the next free nid in a category block ─────────────
if (args[0] === "--next") {
  try {
    console.log(String(nextStepNid(store, args[1])));
  } catch (error) {
    die(error.message);
  }
  process.exit(0);
}

const stubFor = (entry, category) => ({
  id: entry.id,
  nid: entry.nid,
  categoryId: entry.categoryId,
  title: entry.title,
  summary: `TODO — 40 עד 160 תווים. משמש גם כתיאור לגוגל. ${entry.title}.`,
  emoji: category.emoji,
  keywords: [entry.title],
  sections: [],
  relatedStepIds: entry.relatedStepIds ?? [],
  lastReviewed: today,
  sources: [
    { label: "TODO — מקור רשמי", url: "https://www.gov.il/", official: true },
  ],
  status: "coming-soon",
});

const dossierFor = (entry) => `# מחקר · ${entry.title}

> Research dossier for \`${entry.id}\` (nid ${entry.nid}, tier ${entry.tier}).
> This file is the **evidence behind \`lastReviewed\`**. Every figure, deadline and form
> number in \`content/steps/${entry.id}.json\` must be traceable to a row below.
> See \`plan/docs/10-content-data-pipeline.md\`.

## Status

| | |
|---|---|
| Researched | ❌ not yet |
| Authored | ❌ not yet |
| Last verified | — |
| Verified by | — |

## Authorities

*Which body actually owns this process? Name it before collecting links.*

| Body | Role |
|---|---|
| | |

## Sources

*Only URLs that were actually opened. Record the date each was read.*

| # | Label | URL | Official | Read on |
|---|---|---|---|---|
| 1 | | | | |

## Verified facts

*Anything asserted in the step file. A fee, deadline or form number with no row here does
not go in the step file — quote a range with a \`לאימות\` note instead.*

| Fact | Value | Source # |
|---|---|---|
| | | |

## Deliberately NOT stated

*Figures and law sections that could not be verified, and are therefore expressed as
ranges or omitted. Recording these stops the next reviewer re-researching a dead end.*

- 

## Open questions

- 
`;

const scaffold = (entry) => {
  const category = store.categories.find((c) => c.id === entry.categoryId);
  const stepPath = join(STEPS_DIR, `${entry.id}.json`);
  const dossierPath = join(RESEARCH_DIR, `${entry.id}.md`);
  let wrote = false;

  if (!existsSync(stepPath)) {
    writeFileSync(
      stepPath,
      JSON.stringify(stubFor(entry, category), null, 2) + "\n",
      "utf8",
    );
    console.log(`  + content/steps/${entry.id}.json`);
    wrote = true;
  }
  if (!existsSync(dossierPath)) {
    writeFileSync(dossierPath, dossierFor(entry), "utf8");
    console.log(`  + content/research/${entry.id}.md`);
    wrote = true;
  }
  if (!wrote) console.log(`  = ${entry.id} already scaffolded`);
};

// ── --create: write the catalog row, then scaffold ──────────────────
// The catalog row was the last hand edit left in the add-a-step workflow, and it is the
// one that matters: it allocates the permanent nid. Doing it by hand meant remembering to
// run --next first, and nothing caught a nid typed into the wrong category's block.
let createdId = null;
if (args[0] === "--create") {
  const flagAt = args.findIndex((a, i) => i > 0 && a.startsWith("--"));
  const positional = args.slice(1, flagAt === -1 ? undefined : flagAt);
  const flag = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i === -1 ? fallback : args[i + 1];
  };

  const [categoryId, id, title] = positional;
  if (!categoryId || !id || !title) {
    die(
      'Usage: new-step.mjs --create <categoryId> <id> "<title>" [--tier 1|2|3] [--related a,b]\n' +
        `Categories: ${store.categories.map((c) => c.id).join(", ")}`,
    );
  }
  if (!/^[a-z0-9-]+$/.test(id))
    die(`"${id}" must be latin kebab-case — the id IS the URL slug.`);
  if (store.catalog.steps.some((s) => s.id === id)) {
    die(
      `"${id}" is already in content/catalog.json. Scaffold it with: node content/tools/new-step.mjs ${id}`,
    );
  }

  const tier = Number(flag("tier", 2));
  if (![1, 2, 3].includes(tier))
    die(`--tier must be 1, 2 or 3 (plan/docs/06 §3), received ${flag("tier")}`);

  const relatedStepIds = (flag("related", "") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const rel of relatedStepIds) {
    if (!store.catalog.steps.some((s) => s.id === rel))
      die(`--related "${rel}" is not a step in the catalog.`);
  }

  let nid;
  try {
    nid = nextStepNid(store, categoryId);
  } catch (error) {
    die(error.message);
  }

  const entry = { id, nid, categoryId, title, tier, relatedStepIds };
  const insertAt = store.catalog.steps.findIndex((s) => s.nid > nid);
  store.catalog.steps.splice(
    insertAt === -1 ? store.catalog.steps.length : insertAt,
    0,
    entry,
  );
  writeFileSync(
    join(CONTENT_DIR, "catalog.json"),
    JSON.stringify(store.catalog, null, 2) + "\n",
    "utf8",
  );
  console.log(
    `  + content/catalog.json → ${id} (nid ${nid}, ${categoryId}, tier ${tier})`,
  );

  args.push(id);
  createdId = id;
}

const targets = args.includes("--all")
  ? store.catalog.steps
  : store.catalog.steps.filter((s) =>
      createdId ? s.id === createdId : args.includes(s.id),
    );

if (targets.length === 0) {
  die(
    args.length
      ? `No catalog entry matched ${args.join(", ")}. Create it with:\n  node content/tools/new-step.mjs --create <categoryId> ${args[0]} "<title>"`
      : 'Usage: new-step.mjs --create <categoryId> <id> "<title>" | <step-id> | --all | --next <categoryId>',
  );
}

targets.forEach(scaffold);

// ── sync the append-only nid registry ───────────────────────────────
const { added, conflicts, counts } = syncRegistry(store);
if (conflicts.length) {
  die(`\n✖ ${conflicts.join("\n✖ ")}\n\nNothing was written to the registry.`);
}
console.log(
  `\nRegistry: ${counts.steps} step nids, ${counts.categories} category nids` +
    (added ? ` (${added} newly allocated)` : " (no change)"),
);
