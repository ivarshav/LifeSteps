import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { Modal } from "@/components/ui";

function ModalHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} type="button">
        פתיחה
      </button>
      <Modal
        footer={<button type="button">אחרון</button>}
        onClose={() => setOpen(false)}
        open={open}
        title="כותרת"
      >
        <button type="button">ראשון</button>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("traps focus, closes on Escape, and returns focus to its trigger", async () => {
    render(<ModalHarness />);
    const trigger = screen.getByRole("button", { name: "פתיחה" });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "כותרת" });
    const first = screen.getByRole("button", { name: "סגירת חלון" });
    const last = screen.getByRole("button", { name: "אחרון" });
    expect(document.activeElement).toBe(first);
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    last.focus();
    fireEvent.keyDown(dialog, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(dialog, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });
});
