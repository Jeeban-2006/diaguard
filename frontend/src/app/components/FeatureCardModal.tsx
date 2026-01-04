"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

interface FeatureCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function FeatureCardModal({ open, onOpenChange, title, subtitle, children }: FeatureCardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        <div className="pt-2">{children}</div>

        <DialogFooter>
          <DialogClose>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-md">Close</button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FeatureCardModal;
