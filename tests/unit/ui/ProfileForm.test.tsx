import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProfileForm } from "@/components/profile/ProfileForm";

describe("ProfileForm", () => {
  it("offers general preferences without retired sensitive-event values", () => {
    render(<ProfileForm initialProfile={{}} onSave={() => {}} />);

    const text = document.body.textContent ?? "";
    for (const value of [
      "גרוש/ה",
      "אלמן/ה",
      "בהיריון",
      "מחפש/ת עבודה",
      "גירושין",
      "פטירה",
      "ניתוח",
    ]) {
      expect(text).not.toContain(value);
    }
    expect(screen.getByText(/רק בדפדפן הזה באמצעות אחסון מקומי/)).toBeTruthy();
  });
});
