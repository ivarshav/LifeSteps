export function getKofiUrl(
  configuredUrl: string | undefined =
    process.env.NEXT_PUBLIC_KOFI_URL ?? "https://ko-fi.com/lifesteps",
): string | null {
  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "ko-fi.com" ||
      url.port !== "" ||
      url.username !== "" ||
      url.password !== "" ||
      !/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) ||
      url.hash !== ""
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}