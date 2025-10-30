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

export async function generateStaticParams() {
  const blogsDir = path.join(process.cwd(), 'public', 'blogs');
  if (!fs.existsSync(blogsDir)) return [];
  const files = fs.readdirSync(blogsDir).filter((f) => f.endsWith('.md'));
  return files.map((file) => ({ slug: file.replace(/\.md$/, '') }));
}

export default async function BlogPage({ params }: PageProps) {
  const { slug } = await params;

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


