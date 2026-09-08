export type ClassValue =
  string | false | null | undefined | Record<string, boolean>;

export function cn(...values: ClassValue[]): string {
  return values
    .flatMap((value) => {
      if (typeof value === "string") {
        return value;
      }

      if (value && typeof value === "object") {
        return Object.entries(value)
          .filter(([, enabled]) => enabled)
          .map(([className]) => className);
      }

      return [];
    })
    .join(" ");
}
