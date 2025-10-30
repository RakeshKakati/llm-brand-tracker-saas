import type { MetadataRoute } from "next";
import fs from "fs";
import path from "path";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.kommi.in";
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/auth`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/dashboard`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/teams/accept`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Add comparison blogs if present (static paths under public/blogs/comparisons)
  // These are served via app/blogs/comparisons/[slug]
  const comparisons: string[] = [
    "peec-ai", "otterly-ai", "knowatoa-ai", "profound-ai", "rankshift"
  ];
  comparisons.forEach((slug) => {
    urls.push({
      url: `${baseUrl}/blogs/comparisons/${slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  });

  // Add generic blog posts from public/blogs/*.md served via app/blogs/[slug]
  try {
    const blogsDir = path.join(process.cwd(), "public", "blogs");
    if (fs.existsSync(blogsDir)) {
      const files = fs.readdirSync(blogsDir).filter((f) => f.endsWith(".md"));
      files.forEach((file) => {
        const slug = file.replace(/\.md$/, "");
        urls.push({
          url: `${baseUrl}/blogs/${slug}`,
          lastModified: now,
          changeFrequency: "monthly",
          priority: 0.5,
        });
      });
    }
  } catch (e) {
    // no-op: sitemap should not fail build on fs errors
  }

  return urls;
}


