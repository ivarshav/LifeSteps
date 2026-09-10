"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Step } from "@/lib/schema";
import { isListSaved, saveList } from "@/lib/saved-lists";
import { decodeShare, type ShareSelection } from "@/lib/share";
import { ProgressProvider } from "@/components/step/ProgressContext";
import { SectionBlock } from "@/components/step/SectionBlock";

type ResolvedStep = { step: Step; taskIds: Set<string> };

function resolve(selection: ShareSelection, steps: Step[]) {
  let unavailable = false;
  const resolved: ResolvedStep[] = [];
  selection.s.forEach(([stepNid, taskNids]) => {
    const step = steps.find((item) => item.nid === stepNid);
    if (!step) {
      unavailable = true;
      return;
    }
    const allTasks = step.sections.flatMap((section) => section.tasks);
    const taskIds = new Set<string>();
    if (taskNids.length === 0) allTasks.forEach((task) => taskIds.add(task.id));
    else taskNids.forEach((taskNid) => {
      const task = allTasks.find((item) => item.nid === taskNid);
      if (task) taskIds.add(task.id);
      else unavailable = true;
    });
    if (taskIds.size) resolved.push({ step, taskIds });
  });
  return { resolved, unavailable };
}

export function SharedList({ steps }: { steps: Step[] }) {
  const [selection, setSelection] = useState<ShareSelection | null | undefined>(undefined);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const decoded = decodeShare(window.location.hash);
      setSelection(decoded);
      setSaved(decoded ? isListSaved(decoded) : false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [steps]);

  if (selection === undefined) return <p className="py-10 text-center text-[var(--gray-600)]">טוענים את הרשימה…</p>;
  if (selection === null) {
    return <Card className="mx-auto my-10 max-w-2xl p-6 text-center">
      <h1 className="text-2xl font-bold text-[var(--gray-900)]">לא הצלחנו לפתוח את הרשימה</h1>
      <p className="mt-3 text-[var(--gray-600)]">ייתכן שהקישור חלקי או לא תקין. אפשר לחזור לאתר ולבחור צעדים חדשים.</p>
      <Button asChild className="mt-5"><Link href="/">לדף הבית</Link></Button>
    </Card>;
  }

  const { resolved, unavailable } = resolve(selection, steps);
  const save = () => {
    saveList(selection);
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <Card className="mb-6 border-[var(--brand-200)] bg-[var(--brand-50)] p-6">
        <p className="font-semibold text-[var(--brand-700)]">רשימה ששותפה איתך</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--gray-900)]">{selection.t || "רשימת צעדים"}</h1>
        {selection.m ? <blockquote className="mt-4 border-s-4 border-[var(--brand-400)] ps-4 text-[var(--gray-700)]">{selection.m}</blockquote> : null}
        <p className="mt-4 text-sm text-[var(--gray-600)]">הסימונים שלך נשמרים רק אצלך ולא נשלחים חזרה למי ששיתף.</p>
      </Card>
      {resolved.map(({ step, taskIds }) => (
        <Card className="mb-4 p-5" key={step.id}>
          <details className="group" open>
            <summary className="flex cursor-pointer list-none items-start gap-3 [&::-webkit-details-marker]:hidden">
              <span aria-hidden className="text-3xl leading-none">{step.emoji}</span>
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold text-[var(--gray-900)]">{step.title}</h2>
                <p className="mt-1 text-[var(--gray-600)]">{step.summary}</p>
              </div>
              <ChevronDown
                aria-hidden
                className="mt-1 shrink-0 text-[var(--gray-500)] transition-transform group-open:rotate-180"
                size={20}
              />
            </summary>
            <ProgressProvider
              stepId={step.id}
              taskIds={[...taskIds]}
            >
              {step.sections
                .map((section) => ({
                  ...section,
                  tasks: section.tasks.filter((task) => taskIds.has(task.id)),
                }))
                .filter((section) => section.tasks.length > 0)
                .map((section, index) => (
                  <SectionBlock index={index} key={section.id} section={section} />
                ))}
            </ProgressProvider>
          </details>
        </Card>
      ))}
      {unavailable ? <p className="my-4 text-sm text-[var(--gray-600)]">חלק מהצעדים ברשימה כבר לא זמינים באתר</p> : null}
      {resolved.length ? (
        <div className="flex flex-wrap items-center gap-3">
          {saved ? (
            <>
              <p aria-live="polite" className="font-semibold text-[var(--accent-700)]" role="status">
                הרשימה נשמרה אצלך
              </p>
              <Button asChild variant="primary"><Link href="/saved">לרשימות ששמרתי</Link></Button>
            </>
          ) : <Button onClick={save} variant="secondary">שמור את הרשימה אצלי</Button>}
          <Button asChild variant="ghost"><Link href="/">גלה עוד צעדים באתר</Link></Button>
        </div>
      ) : null}
    </div>
  );
}
