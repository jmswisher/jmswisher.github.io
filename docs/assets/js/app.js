async function loadJSON(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
}

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function safeTags(csvValue) {
  if (!csvValue) return [];
  return String(csvValue)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function button(href, label, secondary = false) {
  const a = document.createElement("a");
  a.href = href;
  a.textContent = label;
  a.className = secondary ? "button secondary" : "button";
  if (/^https?:\/\//i.test(href)) {
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }
  return a;
}

function makeTagRow(tags) {
  const row = el("div", "tag-row");
  tags.forEach(tag => row.appendChild(el("span", "tag", tag)));
  return row;
}

function isPublished(record) {
  return String(record.publish || "Y").toUpperCase() !== "N";
}

function byId(items, key) {
  return new Map(items.map(item => [item[key], item]));
}

function pickSelectionsForPosition(selections, positionId) {
  return selections
    .filter(sel => isPublished(sel) && sel.position_id === positionId)
    .sort((a, b) => Number(a.priority_rank || 999) - Number(b.priority_rank || 999));
}

function renderObjectCard(object, customFitNote = "", customLabel = "") {
  const article = el("article", "project");

  const media = el("div", "media");
  const img = document.createElement("img");
  img.className = "preview";
  img.src = object.image_path || "assets/images/placeholder-project.png";
  img.alt = object.title || "Portfolio object preview";
  img.onerror = () => { img.style.display = "none"; };
  media.appendChild(img);

  const body = el("div", "");
  body.appendChild(el("h3", "", customLabel || object.title || "Untitled object"));

  if (object.summary) {
    body.appendChild(el("p", "", object.summary));
  }

  const meta = [];
  if (object.doc_type) meta.push(object.doc_type);
  if (object.audience) meta.push(object.audience);
  if (object.source_position) meta.push(object.source_position);

  if (meta.length) {
    body.appendChild(el("p", "muted", meta.join(" • ")));
  }

  const fitNote = customFitNote || object.position_fit_note || "";
  if (fitNote) {
    body.appendChild(el("p", "muted", fitNote));
  }

  body.appendChild(makeTagRow(safeTags(object.skills_csv)));

  const links = el("div", "project-links");
  if (object.pdf_path) links.appendChild(button(object.pdf_path, "PDF", true));
  if (object.live_url) links.appendChild(button(object.live_url, "Live page", true));
  if (object.archive_url) links.appendChild(button(object.archive_url, "Archived page", true));

  if (links.childElementCount) {
    body.appendChild(links);
  }

  media.appendChild(body);
  article.appendChild(media);

  return article;
}

async function renderHome() {
  const [site, positions, objects] = await Promise.all([
    loadJSON("data/site.json"),
    loadJSON("data/positions.json"),
    loadJSON("data/objects.json")
  ]);

  document.getElementById("site-title").textContent =
    site.site_title || "Janet Portfolio";
  document.getElementById("site-tagline").textContent =
    site.site_tagline || "";

  const positionGrid = document.getElementById("position-grid");
  positions.filter(isPublished).forEach(emp => {
    const card = el("article", "card");
    card.appendChild(el("h3", "", emp.position_name));
    card.appendChild(el("p", "muted", emp.target_role || ""));
    card.appendChild(el("p", "", emp.headline || ""));
    card.appendChild(
      button(`position.html?slug=${encodeURIComponent(emp.page_slug)}`, "Open page")
    );
    positionGrid.appendChild(card);
  });

  const objectGrid = document.getElementById("project-grid");
  objects.filter(isPublished).forEach(object => {
    const card = el("article", "card");
    card.appendChild(el("h3", "", object.title));
    card.appendChild(el("p", "", object.summary || ""));
    card.appendChild(makeTagRow(safeTags(object.skills_csv)));

    const links = el("div", "project-links");
    if (object.pdf_path) links.appendChild(button(object.pdf_path, "PDF", true));
    if (object.live_url) links.appendChild(button(object.live_url, "Live page", true));
    if (object.archive_url) links.appendChild(button(object.archive_url, "Archived page", true));
    if (links.childElementCount) card.appendChild(links);

    objectGrid.appendChild(card);
  });
}

async function renderPosition() {
  const [site, positions, objects, selections] = await Promise.all([
    loadJSON("data/site.json"),
    loadJSON("data/positions.json"),
    loadJSON("data/objects.json"),
    loadJSON("data/selections.json")
  ]);

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  const position = positions.find(e => e.page_slug === slug && isPublished(e)) || positions.find(isPublished);
  if (!position) return;

  document.title = `${position.position_name} | ${site.site_title || "Janet Portfolio"}`;
  document.getElementById("role-label").textContent = position.target_role || "Target role";
  document.getElementById("position-title").textContent = position.position_name || "Position page";
  document.getElementById("position-headline").textContent = position.headline || "";
  document.getElementById("position-summary").textContent = position.summary || "";

  const ctaWrap = document.getElementById("cta-wrap");
  if (position.cta_label && position.cta_url) {
    ctaWrap.appendChild(button(position.cta_url, position.cta_label));
  }
  if (position.resume_pdf_path) {
    ctaWrap.appendChild(button(position.resume_pdf_path, "Resume PDF", true));
  }

  const objectMap = byId(objects.filter(isPublished), "object_id");
  const featuredWrap = document.getElementById("featured-projects");

  const selected = pickSelectionsForPosition(selections, position.position_id);

  selected.forEach(sel => {
    const object = objectMap.get(sel.object_id);
    if (!object) return;
    featuredWrap.appendChild(
      renderObjectCard(object, sel.custom_fit_note || "", sel.custom_label || "")
    );
  });

  if (!selected.length) {
    featuredWrap.appendChild(
      el("p", "muted", "No featured objects have been selected for this position yet.")
    );
  }
}

const page = document.body.dataset.page;
if (page === "home") renderHome().catch(console.error);
if (page === "position") renderPosition().catch(console.error);
