import fs from 'fs';
import path from 'path';
import Script from 'next/script';

function getParts() {
  const file = path.join(process.cwd(), 'public', 'portfolio.html');
  const html = fs.readFileSync(file, 'utf8');

  // Collect ALL <link> and <style> tags from anywhere in the document (head styling).
  const links = html.match(/<link[^>]*>/g) || [];
  const styles = html.match(/<style[^>]*>[\s\S]*?<\/style>/g) || [];
  const headHtml = links.join('\n') + '\n' + styles.join('\n');

  // Body inner markup (everything inside <body>), minus scripts.
  const bodyInner = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/) || [, ''])[1];
  const bodyNoScripts = bodyInner.replace(/<script[\s\S]*?<\/script>/g, '');

  // Any markup that sits between </head> and <body> (excluding style/link/script).
  const between = (html.match(/<\/head>([\s\S]*?)<body[^>]*>/) || [, ''])[1]
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<link[^>]*>/g, '')
    .replace(/<script[\s\S]*?<\/script>/g, '');

  // Scripts from the whole document body region.
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
  const scripts = scriptMatches
    .map((s) => s.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''))
    .join('\n');

  return { headHtml, bodyHtml: between + bodyNoScripts, scripts };
}

export default function Home() {
  const { headHtml, bodyHtml, scripts } = getParts();
  return (
    <>
      <head dangerouslySetInnerHTML={{ __html: headHtml }} />
      <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script id="portfolio-js" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: scripts }} />
    </>
  );
}
