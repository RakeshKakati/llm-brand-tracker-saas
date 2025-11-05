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

// Allowlist of blog slugs - includes all blog markdown files
const posts = [
  'ai-advertising', 'ai-analyse', 'ai-analysis', 'ai-analytical', 'ai-analytics', 'ai-analytics-tools',
  'ai-and-analytics', 'ai-and-data', 'ai-and-data-analytics', 'ai-and-marketing', 'ai-and-sales',
  'ai-based-search-engine', 'ai-based-search-engines', 'ai-best-tools', 'ai-chatbot-google', 'ai-data',
  'ai-data-analyst', 'ai-data-analytics', 'ai-driven-marketing', 'ai-email-marketing', 'ai-for-advertising',
  'ai-for-analytics', 'ai-for-data-analysis', 'ai-for-data-analytics', 'ai-for-email-marketing', 'ai-for-marketing',
  'ai-for-sales', 'ai-for-sales-and-marketing', 'ai-for-search', 'ai-google-search', 'ai-in-google-search',
  'ai-in-marketing-automation', 'ai-in-sales-and-marketing', 'ai-in-search-engines', 'ai-internet-search',
  'ai-literature-search', 'ai-marketing-automation', 'ai-marketing-tools', 'ai-optimisation', 'ai-optimization',
  'ai-reporting', 'ai-reviews', 'ai-sales-tools', 'ai-search', 'ai-search-engine', 'ai-search-engine-free',
  'ai-search-engine-gpt', 'ai-search-google', 'ai-search-tools', 'ai-searches', 'ai-setting',
  'ai-tool-for-digital-marketing', 'ai-tool-search', 'ai-tools-for-business', 'ai-tools-for-data-analysis',
  'ai-tools-for-digital-marketing', 'ai-tools-for-marketing', 'ai-tools-google', 'ai-tools-websites',
  'ai-web-search', 'ai-website-search', 'al-search', 'algolia-ai', 'analysis-ai', 'analytics-marketing',
  'analytics-tools-marketing', 'artificial-intelligence-google', 'artificial-intelligence-google-search',
  'artificial-intelligence-search', 'artificial-intelligence-search-engine', 'baidu-ai',
  'baidu-artificial-intelligence', 'best-ai-marketing-tools', 'best-ai-platforms', 'best-ai-search',
  'best-ai-search-engine', 'best-ai-seo-tools', 'best-ai-software', 'best-ai-tool-for-digital-marketing',
  'best-ai-tools', 'best-ai-tools-for-business', 'best-ai-tools-for-digital-marketing', 'best-ai-tools-for-marketing',
  'bing-ai', 'bing-ai-chat', 'bing-ai-chatbot', 'bing-and-chatgpt', 'bing-by-microsoft', 'bing-chat-gpt',
  'bing-chatgpt', 'bing-gpt', 'bing-openai', 'bing-with-chat-gpt', 'blind-search-in-ai', 'booster-ai',
  'business-ai-tools', 'character-ai-search', 'chat-gpt-bing', 'chat-gpt-for-search-engines',
  'chat-gpt-image-search', 'chatbot-bing', 'chatbot-for-google', 'chatbot-google', 'chatbot-google-ai',
  'chatgpt-bing', 'chatgpt-google', 'chatgpt-google-alternative', 'chatgpt-google-search', 'chatgpt-like',
  'content-ai', 'contents-ai', 'conversions-ai', 'customer-insights-ai', 'data-analysis-ai',
  'data-analysis-site', 'data-analyst-ai', 'data-analytics-and-ai', 'data-analytics-with-ai',
  'different-ai-platforms', 'digital-marketing-ai', 'digital-marketing-ai-tools', 'digital-marketing-and-ai',
  'elasticsearch-ai', 'exhaustive-search-in-ai', 'free-ai-search', 'free-ai-search-engine',
  'free-ai-tools-for-marketing', 'generative-ai-google', 'generative-ai-in-marketing', 'generative-ai-search',
  'generative-search', 'get-answer', 'google-ai-chat', 'google-ai-chat-gpt', 'google-ai-chats', 'google-ai-engine',
  'google-ai-image-search', 'google-ai-search', 'google-ai-search-engine', 'google-ai-tools', 'google-bert-ai',
  'google-chatgpt', 'google-chatgpt-alternative', 'google-generative-ai', 'google-search-ai', 'gpt-search-engine',
  'heuristic-artificial-intelligence', 'hypothesis-space-search-in-machine-learning',
  'informed-search-in-artificial-intelligence', 'insider-ai', 'latest-ai-tools', 'manage-ai', 'marketing-ai',
  'marketing-ai-tool', 'marketing-ai-tools', 'marketing-analysis-tools', 'marketing-tools-for-business',
  'marketing-with-ai', 'microsoft-ai-search', 'microsoft-ai-search-engine', 'microsoft-and-bing',
  'microsoft-bing-ai', 'microsoft-bing-available-in', 'microsoft-bing-browser', 'microsoft-bing-chat',
  'microsoft-bing-chatbot', 'microsoft-edge-bing', 'minimax-ai', 'minimax-search-in-ai', 'most-popular-ai-tools',
  'most-powerful-ai-tool', 'most-powerful-ai-tools', 'new-ai-tools', 'newest-ai-tools', 'open-ai-bing',
  'open-ai-search', 'open-ai-search-engine', 'openai-engine', 'openai-search', 'openai-search-engine',
  'peak-ai', 'powerful-ai-tools', 'sales-ai-tools', 'search-for-ai', 'search-space-in-ai', 'search-with-ai',
  'searching-for-solution-in-ai', 'space-search-in-ai', 'tools-for-ai', 'tools-marketing', 'top-5-ai-tools',
  'top-ai-platforms', 'top-ai-tool', 'top-ai-tools', 'trending-ai-tools', 'use-of-ai-in-marketing',
  'web-search-ai', 'yandex-ai', 'you-ai-search-engine',
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


