"use client";

import { useEffect, useState } from "react";

import { Button, Card } from "@/components/ui";
import { isProfileEmpty, readProfile, type LifeProfile } from "@/lib/profile";

import { ProfileDialog } from "./ProfileDialog";

export function ProfilePrompt() {
  const [profile, setProfile] = useState<LifeProfile>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setProfile(readProfile()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const hasProfile = !isProfileEmpty(profile);
  return (
    <>
      <Card className="flex flex-wrap items-center gap-5 border-[var(--brand-100)] bg-[linear-gradient(100deg,var(--brand-50),var(--accent-50))] p-6">
        <div className="min-w-60 flex-1">
          <h3 className="text-lg font-semibold text-[var(--gray-900)]">
            {hasProfile ? "המסלול האישי שלכם מוכן" : "מה רלוונטי לכם עכשיו?"}
          </h3>
          <p className="mt-1.5 max-w-[58ch] text-sm text-[var(--gray-600)]">
            {hasProfile
              ? "אפשר לראות מה כדאי לעשות בהמשך, לעדכן את הבחירות או למחוק אותן בכל זמן."
              : "נבנה סדר צעדים שמתאים לחיים שלכם. הבחירה אופציונלית, נשמרת רק בדפדפן ותמיד אפשר לשנות אותה."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {hasProfile ? (
            <Button asChild variant="primary">
              <a href="/my-path">למסלול שלי</a>
            </Button>
          ) : null}
          <Button
            onClick={() => setOpen(true)}
            variant={hasProfile ? "secondary" : "primary"}
          >
            {hasProfile ? "עדכון המסלול" : "בניית מסלול"}
          </Button>
        </div>
      </Card>
      <ProfileDialog
        initialProfile={profile}
        onClose={() => setOpen(false)}
        onSaved={setProfile}
        open={open}
      />
    </>
  );
}
