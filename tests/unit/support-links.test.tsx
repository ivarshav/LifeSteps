import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AboutPage from "@/app/about/page";
import { Footer } from "@/components/layout/Footer";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("Ko-fi support links", () => {
  it("hides support links until a valid creator profile is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_KOFI_URL", "");
    render(
      <>
        <AboutPage />
        <Footer />
      </>,
    );

    expect(
      screen.queryByRole("link", { name: /תמיכה בפרויקט/ }),
    ).toBeNull();
    expect(
      screen.queryByRole("link", { name: /לתמיכה בצעדי חיים/ }),
    ).toBeNull();
  });

  it("shows safe external support links on About and in the footer", () => {
    vi.stubEnv("NEXT_PUBLIC_KOFI_URL", "https://ko-fi.com/lifesteps");
    render(
      <>
        <AboutPage />
        <Footer />
      </>,
    );

    for (const name of [
      "לתמיכה בצעדי חיים ב-Ko-fi (נפתח בחלון חדש)",
      "להזמין לנו כוס קפה (נפתח בחלון חדש)",
    ]) {
      const link = screen.getByRole("link", { name });
      expect(link.getAttribute("href")).toBe("https://ko-fi.com/lifesteps");
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noreferrer");
    }
    expect(
      screen.getByRole("heading", {
        name: "אהבתם את צעדי חיים? מוזמנים להזמין לנו כוס קפה :)",
      }),
    ).toBeTruthy();
  });
});

describe("legal page disclosures", () => {
  it("describes browser storage, analytics, and the external payment flow", () => {
    render(<PrivacyPage />);

    expect(
      screen.getByRole("heading", { name: "מדיניות פרטיות" }),
    ).toBeTruthy();
    expect(screen.getByText(/localStorage/)).toBeTruthy();
    expect(screen.getByText(/Vercel Analytics/)).toBeTruthy();
    expect(screen.getByText(/Ko-fi או ספק התשלום/)).toBeTruthy();
    for (const name of [
      "מדיניות הפרטיות של Vercel (נפתח בחלון חדש)",
      "מדיניות הפרטיות של Ko-fi (נפתח בחלון חדש)",
    ]) {
      expect(screen.getByRole("link", { name }).getAttribute("target")).toBe(
        "_blank",
      );
    }
  });

  it("states that support is optional and does not change free access", () => {
    render(<TermsPage />);

    expect(screen.getByRole("heading", { name: "תנאי שימוש" })).toBeTruthy();
    expect(screen.getByText(/מרצון/)).toBeTruthy();
    expect(screen.getByText(/השימוש באתר נשאר חינם/)).toBeTruthy();
  });
});