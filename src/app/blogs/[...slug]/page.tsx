import { permanentRedirect } from "next/navigation";

type BlogsDetailAliasPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default async function BlogsDetailAliasPage({ params }: BlogsDetailAliasPageProps) {
  const { slug = [] } = await params;
  const normalized = slug.join("/").trim();

  if (!normalized) {
    permanentRedirect("/blog");
  }

  permanentRedirect(`/blog/${encodeURIComponent(normalized)}`);
}
