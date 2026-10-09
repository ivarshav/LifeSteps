const NIQQUD_PATTERN = /[\u0591-\u05c7]/g;
const FINAL_LETTERS: Readonly<Record<string, string>> = {
  ך: "כ",
  ם: "מ",
  ן: "נ",
  ף: "פ",
  ץ: "צ",
};
const PREFIX_PATTERN = /^([בכלמשהו])(.*)$/;

export function stripNiqqud(value: string): string {
  return value.replace(NIQQUD_PATTERN, "");
}

export function foldFinals(value: string): string {
  return value.replace(/[ךםןףץ]/g, (letter) => FINAL_LETTERS[letter] ?? letter);
}

export function stripPrefixes(value: string): string {
  return value
    .split(/\s+/)
    .map((token) => {
      const match = token.match(PREFIX_PATTERN);
      if (!match || token.length <= 3) {
        return token;
      }

      const [, , remainder] = match;
      return remainder.length >= 3 ? remainder : token;
    })
    .join(" ");
}

export function normalize(value: string): string {
  return foldFinals(stripNiqqud(value));
}
