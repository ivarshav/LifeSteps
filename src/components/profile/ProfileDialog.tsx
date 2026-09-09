"use client";

import { Modal, useToast } from "@/components/ui";
import { saveProfile, type LifeProfile } from "@/lib/profile";

import { ProfileForm } from "./ProfileForm";

export function ProfileDialog({
  initialProfile,
  onClose,
  onSaved,
  open,
}: {
  initialProfile: LifeProfile;
  onClose: () => void;
  onSaved: (profile: LifeProfile) => void;
  open: boolean;
}) {
  const { showToast } = useToast();

  return (
    <Modal onClose={onClose} open={open} title="בונים מסלול אישי">
      <ProfileForm
        initialProfile={initialProfile}
        key={JSON.stringify(initialProfile)}
        onCancel={onClose}
        onSave={(profile) => {
          const persisted = saveProfile(profile);
          onSaved(profile);
          showToast(
            persisted
              ? "המסלול האישי נשמר בדפדפן"
              : "המסלול מוכן לביקור הזה, אך הדפדפן לא אפשר לשמור אותו",
            { icon: persisted ? "✓" : "!" },
          );
          onClose();
        }}
      />
    </Modal>
  );
}
