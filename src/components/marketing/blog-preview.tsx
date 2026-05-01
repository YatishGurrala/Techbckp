"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { BlogMeta } from "@/lib/blog";

type BlogPreviewProps = {
  posts: BlogMeta[];
};

const PLACEHOLDER_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBknMuUc0jCjbjMpxiC5s1jzfReEm4iND9MNZx8Na3rZxEefl7OfqHl43az60t1txgyGnhY8Pupohn9uFIf5PM0myzIWxp27WJJXEtaBNHXNuoUXxHL9v-7SK9T5fDeq7PsHmb1WOl1ljhfUgpzWVHzfll_pWNl1UXRB0GVS5ihdzAVyH2jzx7TPYg0MO-3iQ7qX8526E0srW_grkD96yAHa-WVA6C76jLcVGTDsNXdwYss0a_eAoYSvXeqLFETsfwPKbvSvRjVHdMi",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAwIN_H09hP2DfeMwh-z50pIeVvckcrHB4ilI5W0zVBpzrQT2-gfwi-FuTBZHksw1k4IUt6fq6QT-IUFBl_H8eT9OSatObSPeBUb_FZIKcLkYsoBJ0NV8DBzm3M9YbJ5urIPrIx2RND123kppyC_ICU0E_bwkweWxKaSw25tD3Dz1c3gcnSMDHLNCmuDtnkYpCoBA_YJ_VdV8EBgQoSCie0SOfROkBvi9cqhI98cPIgV-UMyf9V5-jK1S-J8VzqK3n1icWXfNUwrdKQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBq2heI_TouGJgx25qATKYcTP7k_KNjOti-IOl23PvoCqK22YgyWVdZrygiDQfuYcBJrpRC-3dEoI9gmJk1h2VMbuSX8r_yABNrEdC_9qTcdw0k9c2SEndfyv-h57ERhmEtARSKTBSc0q4vf9o4SqX4ydo9m83VAE1jQngAg-Cx6rUYjNmlhtAf_nZbgrHOmX5Xup9IBeqlrVU4L7WGh-w4Ns0auYBJCXWvEGNitba-ZjhXhJtXAdJMuMpAN69EBDVlyeY35bZf_Axl",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDmcmIllmXeBjE5n9f90TwM25G6OAfk4UMMhwtPBT7S03PntWUUbnnzoQoGGKY-0uIUIvBoZuIWmNCPSCbzC7cXeWR5FPy6k-uOfvFybOT46KIVDFyb4PLk50dulVzZHKRowOM1JVp1A2XYagQwI7uDsoMbJlP6WCJ-kDf4LcvBmDbujy9FvJJW8OKrXgGoMVVmmQPRoM0O70sdiY92jROG3Yu1Z8P46Hm_WJYEYpCNPjAkP3Lg2pvZPeRxuWdnjrY2Q5gBsygMzR8E",
];

function imageFor(index: number) {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
}

