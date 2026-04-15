const fs = require('fs');
const path = require('path');

const root = process.cwd();
const outDir = path.join(root, 'docs');
const dataDir = path.join(root, 'data');
const assetsDir = path.join(root, 'assets');

/* ----------------------------- filesystem helpers ----------------------------- */

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

function writeText(relPath, content) {
  const absPath = path.join(root, relPath);
  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, content, 'utf8');
}

function assetExists(relPath) {
  if (!relPath) return false;
  return fs.existsSync(path.join(root, relPath));
}

/* --------------------------------- utilities --------------------------------- */

function isPublished(record) {
//  console.log(`Checking publish status for record with ID "${record.sample_id || record.position_id || 'unknown'}":`, record.publish);
  return Boolean(record.publish) !== false;
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

function toPublishedUrl(value) {
  if (!value) return "";
  if (/^(https?:|mailto:|#)/i.test(value)) return value;
  return "/" + value.replace(/^\/+/, "");
}

function publicAssetHref(relPath, depth = 0) {
  const prefix = depth === 0 ? '' : '../'.repeat(depth);
  return prefix + relPath.replace(/^\/+/, '');
}

function displayGroupLabel(key) {
  const labels = {
    featured: "Featured work",
    how_tos: "Instructional Content (How-tos)",
    explanatory: "Explanatory Content",
    reference: "Reference Content",
  };

  if (labels[key]) return labels[key];

  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

function displayGroupOrder(key) {
  const order = {
    featured: 1,
    how_tos: 2,
    conceptual: 3,
    reference: 4,
  };
  return order[key] || 999;
}

function groupItemsByDisplayGroup(items) {
  const groups = new Map();

  for (const item of items) {
    const key = (item.selection.display_group || "featured").trim().toLowerCase();

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }

  return groups;
}

/* --------------------------------- rendering --------------------------------- */

function renderButton(href, label, secondary = false) {
  if (!href || !label) return '';
  const classes = secondary ? 'button secondary' : 'button';
  const isExternal = /^(https?:|mailto:)/i.test(href);
  const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a class="${classes}" href="${escapeHtml(href)}"${attrs}>${escapeHtml(label)}</a>`;
}

function renderTagRow(tags) {
  if (!tags.length) return '';
  return `<div class="tag-row">${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function renderLinks(sample) {
  const links = [];
  if (assetExists(sample.pdf_path)) links.push(renderButton(toPublishedUrl(sample.pdf_path), 'PDF', true));
  if (sample.live_url) links.push(renderButton(toPublishedUrl(sample.live_url), 'Live page', true));
  if (sample.archive_url) links.push(renderButton(toPublishedUrl(sample.archive_url), 'Archived page', true));
  return links.length ? `<div class="project-links">${links.join('')}</div>` : '';
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

function renderHomePage(site, positions, samples) {
  const positionCards = positions.map(position => {
    const href = `positions/${encodeURIComponent(position.page_slug)}.html`;
    return `
      <article class="card">
        <h3>${escapeHtml(position.public_label || position.position_title)}</h3>
        <p class="muted">${escapeHtml(position.target_role || '')}</p>
        <p>${escapeHtml(position.headline || '')}</p>
        ${renderButton(href, 'Open page')}
      </article>`;
  }).join('');

  const projectCards = samples.map(sample => `
      <article class="card">
        <h3>${escapeHtml(sample.title || 'Untitled sample')}</h3>
        <p>${escapeHtml(sample.summary || '')}</p>
        ${renderTagRow(sample.skills)}
        ${renderLinks(sample)}
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

function renderSelectedSampleCard(item, depth = 0) {
  const { sample, selection } = item;

  const title = selection.custom_label || sample.title || '';
  const fitNote = selection.custom_fit_note || sample.position_fit_note || '';
  const summary = sample.summary || '';
  const audience = [sample.audience].filter(Boolean).join(' • ');

  return `
    <article class="project">
      <div class="media">
        <div>
          <h3>${escapeHtml(title)}</h3>
          ${summary ? `<p>${escapeHtml(summary)}</p>` : ''}
          ${audience ? `<p class="audience"><strong>Audience:</strong> ${escapeHtml(audience)}</p>` : ''}
          ${fitNote ? `<p class="muted">${escapeHtml(fitNote)}</p>` : ''}
          ${renderTagRow(sample.skills)}
          ${renderLinks(sample)}
        </div>
      </div>
    </article>
  `;
}

function renderPositionPage(site, position, selectedItems, depth = 1) {
  const ctas = [];
  const fallbackEmail = site.contact_email ? `mailto:${site.contact_email}` : '';
  const ctaUrl =
    position.cta.url && position.cta.url !== 'mailto:swisher@alumni.uchicago.edu'
      ? position.cta.url
      : fallbackEmail;

  if (position.cta.label && ctaUrl) {
    ctas.push(renderButton(ctaUrl, position.cta.label));
  }

  if (assetExists(position.resume_pdf_path)) {
    ctas.push(
      renderButton(
        toPublishedUrl(position.resume_pdf_path),
        'Resume PDF',
        true
      )
    );
  }

  const groupedItems = groupItemsByDisplayGroup(selectedItems);

  let groupedSectionsHtml = '';

  if (groupedItems.size === 0) {
    groupedSectionsHtml = `
      <section class="panel">
        <h2>Selected work</h2>
        <p>No samples have been selected for this position yet.</p>
      </section>
    `;
  } else {
    groupedSectionsHtml = Array.from(groupedItems.entries())
      .map(([groupKey, items]) => {
        const cardsHtml = items
          .map(item => renderSelectedSampleCard(item, depth))
          .join('');

        return `
          <section class="panel">
            <h2>${escapeHtml(displayGroupLabel(groupKey))}</h2>
            <div class="stack">
              ${cardsHtml}
            </div>
          </section>
        `;
      })
      .join('');
  }

  return pageShell({
    title: `${position.position_title || 'Position page'} | ${site.site_title || "Janet Swisher's Portfolio"}`,
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
    ${groupedSectionsHtml}
  </main>`
  });
}

/* ----------------------------------- build ----------------------------------- */

function main() {
  const site = readJSON('data/site.json');
  const positions = readJSON('data/positions.json').filter(isPublished);
  const samples = readJSON('data/samples.json').filter(isPublished);
  const selections = readJSON('data/selections.json').filter(isPublished);

  const sampleMap = new Map(samples.map(obj => [obj.sample_id, obj]));

  cleanDir(outDir);
  ensureDir(path.join(outDir, 'positions'));
  copyDir(assetsDir, path.join(outDir, 'assets'));
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  positions.sort((a, b) => (a.position_sequence || 999) - (b.position_sequence || 999));

  fs.writeFileSync(path.join(outDir, 'index.html'), renderHomePage(site, positions, samples));

  for (const position of positions) {
    console.log(`Building page for position "${position.position_id}" with sequence ${position.position_sequence}...`);
    const selectedItems = selections
      .filter(sel => sel.position_id === position.position_id && isPublished(sel))
      .sort((a, b) => (a.priority_rank || 999) - (b.priority_rank || 999))
      .map(sel => {
        const sample = sampleMap.get(sel.sample_id);
        if (!sample || !isPublished(sample)) return null;
        return { selection: sel, sample };
     })
    .filter(Boolean);
    
    const outputPath = path.join(outDir, 'positions', `${position.page_slug}.html`);
    fs.writeFileSync(outputPath, renderPositionPage(site, position, selectedItems, 1));
  }

  console.log(`Built ${positions.length} position page(s) into ${outDir}`);
}

main();
