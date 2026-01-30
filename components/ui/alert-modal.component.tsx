import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

const AlertModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: AlertModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="space-y-2 mb-2">
        <h3 className="text-lg font-semibold text-white ">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="secondary" onClick={onCancel} className="min-w-[80px]">
          {cancelText}
        </Button>
        <Button
          variant={danger ? "destructive" : "default"}
          onClick={onConfirm}
          className="min-w-[80px] bg-accent text-accent-foreground"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default AlertModal;
