import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CTASection } from "@/components/marketing/cta-section";
import { PageShell } from "@/components/marketing/page-shell";
import { getPostBySlug, getSortedPosts } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getSortedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getPostBySlug(slug);
    return {
      title: `${post.title} | Techbckp Blog`,
      description: post.excerpt,
    };
  } catch {
    return {
      title: "Post Not Found | Techbckp Blog",
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const normalizedSlug = decodeURIComponent(slug);
  const [post, allPosts] = await Promise.all([
    getPostBySlug(normalizedSlug).catch(() => null),
    getSortedPosts(),
  ]);

  if (!post) {
    notFound();
  }

  if (post.slug !== normalizedSlug) {
    redirect(`/blog/${encodeURIComponent(post.slug)}`);
  }

  const related = allPosts.filter((candidate) => candidate.slug !== post.slug).slice(0, 2);

  return (
    <PageShell footerVariant="dark">
      <article className="page-wrap max-w-4xl py-14 md:py-20">
        <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">{post.category}</span>
          <span>•</span>
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readTime}</span>
        </div>

        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-white md:text-6xl">{post.title}</h1>

        <div className="mt-8 flex items-center gap-4 border-y border-zinc-100 py-6 dark:border-zinc-800">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCikNLvZglalrRYclmzZSLdkAeIQFF095UUyz96bhud_iz5JVpZwuAMtGMe1UX0rqE7sPxbxjDPOxRnim7SpiBRCTG50H8y3wGfqb5Du1IV0KZUM_HXwnjCD0bZ1UIL6ePjVYRuT2dP9l5TYvF4Eyh9gvBA-EklzLvcXNWcfHDxq-iZF6VfUYotPAXclF2PLztrfP9JYqp20ckdOfpcgV34E03wH6BqmrWK8nK3sDOaur9PFUiwewBoZzOqcvtg13w0sNjmr9rd_qA_"
            alt="Author avatar"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover grayscale"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">{post.author}</span>
            <span className="text-xs text-zinc-500">VP of Engineering at Techbckp</span>
          </div>
        </div>

        <div className="ambient-shadow mt-10 overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSbQNWrJnGoNlYWVtcdF9cO9A_veBi25d1Q3IiHe-y2uKJgRr3w-4JZ8Nk_a0V1aw7q_TKuAkJ22WSPueEn5-3Ru87exrtme9PiTDv2T8nVJ_8NL5wXgP5zcMt8tcNhu3yYC0cp_5eMtQ6CJJDx5YZChD3x2NI466OtswO_wr-kEm-27SWW51_OUSFL_WTl2sozBK1NNlT-IumPkAJUzUndRYg-CIzuRuuHr4E8WAvnO0c75Hebb9i_fMPoWh76OrgKNl9jHz318ub"
            alt="Article cover"
            width={1600}
            height={900}
            className="h-[360px] w-full object-cover md:h-[500px]"
            priority
          />
        </div>

        <div
          className="prose prose-zinc mt-12 max-w-none prose-headings:tracking-tight prose-a:text-[#ff8400] prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-surface-container-low prose-blockquote:px-6 prose-blockquote:py-4 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        <Link href="/blog" className="mt-8 inline-flex text-sm font-semibold text-[#ff8400]">
          ← Back to Blog
        </Link>

        {related.length > 0 ? (
          <section className="mt-16 border-t border-zinc-100 pt-12 dark:border-zinc-800">
            <div className="mb-8 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Continue Reading</h2>
              <Link href="/blog" className="inline-flex items-center gap-1 text-sm font-semibold text-[#ff8400]">
                View all posts
                <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden>
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${encodeURIComponent(item.slug)}`}
                  className="group overflow-hidden rounded-xl border border-zinc-100 bg-white p-5 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Case Study</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-[#ff8400] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <CTASection
        title="Need help shipping faster?"
        body="If this article is close to what you are building, we can help you execute it end-to-end."
        primaryLabel="Start Your Project"
        primaryHref="/contact"
      />
    </PageShell>
  );
}
