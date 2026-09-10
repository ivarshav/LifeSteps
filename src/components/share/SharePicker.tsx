"use client";

import { ChevronDown, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Category, Step } from "@/lib/schema";
import { encodeShare, estimateLength, type ShareSelection } from "@/lib/share";

function selectionFor(selection: Set<number>): ShareSelection {
  return {
    v: 1,
    s: [...selection].sort((left, right) => left - right).map((stepNid) => [stepNid, []]),
  };
}

export function SharePicker({
  categories,
  steps,
}: {
  categories: Category[];
  steps: Step[];
}) {
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState("");
  const [canUseWebShare, setCanUseWebShare] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOrigin(window.location.origin);
      setCanUseWebShare("share" in navigator);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const shareSelection = useMemo(() => {
    const base = selectionFor(selection);
    return {
      ...base,
      ...(title.trim() ? { t: title.trim() } : {}),
      ...(message.trim() ? { m: message.trim() } : {}),
    };
  }, [message, selection, title]);
  const link = selection.size && origin ? `${origin}/s#${encodeShare(shareSelection)}` : "";
  const length = link ? estimateLength(shareSelection, origin) : 0;
  const tooLong = length > 1800;
  const warning = length > 900 && !tooLong;

  const setStep = (step: Step, checked: boolean) => {
    setSelection((current) => {
      const next = new Set(current);
      if (checked) next.add(step.nid);
      else next.delete(step.nid);
      return next;
    });
  };

  const setCategory = (categorySteps: Step[], checked: boolean) => {
    setSelection((current) => {
      const next = new Set(current);
      categorySteps.forEach((step) => {
        if (checked) next.add(step.nid);
        else next.delete(step.nid);
      });
      return next;
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setStatus("הקישור הועתק.");
    } catch {
      setStatus("לא הצלחנו להעתיק. אפשר לבחור ולהעתיק את הקישור ידנית.");
    }
  };

  const share = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: title || "רשימת צעדים", text: message, url: link });
    } catch {
      setStatus("השיתוף בוטל או לא הושלם.");
    }
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-4">
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">בוחרים מה לשתף</h2>
          <p className="mt-2 text-[var(--gray-600)]">
            בוחרים את הצעדים שרוצים לשתף. המשימות המפורטות יוצגו למי שיפתח את הרשימה.
          </p>
          <div className="mt-5 space-y-3">
            {categories.map((category) => {
              const categorySteps = steps.filter((step) => step.categoryId === category.id);
              const selectedCount = categorySteps.filter((step) => selection.has(step.nid)).length;
              const categoryState =
                selectedCount === 0 ? false : selectedCount === categorySteps.length ? true : "mixed";
              return (
                <div className="relative rounded-lg border border-[var(--gray-200)]" key={category.id}>
                  <div className="absolute start-3 top-3 z-10">
                    <Checkbox
                      checked={categoryState}
                      label={`בחירת כל צעדי ${category.title}`}
                      onChange={(checked) => setCategory(categorySteps, checked)}
                    />
                  </div>
                  <details className="group">
                    <summary className="flex min-h-[68px] cursor-pointer items-center gap-3 py-3 pe-3 ps-[68px] font-semibold text-[var(--gray-800)]">
                      <span>{category.emoji} {category.title}</span>
                      <ChevronDown
                        aria-hidden
                        className="me-1 ms-auto transition-transform group-open:rotate-180"
                        size={18}
                      />
                    </summary>
                    <div className="space-y-3 border-block-start border-[var(--gray-100)] p-3">
                      {categorySteps.map((step) => {
                        return (
                          <div className="flex items-center gap-3 rounded-md bg-[var(--gray-50)] p-3" key={step.id}>
                            <Checkbox
                              checked={selection.has(step.nid)}
                              label={`בחירת ${step.title}`}
                              onChange={(checked) => setStep(step, checked)}
                            />
                            <span className="font-medium text-[var(--gray-800)]">{step.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
      <aside className="space-y-4 lg:sticky lg:top-[calc(var(--hdr-h)+24px)]">
        <Card className="p-5">
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">הרשימה שלך</h2>
          {selection.size === 0 ? (
            <p className="mt-3 text-sm text-[var(--gray-600)]">עדיין לא נבחרו צעדים.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {steps.filter((step) => selection.has(step.nid)).map((step) => (
                <li className="flex items-center justify-between gap-2" key={step.id}>
                  <span>{step.title}</span>
                  <button className="min-h-11 rounded-md px-2 text-[var(--brand-600)] hover:bg-[var(--brand-50)]" onClick={() => setStep(step, false)} type="button">הסרה</button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="space-y-3 p-5">
          <label className="block text-sm font-semibold text-[var(--gray-800)]" htmlFor="share-title">
            כותרת לרשימה ({title.length}/60)
          </label>
          <input className="w-full rounded-md border border-[var(--gray-300)] p-2" id="share-title" maxLength={60} onChange={(event) => setTitle(event.target.value)} value={title} />
          <label className="block text-sm font-semibold text-[var(--gray-800)]" htmlFor="share-message">
            הודעה אישית ({message.length}/200)
          </label>
          <textarea className="min-h-24 w-full rounded-md border border-[var(--gray-300)] p-2" id="share-message" maxLength={200} onChange={(event) => setMessage(event.target.value)} value={message} />
          <p className="text-sm text-[var(--gray-600)]">הכל מקודד בתוך הקישור עצמו. שום מידע לא נשמר אצלנו ואין מסד נתונים.</p>
          {link ? (
            <>
              <label className="sr-only" htmlFor="share-link">קישור לשיתוף</label>
              <textarea className="min-h-24 w-full break-all rounded-md border border-[var(--gray-300)] bg-[var(--gray-50)] p-2 text-xs" id="share-link" readOnly value={link} />
              <p className={`text-sm ${tooLong ? "text-[var(--danger-500)]" : warning ? "text-amber-700" : "text-[var(--accent-600)]"}`}>
                אורך הקישור: {length} תווים{tooLong ? " — הקישור ארוך מדי — כדאי לפצל לשתי רשימות" : warning ? " — הקישור מתחיל להיות ארוך" : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button disabled={tooLong} onClick={copyLink} size="sm" variant="secondary">העתק קישור</Button>
                <a className={`inline-flex min-h-11 items-center rounded-md px-3 py-1.5 text-sm font-semibold ${tooLong ? "pointer-events-none opacity-50" : "bg-[#25D366] text-white"}`} href={tooLong ? undefined : `https://wa.me/?text=${encodeURIComponent(`${title || "רשימת צעדים"}\n${link}`)}`} rel="noreferrer" target="_blank">WhatsApp</a>
                <a className={`inline-flex min-h-11 items-center rounded-md px-3 py-1.5 text-sm font-semibold ${tooLong ? "pointer-events-none opacity-50" : "bg-[var(--gray-100)] text-[var(--gray-800)]"}`} href={tooLong ? undefined : `mailto:?subject=${encodeURIComponent(title || "רשימת צעדים")}&body=${encodeURIComponent(`${message}\n\n${link}`)}`}>דוא״ל</a>
                {canUseWebShare ? <Button disabled={tooLong} onClick={share} size="sm" variant="ghost"><Share2 aria-hidden size={16} />שיתוף</Button> : null}
              </div>
            </>
          ) : null}
          <p aria-live="polite" className="text-sm text-[var(--gray-600)]">{status}</p>
        </Card>
      </aside>
    </div>
  );
}
