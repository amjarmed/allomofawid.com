import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { SpecialtyWithHuissiers } from "@/lib/types/admin"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const specialtySchema = z.object({
  name_ar: z.string().min(2).max(100),
  name_fr: z.string().min(2).max(100),
  name_en: z.string().min(2).max(100),
  description_ar: z.string().optional(),
  description_fr: z.string().optional(),
  description_en: z.string().optional(),
  slug: z.string().min(2).max(100),
  icon: z.string().optional(),
  active: z.boolean().default(true),
})

type SpecialtyFormData = z.infer<typeof specialtySchema>

interface SpecialtyFormProps {
  specialty?: SpecialtyWithHuissiers | null
  onClose: () => void
  onSuccess: () => void
}

export function SpecialtyForm({ specialty, onClose, onSuccess }: SpecialtyFormProps) {
  const t = useTranslations("admin")
  const [loading, setLoading] = useState(false)

  const form = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: specialty || {
      name_ar: "",
      name_fr: "",
      name_en: "",
      description_ar: "",
      description_fr: "",
      description_en: "",
      slug: "",
      icon: "",
      active: true,
    },
  })

  const onSubmit = async (data: SpecialtyFormData) => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/specialties" + (specialty ? `?id=${specialty.id}` : ""), {
        method: specialty ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error()

      toast.success(t(specialty ? "specialties.updateSuccess" : "specialties.createSuccess"))
      onSuccess()
    } catch {
      toast.error(t(specialty ? "specialties.updateFailed" : "specialties.createFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {specialty ? t("specialties.edit") : t("specialties.create")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.nameAr")}</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.descriptionAr")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_fr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.nameFr")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_fr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.descriptionFr")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.nameEn")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.descriptionEn")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.slug")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("specialties.icon")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t("specialties.active")}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
