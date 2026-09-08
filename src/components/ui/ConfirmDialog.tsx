"use client";

import { Button } from "./Button";
import { Modal } from "./Modal";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
};

export function ConfirmDialog({
  cancelLabel = "ביטול",
  confirmLabel = "אישור",
  description,
  destructive = false,
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) {
  return (
    <Modal
      className="max-w-[460px]"
      footer={
        <div className="ms-auto flex items-center gap-3">
          <Button onClick={onCancel} variant="ghost">
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            variant={destructive ? "danger" : "primary"}
          >
            {confirmLabel}
          </Button>
        </div>
      }
      onClose={onCancel}
      open={open}
      role="alertdialog"
      title={title}
    >
      <p className="text-[var(--gray-600)]">{description}</p>
    </Modal>
  );
}
