const state = {
  catalog: null,
  selectedSkill: null,
  selectedFile: null,
  fileView: "preview",
};

const elements = {
  health: document.querySelector("#health"),
  search: document.querySelector("#search"),
  showEmpty: document.querySelector("#show-empty"),
  navigationCount: document.querySelector("#navigation-count"),
  skillNavigation: document.querySelector("#skill-navigation"),
  detail: document.querySelector("#detail"),
  refresh: document.querySelector("#refresh"),
};

elements.search.addEventListener("input", renderNavigation);
elements.showEmpty.addEventListener("change", renderNavigation);
elements.refresh.addEventListener("click", () => void loadCatalog());
window.addEventListener("hashchange", () => void applyHash());

void loadCatalog();

async function loadCatalog() {
  elements.refresh.disabled = true;
  try {
    state.catalog = await fetchJson("/api/catalog");
    renderHealth();
    renderNavigation();
    await applyHash();
  } catch (error) {
    elements.health.replaceChildren(message("error", `Cannot load catalog: ${error.message}`));
  } finally {
    elements.refresh.disabled = false;
  }
}

function renderHealth() {
  const { summary, diagnostics } = state.catalog;
  const summaryNode = document.createElement("p");
  summaryNode.className = "summary-line";
  summaryNode.textContent = `${summary.arsu_skills} ARSU · ${summary.companion_skills} Companion · ${summary.plugin_skills} plugin Skills · ${summary.available_domains}/${summary.domains} available domains`;
  const nodes = [summaryNode];
  for (const diagnostic of diagnostics) {
    nodes.push(message(diagnostic.severity, `${diagnostic.source} · ${diagnostic.code}: ${diagnostic.message}`));
  }
  elements.health.replaceChildren(...nodes);
}

function renderNavigation() {
  if (!state.catalog) return;
  const query = elements.search.value.trim().toLowerCase();
  const skillsById = new Map(state.catalog.skills.map((skill) => [skill.skill_id, skill]));
  const branches = [];
  let visibleEntries = 0;

  for (const definition of [{ family: "arsu", label: "ARSU" }, { family: "companion", label: "Companion" }]) {
    const allSkills = state.catalog.skills.filter((skill) => skill.family === definition.family);
    const familyMatches = matchesText(query, definition.label, definition.family);
    const visibleSkills = familyMatches ? allSkills : allSkills.filter((skill) => matchesSkill(skill, query));
    if (query && visibleSkills.length === 0) continue;
    visibleEntries += visibleSkills.length;
    branches.push(familyBranch(definition.label, definition.family, allSkills.length, visibleSkills, Boolean(query)));
  }

  const pluginBranch = buildPluginBranch(query, skillsById);
  if (pluginBranch) {
    visibleEntries += pluginBranch.visibleEntries;
    branches.push(pluginBranch.node);
  }
  elements.navigationCount.textContent = query ? `${visibleEntries} matching entries` : "Browse by family and domain";
  elements.skillNavigation.replaceChildren(...branches);
}

function familyBranch(label, family, total, skills, searchActive) {
  const branch = detailsNode("family-branch");
  branch.open = searchActive || state.selectedSkill?.family === family;
  branch.append(summaryNode(label, total));
  const list = document.createElement("div");
  list.className = "tree-list";
  for (const skill of skills) list.append(skillButton(skill));
  branch.append(list);
  return branch;
}

function buildPluginBranch(query, skillsById) {
  const domains = state.catalog.domains.filter((domain) => elements.showEmpty.checked || domain.available);
  const pluginMatches = matchesText(query, "plugin");
  const domainNodes = [];
  let visibleEntries = 0;
  for (const domain of domains) {
    const directSkills = domain.direct_skill_ids.flatMap((id) => skillsById.get(id) ?? []);
    const directIds = new Set(domain.direct_skill_ids);
    const dependencySkills = domain.resolved_skill_ids.filter((id) => !directIds.has(id)).flatMap((id) => skillsById.get(id) ?? []);
    const domainMatches = pluginMatches || matchesText(query, domain.domain_id, domain.title, domain.description);
    const visibleDirect = domainMatches ? directSkills : directSkills.filter((skill) => matchesSkill(skill, query));
    const visibleDependencies = domainMatches ? dependencySkills : dependencySkills.filter((skill) => matchesSkill(skill, query));
    if (query && !domainMatches && visibleDirect.length === 0 && visibleDependencies.length === 0) continue;
    visibleEntries += visibleDirect.length + visibleDependencies.length;
    domainNodes.push(domainBranch(domain, visibleDirect, visibleDependencies, Boolean(query)));
  }
  if (query && domainNodes.length === 0 && !pluginMatches) return null;

  const branch = detailsNode("family-branch plugin-branch");
  branch.open = Boolean(query) || state.selectedSkill?.family === "plugin";
  branch.append(summaryNode("Plugin", domains.filter((domain) => domain.available).length));
  const list = document.createElement("div");
  list.className = "domain-list";
  if (domainNodes.length) list.append(...domainNodes);
  else list.append(emptyTreeMessage("No matching domains."));
  branch.append(list);
  return { node: branch, visibleEntries };
}

