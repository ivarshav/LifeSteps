import LZString from "lz-string";
import { z } from "zod";

const ShareSelectionSchema = z
  .object({
    v: z.literal(1),
    t: z.string().max(60).optional(),
    m: z.string().max(200).optional(),
    s: z
      .array(
        z.tuple([
          z.number().int().positive(),
          z.array(z.number().int().positive()).max(200),
        ]),
      )
      .min(1)
      .max(100),
  })
  .strict()
  .superRefine(({ s }, context) => {
    const stepNids = new Set<number>();
    s.forEach(([stepNid], index) => {
      if (stepNids.has(stepNid)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Step ids must be unique",
          path: ["s", index, 0],
        });
      }
      stepNids.add(stepNid);
    });
  });

export type ShareSelection = z.infer<typeof ShareSelectionSchema>;

export function encodeShare(selection: ShareSelection): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(selection));
}

export function decodeShare(hash: string): ShareSelection | null {
  try {
    const encoded = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!encoded) return null;
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = ShareSelectionSchema.safeParse(JSON.parse(json));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function estimateLength(selection: ShareSelection, origin: string): number {
  return `${origin.replace(/\/$/, "")}/s#${encodeShare(selection)}`.length;
}
