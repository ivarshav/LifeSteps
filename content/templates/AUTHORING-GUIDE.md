# Content Authoring Guide

> For whoever writes the Hebrew content. You do not need to write code.
>
> Read this once, then work from `step.example.json` — it is the quality bar.

---

## 1. What you are writing

A **step** (צעד) is a life event. It contains **sections** (שלבים), each containing
**tasks** (משימות) the reader ticks off.

You are not writing an article. You are writing **the list someone works through while
standing in a post office**.

Every task should be something the reader can do, and then tick.

### 1.1 But the list is not the whole job — you are a mentor

> **Life Steps is not only a bureaucracy helper. It is a mentor for life.**
> (`plan/docs/00 §2.1` — owner decision, 2026-09-07.)

A step that only enumerates forms has failed, even when every form is right. The reader is
usually facing a **decision**, not just a queue: which מסגרת, which קרן, whether to split
the leave, when to move. Help them decide.

Five things a knowledgeable friend would say, that a form never does:

| | Where it goes |
|---|---|
| What to weigh up — the honest trade-offs | `details` on the task, or the section `description` |
| What people typically get wrong, and what it costs | `warning` |
| The entitlement nobody claims, the deadline nobody mentions | `important: true` + `details` |
| What order saves a second trip | the section ordering, and `details` |
| What to do when it is refused | a task of its own — the appeal is part of the process |

So `details` should say **why this matters and what a good outcome looks like**, not
restate the title in longer words. Compare:

- ❌ `"details": "יש להגיש את הטופס באתר."` — adds nothing.
- ✅ `"details": "זה השלב שקובע את גובה התשלום לשנה הבאה, ולכן שווה לבדוק אותו לפני שמגישים ולא אחרי. אם הנתונים לא מעודכנים, התיקון בדיעבד לוקח חודשים."`

**Two lines this does not cross**, and reframing the product does not soften either:

1. **A figure you have not verified does not appear.** See §5. Guidance is free; facts are earned.
2. **No regulated advice** — no legal opinion, no medical recommendation, and no "take this
   fund / this policy". Explain the mechanism and the trade-offs, then leave the choice to
   the reader. `plan/docs/00 §4` is binding on this.

## 2. Workflow

```powershell
# 1. Copy the template
Copy-Item content\templates\step.template.json content\steps\<your-step-id>.json

# 2. Look up your id and nid — they are PRE-ALLOCATED
#    plan\docs\06-step-catalog.md  §2

# 3. Author it

# 4. Validate — repeat until clean
npm run validate:content

# 5. Read the rendered page as a reader would
npm run build
npx serve out
```

**Step 5 is not optional.** A checklist can validate perfectly and still read as
incoherent. You will only notice on the page.

## 3. The `nid` rule — the one rule you must never break

Every step and task has a `nid`, a permanent number.

> **Never invent a `nid`. Never reuse one. Never renumber.**

Take yours from `plan/docs/06-step-catalog.md §2`, where every step already has one assigned.

**Why:** when a user shares a list, the link contains the `nid`s — not the names. If `nid 12`
means "buying a used car" today and later means "getting a passport", then every link
already sent to a real person silently starts showing different content. There is no error
message and no way to fix links already out there.

If you delete a step, its `nid` is retired forever. The validator enforces this.

## 4. Task titles — use the verbal noun (שם פעולה)

| ✅ Correct | ❌ Wrong |
|---|---|
| `בדיקת שעבודים ועיקולים ברשם המשכונות` | `שעבודים ועיקולים` |
| `הוצאת ביטוח חובה לפני הנסיעה הראשונה` | `ביטוח חובה` |
| `תשלום אגרת העברת הבעלות` | `אגרה` |
| `חתימה על הסכם מכר בכתב` | `הסכם מכר` |

The task name must contain **the action**, not just the topic.

Both forms of the verbal noun are correct — construct (`בדיקת שעבודים`) and absolute
(`בדיקה במכון מורשה`). Use whichever reads naturally.

**Why the verbal noun and not the imperative** (`בדוק`): the imperative carries grammatical
gender, forcing `בדוק/בדקי` on every single line. The verbal noun (`בדיקת`) is naturally
gender-neutral and reads better in a list.

If it is not something the reader can do and tick, it is **not a task**. Put it in
`details`.

## 5. Never state a figure you have not verified today

This is the rule that protects readers from real financial harm.

