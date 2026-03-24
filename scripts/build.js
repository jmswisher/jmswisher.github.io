const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, 'docs');
const dataDir = path.join(root, 'data');
const assetsDir = path.join(root, 'assets');

function readJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf8'));
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function toPublishedUrl(value) {
  if (!value) return "";
  if (/^(https?:|mailto:|#)/i.test(value)) return value;
  return "/" + value.replace(/^\/+/, "");
}
function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeTags(csv) {
  if (!csv) return [];
  return String(csv).split(',').map(s => s.trim()).filter(Boolean);
}

function isPublished(record) {
  return String(record.publish || 'Y').toUpperCase() !== 'N';
}

function assetExists(relPath) {
  if (!relPath) return false;
  return fs.existsSync(path.join(root, relPath));
}

function publicAssetHref(relPath, depth = 0) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  return prefix + relPath.replace(/^\/+/, '');
}

function externalLink(href) {
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href);
}

function renderButton(href, label, secondary = false) {
  const attrs = [];
  attrs.push(`href="${escapeHtml(href)}"`);
  if (externalLink(href) && !/^mailto:/i.test(href)) {
    attrs.push('target="_blank" rel="noopener noreferrer"');
  }
  const className = secondary ? 'button secondary' : 'button';
  return `<a class="${className}" ${attrs.join(' ')}>${escapeHtml(label)}</a>`;
}

function renderTagRow(tags) {
  if (!tags.length) return '';
  return `<div class="tag-row">${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function renderLinks(object, depth = 0) {
  const links = [];
  if (assetExists(object.pdf_path)) links.push(renderButton(toPublishedUrl(object.pdf_path, depth), 'PDF', true));
  if (object.live_url) links.push(renderButton(toPublishedUrl(object.live_url, depth), 'Live page', true));
  if (object.archive_url) links.push(renderButton(toPublishedUrl(object.archive_url, depth), 'Archived page', true));
  return links.length ? `<div class="project-links">${links.join('')}</div>` : '';
}

function renderObjectCard(object, options = {}) {
  const { depth = 0, customFitNote = '', customLabel = '' } = options;
  const displayTitle = customLabel || object.title || 'Untitled object';
  const summary = object.summary ? `<p>${escapeHtml(object.summary)}</p>` : '';
  const meta = [object.doc_type, object.audience, object.source_position].filter(Boolean).map(escapeHtml).join(' • ');
  const metaHtml = meta ? `<p class="muted">${meta}</p>` : '';
  const fitNote = customFitNote || object.position_fit_note || '';
  const fitNoteHtml = fitNote ? `<p class="muted">${escapeHtml(fitNote)}</p>` : '';
  const imgUrl = toPublishedUrl(object.image_path);
  const imgHtml = assetExists(object.image_path)
    ? `<img class="preview" src="${escapeHtml(publicAssetHref(imgUrl, depth))}" alt="${escapeHtml(object.title || 'Portfolio object preview')}" />`
    : '';

  return `
    <article class="project">
      <div class="media${imgHtml ? '' : ' media-no-image'}">
        ${imgHtml}
        <div>
          <h3>${escapeHtml(displayTitle)}</h3>
          ${summary}
          ${metaHtml}
          ${fitNoteHtml}
          ${renderTagRow(safeTags(object.skills_csv))}
          ${renderLinks(object, depth)}
        </div>
      </div>
    </article>`;
}

function pageShell({ title, bodyClass = '', depth = 0, content }) {
  const cssHref = publicAssetHref('assets/css/styles.css', depth);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${escapeHtml(cssHref)}" />
</head>
<body${bodyClass ? ` class="${escapeHtml(bodyClass)}"` : ''}>
${content}
</body>
</html>`;
}