function domainBranch(domain, directSkills, dependencySkills, searchActive) {
  const branch = detailsNode("domain-branch");
  const selected = state.selectedSkill && domain.resolved_skill_ids.includes(state.selectedSkill.skill_id);
  branch.open = searchActive || Boolean(selected);
  branch.append(summaryNode(domain.title, domain.resolved_skill_ids.length, domain.domain_id));
  const content = document.createElement("div");
  content.className = "domain-content";
  if (!domain.available) {
    content.append(emptyTreeMessage("No reviewed Skills are currently available."));
  } else {
    content.append(skillGroup("Direct Skills", directSkills));
    if (dependencySkills.length) content.append(skillGroup("Dependencies", dependencySkills));
  }
  branch.append(content);
  return branch;
}

function skillGroup(label, skills) {
  const group = document.createElement("section");
  group.className = "skill-group";
  const heading = document.createElement("h3");
  heading.textContent = `${label} (${skills.length})`;
  group.append(heading);
  if (skills.length) {
    const list = document.createElement("div");
    list.className = "tree-list";
    for (const skill of skills) list.append(skillButton(skill));
    group.append(list);
  } else group.append(emptyTreeMessage("No matches in this group."));
  return group;
}

function skillButton(skill) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `skill-link${state.selectedSkill?.skill_id === skill.skill_id ? " active" : ""}`;
  button.innerHTML = `<strong>${escapeHtml(skill.title)}</strong><span>${escapeHtml(skill.skill_id)}</span>`;
  button.addEventListener("click", () => { window.location.hash = `#/skills/${encodeURIComponent(skill.skill_id)}`; });
  return button;
}

async function applyHash() {
  if (!state.catalog) return;
  const segments = parseHash();
  if (segments[0] !== "skills" || !segments[1]) return;
  const skillId = segments[1];
  const filePath = segments[2] === "files" ? segments.slice(3).join("/") : null;
  try {
    state.selectedSkill = await fetchJson(`/api/skills/${encodeURIComponent(skillId)}`);
    state.selectedFile = null;
    state.fileView = "preview";
    renderNavigation();
    renderSkillWorkspace();
    const defaultPath = filePath || state.selectedSkill.files.find((file) => file.path === "SKILL.md")?.path || state.selectedSkill.files[0]?.path;
    if (defaultPath) await openFile(defaultPath, false);
  } catch (error) {
    elements.detail.replaceChildren(message("error", error.message));
  }
}

function renderSkillWorkspace() {
  const skill = state.selectedSkill;
  const header = document.createElement("header");
  header.className = "skill-header";
  header.innerHTML = `<p class="eyebrow">${escapeHtml(skill.family)}</p><h2>${escapeHtml(skill.title)}</h2><code>${escapeHtml(skill.skill_id)}</code><p>${escapeHtml(skill.description)}</p>`;

  const metadataPanel = document.createElement("details");
  metadataPanel.className = "metadata-panel";
  const metadataSummary = document.createElement("summary");
  metadataSummary.textContent = "Skill metadata";
  const metadata = document.createElement("dl");
  metadata.className = "metadata";
  addDefinition(metadata, "License", skill.license || "Not declared");
  addDefinition(metadata, "Vendor", skill.vendor ? `${skill.vendor.name} ${skill.vendor.release}` : "ResearchSpec base surface");
  addDefinition(metadata, "Dependencies", skill.dependencies.length ? skill.dependencies.join(", ") : "None");
  addDefinition(metadata, "Direct domains", skill.direct_domain_ids.length ? skill.direct_domain_ids.join(", ") : "None");
  const dependencyOnly = skill.resolved_domain_ids.filter((id) => !skill.direct_domain_ids.includes(id));
  addDefinition(metadata, "Dependency-only domains", dependencyOnly.length ? dependencyOnly.join(", ") : "None");
  metadataPanel.append(metadataSummary, metadata);

  const workspace = document.createElement("section");
  workspace.className = "skill-workspace";
  const explorer = document.createElement("aside");
  explorer.className = "file-explorer";
  const explorerHeading = document.createElement("h3");
  explorerHeading.textContent = `Files (${skill.files.length})`;
  const fileTree = document.createElement("nav");
  fileTree.id = "file-tree";
  fileTree.className = "nested-file-tree";
  fileTree.setAttribute("aria-label", `${skill.title} files`);
  explorer.append(explorerHeading, fileTree);

  const preview = document.createElement("section");
  preview.id = "file-preview";
  preview.className = "file-preview empty-state";
  preview.innerHTML = "<p>Select a file to inspect its current contents.</p>";
  workspace.append(explorer, preview);
  elements.detail.replaceChildren(header, metadataPanel, workspace);
  renderFileTree();
}

function renderFileTree() {
  const container = document.querySelector("#file-tree");
  if (!container || !state.selectedSkill) return;
  container.replaceChildren(...state.selectedSkill.file_tree.map((node) => renderFileTreeNode(node)));
}

