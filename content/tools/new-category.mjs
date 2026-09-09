#!/usr/bin/env node
/**
 * Adds a life-domain category, or gives an existing one another block of nids.
 *
 *   node content/tools/new-category.mjs pets "בעלי חיים" "אימוץ, חיסונים, שבב וטיסות." \
 *        --emoji 🐾 --color "#B45309"
 *   node content/tools/new-category.mjs --extend career     # career's block is full
 *   node content/tools/new-category.mjs --next              # what would be allocated
 *
 * This exists so that adding a category is an ordinary operation rather than a code
 * change. Before it, a tenth category needed an edit to rules.mjs (the `interests` answer
 * codes were a hand-copied list of the nine ids) and landed on a nid block that collided
 * with the documented overflow range. Both are now data, allocated here.
 *
 * A category `id` and `nid` are PERMANENT once shipped, for the same reason a step nid is:
 * the V2 profile cookie stores category ids as `interests` codes, so renaming one silently
 * drops a returning visitor's saved interest. Additions are free; renames are not.
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CONTENT_DIR,
  DEFAULT_BLOCK_SIZE,
  NEW_BLOCK_SIZE,
  blocksOf,
  loadStore,
  nextCategoryNid,
  nextFreeBlock,
  rangeText,
  syncRegistry,
} from "./rules.mjs";

const store = loadStore();
const args = process.argv.slice(2);

const die = (message) => {
  console.error(message);
  process.exit(1);
};

const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const CATEGORIES_PATH = join(CONTENT_DIR, "categories.json");

const write = (categories) => {
  const ordered = [...categories].sort((a, b) => a.order - b.order);
  writeFileSync(
    CATEGORIES_PATH,
    JSON.stringify(ordered, null, 2) + "\n",
    "utf8",
  );
};

const finish = () => {
  const { added, conflicts, counts } = syncRegistry(loadStore());
  if (conflicts.length)
    die(
      `\n✖ ${conflicts.join("\n✖ ")}\n\nNothing was written to the registry.`,
    );
  console.log(
    `\nRegistry: ${counts.steps} step nids, ${counts.categories} category nids` +
      (added ? ` (${added} newly allocated)` : " (no change)"),
  );
};

// ── --next: what would be allocated, without allocating it ──────────
if (args[0] === "--next") {
  const block = nextFreeBlock(store);
  console.log(
    `nid ${nextCategoryNid(store)} · block ${block.start}–${block.start + block.size - 1} · order ${
      Math.max(...store.categories.map((c) => c.order)) + 1
    }`,
  );
  process.exit(0);
}

// ── --extend: another block for a category whose block is full ──────
if (args[0] === "--extend") {
  const categoryId = args[1];
  const category = store.categories.find((c) => c.id === categoryId);
  if (!category) {
    die(
      `Unknown category "${categoryId}". One of: ${store.categories.map((c) => c.id).join(", ")}`,
    );
  }

  const size = Number(flag("size", NEW_BLOCK_SIZE));
  if (!Number.isInteger(size) || size < 1)
    die(`--size must be a positive integer, received ${flag("size")}`);

  const block = nextFreeBlock(store, size);
  category.nidBlocks = [...blocksOf(category), block];
  write(store.categories);

  console.log(
    `  + content/categories.json → "${categoryId}" gains block ${block.start}–${block.start + block.size - 1}\n` +
      `    now spanning ${rangeText(blocksOf(category))}`,
  );
  console.log(
    `\nThe original block keeps its nids — nothing is renumbered and nothing is reclaimed.\n` +
      `Next step nid for this category: node content/tools/new-step.mjs --next ${categoryId}`,
  );
  finish();
  process.exit(0);
}

// ── create a category ───────────────────────────────────────────────
const flagAt = args.findIndex((a) => a.startsWith("--"));
const [id, title, description] = args.slice(
  0,
  flagAt === -1 ? undefined : flagAt,
);

if (!id || !title || !description) {
  die(
    'Usage: new-category.mjs <id> "<title>" "<description>" --emoji <e> --color "#RRGGBB" [--order N] [--block-size N]\n' +
      "       new-category.mjs --extend <categoryId> [--size N]\n" +
      "       new-category.mjs --next",
  );
}
if (!/^[a-z0-9-]+$/.test(id))
  die(
    `"${id}" must be latin kebab-case — it is a URL segment and a stored profile code.`,
  );
if (store.categories.some((c) => c.id === id))
  die(`"${id}" is already a category in content/categories.json.`);

const registeredNid = Object.entries(store.registry.categories ?? {}).find(
  ([, rid]) => rid === id,
);
if (registeredNid) {
  die(
    `"${id}" was already allocated nid ${registeredNid[0]} in content/.nid-registry.json and later removed.\n` +
      `Restore it with that same nid rather than allocating a new one — the id is what the profile cookie stores.`,
  );
}

const emoji = flag("emoji");
if (!emoji)
  die("--emoji is required — it is the category's card and breadcrumb glyph.");

const color = flag("color");
if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
  die(
    `--color must be a 6-digit hex colour, received ${JSON.stringify(color)}.\n` +
      `It is used as a top border and accent, never as a background behind body text (plan/docs/03 §4).`,
  );
}

const order = Number(
  flag("order", Math.max(...store.categories.map((c) => c.order)) + 1),
);
if (!Number.isInteger(order) || order <= 0)
  die(`--order must be a positive integer, received ${flag("order")}`);
if (store.categories.some((c) => c.order === order)) {
  die(
    `order ${order} is already used by "${store.categories.find((c) => c.order === order).id}".`,
  );
}

const blockSize = Number(flag("block-size", NEW_BLOCK_SIZE));
if (!Number.isInteger(blockSize) || blockSize < DEFAULT_BLOCK_SIZE) {
  die(
    `--block-size must be an integer of at least ${DEFAULT_BLOCK_SIZE}, received ${flag("block-size")}`,
  );
}

const nid = nextCategoryNid(store);
const block = nextFreeBlock(store, blockSize);

store.categories.push({
  id,
  nid,
  nidBlocks: [block],
  title,
  description,
  emoji,
  color,
  order,
});
write(store.categories);

console.log(
  `  + content/categories.json → ${id} (nid ${nid}, block ${block.start}–${block.start + block.size - 1}, order ${order})`,
);
finish();

console.log(
  `\nNothing in content/tools needed editing: "${id}" is now a valid \`interests\` code and a\n` +
    `valid \`categoryId\`, because both are read from categories.json.\n\n` +
    `Still to do by hand — these are editorial, not structural:\n` +
    `  1. Add its first step:  node content/tools/new-step.mjs --create ${id} <step-id> "<title>"\n` +
    `  2. Add the colour row to plan/docs/03-ui-ux-spec.md §4 and the category to plan/docs/06-step-catalog.md\n` +
    `  3. Run:  node content/tools/validate.mjs`,
);
