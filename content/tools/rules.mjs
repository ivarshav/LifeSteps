/**
 * Shared content rules — the dependency-free implementation of the rules in
 * plan/docs/02-content-model.md §6 and plan/docs/04-roadmap-and-work-packages.md §4.1.
 *
 * This module is the single implementation of the content rules. It runs on plain Node
 * with no install step, so content can be authored and validated before any application
 * code exists. WP-2's `scripts/validate-content.ts` is expected to wrap this rather than
 * restate the rules — two copies of a rule set is two rule sets.
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
export const STEPS_DIR = join(CONTENT_DIR, "steps");
export const RESEARCH_DIR = join(CONTENT_DIR, "research");

/**
 * The frozen answer codes from plan/docs/04 §4.1.
 * A value outside this table produces no error at runtime — the rule simply never
 * matches and the task is silently never badged. That is why it is an ERROR here.
 *
 * `interests` is deliberately absent: it IS the category id list, so it is derived from
 * categories.json by `answerCodes()` below rather than copied here. A copy would mean
 * adding a category requires editing this file — the matcher would be closed to extension.
 */
export const FROZEN_ANSWER_CODES = {
  lifeStage: [
    "studies",
    "military",
    "early-career",
    "young-family",
    "midlife",
    "pre-retirement",
  ],
  maritalStatus: ["single", "partnered", "married", "divorced", "widowed"],
  kids: ["none", "expecting", "young", "teens", "adult"],
  housing: ["with-parents", "renting", "owns", "buying"],
  employment: [
    "employee",
    "self-employed",
    "business-owner",
    "student",
    "job-seeking",
    "retired",
  ],
};

/**
 * The full profile code table for a given store — the frozen five plus `interests`,
 * derived from the categories that actually exist.
 *
 * The corollary of deriving it: **a category `id` is permanent once shipped.** The V2
 * profile cookie stores these codes, so renaming `army-edu` later would silently drop a
 * returning visitor's saved interest — the same class of failure as reusing a nid, and
 * just as undetectable. Adding a category is free; renaming one is not.
 */
export const answerCodes = (store) => ({
  ...FROZEN_ANSWER_CODES,
  interests: store.categories.map((c) => c.id),
});

export const OPERATORS = ["eq", "in", "notIn", "has"];

// ── nid block allocation ────────────────────────────────────────────
// Blocks are DECLARED in categories.json (`nidBlocks`), never derived from the category
// nid. Deriving them as `nid * 10` meant the tenth category landed on 100–109 — exactly
// where the overflow policy sent full blocks — and nothing would have reported the clash.

/** Blocks omit `size` at their peril; this is what they get if they do. */
export const DEFAULT_BLOCK_SIZE = 10;
/** Where blocks for categories added after launch start. Clear of the original 10–99. */
export const NEW_BLOCK_BASE = 1000;
export const NEW_BLOCK_SIZE = 100;

export const blocksOf = (category) =>
  (category.nidBlocks ?? []).map((b) => ({
    start: b.start,
    size: b.size ?? DEFAULT_BLOCK_SIZE,
  }));

export const rangeText = (blocks) =>
  blocks.map(({ start, size }) => `${start}–${start + size - 1}`).join(", ");

/** Every step nid ever spoken for — the catalog AND the append-only registry. */
export const takenStepNids = (store) =>
  new Set([
    ...store.catalog.steps.map((s) => s.nid),
    ...Object.keys(store.registry.steps ?? {}).map(Number),
  ]);

/** The next free step nid inside a category's declared blocks. Throws with the remedy. */
export function nextStepNid(store, categoryId) {
  const category = store.categories.find((c) => c.id === categoryId);
  if (!category) {
    throw new Error(
      `Unknown category "${categoryId}". One of: ${store.categories.map((c) => c.id).join(", ")}`,
    );
  }
  const blocks = blocksOf(category);
  if (!blocks.length) {
    throw new Error(
      `Category "${categoryId}" declares no nidBlocks in content/categories.json.`,
    );
  }
  const taken = takenStepNids(store);
  for (const { start, size } of blocks) {
    for (let nid = start; nid < start + size; nid += 1)
      if (!taken.has(nid)) return nid;
  }
  throw new Error(
    `Every nid in the "${categoryId}" block${blocks.length > 1 ? "s" : ""} (${rangeText(blocks)}) is taken.\n` +
      `Give the category another block — nids are never reused, so nothing here can be reclaimed:\n` +
      `  node content/tools/new-category.mjs --extend ${categoryId}`,
  );
}

/** The next block that overlaps nothing already declared. */
export function nextFreeBlock(store, size = NEW_BLOCK_SIZE) {
  const used = store.categories.flatMap(blocksOf);
  const overlaps = (start) =>
    used.some((b) => start < b.start + b.size && b.start < start + size);
  let start = NEW_BLOCK_BASE;
  while (overlaps(start)) start += size;
  return { start, size };
}

