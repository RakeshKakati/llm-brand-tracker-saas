/*
  Augments public/blogs/*.md with SEO sections if missing.
  - Inserts TL;DR, Table of Contents, core sections, FAQs, Related reads.
  - Skips files that already contain a TL;DR section.
*/

const fs = require('fs');
const path = require('path');

const blogsDir = path.join(process.cwd(), 'public', 'blogs');

function toTitleCase(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildTemplate(title, slug) {
  return `# ${title}\n\n> TL;DR: ${title} — quick summary of value and when to use it.\n\n## Table of contents\n- What it is\n- Why it matters\n- Tools/Options\n- Implementation/Workflow\n- Comparison table\n- FAQs\n- Related reads\n- Conclusion\n\n## What it is\nBriefly define ${title.toLowerCase()} and when it applies.\n\n## Why it matters\n- Time saved\n- Quality and consistency\n- Integration with existing workflows\n\n## Tools/Options\nList notable tools or approaches, and when to choose which.\n\n## Implementation/Workflow\n1. Define your KPI and scope\n2. Configure tools and guardrails\n3. Pilot vs baseline\n4. Measure and standardize\n\n## Comparison table\n| Option | Strengths | Considerations |\n| --- | --- | --- |\n| Example | Fast and reliable | Requires setup |\n\n## FAQs\n- How do we measure impact? Use a baseline/control, track cost per task and outcomes.\n- How do we keep quality high? Document prompts/playbooks and reviews.\n\n## Related reads\n- [Best AI Tools](/blogs/best-ai-tools)\n- [AI Tools for Business](/blogs/ai-tools-for-business)\n\n## Conclusion\nSummarize when to use ${title.toLowerCase()} and next steps.\n`;
}

function augmentFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf-8');
  if (/TL;DR:/i.test(original)) {
    return false; // already augmented
  }
  const filename = path.basename(filePath);
  const slug = filename.replace(/\.md$/, '');
  const hasH1 = /^#\s+.+/m.test(original);
  const title = hasH1
    ? (original.match(/^#\s+(.+)/m) || [null, toTitleCase(slug)])[1]
    : toTitleCase(slug);

  // Keep existing content after the new template; ensure single leading H1
  const withoutH1 = hasH1 ? original.replace(/^#\s+.+\n?/, '') : `\n${original}`;
  const template = buildTemplate(title, slug);
  const combined = `${template}\n\n---\n\n${withoutH1.trim()}\n`;
  fs.writeFileSync(filePath, combined, 'utf-8');
  return true;
}

function main() {
  if (!fs.existsSync(blogsDir)) {
    console.error('No public/blogs directory found');
    process.exit(1);
  }
  const files = fs.readdirSync(blogsDir).filter((f) => f.endsWith('.md'));
  let changed = 0;
  files.forEach((file) => {
    const filePath = path.join(blogsDir, file);
    const didChange = augmentFile(filePath);
    if (didChange) changed += 1;
  });
  console.log(`Augmented ${changed} files (skipped existing TL;DR).`);
}

main();


