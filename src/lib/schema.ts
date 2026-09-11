import { z } from "zod";

const KebabCaseSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
  message: "Expected a lowercase Latin kebab-case identifier",
});

const NonEmptyStringSchema = z.string().trim().min(1);

const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Expected a YYYY-MM-DD date" })
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Expected a valid calendar date");

export const BlockSchema = z
  .object({
    start: z.number().int().positive(),
    size: z.number().int().positive(),
  })
  .strict();

export const CategorySchema = z
  .object({
    id: KebabCaseSchema,
    nid: z.number().int().positive(),
    nidBlocks: z.array(BlockSchema).min(1),
    title: NonEmptyStringSchema,
    description: NonEmptyStringSchema,
    emoji: NonEmptyStringSchema,
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
      message: "Expected a six-digit hexadecimal color",
    }),
    order: z.number().int().positive(),
  })
  .strict();

export const MoneySchema = z
  .object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    currency: z.literal("ILS"),
    note: NonEmptyStringSchema.optional(),
  })
  .strict()
  .refine(({ min, max }) => min <= max, {
    message: "Minimum cost cannot exceed maximum cost",
    path: ["min"],
  });

export const LinkSchema = z
  .object({
    label: NonEmptyStringSchema,
    url: z
      .string()
      .url()
      .refine((url) => url.startsWith("https://"), {
        message: "Expected an absolute https:// URL",
      }),
    official: z.boolean().optional(),
  })
  .strict();

export const ProfileKeySchema = z.enum([
  "lifeStage",
  "maritalStatus",
  "kids",
  "housing",
  "employment",
  "interests",
]);

export const ConditionSchema = z
  .object({
    key: ProfileKeySchema,
    op: z.enum(["eq", "in", "notIn", "has"]),
    value: z.union([
      NonEmptyStringSchema,
      z.array(NonEmptyStringSchema).min(1),
    ]),
  })
  .strict();

export const MatchSchema = z
  .object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional(),
    none: z.array(ConditionSchema).optional(),
  })
  .strict();

const RecommendationEligibilitySchema = z
  .object({
    kind: z.enum(["profile", "explicit-event"]),
  })
  .strict();

const RecommendationSequenceSchema = z
  .object({
    after: z.array(KebabCaseSchema).optional(),
    sequence: z
      .object({
        id: NonEmptyStringSchema,
        order: z.number().int().positive(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const TaskSchema = z
  .object({
    id: KebabCaseSchema,
    nid: z.number().int().positive(),
    title: NonEmptyStringSchema,
    details: NonEmptyStringSchema.optional(),
    optional: z.boolean().optional(),
    important: z.boolean().optional(),
    warning: NonEmptyStringSchema.optional(),
    timing: NonEmptyStringSchema.optional(),
    cost: MoneySchema.optional(),
    documents: z.array(NonEmptyStringSchema).optional(),
    links: z.array(LinkSchema).optional(),
    audience: MatchSchema.optional(),
  })
  .strict();

export const SectionSchema = z
  .object({
    id: KebabCaseSchema,
    nid: z.number().int().positive(),
    title: NonEmptyStringSchema,
    description: NonEmptyStringSchema.optional(),
    tasks: z.array(TaskSchema).min(1),
  })
  .strict();

export const StepSchema = z
  .object({
    id: KebabCaseSchema,
    nid: z.number().int().positive(),
    categoryId: KebabCaseSchema,
    title: NonEmptyStringSchema,
    shortTitle: NonEmptyStringSchema.optional(),
    summary: NonEmptyStringSchema,
    emoji: NonEmptyStringSchema,
    keywords: z.array(NonEmptyStringSchema),
    recommendationEligibility: RecommendationEligibilitySchema.default({
      kind: "profile",
    }),
    recommendationSequence: RecommendationSequenceSchema.optional(),
    estimatedDuration: NonEmptyStringSchema.optional(),
    estimatedCost: MoneySchema.optional(),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
    audience: MatchSchema.optional(),
    sections: z.array(SectionSchema),
    requiredDocuments: z.array(NonEmptyStringSchema).optional(),
    faq: z
      .array(
        z
          .object({
            q: NonEmptyStringSchema,
            a: NonEmptyStringSchema,
          })
          .strict(),
      )
      .optional(),
    relatedStepIds: z.array(KebabCaseSchema).optional(),
    disclaimer: NonEmptyStringSchema.optional(),
    lastReviewed: IsoDateSchema,
    sources: z.array(LinkSchema).min(1),
    status: z.enum(["published", "coming-soon"]).optional(),
  })
  .strict()
  .superRefine((step, context) => {
    if (step.status !== "coming-soon" && step.sections.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Published steps require at least one section",
        path: ["sections"],
      });
    }
  });

export const CatalogEntrySchema = z
  .object({
    id: KebabCaseSchema,
    nid: z.number().int().positive(),
    categoryId: KebabCaseSchema,
    title: NonEmptyStringSchema,
    tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    relatedStepIds: z.array(KebabCaseSchema).optional(),
  })
  .strict();

export const CatalogSchema = z
  .object({
    $comment: z.string().optional(),
    version: z.number().int().positive(),
    steps: z.array(CatalogEntrySchema),
  })
  .strict();

export type Block = z.infer<typeof BlockSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Money = z.infer<typeof MoneySchema>;
export type Link = z.infer<typeof LinkSchema>;
export type ProfileKey = z.infer<typeof ProfileKeySchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Match = z.infer<typeof MatchSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Step = z.infer<typeof StepSchema>;
export type CatalogEntry = z.infer<typeof CatalogEntrySchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