/** The next free category nid, respecting the append-only registry. */
export function nextCategoryNid(store) {
  const taken = new Set([
    ...store.categories.map((c) => c.nid),
    ...Object.keys(store.registry.categories ?? {}).map(Number),
  ]);
  let nid = 1;
  while (taken.has(nid)) nid += 1;
  return nid;
}

/** First words that mean the author used an imperative instead of a verbal noun. */
const IMPERATIVE_FIRST_WORDS = new Set([
  "בדוק",
  "בדקו",
  "בדקי",
  "הוצא",
  "הוציאו",
  "שלם",
  "שלמו",
  "חתום",
  "חתמו",
  "מלא",
  "מלאו",
  "הגש",
  "הגישו",
  "קבל",
  "קבלו",
  "העבר",
  "העבירו",
  "בטל",
  "בטלו",
  "עדכן",
  "עדכנו",
  "פתח",
  "פתחו",
  "סגור",
  "סגרו",
  "רשום",
  "רשמו",
  "הזמן",
  "הזמינו",
  "בחר",
  "בחרו",
  "השווה",
  "השוו",
  "תאם",
  "תאמו",
  "חדש",
  "חדשו",
  "סמן",
  "סמנו",
  "הכן",
  "הכינו",
  "שמור",
  "שמרו",
  "צלם",
  "צלמו",
  "אמת",
  "אמתו",
  "ברר",
  "בררו",
  "עקוב",
  "עקבו",
  "וודא",
  "ודאו",
  "גש",
  "גשו",
  "קרא",
  "קראו",
]);

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export function loadStore() {
  const categories = readJson(join(CONTENT_DIR, "categories.json"));
  const catalog = readJson(join(CONTENT_DIR, "catalog.json"));
  const registry = existsSync(join(CONTENT_DIR, ".nid-registry.json"))
    ? readJson(join(CONTENT_DIR, ".nid-registry.json"))
    : { categories: {}, steps: {} };

  // A malformed step file must not crash the run with an anonymous JSON.parse stack.
  // It is reported as an ordinary validation error against the file that caused it —
  // the commonest cause is a literal newline inside a Hebrew string.
  const steps = [];
  const unreadable = [];
  for (const f of readdirSync(STEPS_DIR).filter((f) => f.endsWith(".json"))) {
    const file = `content/steps/${f}`;
    try {
      steps.push({ file, data: readJson(join(STEPS_DIR, f)) });
    } catch (error) {
      unreadable.push({ file, message: error.message });
    }
  }

  return { categories, catalog, registry, steps, unreadable };
}

const monthsSince = (iso) =>
  (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24 * 30.44);

/**
 * Claims every category and step nid in the store into the append-only registry.
 * Shared by new-step.mjs and new-category.mjs — one implementation, so the two tools
 * cannot disagree about what "already allocated" means.
 *
 * Returns { added, conflicts, counts }. A conflict is a nid the registry has already
 * given to a different id; nothing is written when there is one.
 */
export function syncRegistry(store) {
  const registryPath = join(CONTENT_DIR, ".nid-registry.json");
  const registry = existsSync(registryPath)
    ? readJson(registryPath)
    : { $comment: "", categories: {}, steps: {} };

  registry.$comment =
    "APPEND-ONLY. Every nid ever allocated, and to which id. A nid is never reused, never renumbered, and deleting a step does not free it — share links in the wild encode nids. See plan/docs/02-content-model.md §3.";
  registry.categories ??= {};
  registry.steps ??= {};

  const conflicts = [];
  let added = 0;
  const claim = (bucket, nid, id) => {
    const key = String(nid);
    if (registry[bucket][key] && registry[bucket][key] !== id) {
      conflicts.push(
        `nid ${nid} is registered to "${registry[bucket][key]}" and cannot be reassigned to "${id}"`,
      );
      return;
    }
    if (!registry[bucket][key]) {
      registry[bucket][key] = id;
      added += 1;
    }
  };

  for (const category of store.categories)
    claim("categories", category.nid, category.id);
  for (const step of store.catalog.steps) claim("steps", step.nid, step.id);

  const sortNumeric = (obj) =>
    Object.fromEntries(
      Object.entries(obj).sort(([a], [b]) => Number(a) - Number(b)),
    );
  registry.categories = sortNumeric(registry.categories);
  registry.steps = sortNumeric(registry.steps);

  if (!conflicts.length) {
    writeFileSync(
      registryPath,
      JSON.stringify(registry, null, 2) + "\n",
      "utf8",
    );
  }
  return {
    added,
    conflicts,
    counts: {
      categories: Object.keys(registry.categories).length,
      steps: Object.keys(registry.steps).length,
    },
  };
}

