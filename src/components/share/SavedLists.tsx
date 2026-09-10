"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getSavedLists, removeSavedList, type SavedList } from "@/lib/saved-lists";

export function SavedLists() {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLists(getSavedLists());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const remove = (id: string) => {
    removeSavedList(id);
    setLists((current) => current.filter((list) => list.id !== id));
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <h1 className="text-3xl font-bold text-[var(--gray-900)]">הרשימות ששמרתי</h1>
      <p className="mt-3 text-[var(--gray-600)]">
        הרשימות נשמרות רק בדפדפן ובמכשיר הזה.
      </p>
      {!ready ? <p className="mt-6 text-[var(--gray-600)]">טוענים רשימות…</p> : null}
      {ready && lists.length === 0 ? (
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold text-[var(--gray-900)]">עדיין לא נשמרו רשימות</h2>
          <p className="mt-2 text-[var(--gray-600)]">
            פתחו רשימה ששיתפו איתכם ובחרו ״שמור את הרשימה אצלי״.
          </p>
          <Button asChild className="mt-4">
            <Link href="/share">בניית רשימה לשיתוף</Link>
          </Button>
        </Card>
      ) : null}
      <div className="mt-6 space-y-3">
        {lists.map((list) => (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-5" key={list.id}>
            <div>
              <h2 className="font-semibold text-[var(--gray-900)]">
                {list.selection.t || "רשימת צעדים"}
              </h2>
              <p className="mt-1 text-sm text-[var(--gray-600)]">
                {list.selection.s.length} צעדים · נשמרה{" "}
                {new Intl.DateTimeFormat("he-IL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(list.savedAt))}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <Link href={`/s#${list.payload}`}>פתיחת הרשימה</Link>
              </Button>
              <Button onClick={() => remove(list.id)} size="sm" variant="ghost">
                הסרה
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
