import { z } from "zod";

import categories from "../../content/categories.json";
import profileOptions from "../../profile-options.json";

import { ProfileKeySchema, type ProfileKey } from "./schema";

const ProfileOptionSchema = z
  .object({
    label: z.string().trim().min(1),
    value: z.string().trim().min(1),
  })
  .strict();

const ProfileFieldSchema = z
  .object({
    label: z.string().trim().min(1),
    options: z.array(ProfileOptionSchema).min(1),
  })
  .strict();

const ProfileDefinitionSchema = z
  .object({
    fields: z
      .object({
        lifeStage: ProfileFieldSchema,
        maritalStatus: ProfileFieldSchema,
        kids: ProfileFieldSchema,
        housing: ProfileFieldSchema,
        employment: ProfileFieldSchema,
      })
      .strict(),
    version: z.literal(1),
  })
  .strict();

export const profileDefinition = ProfileDefinitionSchema.parse(profileOptions);
export const PROFILE_STORAGE_KEY = "ls_profile_v1";
const categoryLabels = new Map(
  categories.map((category) => [category.id, category.title]),
);

export const profileFieldKeys = [
  "lifeStage",
  "maritalStatus",
  "kids",
  "housing",
  "employment",
] as const;
const retiredProfileValues = {
  maritalStatus: ["divorced", "widowed"],
  kids: ["expecting"],
  employment: ["job-seeking"],
} as const;
const retiredProfileValueSet = new Set<string>(
  Object.values(retiredProfileValues).flat(),
);
export const interestOptions = [...categoryLabels.entries()].map(
  ([value, label]) => ({ label, value }),
);

const singleValueSchema = z.string().trim().min(1);

export const LifeProfileSchema = z
  .object({
    lifeStage: singleValueSchema.optional(),
    maritalStatus: singleValueSchema.optional(),
    kids: singleValueSchema.optional(),
    housing: singleValueSchema.optional(),
    employment: singleValueSchema.optional(),
    interests: z.array(singleValueSchema).max(categoryLabels.size).optional(),
  })
  .strict()
  .superRefine((profile, context) => {
    for (const key of profileFieldKeys) {
      const value = profile[key];
      if (
        value !== undefined &&
        !profileDefinition.fields[key].options.some(
          (option) => option.value === value,
        )
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown value for ${key}`,
          path: [key],
        });
      }
    }

    if (profile.interests) {
      const interests = new Set<string>();
      for (const [index, value] of profile.interests.entries()) {
        if (!categoryLabels.has(value)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Interests must be known category identifiers",
            path: ["interests", index],
          });
        }
        if (interests.has(value)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Interests must not contain duplicate category identifiers",
            path: ["interests", index],
          });
        }
        interests.add(value);
      }
    }
  });

export type LifeProfile = z.infer<typeof LifeProfileSchema>;

const StoredLifeProfileSchema = z
  .object({
    lifeStage: singleValueSchema.optional(),
    maritalStatus: singleValueSchema.optional(),
    kids: singleValueSchema.optional(),
    housing: singleValueSchema.optional(),
    employment: singleValueSchema.optional(),
    interests: z.array(singleValueSchema).max(categoryLabels.size).optional(),
  })
  .strict();

function isStorageError(error: unknown): error is DOMException {
  return error instanceof DOMException;
}

function normalizeProfile(value: unknown): LifeProfile {
  const result = LifeProfileSchema.safeParse(value);
  return result.success ? result.data : {};
}

function migrateProfile(value: unknown): LifeProfile {
  const stored = StoredLifeProfileSchema.safeParse(value);
  if (!stored.success) return {};

  const migrated = { ...stored.data };
  for (const [key, values] of Object.entries(retiredProfileValues) as [
    keyof typeof retiredProfileValues,
    readonly string[],
  ][]) {
    if (values.includes(migrated[key] ?? "")) delete migrated[key];
  }
  return normalizeProfile(migrated);
}

function persistMigratedProfile(profile: LifeProfile): void {
  if (isProfileEmpty(profile)) {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
  } else {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export function readProfile(): LifeProfile {
  if (typeof window === "undefined") return {};

  let raw: string | null;
  try {
    raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    if (isStorageError(error)) return {};
    throw error;
  }
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    const current = LifeProfileSchema.safeParse(parsed);
    if (current.success) return current.data;

    const migrated = migrateProfile(parsed);
    if (
      Object.keys(migrated).length > 0 ||
      Object.values(parsed as object).some(
        (value) => typeof value === "string" && retiredProfileValueSet.has(value),
      )
    ) {
      try {
        persistMigratedProfile(migrated);
      } catch (error) {
        if (!isStorageError(error)) throw error;
      }
    }
    return migrated;
  } catch (error) {
    if (error instanceof SyntaxError) return {};
    throw error;
  }
}

export function saveProfile(profile: LifeProfile): boolean {
  const parsed = LifeProfileSchema.parse(profile);
  if (typeof window === "undefined") return false;

  try {
    if (isProfileEmpty(parsed)) {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(parsed));
    }
    return true;
  } catch (error) {
    if (isStorageError(error)) return false;
    throw error;
  }
}

export function clearProfile(): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    return true;
  } catch (error) {
    if (isStorageError(error)) return false;
    throw error;
  }
}

export function getProfileValueLabel(key: ProfileKey, value: string): string {
  if (key === "interests") return categoryLabels.get(value) ?? value;
  return (
    profileDefinition.fields[key].options.find(
      (option) => option.value === value,
    )?.label ?? value
  );
}

export function getProfileSummary(profile: LifeProfile): string[] {
  return profileFieldKeys
    .flatMap((key) => {
      const value = profile[key];
      return value
        ? [
            `${profileDefinition.fields[key].label}: ${getProfileValueLabel(key, value)}`,
          ]
        : [];
    })
    .concat(
      profile.interests?.map((value) =>
        getProfileValueLabel("interests", value),
      ) ?? [],
    );
}

export function isProfileEmpty(profile: LifeProfile): boolean {
  return Object.values(profile).every(
    (value) =>
      value === undefined || (Array.isArray(value) && value.length === 0),
  );
}

export function isProfileKey(value: string): value is ProfileKey {
  return ProfileKeySchema.safeParse(value).success;
}