function checkLinks(links, where, err) {
  if (links === undefined) return;
  if (!Array.isArray(links)) return err(`${where} must be an array`);
  links.forEach((l, i) => {
    if (typeof l?.label !== "string" || !l.label.trim())
      err(`${where}[${i}].label is required`);
    if (typeof l?.url !== "string" || !/^https:\/\/.+/.test(l.url)) {
      err(
        `${where}[${i}].url must be an absolute https:// URL, received ${JSON.stringify(l?.url)}`,
      );
    }
  });
}

function checkMatch(rule, where, err, codes) {
  if (rule === undefined) return;
  if (typeof rule !== "object" || rule === null)
    return err(`${where} must be an object`);
  for (const group of ["all", "any", "none"]) {
    if (rule[group] === undefined) continue;
    if (!Array.isArray(rule[group])) {
      err(`${where}.${group} must be an array`);
      continue;
    }
    rule[group].forEach((cond, i) => {
      const at = `${where}.${group}[${i}]`;
      const allowed = codes[cond?.key];
      if (!allowed) {
        return err(
          `${at}.key ${JSON.stringify(cond?.key)} is not a profile key (${Object.keys(codes).join(", ")})`,
        );
      }
      if (!OPERATORS.includes(cond?.op)) {
        return err(
          `${at}.op ${JSON.stringify(cond?.op)} is not one of ${OPERATORS.join(", ")}`,
        );
      }
      const values = Array.isArray(cond.value) ? cond.value : [cond.value];
      for (const v of values) {
        if (!allowed.includes(v)) {
          err(
            `${at}.value ${JSON.stringify(v)} is not a valid code for "${cond.key}" (plan/docs/04 §4.1). Allowed: ${allowed.join(", ")}`,
          );
        }
      }
      if (cond.op === "has" && cond.key !== "interests") {
        err(
          `${at}.op "has" only applies to "interests" — "${cond.key}" holds a single value`,
        );
      }
      if (
        (cond.op === "in" || cond.op === "notIn") &&
        !Array.isArray(cond.value)
      ) {
        err(`${at}.value must be an array when op is "${cond.op}"`);
      }
    });
  }
}

function checkMoney(money, where, err, warn) {
  if (money === undefined) return;
  if (typeof money?.min !== "number" || typeof money?.max !== "number") {
    return err(`${where} needs numeric min and max`);
  }
  if (money.min > money.max)
    err(`${where}.min (${money.min}) is greater than max (${money.max})`);
  if (money.currency !== "ILS") err(`${where}.currency must be "ILS"`);
  if (money.min === money.max && money.min !== 0 && !money.note) {
    warn(
      `${where} states an exact figure with no note — quote a range, or add a "לאימות" note (AUTHORING-GUIDE §5)`,
    );
  }
}

/**
 * Validates the whole content store.
 * Returns { errors: [], warnings: [] } — each entry { file, path, message }.
 */
/**
 * Validates the whole content store.
 *
 * Three severities, deliberately:
 *   errors   — always fail. The store is wrong.
 *   warnings — fail under --strict. Genuine content defects worth gating a merge on.
 *   notices  — never fail, printed only with --notices. Advisory: things a maintainer
 *              should know when they next touch this area, but which no build should
 *              block on. Capacity and cross-link reciprocity live here because roughly a
 *              third of the existing links are deliberately one-way — as warnings they
 *              would turn --strict from a gate into something everyone passes with -f.
 *
 * Returns { errors, warnings, notices } — each entry { file, path, message }.
 */
