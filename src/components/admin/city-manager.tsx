import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CityInput } from "@/lib/validations/location"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { CityForm } from "./city-form"
import { useLocale } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import { toast } from "sonner"

export function CityManager() {
  const t = useTranslations("admin")
  const locale = useLocale()
  const [isCreating, setIsCreating] = useState(false)
  const [editingCity, setEditingCity] = useState<CityInput | null>(null)
  const [cities, setCities] = useState<any[]>([]) // Replace with proper type
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Fetch cities
  const fetchCities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/cities?" + new URLSearchParams({
        search,
        page: "1",
        limit: "10"
      }))
      const data = await response.json()
      setCities(data.data)
    } catch (error) {
      toast.error(t("errors.fetchFailed"))
    } finally {
      setLoading(false)
    }
  }

  // Delete city
  const deleteCity = async (id: string) => {
    try {
      const response = await fetch(\`/api/admin/cities?id=\${id}\`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error()
      toast.success(t("cities.deleteSuccess"))
      fetchCities()
    } catch {
      toast.error(t("cities.deleteFailed"))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cities.title")}</CardTitle>
        <CardDescription>{t("cities.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <Input
            placeholder={t("cities.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => setIsCreating(true)}>
            {t("cities.create")}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("cities.name")}</TableHead>
                <TableHead>{t("cities.region")}</TableHead>
                <TableHead>{t("cities.code")}</TableHead>
                <TableHead>{t("cities.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>{city[\`name_\${locale}\`]}</TableCell>
                  <TableCell>{city.region[\`name_\${locale}\`]}</TableCell>
                  <TableCell>{city.code}</TableCell>
                  <TableCell>
                    {city.active ? t("common.active") : t("common.inactive")}
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
                          onClick={() => setEditingCity(city)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteCity(city.id)}
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

      {(isCreating || editingCity) && (
        <CityForm
          city={editingCity}
          onClose={() => {
            setIsCreating(false)
            setEditingCity(null)
          }}
          onSuccess={() => {
            setIsCreating(false)
            setEditingCity(null)
            fetchCities()
          }}
        />
      )}
    </Card>
  )
}