function renderFileTreeNode(node) {
  if (node.node_type === "file") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `file-link${state.selectedFile?.path === node.path ? " active" : ""}`;
    button.innerHTML = `<span>${escapeHtml(node.name)}</span><small>${formatBytes(node.size)}</small>`;
    button.addEventListener("click", () => { window.location.hash = `#/skills/${encodeURIComponent(state.selectedSkill.skill_id)}/files/${encodePath(node.path)}`; });
    return button;
  }
  const directory = detailsNode("directory-node");
  directory.open = Boolean(state.selectedFile?.path.startsWith(`${node.path}/`));
  directory.append(summaryNode(node.name, countFileLeaves(node.children)));
  const children = document.createElement("div");
  children.className = "directory-children";
  children.append(...node.children.map((child) => renderFileTreeNode(child)));
  directory.append(children);
  return directory;
}

async function openFile(filePath, updateHash = true) {
  if (!state.selectedSkill) return;
  if (updateHash) window.location.hash = `#/skills/${encodeURIComponent(state.selectedSkill.skill_id)}/files/${encodePath(filePath)}`;
  const data = await fetchJson(`/api/skills/${encodeURIComponent(state.selectedSkill.skill_id)}/files/${encodePath(filePath)}`);
  state.selectedFile = data;
  state.fileView = "preview";
  renderFileTree();
  renderFile();
}

function renderFile() {
  const file = state.selectedFile;
  const container = document.querySelector("#file-preview");
  if (!file || !container) return;
  container.className = "file-preview";
  const header = document.createElement("div");
  header.className = "file-header";
  header.innerHTML = `<div><h3>${escapeHtml(file.path)}</h3><p class="muted">${escapeHtml(file.kind)} · ${formatBytes(file.size)}</p></div>`;
  const actions = document.createElement("div");
  actions.className = "file-actions";
  if (file.kind === "markdown" && file.source !== null) {
    actions.append(viewButton("Preview", "preview"), viewButton("Source", "source"));
  }
  const download = document.createElement("a");
  download.href = file.raw_url;
  download.textContent = file.kind === "image" ? "Open raw" : "Download raw";
  actions.append(download);
  header.append(actions);

  const body = document.createElement("div");
  body.className = "file-body";
  if (file.kind === "image") {
    const image = document.createElement("img");
    image.src = file.raw_url;
    image.alt = file.path;
    body.append(image);
  } else if (file.source === null) {
    body.append(message("info", file.preview_truncated ? "Preview omitted because this file exceeds 1 MiB." : "Binary files are not executed or embedded by the harness."));
  } else if (file.kind === "markdown" && state.fileView === "preview") {
    body.classList.add("markdown");
    body.innerHTML = file.rendered_html;
  } else {
    const source = document.createElement("pre");
    source.textContent = file.source;
    body.append(source);
  }
  container.replaceChildren(header, body);
}

function viewButton(label, view) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = state.fileView === view ? "active" : "secondary";
  button.textContent = label;
  button.addEventListener("click", () => { state.fileView = view; renderFile(); });
  return button;
}

function detailsNode(className) {
  const node = document.createElement("details");
  node.className = className;
  return node;
}

function summaryNode(label, count, subtitle) {
  const summary = document.createElement("summary");
  const text = document.createElement("span");
  text.innerHTML = `<strong>${escapeHtml(label)}</strong>${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}`;
  const badge = document.createElement("span");
  badge.className = "count-badge";
  badge.textContent = String(count);
  summary.append(text, badge);
  return summary;
}

function emptyTreeMessage(text) {
  const node = document.createElement("p");
  node.className = "tree-empty muted";
  node.textContent = text;
  return node;
}

function addDefinition(list, term, description) {
  const dt = document.createElement("dt");
  dt.textContent = term;
  const dd = document.createElement("dd");
  dd.textContent = description;
  list.append(dt, dd);
}

function message(severity, text) {
  const node = document.createElement("p");
  node.className = `notice ${severity}`;
  node.textContent = text;
  return node;
}

function matchesSkill(skill, query) {
  if (!query) return true;
  return matchesText(query, skill.skill_id, skill.title, skill.description, skill.vendor?.name, ...skill.direct_domain_ids, ...skill.resolved_domain_ids);
}

function matchesText(query, ...values) {
  if (!query) return true;
  return values.filter(Boolean).join(" ").toLowerCase().includes(query);
}

function countFileLeaves(nodes) {
  return nodes.reduce((count, node) => count + (node.node_type === "file" ? 1 : countFileLeaves(node.children)), 0);
}

function parseHash() {
  try { return window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent); }
  catch { return []; }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || `Request failed with ${response.status}`);
  return body;
}

function encodePath(value) { return value.split("/").map(encodeURIComponent).join("/"); }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character]); }
function formatBytes(value) { return value < 1024 ? `${value} B` : value < 1024 * 1024 ? `${(value / 1024).toFixed(1)} KiB` : `${(value / 1024 / 1024).toFixed(1)} MiB`; }
