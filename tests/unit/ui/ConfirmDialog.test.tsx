import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "@/components/ui";

describe("ConfirmDialog", () => {
  it("renders an alert dialog and confirms destructive actions", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        description="לא ניתן לבטל פעולה זו"
        destructive
        onCancel={() => undefined}
        onConfirm={onConfirm}
        open
        title="מחיקה"
      />,
    );
    expect(
      screen
        .getByRole("alertdialog", { name: "מחיקה" })
        .getAttribute("aria-modal"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "אישור" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