export function validateStore(store) {
  const errors = [];
  const warnings = [];
  const notices = [];

  const codes = answerCodes(store);
  const categoryIds = new Set(store.categories.map((c) => c.id));
  const catalogById = new Map(store.catalog.steps.map((s) => [s.id, s]));
  const stepIds = new Set(store.steps.map((s) => s.data.id));
  const seenStepNids = new Map();

  // ── files that could not be parsed at all ─────────────────────────
  for (const { file, message } of store.unreadable ?? []) {
    errors.push({
      file,
      path: "",
      message: `is not valid JSON and was skipped — ${message}. The usual cause is a literal line break inside a string; use \\n or keep the string on one line`,
    });
  }

  // ── categories.json ───────────────────────────────────────────────
  // plan/docs/02 §3 requires category nids to be unique. Nothing enforced it: a duplicate
  // id collapsed silently into a Set and a duplicate nid was simply accepted.
  const CAT_FILE = "content/categories.json";
  const seenCatIds = new Map();
  const seenCatNids = new Map();
  const seenCatOrders = new Map();
  const declaredBlocks = [];

  if (!Array.isArray(store.categories) || store.categories.length === 0) {
    errors.push({
      file: CAT_FILE,
      path: "",
      message: "must be a non-empty array of categories",
    });
  } else {
    for (const [ci, category] of store.categories.entries()) {
      const at = `[${ci}] ${category?.id ?? "?"}`;
      const cerr = (path, message) =>
        errors.push({ file: CAT_FILE, path: `${at}.${path}`, message });
      const cwarn = (path, message) =>
        warnings.push({ file: CAT_FILE, path: `${at}.${path}`, message });

      if (
        typeof category.id !== "string" ||
        !/^[a-z0-9-]+$/.test(category.id)
      ) {
        cerr(
          "id",
          `must be latin kebab-case, received ${JSON.stringify(category.id)}`,
        );
      } else if (seenCatIds.has(category.id)) {
        cerr(
          "id",
          `duplicates the category at index ${seenCatIds.get(category.id)}`,
        );
      } else {
        seenCatIds.set(category.id, ci);
      }

      if (!Number.isInteger(category.nid) || category.nid <= 0) {
        cerr(
          "nid",
          `must be a positive integer, received ${JSON.stringify(category.nid)}`,
        );
      } else if (seenCatNids.has(category.nid)) {
        cerr(
          "nid",
          `nid ${category.nid} is already used by "${seenCatNids.get(category.nid)}" — category nids are unique (plan/docs/02 §3)`,
        );
      } else {
        seenCatNids.set(category.nid, category.id);
      }

      const registered = store.registry.categories?.[String(category.nid)];
      if (registered && registered !== category.id) {
        cerr(
          "nid",
          `nid ${category.nid} was allocated to "${registered}" in content/.nid-registry.json. A nid is NEVER reused (plan/docs/02 §3)`,
        );
      }
      const registeredId = Object.entries(store.registry.categories ?? {}).find(
        ([, id]) => id === category.id,
      );
      if (registeredId && Number(registeredId[0]) !== category.nid) {
        cerr(
          "nid",
          `"${category.id}" is registered as nid ${registeredId[0]} but this file says ${category.nid}. A shipped category id keeps its nid forever`,
        );
      }

      for (const field of ["title", "description", "emoji"]) {
        if (typeof category[field] !== "string" || !category[field].trim())
          cerr(field, "is required");
      }
      if (
        typeof category.color !== "string" ||
        !/^#[0-9A-Fa-f]{6}$/.test(category.color)
      ) {
        cerr(
          "color",
          `must be a 6-digit hex colour, received ${JSON.stringify(category.color)}`,
        );
      }
      if (!Number.isInteger(category.order) || category.order <= 0) {
        cerr("order", "must be a positive integer");
      } else if (seenCatOrders.has(category.order)) {
        cerr(
          "order",
          `order ${category.order} is already used by "${seenCatOrders.get(category.order)}" — the home page order would be arbitrary`,
        );
      } else {
        seenCatOrders.set(category.order, category.id);
      }

      // ── nid blocks ──────────────────────────────────────────────
      const blocks = Array.isArray(category.nidBlocks)
        ? category.nidBlocks
        : null;
      if (!blocks || blocks.length === 0) {
        cerr(
          "nidBlocks",
          "at least one { start, size } block is required — a category with no block cannot be given a step (run: node content/tools/new-category.mjs --extend " +
            category.id +
            ")",
        );
      } else {
        blocks.forEach((b, bi) => {
          const size = b?.size ?? DEFAULT_BLOCK_SIZE;
          if (!Number.isInteger(b?.start) || b.start < 10) {
            return cerr(
              `nidBlocks[${bi}].start`,
              `must be an integer of at least 10, received ${JSON.stringify(b?.start)}`,
            );
          }
          if (!Number.isInteger(size) || size < 1) {
            return cerr(
              `nidBlocks[${bi}].size`,
              `must be a positive integer, received ${JSON.stringify(b?.size)}`,
            );
          }
          const clash = declaredBlocks.find(
            (d) => b.start < d.start + d.size && d.start < b.start + size,
          );
          if (clash) {
            cerr(
              `nidBlocks[${bi}]`,
              `${b.start}–${b.start + size - 1} overlaps "${clash.categoryId}" (${clash.start}–${clash.start + clash.size - 1}). Overlapping blocks hand the same nid to two categories`,
            );
          }
          declaredBlocks.push({
            categoryId: category.id,
            start: b.start,
            size,
          });
        });

        const capacity = blocksOf(category).reduce((n, b) => n + b.size, 0);
        const used = store.catalog.steps.filter(
          (s) => s.categoryId === category.id,
        ).length;
        const remedy = `node content/tools/new-category.mjs --extend ${category.id}`;
        if (capacity && used >= capacity) {
          cwarn(
            "nidBlocks",
            `all ${capacity} nids used (${rangeText(blocksOf(category))}). No further step can be added to this category until it has another block: ${remedy}`,
          );
        } else if (capacity && used / capacity >= 0.8) {
          notices.push({
            file: CAT_FILE,
            path: `${at}.nidBlocks`,
            message: `${used} of ${capacity} nids used (${rangeText(blocksOf(category))}). Allocate another block before it fills: ${remedy}`,
          });
        }
      }
    }
  }

  // ── catalog.json ──────────────────────────────────────────────────
  const CATALOG_FILE = "content/catalog.json";
  const seenCatalogIds = new Map();
  const seenCatalogNids = new Map();
  for (const [ei, entry] of store.catalog.steps.entries()) {
    const at = `steps[${ei}] ${entry?.id ?? "?"}`;
    const kerr = (path, message) =>
      errors.push({ file: CATALOG_FILE, path: `${at}.${path}`, message });

    if (typeof entry.id !== "string" || !/^[a-z0-9-]+$/.test(entry.id)) {
      kerr(
        "id",
        `must be latin kebab-case, received ${JSON.stringify(entry.id)}`,
      );
    } else if (seenCatalogIds.has(entry.id)) {
      kerr(
        "id",
        `duplicates the entry at index ${seenCatalogIds.get(entry.id)}`,
      );
    } else {
      seenCatalogIds.set(entry.id, ei);
    }

    if (!Number.isInteger(entry.nid) || entry.nid <= 0) {
      kerr(
        "nid",
        `must be a positive integer, received ${JSON.stringify(entry.nid)}`,
      );
    } else if (seenCatalogNids.has(entry.nid)) {
      kerr(
        "nid",
        `nid ${entry.nid} is already allocated to "${seenCatalogNids.get(entry.nid)}"`,
      );
    } else {
      seenCatalogNids.set(entry.nid, entry.id);
    }

    const category = store.categories.find((c) => c.id === entry.categoryId);
    if (!category) {
      kerr(
        "categoryId",
        `"${entry.categoryId}" does not resolve to a category in content/categories.json`,
      );
    } else if (Number.isInteger(entry.nid)) {
      const blocks = blocksOf(category);
      const inBlock = blocks.some(
        (b) => entry.nid >= b.start && entry.nid < b.start + b.size,
      );
      if (blocks.length && !inBlock) {
        kerr(
          "nid",
          `${entry.nid} is outside the "${entry.categoryId}" block${blocks.length > 1 ? "s" : ""} (${rangeText(blocks)}). Allocate with: node content/tools/new-step.mjs --next ${entry.categoryId}`,
        );
      }
    }

    if (![1, 2, 3].includes(entry.tier)) {
      kerr(
        "tier",
        `must be 1, 2 or 3 (plan/docs/06 §3), received ${JSON.stringify(entry.tier)}`,
      );
    }
    if (typeof entry.title !== "string" || !entry.title.trim())
      kerr("title", "is required");
  }

  // ── catalog ↔ files ───────────────────────────────────────────────
  const unreadableIds = new Set(
    (store.unreadable ?? []).map(({ file }) =>
      file.replace(/^content\/steps\//, "").replace(/\.json$/, ""),
    ),
  );
  for (const entry of store.catalog.steps) {
    if (!stepIds.has(entry.id) && !unreadableIds.has(entry.id)) {
      errors.push({
        file: "content/catalog.json",
        path: entry.id,
        message: `catalog lists "${entry.id}" but content/steps/${entry.id}.json does not exist — run: node content/tools/new-step.mjs ${entry.id}`,
      });
    }
  }

  for (const { file, data } of store.steps) {
    const err = (path, message) => errors.push({ file, path, message });
    const warn = (path, message) => warnings.push({ file, path, message });
    const notice = (path, message) => notices.push({ file, path, message });
    const e = (path) => (message) => err(path, message);

    // ── identity ────────────────────────────────────────────────────
    if (typeof data.id !== "string" || !/^[a-z0-9-]+$/.test(data.id)) {
      err(
        "id",
        `must be latin kebab-case, received ${JSON.stringify(data.id)}`,
      );
    }
    if (!file.endsWith(`/${data.id}.json`)) {
      err("id", `does not match the filename — the id IS the URL slug`);
    }
    if (!Number.isInteger(data.nid) || data.nid <= 0) {
      err(
        "nid",
        `must be a positive integer, received ${JSON.stringify(data.nid)}`,
      );
    } else if (seenStepNids.has(data.nid)) {
      err(
        "nid",
        `nid ${data.nid} is already used by "${seenStepNids.get(data.nid)}" — nids are unique across all steps`,
      );
    } else {
      seenStepNids.set(data.nid, data.id);
    }

    const catalogEntry = catalogById.get(data.id);
    if (!catalogEntry) {
      err(
        "id",
        `is not listed in content/catalog.json — every step must be declared in the catalog`,
      );
    } else {
      if (catalogEntry.nid !== data.nid) {
        err(
          "nid",
          `is ${data.nid} but the catalog allocates ${catalogEntry.nid}. The catalog wins — nids are permanent (plan/docs/02 §3)`,
        );
      }
      if (catalogEntry.categoryId !== data.categoryId) {
        err(
          "categoryId",
          `is "${data.categoryId}" but the catalog says "${catalogEntry.categoryId}"`,
        );
      }
      const fileRelated = [...(data.relatedStepIds ?? [])].sort();
      const catalogRelated = [...(catalogEntry.relatedStepIds ?? [])].sort();
      if (JSON.stringify(fileRelated) !== JSON.stringify(catalogRelated)) {
        err(
          "relatedStepIds",
          `disagrees with the catalog. File: [${fileRelated.join(", ")}] · catalog: [${catalogRelated.join(", ")}]. The catalog owns the taxonomy — update content/catalog.json and mirror it here`,
        );
      }
    }

    // ── registry: a nid is never reused ─────────────────────────────
    const registered = store.registry.steps?.[String(data.nid)];
    if (registered && registered !== data.id) {
      err(
        "nid",
        `nid ${data.nid} was allocated to "${registered}" in content/.nid-registry.json. A nid is NEVER reused — every share link already sent would silently resolve to different content (plan/docs/02 §3)`,
      );
    }

    // ── required scalars ────────────────────────────────────────────
    for (const field of ["title", "summary", "emoji"]) {
      if (typeof data[field] !== "string" || !data[field].trim())
        err(field, "is required");
    }
    if (!categoryIds.has(data.categoryId)) {
      err(
        "categoryId",
        `"${data.categoryId}" does not resolve to a category in content/categories.json`,
      );
    }
    if (!Array.isArray(data.keywords) || data.keywords.length === 0) {
      warn(
        "keywords",
        "no search keywords — the step will only be found by its exact title",
      );
    }
    if (
      typeof data.summary === "string" &&
      (data.summary.length < 40 || data.summary.length > 160)
    ) {
      warn(
        "summary",
        `is ${data.summary.length} chars; 40–160 reads best as the Google description`,
      );
    }
    if (data.difficulty !== undefined && ![1, 2, 3].includes(data.difficulty)) {
      err("difficulty", "must be 1, 2 or 3");
    }

    // ── freshness ───────────────────────────────────────────────────
    if (
      typeof data.lastReviewed !== "string" ||
      Number.isNaN(new Date(data.lastReviewed).getTime())
    ) {
      err(
        "lastReviewed",
        `is required and must be a parseable YYYY-MM-DD date, received ${JSON.stringify(data.lastReviewed)}`,
      );
    } else {
      const age = monthsSince(data.lastReviewed);
      if (age > 18)
        err(
          "lastReviewed",
          `is ${age.toFixed(0)} months old. Israeli fees and procedures change — re-verify the facts and update the date (plan/docs/02 §7)`,
        );
      else if (age > 12)
        warn(
          "lastReviewed",
          `is ${age.toFixed(0)} months old — due for review at 18`,
        );
    }

    // ── sources ─────────────────────────────────────────────────────
    if (!Array.isArray(data.sources) || data.sources.length === 0) {
      err(
        "sources",
        "at least one source is required (plan/docs/02 §6 rule 5)",
      );
    } else {
      checkLinks(data.sources, "sources", e("sources"));
      if (!data.sources.some((s) => s.official)) {
        warn(
          "sources",
          "no source is marked official:true — prefer an official gov.il page",
        );
      }
    }

    // ── cross-links ─────────────────────────────────────────────────
    for (const [i, rel] of (data.relatedStepIds ?? []).entries()) {
      if (!catalogById.has(rel)) {
        err(
          `relatedStepIds[${i}]`,
          `"${rel}" does not resolve to any step in the catalog`,
        );
      }
      if (rel === data.id)
        err(`relatedStepIds[${i}]`, "a step cannot be related to itself");
    }

    if (
      data.estimatedCost !== undefined &&
      typeof data.estimatedCost !== "string"
    ) {
      checkMoney(data.estimatedCost, "estimatedCost", e("estimatedCost"), (m) =>
        warn("estimatedCost", m),
      );
    } else if (
      typeof data.estimatedCost === "string" &&
      !data.estimatedCost.trim()
    ) {
      err("estimatedCost", "must be a non-empty string when it is not a range");
    }
    checkMatch(data.audience, "audience", e("audience"), codes);

    // ── sections and tasks ──────────────────────────────────────────
    const comingSoon = data.status === "coming-soon";
    if (
      data.status !== undefined &&
      !["published", "coming-soon"].includes(data.status)
    ) {
      err("status", 'must be "published" or "coming-soon"');
    }
    const sections = data.sections ?? [];
    if (!Array.isArray(sections)) {
      err("sections", "must be an array");
    } else if (sections.length === 0 && !comingSoon) {
      err(
        "sections",
        'a published step needs at least one section (set "status": "coming-soon" for a placeholder)',
      );
    } else if (!comingSoon && (sections.length < 3 || sections.length > 6)) {
      warn(
        "sections",
        `${sections.length} sections; 3–6 reads best (AUTHORING-GUIDE §7)`,
      );
    }

    const sectionNids = new Map();
    for (const [si, section] of sections.entries()) {
      const sp = `sections[${si}]`;
      if (typeof section.id !== "string" || !/^[a-z0-9-]+$/.test(section.id))
        err(`${sp}.id`, "must be latin kebab-case");
      if (!Number.isInteger(section.nid) || section.nid <= 0)
        err(`${sp}.nid`, "must be a positive integer");
      else if (sectionNids.has(section.nid))
        err(`${sp}.nid`, `duplicates section nid ${section.nid}`);
      else sectionNids.set(section.nid, section.id);
      if (typeof section.title !== "string" || !section.title.trim())
        err(`${sp}.title`, "is required");

      const tasks = section.tasks ?? [];
      if (!Array.isArray(tasks) || tasks.length === 0) {
        err(`${sp}.tasks`, "a section needs at least one task");
        continue;
      }
      if (!comingSoon && (tasks.length < 3 || tasks.length > 8)) {
        warn(
          `${sp}.tasks`,
          `${tasks.length} tasks; 3–8 reads best. Consistently more usually means the step should be split`,
        );
      }

      for (const [ti, task] of tasks.entries()) {
        const tp = `${sp}.tasks[${ti}]`;
        if (typeof task.id !== "string" || !/^[a-z0-9-]+$/.test(task.id))
          err(`${tp}.id`, "must be latin kebab-case");
        if (!Number.isInteger(task.nid) || task.nid <= 0)
          err(`${tp}.nid`, "must be a positive integer");
        if (typeof task.title !== "string" || !task.title.trim()) {
          err(`${tp}.title`, "is required");
        } else {
          const first = task.title.trim().split(/\s+/)[0];
          if (IMPERATIVE_FIRST_WORDS.has(first)) {
            warn(
              `${tp}.title`,
              `starts with the imperative "${first}" — use the verbal noun (בדיקת… / הוצאת… / תשלום…), which is gender-neutral (AUTHORING-GUIDE §4)`,
            );
          } else if (!task.title.trim().includes(" ")) {
            warn(
              `${tp}.title`,
              `"${task.title}" is a topic, not an action — the title must contain the action`,
            );
          }
        }
        for (const [flag] of [["optional"], ["important"]]) {
          if (task[flag] !== undefined && typeof task[flag] !== "boolean")
            err(`${tp}.${flag}`, "must be a boolean");
        }
        if (
          task.warning !== undefined &&
          (typeof task.warning !== "string" || !task.warning.trim())
        ) {
          err(
            `${tp}.warning`,
            "must be a non-empty string — delete the field if unused (AUTHORING-GUIDE §8)",
          );
        }
        checkMoney(task.cost, `${tp}.cost`, e(`${tp}.cost`), (m) =>
          warn(`${tp}.cost`, m),
        );
        checkLinks(task.links, `${tp}.links`, e(`${tp}.links`));
        checkMatch(task.audience, `${tp}.audience`, e(`${tp}.audience`), codes);
      }

      // task nids are unique WITHIN the step, not within the section — share links
      // encode [stepNid, taskNids] with no section in between.
    }

    const taskNids = new Map();
    for (const section of sections) {
      for (const task of section.tasks ?? []) {
        if (!Number.isInteger(task.nid)) continue;
        if (taskNids.has(task.nid)) {
          err(
            "sections",
            `task nid ${task.nid} is used by both "${taskNids.get(task.nid)}" and "${task.id}". Task nids must be unique within the STEP — share links encode [stepNid, taskNids] with no section in between (plan/docs/07 §2)`,
          );
        } else {
          taskNids.set(task.nid, task.id);
        }
      }
    }

    for (const [i, item] of (data.faq ?? []).entries()) {
      if (!item?.q?.trim() || !item?.a?.trim())
        err(`faq[${i}]`, "needs both q and a");
    }

    // ── the research dossier that backs lastReviewed ────────────────
    if (!existsSync(join(RESEARCH_DIR, `${data.id}.md`))) {
      warn(
        "lastReviewed",
        `no research dossier at content/research/${data.id}.md — lastReviewed is unauditable without one (plan/docs/10 §4)`,
      );
    }

    // ── mentor depth ────────────────────────────────────────────────
    // "Life Steps is not only a bureaucracy helper. It is a mentor for life."
    // (plan/docs/00 §2.1.) A step can enumerate every correct form and still fail that bar.
    //
    // These are notices, not warnings: depth is a judgement no rule can settle. The
    // thresholds sit just under the floor the authored store actually holds today —
    // 100% of tasks carry details, every step has 4+ faq entries, 1+ warning and 4+
    // described sections. So none of these fire on current content by design: they are a
    // regression guard for the next step somebody writes in a hurry, not a rubber stamp.
    if (!comingSoon && Array.isArray(sections) && sections.length) {
      const allTasks = sections.flatMap((s) => s.tasks ?? []);
      const withDetails = allTasks.filter(
        (t) => typeof t.details === "string" && t.details.trim(),
      ).length;
      const withWarning = allTasks.filter(
        (t) => typeof t.warning === "string" && t.warning.trim(),
      ).length;
      const describedSections = sections.filter(
        (s) => typeof s.description === "string" && s.description.trim(),
      ).length;

      if (allTasks.length && withDetails / allTasks.length < 0.8) {
        notice(
          "sections",
          `only ${withDetails} of ${allTasks.length} tasks explain themselves in "details". A task the reader cannot act on without already knowing the answer is a form line, not guidance (plan/docs/00 §2.1)`,
        );
      }
      if (!Array.isArray(data.faq) || data.faq.length < 3) {
        notice(
          "faq",
          `${(data.faq ?? []).length} faq entries. The questions people actually ask out loud are where a checklist stops being a form list — every other published step carries at least four (plan/docs/00 §2.1)`,
        );
      }
      if (withWarning === 0) {
        notice(
          "sections",
          `no task carries a "warning". Almost every Israeli process has a trap that costs money or time when missed — if this one genuinely has none, ignore this (plan/docs/00 §2.1)`,
        );
      }
      if (describedSections < 2) {
        notice(
          "sections",
          `only ${describedSections} section(s) carry a "description" framing the stage the reader is at (plan/docs/00 §2.1)`,
        );
      }
    }
  }

  // ── cross-link reciprocity ────────────────────────────────────────
  // A one-way link is legal — "after an accident" points at the medical committee without
  // the reverse making sense. But a NEW step that links outward with nothing linking back
  // is reachable only from search, which is the usual way a step quietly goes unread.
  const related = new Map(
    store.catalog.steps.map((s) => [s.id, s.relatedStepIds ?? []]),
  );
  for (const { file, data } of store.steps) {
    for (const [i, rel] of (data.relatedStepIds ?? []).entries()) {
      if (related.has(rel) && !related.get(rel).includes(data.id)) {
        notices.push({
          file,
          path: `relatedStepIds[${i}]`,
          message: `"${rel}" does not link back. Add "${data.id}" to its relatedStepIds, or accept the one-way link deliberately`,
        });
      }
    }
  }

  // ── plan/docs/06 must agree with the catalog ──────────────────────
  errors.push(...catalogDocDrift(store));

  return { errors, warnings, notices };
}

/**
 * `plan/docs/06-step-catalog.md` restates the catalog in prose — tier reasoning, star
 * markers, the human argument for what ships first. Two hand-maintained lists of the same
 * fifty rows drift, and the doc is what a person reads before deciding what to author.
 *
 * Returns [] when `plan/` is absent. It is gitignored (.gitignore:23), so CI legitimately
 * checks out a tree without it, and a rule that errored there would fail every build.
 */
export function catalogDocDrift(store) {
  const DOC = join(CONTENT_DIR, "..", "plan", "docs", "06-step-catalog.md");
  if (!existsSync(DOC)) return [];

  const file = "plan/docs/06-step-catalog.md";
  const rows = new Map();
  for (const line of readFileSync(DOC, "utf8").split(/\r?\n/)) {
    const m = line.match(
      /^\|\s*(\d+)\s*\|\s*`([a-z0-9-]+)`\s*\|(.+?)\|\s*\**(\d)\**\s*\|\s*$/,
    );
    if (m) rows.set(m[2], { nid: Number(m[1]), tier: Number(m[4]) });
  }
  if (rows.size === 0) return [];

  const issues = [];
  for (const entry of store.catalog.steps) {
    const row = rows.get(entry.id);
    if (!row) {
      issues.push({
        file,
        path: entry.id,
        message: `is in content/catalog.json but has no row here. Add it under its category heading`,
      });
      continue;
    }
    if (row.nid !== entry.nid) {
      issues.push({
        file,
        path: entry.id,
        message: `is listed as nid ${row.nid} but the catalog allocates ${entry.nid}. The catalog wins`,
      });
    }
    if (row.tier !== entry.tier) {
      issues.push({
        file,
        path: entry.id,
        message: `is listed as tier ${row.tier} but the catalog says tier ${entry.tier}`,
      });
    }
  }
  for (const id of rows.keys()) {
    if (!store.catalog.steps.some((s) => s.id === id)) {
      issues.push({
        file,
        path: id,
        message: `has a row here but is not in content/catalog.json — the doc promises a page nothing will build`,
      });
    }
  }
  return issues;
}