function renderHomePage(site, positions, objects) {
  const positionCards = positions.map(position => {
    const href = `positions/${encodeURIComponent(position.page_slug)}.html`;
    return `
      <article class="card">
        <h3>${escapeHtml(position.public_label || position.position_name)}</h3>
        <p class="muted">${escapeHtml(position.target_role || '')}</p>
        <p>${escapeHtml(position.headline || '')}</p>
        ${renderButton(href, 'Open page')}
      </article>`;
  }).join('');

  const projectCards = objects.map(object => `
      <article class="card">
        <h3>${escapeHtml(object.title || 'Untitled object')}</h3>
        <p>${escapeHtml(object.summary || '')}</p>
        ${renderTagRow(safeTags(object.skills_csv))}
        ${renderLinks(object, 0)}
      </article>`).join('');

  return pageShell({
    title: site.site_title || "Janet Swisher's Portfolio",
    content: `
  <header class="site-header">
    <div class="wrap">
      <p class="eyebrow">Portfolio hub</p>
      <h1>${escapeHtml(site.site_title || "Janet Swisher's Portfolio")}</h1>
      <p class="lede">${escapeHtml(site.site_tagline || '')}</p>
    </div>
  </header>

  <main class="wrap">
    <section class="panel">
      <h2>Available position-specific pages</h2>
      <p class="muted">Each card below links to a generated landing page.</p>
      <div class="card-grid">${positionCards}</div>
    </section>

    <section class="panel">
      <h2>Core work samples</h2>
      <div class="card-grid">${projectCards}</div>
    </section>
  </main>`
  });
}

function renderPositionPage(site, position, objectsForPosition, depth = 1) {
  const ctas = [];
  const fallbackEmail = site.contact_email ? `mailto:${site.contact_email}` : '';
  const ctaUrl = position.cta_url && position.cta_url !== 'mailto:janet@example.com' ? position.cta_url : fallbackEmail;
  if (position.cta_label && ctaUrl) ctas.push(renderButton(ctaUrl, position.cta_label));
  if (assetExists(position.resume_pdf_path)) ctas.push(renderButton(toPublishedUrl(position.resume_pdf_path, depth), 'Resume PDF', true));

  const featuredMarkup = objectsForPosition.length
    ? objectsForPosition.map(item => renderObjectCard(item.object, {
        depth,
        customFitNote: item.selection.custom_fit_note || '',
        customLabel: item.selection.custom_label || ''
      })).join('')
    : '<p class="muted">No featured objects have been selected for this position yet.</p>';

  return pageShell({
    title: `${position.position_title} | ${site.site_title || "Janet Swisher's Portfolio"}`,
    depth,
    content: `
  <header class="site-header">
    <div class="wrap">
      <a class="back-link" href="../index.html">← Back to portfolio hub</a>
      <p class="eyebrow">${escapeHtml(position.target_role || 'Role')}</p>
      <h1>${escapeHtml(position.position_title || 'Position page')}</h1>
      <p class="lede">${escapeHtml(position.headline || '')}</p>
      <p class="summary">${escapeHtml(position.summary || '')}</p>
      ${ctas.length ? `<div class="cta-wrap">${ctas.join('')}</div>` : ''}
    </div>
  </header>

  <main class="wrap">
    <section class="panel">
      <h2>Featured work</h2>
      <div class="stack">${featuredMarkup}</div>
    </section>
  </main>`
  });
}

function main() {
  const site = readJSON('data/site.json');
  const positions = readJSON('data/positions.json').filter(isPublished);
  const objects = readJSON('data/objects.json').filter(isPublished);
  const selections = readJSON('data/selections.json').filter(isPublished);

  const objectMap = new Map(objects.map(object => [object.object_id, object]));

  cleanDir(outDir);
  ensureDir(path.join(outDir, 'positions'));
  copyDir(assetsDir, path.join(outDir, 'assets'));
  copyDir(dataDir, path.join(outDir, 'data'));
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  fs.writeFileSync(path.join(outDir, 'index.html'), renderHomePage(site, positions, objects));

  for (const position of positions) {
    const selected = selections
      .filter(sel => sel.position_id === position.position_id)
      .sort((a, b) => Number(a.priority_rank || 999) - Number(b.priority_rank || 999))
      .map(selection => ({ selection, object: objectMap.get(selection.object_id) }))
      .filter(item => item.object);

    const outputPath = path.join(outDir, 'positions', `${position.page_slug}.html`);
    fs.writeFileSync(outputPath, renderPositionPage(site, position, selected));
  }

  console.log(`Built ${positions.length} position page(s) into ${outDir}`);
}

main();
