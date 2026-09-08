import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui";

describe("Button", () => {
  it("renders a native button and supports links through asChild", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>שמירה</Button>);

    fireEvent.click(screen.getByRole("button", { name: "שמירה" }));
    expect(onClick).toHaveBeenCalledOnce();

    rerender(
      <Button
        aria-label="אודות"
        asChild
        data-testid="about-link"
        variant="secondary"
      >
        <a href="/about">מידע נוסף</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "אודות" });
    expect(link.getAttribute("href")).toBe("/about");
    expect(link.getAttribute("data-testid")).toBe("about-link");
  });

  it("forwards its ref and composes asChild click handlers", () => {
    const ref = createRef<HTMLElement>();
    const childClick = vi.fn();
    const buttonClick = vi.fn();

    render(
      <Button asChild onClick={buttonClick} ref={ref}>
        <a href="#about" onClick={childClick}>
          מידע נוסף
        </a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "מידע נוסף" });

    expect(ref.current).toBe(link);
    fireEvent.click(link);
    expect(childClick).toHaveBeenCalledOnce();
    expect(buttonClick).toHaveBeenCalledOnce();
  });

  it("prevents disabled asChild links from mouse and keyboard activation", () => {
    const childClick = vi.fn();
    const buttonClick = vi.fn();

    render(
      <Button asChild disabled onClick={buttonClick}>
        <a href="/danger" onClick={childClick}>
          פעולה מושבתת
        </a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "פעולה מושבתת" });

    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.hasAttribute("href")).toBe(false);

    fireEvent.click(link);
    fireEvent.keyDown(link, { key: "Enter" });
    fireEvent.keyDown(link, { key: " " });
    expect(childClick).not.toHaveBeenCalled();
    expect(buttonClick).not.toHaveBeenCalled();
  });
});
