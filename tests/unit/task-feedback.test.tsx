import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskFeedbackControls } from "@/components/step/FeedbackControls";
import { ProgressProvider } from "@/components/step/ProgressContext";
import { logTaskClarity } from "@/lib/feedbackLog";
import { track } from "@vercel/analytics";

vi.mock("@/lib/feedbackLog", () => ({
  logTaskClarity: vi.fn(),
}));

vi.mock("@vercel/analytics", () => ({
  track: vi.fn(),
}));

describe("task clarity analytics", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("tracks the choice with step and task IDs only", () => {
    render(
      <ProgressProvider stepId="rent-apartment" taskIds={["sign-contract"]}>
        <TaskFeedbackControls taskId="sign-contract" />
      </ProgressProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "לא" }));

    expect(track).toHaveBeenCalledOnce();
    expect(track).toHaveBeenCalledWith("task_clarity", {
      stepId: "rent-apartment",
      taskId: "sign-contract",
      value: "not-helpful",
    });
    expect(logTaskClarity).toHaveBeenCalledOnce();
    expect(logTaskClarity).toHaveBeenCalledWith({
      stepId: "rent-apartment",
      taskId: "sign-contract",
      value: "not-helpful",
    });
  });
});