```jsonc
// ✅
"cost": { "min": 1500, "max": 4000, "currency": "ILS", "note": "לאימות — נכון ל-2026" }

// ❌
"cost": { "min": 1847, "max": 1847, "currency": "ILS" }
```

Applies to:

- **Fees and costs** → a range, with a `לאימות` note
- **Law and section numbers** → do not cite unless verified and sourced
- **Statutory deadlines** → do not state unless verified and sourced
- **Form numbers** → only ones you have confirmed (e.g. `טופס 161`, `טופס 101`)

A confidently wrong number on a page about `טופס 161` or `מס רכישה` costs a reader real
money. A range costs them nothing.

When in doubt: describe the *type* of cost, not the amount.
`"note": "האגרה מתעדכנת — ראו אתר משרד התחבורה"` is a perfectly good answer.

## 6. Sources and freshness

**Every step needs at least one source.** Prefer an official `.gov.il` page and mark it:

```jsonc
"sources": [
  { "label": "משרד התחבורה — העברת בעלות",
    "url": "https://www.gov.il/...",
    "official": true }
]
```

**`lastReviewed` is the date you actually checked the facts** — not the date you edited the
file. It is displayed publicly on the page so readers can judge staleness themselves.

The build **warns at 12 months** and **fails at 18**. This is deliberately aggressive:
Israeli fees, forms and procedures change often enough that an 18-month-old checklist is a
liability.

### 6.1 Trusted-provider attribution

`content/source-providers.json` is the content-owned registry for providers that may be
attributed in a source link. It distinguishes:

- `official-primary` — the original authority for a rule, entitlement, procedure, or
  public service. Prefer this for factual claims.
- `reviewed-supplementary` — a useful additional perspective, never a replacement for an
  official primary source when one exists.

Every provider record must have an HTTPS `sourceUrl`, a reader-facing `attributionNote`,
and a `reviewStatus`. Cite a provider from a step or task only after its record is both
`"approvalStatus": "approved"` and `"reviewStatus": "reviewed"`:

```jsonc
{ "label": "ממשלת ישראל — השירות המדויק",
  "url": "https://www.gov.il/...",
  "official": true,
  "providerId": "gov-il" }
```

**Do not copy, summarize automatically, or present a provider's material as LifeSteps'
advice.** `editorialReviewRequired` is always `true`: an editor must verify the source,
write original LifeSteps guidance, and approve the attribution before it is published.
Proposed providers — including `midrag` — must not be cited in a step until that review is
complete. See `SOURCE-ATTRIBUTION-GUIDE.md` for the full workflow.

## 7. Structure

| Element | Guideline |
|---|---|
| Sections per step | 3–6 |
| Tasks per section | 3–8 |
| Section order | **Chronological** — the order a person actually experiences it |
| `summary` | 40–160 characters. It is the Google description |

Good section arcs:

- `buy-used-car`: לפני החיפוש → בזמן החיפוש → לפני החתימה → ביצוע העסקה → אחרי הקנייה
- `start-new-job`: לפני היום הראשון → בשבוע הראשון → בחודש הראשון → אחרי שלושה חודשים

Consistently more than 8 tasks per section usually means the step should be split.

## 8. Field reference

### Step

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | Latin kebab-case. **This is the URL** |
| `nid` | ✅ | From `plan/docs/06-step-catalog.md §2`. Permanent |
| `categoryId` | ✅ | One of the 9 |
| `title` | ✅ | Hebrew |
| `shortTitle` | | For breadcrumbs and cards |
| `summary` | ✅ | 40–160 chars. Also the meta description |
| `emoji` | ✅ | One |
| `keywords` | ✅ | Hebrew search synonyms, incl. common misspellings |
| `estimatedDuration` | | `"שבועיים עד חודש"` |
| `estimatedCost` | | Range + `לאימות` note |
| `difficulty` | | 1 = simple, 2 = moderate, 3 = complex |
| `requiredDocuments` | | Rolled up for the sidebar card |
| `sections` | ✅ | Min 1 |
| `faq` | | 3–5 real questions |
| `relatedStepIds` | | See `plan/docs/06 §6` |
| `disclaimer` | | Overrides the sitewide default |
| `lastReviewed` | ✅ | `YYYY-MM-DD` |
| `sources` | ✅ | Min 1 |
| `status` | | `"published"` or `"coming-soon"` |

### Task

