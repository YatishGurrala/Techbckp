import { redirect } from "next/navigation";

type BlogsDetailAliasPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function BlogsDetailAliasPage({ params }: BlogsDetailAliasPageProps) {
  const { slug = [] } = await params;
  const normalized = slug.join("/").trim();

  if (!normalized) {
    redirect("/blog");
  }

  redirect(`/blog/${encodeURIComponent(normalized)}`);
}
