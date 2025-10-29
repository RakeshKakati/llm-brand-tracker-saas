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

const comparisons = [
  'kommi-vs-peec-ai',
  'kommi-vs-otterly-ai',
  'kommi-vs-knowatoa-ai',
  'kommi-vs-profound-ai',
  'kommi-vs-rankshift'
];

export async function generateStaticParams() {
  return comparisons.map((slug) => ({
    slug,
  }));
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;

  if (!comparisons.includes(slug)) {
    notFound();
  }

  const filePath = path.join(process.cwd(), 'public', 'blogs', 'comparisons', `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract title from markdown (first h1)
  const titleMatch = content.match(/^# (.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Comparison';

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

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Ready to try kommi?
            </p>
            <div className="flex gap-4">
              <Link href="/auth">
                <Button>Sign Up Free</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Learn More</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

