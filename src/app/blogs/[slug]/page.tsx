import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Allowlist of blog slugs, mirroring the comparisons pattern
const posts = [
  'how-to-rank-on-chatgpt-openai-seo-guide',
  'best-ai-tools', 'ai-search', 'ai-searches', 'ai-in-search-engines', 'top-ai-tools', 'top-ai-tool',
  'ai-for-marketing', 'ai-data-analytics', 'ai-and-marketing', 'ai-for-data-analytics', 'data-analysis-ai',
  'ai-for-data-analysis', 'new-ai-tools', 'ai-and-data-analytics', 'data-analytics-and-ai', 'newest-ai-tools',
  'digital-marketing-ai', 'digital-marketing-and-ai', 'analytics-marketing', 'tools-marketing', 'ai-optimization',
  'ai-reviews', 'ai-optimisation', 'ai-tools-for-marketing', 'ai-marketing-tools', 'ai-advertising', 'latest-ai-tools',
  'ai-reporting', 'conversions-ai', 'manage-ai', 'ai-for-sales', 'ai-and-sales', 'content-ai', 'ai-tools-for-data-analysis',
  'ai-analysis', 'ai-analyse', 'contents-ai', 'ai-analytical', 'ai-tools-for-digital-marketing', 'ai-data', 'ai-data-analyst',
  'ai-tool-for-digital-marketing', 'powerful-ai-tools', 'top-5-ai-tools', 'marketing-ai', 'ai-analytics', 'ai-tools-for-business',
  'best-ai-platforms', 'ai-and-data', 'trending-ai-tools', 'best-ai-software', 'peak-ai', 'marketing-analysis-tools',
  'ai-tools-websites', 'analytics-tools-marketing', 'ai-for-analytics', 'data-analyst-ai', 'ai-and-analytics', 'analysis-ai',
  'marketing-ai-tools', 'digital-marketing-ai-tools', 'marketing-ai-tool', 'use-of-ai-in-marketing', 'customer-insights-ai',
  'most-popular-ai-tools', 'get-answer', 'booster-ai', 'ai-setting', 'ai-sales-tools', 'free-ai-tools-for-marketing',
  'sales-ai-tools', 'best-ai-tools-for-business', 'ai-marketing-automation', 'ai-for-sales-and-marketing', 'ai-in-sales-and-marketing',
  'ai-in-marketing-automation', 'al-search', 'ai-email-marketing', 'ai-for-email-marketing', 'insider-ai', 'data-analytics-with-ai',
  'data-analysis-site', 'most-powerful-ai-tools', 'most-powerful-ai-tool', 'best-ai-tools-for-marketing', 'ai-analytics-tools',
  'best-ai-tools-for-digital-marketing', 'marketing-tools-for-business', 'business-ai-tools', 'ai-driven-marketing',
  'best-ai-seo-tools', 'top-ai-platforms', 'best-ai-tool-for-digital-marketing', 'ai-best-tools', 'different-ai-platforms',
  'tools-for-ai',
];

export async function generateStaticParams() {
  return posts.map((slug) => ({ slug }));
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;

  if (!posts.includes(slug)) {
    notFound();
  }

  const filePath = path.join(process.cwd(), 'public', 'blogs', `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Blog';

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
        </div>

        <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-muted-foreground prose-p:leading-7 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-table:w-full prose-th:border prose-th:border-border prose-th:p-4 prose-th:bg-muted prose-td:border prose-td:border-border prose-td:p-4 prose-ul:list-disc prose-ol:list-decimal prose-li:my-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}


