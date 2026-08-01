import { Clock } from "lucide-react";
import { pageRegistry } from "@/lib/page-registry";

export default async function DynamicCompanyPage({
  params,
}: {
  params: Promise<{ blockSlug: string; pageSlugs: string[] }>;
}) {
  const { blockSlug, pageSlugs } = await params;
  const path = `/${blockSlug}/${pageSlugs.join("/")}`;
  const PageComponent = pageRegistry[path];

  if (PageComponent) return <PageComponent />;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--allpa-gold-400)]/10 text-[var(--allpa-gold-300)]">
        <Clock className="h-6 w-6" />
      </div>
      <h1 className="font-serif text-xl font-semibold text-[#f3ecd9]">Esta página está en camino</h1>
      <p className="mt-2 text-sm text-white/45">
        Se irá integrando en los próximos avances de la plataforma, junto con el resto de bloques del sidebar.
      </p>
    </div>
  );
}
