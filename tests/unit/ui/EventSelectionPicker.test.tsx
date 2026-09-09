import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EventSelectionPicker } from "@/components/profile/EventSelectionPicker";
import { StepSchema, type Step } from "@/lib/schema";

function eventStep(id: string, title: string): Step {
  return StepSchema.parse({
    categoryId: "family",
    emoji: "📋",
    id,
    keywords: [],
    lastReviewed: "2026-01-01",
    nid: id === "divorce" ? 1 : 2,
    recommendationEligibility: { kind: "explicit-event" },
    sections: [
      {
        id: "section",
        nid: 1,
        tasks: [{ id: "task", nid: 1, title: "משימה לדוגמה" }],
        title: "שלב לדוגמה",
      },
    ],
    sources: [{ label: "מקור", url: "https://www.gov.il/" }],
    summary: "תיאור קצר",
    title,
  });
}

describe("EventSelectionPicker", () => {
  afterEach(cleanup);

  it("keeps the event checklist out of the initial page and opens it on demand", () => {
    const onSelectionChange = vi.fn();
    render(
      <EventSelectionPicker
        onSelectionChange={onSelectionChange}
        selectedStepIds={new Set()}
        steps={[
          eventStep("divorce", "גירושין"),
          eventStep("bereavement", "פטירה של קרוב"),
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "נושא נוסף למסלול (אופציונלי)" }),
    ).toBeTruthy();
    expect(screen.queryByRole("checkbox", { name: "גירושין" })).toBeNull();
    expect(screen.getByText(/לא מתווספות לכתובת/)).toBeTruthy();

    fireEvent.click(
      screen.getByRole("button", { name: "בחירת נושא למסלול" }),
    );
    const dialog = screen.getByRole("dialog", { name: "בחירת נושא למסלול" });
    const divorce = within(dialog).getByRole("checkbox", { name: "גירושין" });
    expect((divorce as HTMLInputElement).checked).toBe(false);

    fireEvent.click(divorce);
    expect(onSelectionChange).toHaveBeenCalledWith("divorce", true);
  });

  it("searches and reports exact selection removal within the dialog", () => {
    const onSelectionChange = vi.fn();
    render(
      <EventSelectionPicker
        onSelectionChange={onSelectionChange}
        selectedStepIds={new Set(["divorce"])}
        steps={[
          eventStep("divorce", "גירושין"),
          eventStep("bereavement", "פטירה של קרוב"),
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "בחירת נושא למסלול" }),
    );
    const dialog = screen.getByRole("dialog", { name: "בחירת נושא למסלול" });
    const search = within(dialog).getByRole("searchbox", {
      name: "חיפוש נושא",
    });
    fireEvent.change(search, { target: { value: "פטירה" } });

    expect(
      within(dialog).getByRole("checkbox", { name: "פטירה של קרוב" }),
    ).toBeTruthy();
    expect(
      within(dialog).queryByRole("checkbox", { name: "גירושין" }),
    ).toBeNull();

    fireEvent.change(search, { target: { value: "גירושין" } });
    fireEvent.click(
      within(dialog).getByRole("checkbox", { name: "גירושין" }),
    );
    expect(onSelectionChange).toHaveBeenCalledWith("divorce", false);
  });
});
