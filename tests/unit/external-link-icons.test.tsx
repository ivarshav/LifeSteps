import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  isExternalHref,
  LinkWithExternalIcon,
} from "@/components/layout/LinkWithExternalIcon";
import { ProgressProvider } from "@/components/step/ProgressContext";
import { Sources } from "@/components/step/Sources";
import { TaskRow } from "@/components/step/TaskRow";
import type { Task } from "@/lib/schema";

describe("external-link icons", () => {
  it("decorates external HTTP links but never internal links", () => {
    render(
      <>
        <LinkWithExternalIcon href="https://www.gov.il/example">
          שירות ממשלתי
        </LinkWithExternalIcon>
        <LinkWithExternalIcon href="/about">אודות</LinkWithExternalIcon>
        <LinkWithExternalIcon href="#sources">מקורות</LinkWithExternalIcon>
      </>,
    );

    const external = screen.getByRole("link", {
      name: "שירות ממשלתי (נפתח בחלון חדש)",
    });
    expect(external.querySelector("[data-external-link-icon]")).not.toBeNull();
    expect(
      external
        .querySelector("[data-external-link-icon]")
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(external.getAttribute("target")).toBe("_blank");
    expect(external.getAttribute("rel")).toContain("noreferrer");

    for (const name of ["אודות", "מקורות"]) {
      const internal = screen.getByRole("link", { name });
      expect(internal.querySelector("[data-external-link-icon]")).toBeNull();
      expect(internal.hasAttribute("target")).toBe(false);
    }
    expect(isExternalHref("https://life-steps.herokuapp.com/about")).toBe(
      false,
    );
  });

  it("renders the shared icon on task resource links", () => {
    const task: Task = {
      id: "check-source",
      nid: 1,
      title: "בדיקת מקור",
      links: [
        {
          label: "מידע רשמי",
          url: "https://www.gov.il/he/service/example",
          official: true,
        },
      ],
    };

    render(
      <ProgressProvider stepId="step" taskIds={[task.id]}>
        <TaskRow task={task} />
      </ProgressProvider>,
    );
    fireEvent.click(
      screen.getByLabelText("פרטים נוספים על בדיקת מקור"),
    );

    const link = screen.getByRole("link", {
      name: "מידע רשמי (נפתח בחלון חדש)",
    });
    expect(link.querySelector("[data-external-link-icon]")).not.toBeNull();
    expect(link.className).toContain("min-h-11");
  });

  it("renders the shared icon on every source link", () => {
    render(
      <Sources
        sources={[
          {
            label: "רשות האוכלוסין",
            url: "https://www.gov.il/he/departments/population_authority",
            official: true,
          },
          {
            label: "כל זכות",
            url: "https://www.kolzchut.org.il/",
          },
        ]}
      />,
    );

    const region = screen.getByRole("heading", {
      name: "מקורות ואסמכתאות",
    }).parentElement;
    expect(region).not.toBeNull();
    for (const link of within(region!).getAllByRole("link")) {
      expect(link.querySelector("[data-external-link-icon]")).not.toBeNull();
      expect(link.getAttribute("aria-hidden")).not.toBe("true");
    }
  });
});
