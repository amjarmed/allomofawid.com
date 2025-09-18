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
import { CityInput, citySchema } from "@/lib/validations/location"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

interface CityFormProps {
  city?: CityInput | null
  onClose: () => void
  onSuccess: () => void
}

export function CityForm({ city, onClose, onSuccess }: CityFormProps) {
  const t = useTranslations("admin")
  const [loading, setLoading] = useState(false)

  const form = useForm<CityInput>({
    resolver: zodResolver(citySchema),
    defaultValues: city || {
      name_ar: "",
      name_fr: "",
      name_en: "",
      code: "",
      active: true,
      location: { lat: 0, lng: 0 },
      bounds: [
        { lat: 0, lng: 0 },
        { lat: 0, lng: 0 },
        { lat: 0, lng: 0 },
      ],
    },
  })

  const onSubmit = async (data: CityInput) => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/cities" + (city ? `?id=${city.id}` : ""), {
        method: city ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error()

      toast.success(t(city ? "cities.updateSuccess" : "cities.createSuccess"))
      onSuccess()
    } catch {
      toast.error(t(city ? "cities.updateFailed" : "cities.createFailed"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {city ? t("cities.edit") : t("cities.create")}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cities.nameAr")}</FormLabel>
                  <FormControl>
                    <Input {...field} dir="rtl" />
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
                  <FormLabel>{t("cities.nameFr")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>{t("cities.nameEn")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("cities.code")}</FormLabel>
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
                    <FormLabel>{t("cities.active")}</FormLabel>
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

            {/* TODO: Add map component for location and bounds selection */}

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" loading={loading}>
                {t("common.save")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