| Field | Required | Notes |
|---|---|---|
| `id` | ✅ | Latin kebab-case, unique within the step |
| `nid` | ✅ | Unique **within the step**. Permanent |
| `title` | ✅ | Verbal noun. See §4 |
| `details` | | Markdown. Blank line between paragraphs |
| `optional` | | Renders `רשות` |
| `important` | | Renders `חשוב` |
| `warning` | | Amber `⚠` callout. Use for genuine risk only |
| `timing` | | `"תוך 30 יום מהרכישה"` |
| `cost` | | Range + note |
| `documents` | | Rendered as chips |
| `links` | | Prefer official |
| `audience` | | See §10 |

**Delete every optional field you are not using.** An empty string is not the same as
absent, and empty fields render as empty UI.

## 9. `warning` — use it sparingly

`warning` renders as a prominent amber callout. Reserve it for things that cause **real
harm**:

- ✅ `נהיגה ללא ביטוח חובה היא עבירה פלילית וגוררת פסילת רישיון.`
- ✅ `אל תשלמו את מלוא הסכום לפני שהשעבוד הוסר בפועל.`
- ❌ `כדאי להשוות מחירים.` ← that is `details`

Two or three warnings per step is a lot. If everything is a warning, nothing is.

## 10. `audience` — personalization, used lightly

Marks a task `רלוונטי עבורך` for readers whose profile matches:

```jsonc
"audience": {
  "any": [{ "key": "housing", "op": "in", "value": ["renting", "owns"] }]
}
```

Keys: `lifeStage` · `maritalStatus` · `kids` · `housing` · `employment` · `interests`
Operators: `eq` · `in` · `notIn` · `has`

Values are the **latin codes** from the frozen table in
`plan/docs/04-roadmap-and-work-packages.md §4.1` — never the Hebrew labels.

> A typo in a code produces no error and no warning: the rule simply never matches and the
> task is silently never badged. Copy the codes; do not retype them from memory.

> **A task with an `audience` rule is still shown to everyone.** It is merely badged for
> those it matches. Personalization on this site only ever promotes and annotates; it never
> hides. Two or three per step is plenty.

## 11. Hebrew style

- Natural, modern Israeli Hebrew. Read it aloud — if it sounds translated, rewrite it.
- Correct terminology, used consistently: `טופס 161`, `אגרת רישוי`, `טסט`, `טאבו`,
  `מס רכישה`, `דמי לידה`, `ייפוי כוח מתמשך`, `רשם המשכונות`.
- Gendered forms: `שכיר/ה`, `נשוי/אה`, `רווק/ה`. Pick this style and never mix.
- Address the reader directly in `details` (`בדקו`, `שימו לב`), but keep task **titles** in
  the verbal-noun form.
- No exclamation marks. No emoji inside body text.
- Numbers as digits: `8%–12%`, `2,500 ₪`.

## 12. Sensitive steps

`divorce` · `death-of-relative` · `medical-committee` · `elder-care` are read by people
having the worst week of their year.

- No cheerful copy. No exclamation marks. No emoji beyond the category icon.
- Lead with the **time-critical** item, not with context.
- Be explicit about what can wait. Reducing perceived load is the actual service.
- Extra care with figures and deadlines. This is where a wrong number does the most damage.

## 13. Before you submit

- [ ] `npm run validate:content` — **zero errors**
- [ ] Warnings addressed or justified
- [ ] `nid` matches `plan/docs/06-step-catalog.md §2`
- [ ] Every task title is a verbal noun containing the action
- [ ] No unverified fee, law section or deadline
- [ ] Every figure is a range with `לאימות`, or is sourced
- [ ] ≥ 1 source, at least one `official: true`
- [ ] `lastReviewed` = the date you checked the facts
- [ ] Sections chronological, 3–8 tasks each
- [ ] `relatedStepIds` populated
- [ ] Unused optional fields **deleted**, not left empty
- [ ] You have **read the rendered page** end to end

## 14. When the validator complains

It tells you the file, the field path, what it expected, and what to do:

```
✖ content/steps/buy-apartment.json
    sections[2].tasks[4].links[0].url
    Expected an https:// URL, received "www.gov.il/..."
```

`sections[2].tasks[4]` means the **third** section, **fifth** task — the numbering starts
at 0.

If the schema genuinely cannot express something you need, **say so**. Do not smuggle
structure into a `details` string — it will render as literal text.
