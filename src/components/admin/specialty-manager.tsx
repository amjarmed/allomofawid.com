import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { SpecialtyWithHuissiers } from "@/lib/types/admin"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { SpecialtyForm } from "./specialty-form"

export function SpecialtyManager() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const [isCreating, setIsCreating] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<SpecialtyWithHuissiers | null>(null)
  const [specialties, setSpecialties] = useState<SpecialtyWithHuissiers[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/specialties?" + new URLSearchParams({
        search,
        page: "1",
        limit: "10"
      }))
      const data = await response.json()
      setSpecialties(data.data)
    } catch (error) {
      toast.error(t("errors.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }

  // Delete specialty
  const deleteSpecialty = async (id: string) => {
    try {
      const response = await fetch("/api/admin/specialties?id=" + id, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error()
      toast.success(t("specialties.deleteSuccess"))
      fetchSpecialties()
    } catch {
      toast.error(t("specialties.deleteFailed"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("specialties.title")}</CardTitle>
        <CardDescription>{t("specialties.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <Input
            placeholder={t("specialties.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => setIsCreating(true)}>
            {t("specialties.create")}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("specialties.name")}</TableHead>
                <TableHead>{t("specialties.slug")}</TableHead>
                <TableHead>{t("specialties.huissiers")}</TableHead>
                <TableHead>{t("specialties.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.map((specialty) => (
                <TableRow key={specialty.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{specialty[`name_${locale}`]}</p>
                      <p className="text-sm text-muted-foreground">
                        {specialty[`description_${locale}`]}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{specialty.slug}</TableCell>
                  <TableCell>
                    <ScrollArea className="h-20">
                      {specialty.huissier_specialties?.map((hs) => (
                        <div key={hs.huissier.id} className="mb-1 flex items-center gap-2">
                          <span className="text-sm">{hs.huissier.name}</span>
                          {hs.verified ? (
                            <Badge variant="success">
                              {t("specialties.verified")}
                            </Badge>
                          ) : (
                            <Badge variant="warning">
                              {t("specialties.pending")}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </ScrollArea>
                  </TableCell>
                  <TableCell>
                    {specialty.active ? (
                      <Badge variant="default">
                        {t("common.active")}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        {t("common.inactive")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingSpecialty(specialty)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteSpecialty(specialty.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {(isCreating || editingSpecialty) && (
        <SpecialtyForm
          specialty={editingSpecialty}
          onClose={() => {
            setIsCreating(false)
            setEditingSpecialty(null)
          }}
          onSuccess={() => {
            setIsCreating(false)
            setEditingSpecialty(null)
            fetchSpecialties()
          }}
        />
      )}
    </Card>
  )
}