export function BlogPreview({ posts }: BlogPreviewProps) {
  const latest = posts.slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-6 py-section-gap lg:px-8" id="blog">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-headline-lg mb-2">Technical Insights</h2>
          <p className="text-tertiary">Articles on automation, development, and system growth.</p>
        </div>
        <Link href="/blog" className="text-label-bold text-primary-container hover:underline">
          View all posts
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {latest.map((post, i) => (
          <Link href={`/blog/${encodeURIComponent(post.slug)}`} key={post.slug} className="group cursor-pointer">
            <div className="mb-6 aspect-video overflow-hidden rounded-xl">
              <Image
                src={imageFor(i)}
                alt={post.title}
                width={1200}
                height={675}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h4 className="text-headline-md mb-3 text-xl text-zinc-900 transition-colors group-hover:text-primary-container dark:text-white">
              {post.title}
            </h4>
            <p className="text-sm text-tertiary">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BlogList({ posts }: BlogPreviewProps) {
  const categories = useMemo(() => {
    const discovered = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)));
    return ["All", ...discovered];
  }, [posts]);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = useMemo(() => {
    if (selectedCategory === "All") return posts;
    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  const featured = filteredPosts[0];
  const rest = filteredPosts.slice(1);

  return (
    <>
      {featured && (
        <section className="mb-section-gap">
          <Link
            href={`/blog/${encodeURIComponent(featured.slug)}`}
            className="ambient-shadow grid grid-cols-1 items-center gap-12 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-2 transition hover:shadow-[0px_8px_30px_rgba(15,10,20,0.08)] md:p-4 lg:grid-cols-12"
          >
            <div className="h-[400px] overflow-hidden rounded-lg lg:col-span-7">
              <Image
                src={imageFor(0)}
                alt={featured.title}
                width={1400}
                height={800}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col gap-6 px-6 py-8 lg:col-span-5">
              <span className="inline-flex w-fit rounded-full bg-tertiary-fixed px-3 py-1 text-label-bold text-on-tertiary-fixed-variant">
                {featured.category}
              </span>
              <h2 className="text-headline-lg text-zinc-900 dark:text-white">{featured.title}</h2>
              <p className="text-body-md text-zinc-600 dark:text-zinc-400">{featured.excerpt}</p>
              <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container font-bold text-primary">
                    {featured.author
                      ? featured.author
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")
                      : "TB"}
                  </div>
                  <div>
                    <p className="text-label-bold text-zinc-900 dark:text-white">{featured.author ?? "Techbckp"}</p>
                    <p className="text-label-sm text-zinc-500">CTO at Techbckp</p>
                  </div>
                </div>
                <span className="text-label-sm text-zinc-500">{featured.readTime}</span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="mb-section-gap">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-headline-md">Latest Articles</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "rounded-full bg-orange-50 px-4 py-2 text-label-bold text-orange-500"
                    : "rounded-full px-4 py-2 text-label-bold text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-white"
                }
                aria-pressed={selectedCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post, i) => (
            <article
              key={post.slug}
              className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all hover:shadow-[0px_8px_30px_rgba(15,10,20,0.08)] dark:bg-zinc-900"
            >
              <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="block">
                <div className="h-56 overflow-hidden">
                  <Image
                    src={imageFor(i + 1)}
                    alt={post.title}
                    width={800}
                    height={500}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-label-sm font-semibold uppercase tracking-wider text-orange-500">
                      {post.category}
                    </span>
                    <span className="text-label-sm text-zinc-400">{post.date}</span>
                  </div>
                  <h4 className="text-headline-md leading-tight text-zinc-900 dark:text-white">{post.title}</h4>
                  <p className="text-body-md line-clamp-3 text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-label-bold text-zinc-900 transition-colors group-hover:text-orange-500 dark:text-white">
                      Read Article{" "}
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden>
                        arrow_forward
                      </span>
                    </span>
                    <span className="text-label-sm text-zinc-400">{post.readTime}</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {rest.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-10 text-center">
            <p className="text-body-md text-tertiary">No articles found in this category yet.</p>
          </div>
        ) : null}
      </section>

      <section className="mb-section-gap relative overflow-hidden rounded-2xl bg-zinc-900 px-8 py-16 text-white">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-orange-500/10 to-transparent" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-12 md:flex-row">
          <div className="max-w-xl">
            <h3 className="text-headline-lg mb-4">Stay Updated</h3>
            <p className="text-body-lg text-zinc-400">
              Get our latest technical insights delivered directly to your inbox once a month. No fluff, just execution-focused advice.
            </p>
          </div>
          <form
            className="flex w-full flex-col gap-3 md:w-auto md:min-w-[320px]"
            action="#"
            method="post"
          >
            <div className="flex gap-2 rounded-lg border border-zinc-700 bg-zinc-800 p-1.5">
              <input
                className="text-body-md flex-grow border-none bg-transparent px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-0"
                placeholder="Enter your email"
                type="email"
              />
              <button
                type="submit"
                className="rounded-md bg-orange-500 px-6 py-2 text-label-bold text-white transition-colors hover:bg-orange-600"
              >
                Subscribe
              </button>
            </div>
            <p className="text-label-sm text-center text-zinc-500">Join 2,500+ founders and engineers.</p>
          </form>
        </div>
      </section>
    </>
  );
}
