"use client";

import { Checkbox } from "@/components/ui/Checkbox";

import { useStepProgress } from "./ProgressContext";

export function TaskCheckbox({
  taskId,
  titleId,
}: {
  taskId: string;
  titleId: string;
}) {
  const { completed, toggle } = useStepProgress();

  return (
    <Checkbox
      aria-labelledby={titleId}
      checked={completed.has(taskId)}
      onChange={() => toggle(taskId)}
    />
  );
}
