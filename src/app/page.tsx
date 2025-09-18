import { EmergencySearch } from "@/components/client/emergency-search";
import { CitySearch } from "@/components/server/city-search";
import { useTranslations } from "next-intl";

export default async function HomePage() {
  const t = await useTranslations('common');

  return (
    <div className="min-h-[100dvh] grid place-items-center bg-gradient-to-b from-background to-muted/20 p-4">
      <main className="w-full max-w-screen-xl mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight">
            {t('appName')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('slogan')}
          </p>
        </div>

        <div className="grid gap-8 max-w-5xl mx-auto">
          {/* Primary Emergency Search */}
          <div className="flex justify-center">
            <EmergencySearch />
          </div>

          {/* Secondary Actions - To be implemented */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-3">
              <CitySearch />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
