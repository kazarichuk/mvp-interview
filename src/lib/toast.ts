// src/lib/toast.ts
import { toast as showToast } from "@/components/ui/use-toast"

type ToastVariant = "default" | "destructive"

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
}

export const toast = ({ title, description, variant = "default" }: ToastOptions) => {
  showToast({
    title,
    description,
    variant,
  })
}

export const successToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "default",
  })
}

export const errorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  })
}