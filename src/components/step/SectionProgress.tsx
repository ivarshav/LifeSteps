"use client";

import { Pill } from "@/components/ui/Pill";

import { useStepProgress } from "./ProgressContext";

export function SectionProgress({ taskIds }: { taskIds: string[] }) {
  const { completed } = useStepProgress();
  const done = taskIds.filter((taskId) => completed.has(taskId)).length;

  return (
    <Pill>
      {done.toLocaleString("he-IL")} מתוך{" "}
      {taskIds.length.toLocaleString("he-IL")} הושלמו
    </Pill>
  );
}
