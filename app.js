const IMAGE_SEED_BASE_TIME = Date.now();

const IMAGES = [
  {
    id: "web-frontend",
    name: "web-frontend",
    createdAt: IMAGE_SEED_BASE_TIME - 15 * 60 * 1000,
    lastUpdated: "15 minutes ago",
    os: "RHEL 8",
    target: "AWS",
    status: "ready",
    favorited: true,
    instanceAction: "launch",
    buildInfo: {
      uuid: "d4e8f2a6-3c7b-4d9f-8e1c-5f3a7b9d2e4c",
      architecture: "x86_64",
      sharedWith: "1234567890101",
      ami: "ami-0d52c8df27df8a728",
      region: "us-east-1",
    },
  },
  {
    id: "data-processor",
    name: "data-processor",
    createdAt: IMAGE_SEED_BASE_TIME - 3 * 60 * 60 * 1000,
    lastUpdated: "3 hours ago",
    os: "RHEL 8",
    target: "Azure",
    status: "expired",
    statusBadgeText: "Expires in 6 hours",
    favorited: false,
    instanceAction: "launch",
  },
  {
    id: "notification-service",
    name: "notification-service",
    createdAt: Date.parse("2025-08-25T12:00:00"),
    lastUpdated: "Aug 25, 2025",
    os: "RHEL 9",
    target: "GCP",
    status: "failed",
    favorited: true,
    instanceAction: "launch",
  },
  {
    id: "api-backend",
    name: "api-backend",
    createdAt: Date.parse("2025-08-23T12:00:00"),
    lastUpdated: "Aug 23, 2025",
    os: "RHEL 10",
    target: "Bare metal",
    status: "failed",
    favorited: false,
    instanceAction: "download",
  },
  {
    id: "auth-service",
    name: "auth-service",
    createdAt: Date.parse("2025-08-22T12:00:00"),
    lastUpdated: "Aug 22, 2025",
    os: "RHEL 9",
    target: "AWS",
    status: "ready",
    favorited: false,
    instanceAction: "launch",
    buildInfo: {
      uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      architecture: "x86_64",
      sharedWith: "1234567890101",
      ami: "ami-0abc123def456789",
      region: "us-west-2",
    },
  },
  {
    id: "monitoring-dashboard",
    name: "monitoring-dashboard",
    createdAt: Date.parse("2025-08-16T14:00:00"),
    lastUpdated: "Aug 16, 2025",
    os: "RHEL 8",
    target: "GCP",
    status: "expired",
    favorited: false,
    instanceAction: "launch",
  },
  {
    id: "demo-environment",
    name: "demo-environment",
    createdAt: Date.parse("2025-08-16T10:00:00"),
    lastUpdated: "Aug 16, 2025",
    os: "RHEL 10",
    target: "Oracle",
    status: "ready",
    favorited: true,
    instanceAction: "launch",
    buildInfo: {
      uuid: "d4e8f2a6-3c7b-4d9f-8e1c-5f3a7b9d2e4c",
      architecture: "x86_64",
      sharedWith: "1234567",
      region: "us-phoenix-1",
    },
  },
];

function getTargetImageDetail(img, seed, hex) {
  const id = img.name.replace(/[^a-z0-9-]/gi, "-");
  switch (img.target) {
    case "AWS":
      return {
        label: "AMI",
        value: `ami-0${hex(seed, 8)}df27df8a728`,
      };
    case "Azure":
      return {
        label: "Resource ID",
        value: `/subscriptions/abc123/resourceGroups/${id}/providers/Microsoft.Compute/images/${id}-v1`,
      };
    case "GCP":
      return {
        label: "Image name",
        value: `projects/redhat-image-builder/global/images/${id}`,
      };
    case "Oracle":
      return {
        label: "Image OCID",
        value: `ocid1.image.oc1.phx.aaaaaaaa${hex(seed, 12)}`,
      };
    case "Bare metal":
      return {
        label: "Disk image",
        value: `${id}.qcow2`,
      };
    default:
      return { label: "Image reference", value: id };
  }
}

/** Build metadata for expanded rows (Untitled.pdf — Expanded row). */
function getBuildInfo(img) {
  const seed = img.id.split("").reduce((n, c) => n + c.charCodeAt(0), 0);
  const hex = (n, len) => n.toString(16).padStart(len, "0").slice(-len);
  const regions = {
    AWS: "us-east-1",
    Azure: "eastus",
    GCP: "us-central1",
    Oracle: "us-phoenix-1",
    "Bare metal": "—",
  };

  const image = getTargetImageDetail(img, seed, hex);
  const stored = img.buildInfo || {};

  const info = {
    uuid: stored.uuid || `${hex(seed, 8)}-${hex(seed >> 4, 4)}-4d9f-8e1c-5f3a7b9d2e4`,
    architecture: stored.architecture || "x86_64",
    sharedWith: stored.sharedWith || (seed % 2 === 0 ? "1234567890101" : "1234567"),
    region: stored.region || regions[img.target] || "—",
    imageLabel: image.label,
    imageValue: image.value,
  };

  if (img.target === "AWS" && stored.ami) {
    info.imageValue = stored.ami;
  }

  return info;
}

/** Total item count shown in pagination (matches Untitled.pdf mock data). */
const PAGINATION_DISPLAY_TOTAL = 523;

const PER_PAGE_OPTIONS = [10, 20, 50, 100];

const ISO_CARDS = {
  network: [
    "Red Hat Enterprise Linux 10 Boot ISO",
    "Red Hat Enterprise Linux 9.6 Boot ISO",
    "Red Hat Enterprise Linux 8.10 Boot ISO",
  ],
  offline: [
    "Red Hat Enterprise Linux 10 Binary DVD",
    "Red Hat Enterprise Linux 9.6 Binary DVD",
    "Red Hat Enterprise Linux 8.10 Binary DVD",
  ],
  kvm: [
    "Red Hat Enterprise Linux 10 KVM Guest Image",
    "Red Hat Enterprise Linux 9.6 KVM Guest Image",
    "Red Hat Enterprise Linux 8.10 KVM Guest Image",
  ],
};

/** RHEL download file name for each ISO card title (Build and download RHEL). */
function getIsoFileName(title) {
  const versionMatch = title.match(/Linux (\d+(?:\.\d+)?)/);
  const version = versionMatch
    ? versionMatch[1].includes(".")
      ? versionMatch[1]
      : `${versionMatch[1]}.0`
    : "10.0";

  if (title.includes("Boot ISO")) return `rhel-${version}-x86_64-boot.iso`;
  if (title.includes("Binary DVD")) return `rhel-${version}-x86_64-dvd.iso`;
  if (title.includes("KVM")) return `rhel-${version}-x86_64-kvm.qcow2`;
  return `rhel-${version}-x86_64.iso`;
}

const FILTER_CATEGORIES = [
  {
    id: "name",
    label: "Name",
  },
  {
    id: "target",
    label: "Target environment",
    options: [
      "VMware vSphere (.ova)",
      "VMware vSphere (.vmdk)",
      { separator: true },
      "Amazon Web Services",
      "Google Cloud Platform",
      "Microsoft Azure",
      "Oracle Cloud Infrastructure",
      { separator: true },
      "Virtualization (.qcow2)",
      "Baremetal (.iso)",
      "Windows Subsystem for Linux (.tar.gz)",
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: "ready", label: "Ready" },
      { value: "expired", label: "Expired" },
      { value: "failed", label: "Build failed" },
      { value: "progress", label: "Build in progress" },
      { value: "pending", label: "Build pending" },
    ],
  },
  {
    id: "favorited",
    label: "Favorited",
    options: [
      { value: "yes", label: "Favorited" },
      { value: "no", label: "Unfavorited" },
    ],
  },
  {
    id: "lastUpdated",
    label: "Last updated",
    options: [
      "Within the last 24 hours",
      "More than 1 day ago",
      "More than 7 days ago",
      "More than 15 days ago",
      "More than 30 days ago",
      "Custom",
    ],
  },
  {
    id: "os",
    label: "Operating system",
    options: ["RHEL 10", "RHEL 9", "RHEL 8", "CentOS stream 10", "CentOS stream 9"],
  },
];

const FILTER_INPUT_PLACEHOLDERS = {
  name: "Find by name",
  target: "Filter by target environment",
  status: "Filter by status",
  favorited: "Filter by favorited",
  lastUpdated: "Filter by last seen",
  os: "Filter by operating system",
};

const TARGET_MAP = {
  AWS: "aws",
  Azure: "azure",
  GCP: "gcp",
  Oracle: "oci",
};

const BUILD_IMAGE_TARGET_MAP = {
  AWS: "aws",
  Azure: "azure",
  GCP: "gcp",
  Oracle: "oci",
  "Bare metal": "iso",
};

const BUILD_TARGET_TO_IMAGE_TARGET = {
  aws: "AWS",
  gcp: "GCP",
  azure: "Azure",
  oci: "Oracle",
  "vmware-ova": "VMware vSphere (.ova)",
  "vmware-vmdk": "VMware vSphere (.vmdk)",
  qcow2: "Virtualization (.qcow2)",
  iso: "Bare metal",
  wsl: "WSL",
};

const BUILD_TARGET_PRIORITY = [
  "aws",
  "gcp",
  "azure",
  "oci",
  "vmware-ova",
  "vmware-vmdk",
  "qcow2",
  "iso",
  "wsl",
];

const state = {
  images: [...IMAGES],
  emptyMode: false,
  search: "",
  filters: {},
  selected: new Set(),
  expanded: new Set(),
  page: 1,
  perPage: 20,
  activeFilterCategory: "name",
  filterMenuOpen: false,
  valueFilterMenuOpen: false,
  openKebab: null,
  sortAsc: true,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showToast(msg) {
  const toast = $("#toast");
  $("#toast-text").textContent = msg;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

const STATUS_TOOLTIPS = {
  ready: "Ready to download or launch",
  expired: "Image content is outdated. Rebuild to refresh",
  failed: "Image build failed. Check the logs for more information",
  progress: "Image build is in progress",
  pending: "Image build is pending",
};

const STATUS_BADGE_TOOLTIPS = {
  "Expires in 6 hours": "Image content will expire in 6 hours. Rebuild to refresh",
  "Expires in 7 days": "Image content will expire in 7 days. Rebuild to refresh",
};

/** Build pipeline from screencast2.mp4 */
const BUILD_PIPELINE = [
  { id: "manifest", label: "Generating manifest", tableStatus: "Generating manifest" },
  { id: "content", label: "Preparing content", tableStatus: "Preparing content" },
  {
    id: "building",
    label: "Building image",
    tableStatus: "Building image",
    children: [
      { id: "env", label: "Preparing build environment" },
      { id: "os", label: "Setting up operating system" },
      { id: "disk", label: "Creating disk image" },
      { id: "convert", label: "Converting image" },
    ],
  },
  { id: "upload", label: "Uploading to target", tableStatus: "Uploading to target" },
];

const BUILD_PHASES_FLAT = (() => {
  const flat = [];
  BUILD_PIPELINE.forEach((step) => {
    flat.push({ id: step.id, parentId: null, label: step.label, tableStatus: step.tableStatus });
    (step.children || []).forEach((child) => {
      flat.push({ id: child.id, parentId: step.id, label: child.label, tableStatus: step.tableStatus });
    });
  });
  return flat;
})();

const BUILD_PHASE_MS = 2500;

function statusLabel(status) {
  const map = {
    ready: { text: "Ready", mod: "success", icon: "fa-check-circle" },
    expired: { text: "Expired", mod: "warning", icon: "fa-exclamation-triangle" },
    failed: { text: "Build failed", mod: "danger", icon: "fa-exclamation-circle" },
    progress: { text: "Build in progress", mod: "info", icon: "fa-sync" },
    pending: { text: "Build pending", mod: "custom", icon: "fa-clock" },
  };
  return map[status] || map.pending;
}

function getStatusTooltip(img) {
  if (!img) return "";
  if (img.tooltip) return img.tooltip;
  if (img.statusBadgeText && STATUS_BADGE_TOOLTIPS[img.statusBadgeText]) {
    return STATUS_BADGE_TOOLTIPS[img.statusBadgeText];
  }
  return STATUS_TOOLTIPS[img.status] || STATUS_TOOLTIPS.pending;
}

function renderFavoriteButton(img) {
  const favorited = img.favorited;
  return `<button type="button" class="pf-v6-c-button pf-m-plain pf-m-favorite${favorited ? " pf-m-favorited" : ""}"
    data-favorite="${escapeAttr(img.id)}" aria-label="${favorited ? "Unfavorite" : "Favorite"}">
    <span class="pf-v6-c-button__icon">
      <span class="pf-v6-c-button__icon-favorite"><i class="fas fa-star" aria-hidden="true"></i></span>
      <span class="pf-v6-c-button__icon-favorited"><i class="fas fa-star" aria-hidden="true"></i></span>
    </span>
  </button>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderStatusTooltip(tipText) {
  return `<span class="status-tooltip" role="tooltip">
    <span class="status-tooltip__content">${escapeHtml(tipText)}</span>
    <span class="status-tooltip__arrow" aria-hidden="true"></span>
  </span>`;
}

function renderStatusBadge(status, tooltip, { forFilter = false, img = null, plain = false } = {}) {
  const st = statusLabel(status);
  const displayText = img?.statusBadgeText ?? st.text;
  const tipText = tooltip ?? (img ? getStatusTooltip(img) : STATUS_TOOLTIPS[status] || "");
  const filterClass = forFilter ? " pf-m-status-filter-label" : "";
  const outlineClass = plain ? "" : " pf-m-outline";
  const plainClass = plain && !forFilter ? " table-status-label--plain" : "";
  const spinClass = status === "progress" && !forFilter ? " fa-spin" : "";
  const badge = `<span class="pf-v6-c-label pf-m-${st.mod}${outlineClass}${filterClass}${plainClass}">
    <span class="pf-v6-c-label__content">
      <span class="pf-v6-c-label__icon"><i class="fas ${st.icon}${spinClass}" aria-hidden="true"></i></span>
      <span class="pf-v6-c-label__text">${escapeHtml(displayText)}</span>
    </span>
  </span>`;

  if (forFilter || !tipText) return badge;

  return `<span class="status-label-tooltip-host" tabindex="0" aria-label="${escapeAttr(tipText)}">${badge}${renderStatusTooltip(tipText)}</span>`;
}

function getFlatPhaseIndex(phaseId) {
  return BUILD_PHASES_FLAT.findIndex((p) => p.id === phaseId);
}

function getBuildTableStatus(img) {
  if (!isImageBuilding(img)) return "";
  const idx = img.buildPhaseIndex ?? 0;
  const phase = BUILD_PHASES_FLAT[idx];
  if (!phase) return "Building image";
  if (phase.parentId) {
    const parent = BUILD_PIPELINE.find((s) => s.id === phase.parentId);
    return parent?.tableStatus || "Building image";
  }
  return phase.tableStatus || phase.label;
}

function getBuildPhaseState(phaseId, activeFlatIndex) {
  const idx = getFlatPhaseIndex(phaseId);
  if (idx < 0) return "pending";
  if (idx < activeFlatIndex) return "done";
  if (idx === activeFlatIndex) return "active";
  return "pending";
}

function getParentBuildPhaseState(parentStep, activeFlatIndex) {
  const parentIdx = getFlatPhaseIndex(parentStep.id);
  if (parentIdx < 0) return "pending";

  if (parentStep.children?.length) {
    const lastChildIdx = getFlatPhaseIndex(parentStep.children.at(-1).id);
    if (activeFlatIndex > lastChildIdx) return "done";
    if (activeFlatIndex >= parentIdx && activeFlatIndex <= lastChildIdx) return "active";
    return "pending";
  }

  if (parentIdx < activeFlatIndex) return "done";
  if (parentIdx === activeFlatIndex) return "active";
  return "pending";
}

/** PatternFly arc spinner (matches screencast2 / console image builder). */
function renderPfSpinner({ size = "sm", decorative = false } = {}) {
  const sizeClass = size ? ` pf-m-${size}` : "";
  const a11y = decorative
    ? ' aria-hidden="true"'
    : ' role="progressbar" aria-label="Loading" aria-valuetext="Loading"';
  return `<svg class="pf-v6-c-spinner${sizeClass}"${a11y} viewBox="0 0 100 100"><circle class="pf-v6-c-spinner__path" cx="50" cy="50" r="45" fill="none"></circle></svg>`;
}

/** Spinner centered inside the gray step circle (build progress popover). */
function renderBuildProgressSpinner({ sub = false } = {}) {
  return `<span class="build-progress-spinner${sub ? " build-progress-spinner--sub" : ""}" aria-hidden="true">${renderPfSpinner({ size: "", decorative: true })}</span>`;
}

function renderBuildProgressMarker(phaseState, { sub = false } = {}) {
  if (phaseState === "done") {
    return `<span class="build-progress-step__marker build-progress-step__marker--done" aria-hidden="true"><i class="fas fa-check"></i></span>`;
  }
  if (phaseState === "active") {
    return `<span class="build-progress-step__marker build-progress-step__marker--active" aria-hidden="true">${renderBuildProgressSpinner({ sub })}</span>`;
  }
  return `<span class="build-progress-step__marker build-progress-step__marker--pending" aria-hidden="true"></span>`;
}

function renderBuildProgressSteps(activeFlatIndex) {
  return BUILD_PIPELINE.map((step, stepIndex) => {
    const parentState = getParentBuildPhaseState(step, activeFlatIndex);
    const childrenHtml = (step.children || [])
      .map(
        (child) => {
          const childState = getBuildPhaseState(child.id, activeFlatIndex);
          return `<li class="build-progress-step build-progress-step--sub build-progress-step--${childState}">
            ${renderBuildProgressMarker(childState, { sub: true })}
            <span class="build-progress-step__label">${escapeHtml(child.label)}</span>
          </li>`;
        }
      )
      .join("");
    const subList = childrenHtml ? `<ul class="build-progress-step__sublist">${childrenHtml}</ul>` : "";
    const isLast = stepIndex === BUILD_PIPELINE.length - 1;
    return `<li class="build-progress-step build-progress-step--main build-progress-step--${parentState}${isLast ? " build-progress-step--last" : ""}">
      ${renderBuildProgressMarker(parentState)}
      <span class="build-progress-step__label">${escapeHtml(step.label)}</span>
      ${subList}
    </li>`;
  }).join("");
}

function renderTableStatusCell(img) {
  if (isImageBuilding(img)) {
    return `<div class="table-status-cell table-status-cell--building">
      <button type="button" class="table-build-status" data-build-progress="${escapeAttr(img.id)}" aria-label="View build progress for ${escapeAttr(img.name)}">
        ${renderPfSpinner({ size: "sm" })}
        <span>${escapeHtml(getBuildTableStatus(img))}</span>
      </button>
    </div>`;
  }

  const badge = renderStatusBadge(img.status, null, { img });
  return `<div class="table-status-cell">${badge}</div>`;
}

function getBuildingImages() {
  return state.images.filter((img) => isImageBuilding(img));
}

function deleteImage(id) {
  const index = state.images.findIndex((i) => i.id === id);
  if (index < 0) return;

  const img = state.images[index];
  const wasBuilding = isImageBuilding(img);

  state.images.splice(index, 1);
  state.selected.delete(id);
  state.expanded.delete(id);
  if (state.openKebab === id) state.openKebab = null;

  if (wasBuilding) {
    const stillBuilding = getBuildingImages();
    if (!stillBuilding.length) {
      clearBuildTimer();
      state.buildAnchorId = null;
      hideBuildProgressPopover();
    } else if (state.buildAnchorId === id) {
      state.buildAnchorId = stillBuilding[0].id;
    }
  }

  const filtered = getFilteredImages();
  const maxPage = Math.max(1, Math.ceil(filtered.length / state.perPage) || 1);
  if (state.page > maxPage) state.page = maxPage;

  renderTable();
  showToast(`${img.name} deleted`);
}

function imageIdFromName(name) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  let id = base;
  let n = 2;
  while (state.images.some((i) => i.id === id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

function duplicateImage(sourceId) {
  const sourceIndex = state.images.findIndex((i) => i.id === sourceId);
  if (sourceIndex < 0) return null;

  const source = state.images[sourceIndex];
  const copy = JSON.parse(JSON.stringify(source));
  copy.name = `${source.name}-copy`;
  copy.id = imageIdFromName(copy.name);
  copy.createdAt = Date.now();
  delete copy.buildPhaseIndex;

  state.images.splice(sourceIndex + 1, 0, copy);
  return copy;
}

function duplicateImages(imageIds) {
  const ids = [...new Set(imageIds)].filter(Boolean);
  const sources = ids
    .map((id) => ({ id, index: state.images.findIndex((i) => i.id === id) }))
    .filter((x) => x.index >= 0)
    .sort((a, b) => b.index - a.index);

  const copies = [];
  sources.forEach(({ id }) => {
    const copy = duplicateImage(id);
    if (copy) copies.push(copy);
  });

  if (!copies.length) return;

  renderTable();
  if (copies.length === 1) {
    showToast(`${copies[0].name} created`);
  } else {
    showToast(`${copies.length} images duplicated`);
  }
}

function isImageBuilding(img) {
  return typeof img.buildPhaseIndex === "number";
}

function clearBuildTimer() {
  if (state.buildTimer) {
    clearInterval(state.buildTimer);
    state.buildTimer = null;
  }
}

function hideBuildProgressPopover() {
  $("#build-progress-popover")?.classList.add("hidden");
}

function showBuildProgressPopover(anchorRowId) {
  const img = state.images.find((i) => i.id === anchorRowId);
  if (!anchorRowId || !img || !isImageBuilding(img)) return;

  state.buildAnchorId = anchorRowId;
  $("#build-progress-popover")?.classList.remove("hidden");
  syncBuildProgressUI(anchorRowId);
}

function bindBuildProgressClicks() {
  $("#table-body")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-build-progress]");
    if (!btn || !$("#table-body")?.contains(btn)) return;
    e.stopPropagation();
    showBuildProgressPopover(btn.dataset.buildProgress);
  });
}

function positionBuildProgressPopover(anchorRowId) {
  const popover = $("#build-progress-popover");
  const row = document.querySelector(`#images-table tr.pf-v6-c-table__tr[data-id="${anchorRowId}"]`);
  const statusTd = row?.querySelector(".table-col-status-cell");
  if (!popover || !statusTd) return;

  const rect = statusTd.getBoundingClientRect();
  const popW = popover.offsetWidth || 300;
  popover.style.top = `${Math.max(12, rect.top)}px`;
  popover.style.left = `${Math.max(12, rect.left - popW - 12)}px`;
}

function syncBuildProgressUI(anchorRowId) {
  const activeFlatIndex = getBuildingImages()[0]?.buildPhaseIndex ?? 0;
  const stepsEl = $("#build-progress-steps");
  if (stepsEl) {
    stepsEl.innerHTML = `<ul class="build-progress-steps">${renderBuildProgressSteps(activeFlatIndex)}</ul>`;
  }

  getBuildingImages().forEach((img) => {
    const row = document.querySelector(`#images-table tr.pf-v6-c-table__tr[data-id="${img.id}"]`);
    const statusTd = row?.querySelector(".table-col-status-cell");
    if (statusTd) statusTd.innerHTML = renderTableStatusCell(img);
  });

  if (anchorRowId) positionBuildProgressPopover(anchorRowId);
}

function completeAllBuilds() {
  clearBuildTimer();
  getBuildingImages().forEach((img) => {
    img.status = "ready";
    delete img.statusBadgeText;
    delete img.buildPhaseIndex;
    img.lastUpdated = "Just now";
  });
  state.buildAnchorId = null;
  hideBuildProgressPopover();
  renderTable();
}

function advanceAllBuilds() {
  const building = getBuildingImages();
  if (!building.length) return;

  const current = building[0].buildPhaseIndex ?? 0;
  if (current >= BUILD_PHASES_FLAT.length - 1) {
    completeAllBuilds();
    return;
  }

  building.forEach((img) => {
    img.buildPhaseIndex = current + 1;
    img.status = "progress";
  });

  syncBuildProgressUI(state.buildAnchorId);
}

function startBuildTimer() {
  clearBuildTimer();
  state.buildTimer = setInterval(advanceAllBuilds, BUILD_PHASE_MS);
}

function startImageRebuild(imageIds) {
  const ids = [...new Set(imageIds)].filter(Boolean);
  if (!ids.length) return;

  ids.forEach((id) => {
    const img = state.images.find((i) => i.id === id);
    if (!img || isImageBuilding(img)) return;
    img.status = "progress";
    delete img.statusBadgeText;
    img.buildPhaseIndex = 0;
    img.lastUpdated = "Just now";
  });

  state.buildAnchorId = ids[0];
  renderTable();
  // Defer so the triggering click does not bubble to document and dismiss the popover.
  queueMicrotask(() => showBuildProgressPopover(state.buildAnchorId));
  startBuildTimer();
}

function renderInstanceCell(img) {
  const building = isImageBuilding(img);
  if (img.instanceAction === "launch") {
    if (building) {
      return `<span class="table-instance-link table-instance-link--disabled">Launch instance</span>`;
    }
    return `<button type="button" class="pf-v6-c-button pf-m-link" data-launch="${img.id}">Launch instance</button>`;
  }
  if (building) {
    return `<span class="table-instance-link table-instance-link--disabled">Download image</span>`;
  }
  return `<button type="button" class="pf-v6-c-button pf-m-link" data-download="${img.id}">Download image</button>`;
}

function getImageCreatedAt(img) {
  if (typeof img.createdAt === "number") return img.createdAt;
  const parsed = Date.parse(img.lastUpdated);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getFilteredImages() {
  if (state.emptyMode) return [];

  let list = [...state.images];

  if (state.activeFilterCategory === "name" && state.search) {
    const q = state.search.toLowerCase();
    list = list.filter((img) => img.name.toLowerCase().includes(q));
  }

  if (state.filters.target) {
    const map = {
      "Amazon Web Services": "AWS",
      "Google Cloud Platform": "GCP",
      "Microsoft Azure": "Azure",
      "Oracle Cloud Infrastructure": "Oracle",
      "Baremetal (.iso)": "Bare metal",
    };
    const t = map[state.filters.target] || state.filters.target;
    list = list.filter((img) => img.target === t);
  }

  if (state.filters.status) {
    list = list.filter((img) => img.status === state.filters.status);
  }

  if (state.filters.favorited === "yes") {
    list = list.filter((img) => img.favorited);
  } else if (state.filters.favorited === "no") {
    list = list.filter((img) => !img.favorited);
  }

  if (state.filters.os) {
    list = list.filter((img) => img.os === state.filters.os);
  }

  if (state.filters.lastUpdated === "Within the last 24 hours") {
    list = list.filter((img) => img.lastUpdated.includes("minute") || img.lastUpdated.includes("hour"));
  } else if (state.filters.lastUpdated?.startsWith("More than")) {
    list = list.filter((img) => img.lastUpdated.includes("Aug") || img.lastUpdated.includes("2025"));
  }

  list.sort((a, b) => getImageCreatedAt(b) - getImageCreatedAt(a));

  return list;
}

function getActiveFilterCategory() {
  return FILTER_CATEGORIES.find((f) => f.id === state.activeFilterCategory) || FILTER_CATEGORIES[0];
}

function filterToggleHasValue() {
  const cat = state.activeFilterCategory;
  return Boolean(state.search) || Boolean(state.filters[cat]);
}

function optionValue(opt) {
  return typeof opt === "string" ? opt : opt.value || opt.label;
}

function optionLabel(opt) {
  return typeof opt === "string" ? opt : opt.label;
}

function getFilterDisplayLabel(categoryId, value) {
  const cat = FILTER_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat?.options || !value) return value;
  for (const opt of cat.options) {
    if (opt.separator || opt.group) continue;
    if (optionValue(opt) === value) return optionLabel(opt);
  }
  return value;
}

function getValueFilterToggleText(category) {
  const current = state.filters[category.id];
  if (current) return getFilterDisplayLabel(category.id, current);
  return FILTER_INPUT_PLACEHOLDERS[category.id] || `Filter by ${category.label.toLowerCase()}`;
}

function syncValueFilterToggleDisplay(toggleBtn, category) {
  const el = toggleBtn?.querySelector(".pf-v6-c-menu-toggle__text");
  if (!el) return;
  const current = state.filters[category.id];
  if (category.id === "status" && current) {
    el.innerHTML = renderStatusBadge(current, null, { forFilter: true });
    el.classList.add("pf-m-has-status-label");
    el.classList.remove("pf-m-placeholder");
  } else {
    el.classList.remove("pf-m-has-status-label");
    el.textContent = getValueFilterToggleText(category);
    syncValueFilterTogglePlaceholder(toggleBtn, category);
  }
}

function renderFavoritedFilterIcon(value) {
  if (value === "yes") {
    return `<span class="pf-v6-c-menu__item-icon pf-m-favorited-filter-icon pf-m-favorited" aria-hidden="true"><i class="fas fa-star"></i></span>`;
  }
  return `<span class="pf-v6-c-menu__item-icon pf-m-favorited-filter-icon pf-m-unfavorited" aria-hidden="true"><i class="fas fa-star"></i></span>`;
}

function buildValueFilterMenuItemBody(category, opt, value, label) {
  if (category.id === "status") {
    return `<span class="pf-v6-c-menu__item-text">${renderStatusBadge(value, null, { forFilter: true })}</span>`;
  }
  if (category.id === "favorited") {
    return `${renderFavoritedFilterIcon(value)}<span class="pf-v6-c-menu__item-text">${label}</span>`;
  }
  const icon =
    typeof opt === "object" && opt.icon
      ? `<span class="pf-v6-c-menu__item-icon" aria-hidden="true">${opt.icon}</span>`
      : "";
  return `${icon}<span class="pf-v6-c-menu__item-text">${label}</span>`;
}

function buildValueFilterMenuHtml(category) {
  if (!category.options) return "";

  return category.options
    .map((opt) => {
      if (opt.separator) return '<li class="pf-v6-c-divider" role="separator"></li>';
      if (opt.group) return `<li class="pf-menu-group-label">${opt.group}</li>`;
      const value = optionValue(opt);
      const label = optionLabel(opt);
      const selected = state.filters[category.id] === value ? " pf-m-selected" : "";
      const statusItem = category.id === "status" ? " pf-m-status-filter-item" : "";
      const favoritedItem = category.id === "favorited" ? " pf-m-favorited-filter-item" : "";
      const itemBody = buildValueFilterMenuItemBody(category, opt, value, label);
      return `<li role="none">
        <button type="button" class="pf-v6-c-menu__item${selected}${statusItem}${favoritedItem}" role="menuitem"
          data-value-filter-option="${escapeAttr(value)}" aria-label="${escapeAttr(label)}">
          ${itemBody}
        </button>
      </li>`;
    })
    .join("");
}

function syncFilterToggleHighlight() {
  const filtersWrap = $(".image-builder-filters");
  const btn = $("#filter-toggle");
  const valueBtn = $("#value-filter-toggle");
  const hasValue = filterToggleHasValue();

  if (filtersWrap) {
    filtersWrap.classList.toggle("pf-m-has-filter-value", hasValue);
    filtersWrap.classList.toggle("pf-m-category-open", state.filterMenuOpen);
    filtersWrap.classList.toggle("pf-m-value-open", state.valueFilterMenuOpen);
  }
  if (btn) btn.classList.toggle("pf-m-expanded", state.filterMenuOpen);
  if (valueBtn) valueBtn.classList.toggle("pf-m-expanded", state.valueFilterMenuOpen);
}

function isValueFilterPlaceholder(category) {
  if (category.id === "name") return !state.search;
  return !state.filters[category.id];
}

function syncValueFilterTogglePlaceholder(toggleBtn, category) {
  const el = toggleBtn?.querySelector(".pf-v6-c-menu-toggle__text");
  if (!el || category.id === "status") return;
  el.classList.toggle("pf-m-placeholder", isValueFilterPlaceholder(category));
}

function applyFilterValueChange() {
  state.page = 1;
  renderTable();
  syncFilterToggleHighlight();
}

function renderFilterValueControl() {
  const container = $("#filter-value-control");
  if (!container) return;

  const category = getActiveFilterCategory();
  const ariaLabel =
    FILTER_INPUT_PLACEHOLDERS[category.id] || `Filter by ${category.label.toLowerCase()}`;

  if (category.id === "name") {
    container.innerHTML = `
      <div class="pf-v6-c-text-input-group filter-value-text">
        <div class="pf-v6-c-text-input-group__main pf-m-icon">
          <span class="pf-v6-c-text-input-group__icon">
            <span class="pf-v6-c-text-input-group__text">
              <i class="fas fa-search" aria-hidden="true"></i>
            </span>
          </span>
          <input type="search" class="pf-v6-c-text-input-group__text-input" id="search-input"
            placeholder="${escapeAttr(ariaLabel)}" aria-label="${escapeAttr(ariaLabel)}" autocomplete="off"
            value="${escapeAttr(state.search)}" />
        </div>
      </div>`;
    $("#search-input").addEventListener("input", (e) => {
      state.search = e.target.value;
      applyFilterValueChange();
    });
  } else {
    container.innerHTML = `
      <div class="pf-value-filter-dropdown pf-filter-dropdown${category.id === "target" ? " pf-m-target-value-filter" : ""}">
        <button type="button" class="pf-v6-c-menu-toggle image-builder-filter-toggle${state.valueFilterMenuOpen ? " pf-m-expanded" : ""}"
          id="value-filter-toggle" aria-expanded="false" aria-label="${escapeAttr(ariaLabel)}">
          <span class="pf-v6-c-menu-toggle__text"></span>
          <span class="pf-v6-c-menu-toggle__toggle-icon">
            <i class="fas fa-caret-down" aria-hidden="true"></i>
          </span>
        </button>
        <div class="pf-filter-menu pf-v6-c-menu pf-m-scrollable hidden" role="menu" id="value-filter-menu"></div>
      </div>`;

    const valueBtn = $("#value-filter-toggle");
    const valueMenu = $("#value-filter-menu");
    syncValueFilterToggleDisplay(valueBtn, category);
    syncValueFilterTogglePlaceholder(valueBtn, category);

    valueBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (state.valueFilterMenuOpen) {
        closeValueFilterMenu();
      } else {
        closeAllMenus();
        state.valueFilterMenuOpen = true;
        valueBtn.setAttribute("aria-expanded", "true");
        valueBtn.classList.add("pf-m-expanded");
        valueMenu.classList.remove("hidden");
        valueMenu.classList.toggle("pf-m-status-filter-menu", category.id === "status");
        valueMenu.classList.toggle("pf-m-target-filter-menu", category.id === "target");
        valueMenu.innerHTML = `<ul class="pf-v6-c-menu__list">${buildValueFilterMenuHtml(category)}</ul>`;
        bindValueFilterMenuOptions(valueMenu, category, valueBtn);
        syncFilterToggleHighlight();
      }
    });
  }

  syncFilterToggleHighlight();
}

function bindValueFilterMenuOptions(menu, category, toggleBtn) {
  menu.querySelectorAll("[data-value-filter-option]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = item.dataset.valueFilterOption;
      if (state.filters[category.id] === val) {
        delete state.filters[category.id];
      } else {
        state.filters[category.id] = val;
      }
      syncValueFilterToggleDisplay(toggleBtn, category);
      closeValueFilterMenu();
      applyFilterValueChange();
    });
  });
}

function closeValueFilterMenu() {
  state.valueFilterMenuOpen = false;
  const btn = $("#value-filter-toggle");
  const menu = $("#value-filter-menu");
  if (btn) {
    btn.setAttribute("aria-expanded", "false");
    if (!state.filters[state.activeFilterCategory]) btn.classList.remove("pf-m-expanded");
  }
  if (menu) menu.classList.add("hidden");
  syncFilterToggleHighlight();
}

function clearActiveFilterValue() {
  if (state.activeFilterCategory === "name") {
    state.search = "";
  } else {
    delete state.filters[state.activeFilterCategory];
  }
}

function renderFilters() {
  const container = $("#filter-group");
  const category = getActiveFilterCategory();
  const expanded = state.filterMenuOpen;

  container.innerHTML = `
    <div class="pf-filter-dropdown" id="unified-filter">
      <button type="button" class="pf-v6-c-menu-toggle image-builder-filter-toggle${expanded ? " pf-m-expanded" : ""}" aria-expanded="${expanded}" id="filter-toggle">
        <span class="pf-v6-c-menu-toggle__icon"><i class="fas fa-filter" aria-hidden="true"></i></span>
        <span class="pf-v6-c-menu-toggle__text">${category.label}</span>
        <span class="pf-v6-c-menu-toggle__toggle-icon"><i class="fas fa-caret-down" aria-hidden="true"></i></span>
      </button>
      <div class="pf-filter-menu pf-v6-c-menu pf-m-scrollable hidden" role="menu" id="filter-menu"></div>
    </div>`;

  const btn = $("#filter-toggle");
  const menu = $("#filter-menu");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (state.filterMenuOpen) {
      closeFilterMenu();
    } else {
      closeAllMenus();
      state.filterMenuOpen = true;
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("pf-m-expanded");
      menu.classList.remove("hidden");
      renderUnifiedFilterMenu(menu);
      syncFilterToggleHighlight();
    }
  });

  syncFilterToggleHighlight();
}

function renderUnifiedFilterMenu(menu) {
  const categoryItems = FILTER_CATEGORIES.map((cat) => {
    const selected = cat.id === state.activeFilterCategory ? " pf-m-selected" : "";
    return `<li role="none">
      <button type="button" class="pf-v6-c-menu__item${selected}" role="menuitem" data-filter-category="${cat.id}">
        <span class="pf-v6-c-menu__item-text">${cat.label}</span>
      </button>
    </li>`;
  }).join("");

  menu.innerHTML = `<ul class="pf-v6-c-menu__list">${categoryItems}</ul>`;

  menu.querySelectorAll("[data-filter-category]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      if (item.dataset.filterCategory === state.activeFilterCategory) return;
      clearActiveFilterValue();
      state.activeFilterCategory = item.dataset.filterCategory;
      const toggleText = $("#filter-toggle")?.querySelector(".pf-v6-c-menu-toggle__text");
      if (toggleText) toggleText.textContent = getActiveFilterCategory().label;
      closeFilterMenu();
      render();
    });
  });
}

function closeFilterMenu() {
  state.filterMenuOpen = false;
  const btn = $("#filter-toggle");
  const menu = $("#filter-menu");
  if (btn) {
    btn.setAttribute("aria-expanded", "false");
    btn.classList.remove("pf-m-expanded");
  }
  if (menu) menu.classList.add("hidden");
  syncFilterToggleHighlight();
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;");
}

function positionKebabMenu(menu, anchor) {
  document.body.appendChild(menu);
  menu.style.position = "fixed";
  menu.style.visibility = "hidden";

  const menuRect = menu.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  const gap = 4;
  const margin = 8;
  const maxTop = window.innerHeight - margin - menuRect.height;
  const maxLeft = window.innerWidth - margin - menuRect.width;

  let top = rect.bottom + gap;
  let left = rect.right - menuRect.width;

  if (top > maxTop) {
    top = rect.top - menuRect.height - gap;
  }
  top = Math.max(margin, Math.min(top, maxTop));

  left = Math.max(margin, Math.min(left, maxLeft));

  menu.style.top = `${Math.round(top)}px`;
  menu.style.left = `${Math.round(left)}px`;
  menu.style.visibility = "";
}

function closePaginationPerPageMenus() {
  $$(".pagination-per-page-menu").forEach((menu) => menu.classList.add("hidden"));
  $$(".pagination-per-page-toggle").forEach((btn) => btn.setAttribute("aria-expanded", "false"));
}

function closeAllMenus() {
  closeFilterMenu();
  closeValueFilterMenu();
  closePaginationPerPageMenus();
  state.openKebab = null;
  $$(".pf-kebab-menu").forEach((m) => m.remove());
}

function getPaginationDisplayTotal(filteredCount) {
  if (state.emptyMode) return 0;
  const hasActiveFilters =
    Boolean(state.search) ||
    Object.keys(state.filters).length > 0;
  return hasActiveFilters ? filteredCount : PAGINATION_DISPLAY_TOTAL;
}

function renderPaginationSummary(start, end, displayTotal) {
  return `
    <div class="pagination-summary">
      <span class="pagination-range">${start} - ${end} of ${displayTotal}</span>
      <div class="pagination-per-page-wrap">
        <button type="button" class="pagination-per-page-toggle" aria-expanded="false" aria-haspopup="listbox" aria-label="Items per page">
          <i class="fas fa-caret-down" aria-hidden="true"></i>
        </button>
        <ul class="pagination-per-page-menu hidden" role="listbox" aria-label="Items per page">
          ${PER_PAGE_OPTIONS.map(
            (n) =>
              `<li role="presentation"><button type="button" class="pagination-per-page-option${state.perPage === n ? " pf-m-selected" : ""}" role="option" data-per-page="${n}" ${state.perPage === n ? 'aria-selected="true"' : ""}>${n} per page</button></li>`
          ).join("")}
        </ul>
      </div>
    </div>`;
}

function renderPaginationNav(variant, totalPages) {
  const navBtn = (action, label, text, disabled, extraClass = "") =>
    `<button type="button" class="pagination-nav-btn ${extraClass}" data-page="${action}" ${disabled ? "disabled" : ""} aria-label="${label}">${text}</button>`;

  if (variant === "top") {
    return `
      <nav class="pagination-nav pagination-nav--compact" aria-label="Page navigation">
        ${navBtn("prev", "Previous page", "‹", state.page <= 1, "pagination-nav-btn--plain")}
        ${navBtn("next", "Next page", "›", state.page >= totalPages, "pagination-nav-btn--plain")}
      </nav>`;
  }

  return `
    <nav class="pagination-nav" aria-label="Page navigation">
      ${navBtn("first", "Go to first page", "«", state.page <= 1)}
      ${navBtn("prev", "Previous page", "‹", state.page <= 1)}
      <input type="number" class="pagination-page-input" value="${state.page}" min="1" max="${totalPages}" aria-label="Current page" />
      <span class="pagination-page-of">of ${totalPages}</span>
      ${navBtn("next", "Next page", "›", state.page >= totalPages)}
      ${navBtn("last", "Go to last page", "»", state.page >= totalPages)}
    </nav>`;
}

function bindPagination(el, totalPages) {
  el.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.page;
      if (action === "first") state.page = 1;
      else if (action === "prev") state.page = Math.max(1, state.page - 1);
      else if (action === "next") state.page = Math.min(totalPages, state.page + 1);
      else if (action === "last") state.page = totalPages;
      render();
    });
  });

  const input = el.querySelector(".pagination-page-input");
  input?.addEventListener("change", () => {
    state.page = Math.min(totalPages, Math.max(1, parseInt(input.value, 10) || 1));
    render();
  });

  const perPageToggle = el.querySelector(".pagination-per-page-toggle");
  const perPageMenu = el.querySelector(".pagination-per-page-menu");
  perPageToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    $$(".pagination-per-page-menu").forEach((menu) => {
      if (menu !== perPageMenu) menu.classList.add("hidden");
    });
    perPageMenu?.classList.toggle("hidden");
    const isOpen = perPageMenu && !perPageMenu.classList.contains("hidden");
    perPageToggle.setAttribute("aria-expanded", String(isOpen));
  });
  el.querySelectorAll("[data-per-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.perPage = parseInt(btn.dataset.perPage, 10);
      state.page = 1;
      perPageMenu?.classList.add("hidden");
      perPageToggle?.setAttribute("aria-expanded", "false");
      render();
    });
  });
}

function renderPagination(filteredCount, elTop, elBottom) {
  const displayTotal = getPaginationDisplayTotal(filteredCount);
  const start = displayTotal === 0 ? 0 : (state.page - 1) * state.perPage + 1;
  const end = Math.min(state.page * state.perPage, displayTotal);
  const totalPages = Math.max(1, Math.ceil(displayTotal / state.perPage) || 1);

  if (state.page > totalPages) state.page = totalPages;

  const summary = renderPaginationSummary(start, end, displayTotal);

  elTop.innerHTML = `${summary}${renderPaginationNav("top", totalPages)}`;
  elBottom.innerHTML = `${summary}${renderPaginationNav("bottom", totalPages)}`;

  bindPagination(elTop, totalPages);
  bindPagination(elBottom, totalPages);
}

function renderBuildInfo(img) {
  const info = getBuildInfo(img);
  const dl = (term, val) => `
    <div class="pf-v6-c-description-list__group table-expanded-dl__group">
      <dt class="pf-v6-c-description-list__term">${term}</dt>
      <dd class="pf-v6-c-description-list__description">${val}</dd>
    </div>`;
  return `
    <div class="table-expanded-panel">
      <h4 class="pf-v6-c-title pf-m-md table-expanded-panel__title">Build information</h4>
      <dl class="table-expanded-dl">
        ${dl("UUID", info.uuid)}
        ${dl("Architecture", info.architecture)}
        ${dl("Shared with", `<a href="#" class="table-expanded-link">${info.sharedWith} <i class="fas fa-external-link-alt" aria-hidden="true"></i></a>`)}
        ${dl(info.imageLabel, info.imageValue)}
        ${dl("Region", info.region)}
        ${dl(
          "Status",
          isImageBuilding(img)
            ? `<span class="table-build-status">${renderPfSpinner({ size: "sm" })}<span>${escapeHtml(getBuildTableStatus(img))}</span></span>`
            : renderStatusBadge(img.status, null, { forFilter: true })
        )}
      </dl>
    </div>`;
}

function renderTable() {
  const filtered = getFilteredImages();
  const total = filtered.length;
  const start = (state.page - 1) * state.perPage;
  const pageItems = filtered.slice(start, start + state.perPage);

  const tbody = $("#table-body");
  const empty = $("#empty-state");
  const table = $("#images-table");

  if (total === 0) {
    tbody.innerHTML = "";
    empty.classList.remove("hidden");
    table.classList.add("hidden");
  } else {
    empty.classList.add("hidden");
    table.classList.remove("hidden");

    tbody.innerHTML = pageItems
      .map((img) => {
        const expanded = state.expanded.has(img.id);
        const selected = state.selected.has(img.id);
        const favoriteCellClass = img.favorited ? " pf-m-favorited" : "";

        const expandContentId = `expand-content-${img.id}`;

        const buildingRowClass = isImageBuilding(img) ? " pf-m-building" : "";

        let rows = `
          <tr class="pf-v6-c-table__tr${expanded ? " pf-m-expanded" : ""}${buildingRowClass}" data-id="${img.id}">
            <td class="pf-v6-c-table__td pf-v6-c-table__toggle">
              <button type="button" class="pf-v6-c-button pf-m-plain${expanded ? " pf-m-expanded" : ""}" data-expand="${img.id}"
                aria-expanded="${expanded}" aria-controls="${expandContentId}"
                aria-label="${expanded ? "Collapse row" : "Expand row"}">
                <span class="pf-v6-c-table__toggle-icon"><i class="fas fa-angle-${expanded ? "down" : "right"}" aria-hidden="true"></i></span>
              </button>
            </td>
            <td class="pf-v6-c-table__td pf-v6-c-table__check">
              <label>
                <input type="checkbox" data-select="${img.id}" ${selected ? "checked" : ""} aria-label="Select ${img.name}" />
              </label>
            </td>
            <td class="pf-v6-c-table__td pf-v6-c-table__favorite${favoriteCellClass}">
              ${renderFavoriteButton(img)}
            </td>
            <th class="pf-v6-c-table__td" data-label="Name" scope="row">${escapeHtml(img.name)}</th>
            <td class="pf-v6-c-table__td" data-label="Last updated">${img.lastUpdated}</td>
            <td class="pf-v6-c-table__td" data-label="Operating system">${img.os}</td>
            <td class="pf-v6-c-table__td" data-label="Target environment">${img.target}</td>
            <td class="pf-v6-c-table__td table-col-status-cell" data-label="Status">${renderTableStatusCell(img)}</td>
            <td class="pf-v6-c-table__td" data-label="Instance">${renderInstanceCell(img)}</td>
            <td class="pf-v6-c-table__td pf-v6-c-table__action">
              <div class="pf-kebab-wrap">
                <button type="button" class="pf-v6-c-menu-toggle pf-m-plain pf-m-no-padding" data-kebab="${img.id}" aria-label="Actions for ${img.name}">
                  <span class="pf-v6-c-menu-toggle__icon"><i class="fas fa-ellipsis-v" aria-hidden="true"></i></span>
                </button>
              </div>
            </td>
          </tr>`;

        if (expanded) {
          rows += `
            <tr class="pf-v6-c-table__tr pf-v6-c-table__expandable-row pf-m-expanded" id="${expandContentId}">
              <td class="pf-v6-c-table__td pf-m-no-padding" colspan="10">
                <div class="pf-v6-c-table__expandable-row-content table-expanded-content">${renderBuildInfo(img)}</div>
              </td>
            </tr>`;
        }

        return rows;
      })
      .join("");
  }

  renderPagination(filtered.length, $("#pagination-top"), $("#pagination-bottom"));
  bindTableEvents();
  updateBulkButtons();
}

function bindTableEvents() {
  $("#table-body").querySelectorAll("[data-select]").forEach((cb) => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.select;
      if (cb.checked) state.selected.add(id);
      else state.selected.delete(id);
      updateBulkButtons();
      updateSelectAll();
    });
  });

  $("#table-body").querySelectorAll("[data-favorite]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = state.images.find((i) => i.id === btn.dataset.favorite);
      if (img) {
        img.favorited = !img.favorited;
        renderTable();
      }
    });
  });

  $("#table-body").querySelectorAll("[data-launch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = state.images.find((i) => i.id === btn.dataset.launch);
      if (img) openLaunchModal(img);
    });
  });

  $("#table-body").querySelectorAll("[data-download]").forEach((btn) => {
    btn.addEventListener("click", () => {
      showToast("Download started (prototype)");
    });
  });

  $("#table-body").querySelectorAll("[data-kebab]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.kebab;
      if (state.openKebab === id) {
        closeAllMenus();
        return;
      }
      closeAllMenus();
      state.openKebab = id;
      const menu = document.createElement("div");
      menu.className = "pf-kebab-menu pf-v6-c-menu";
      menu.innerHTML = `<ul class="pf-v6-c-menu__list">
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem" data-kebab-action="edit">Edit</button></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem" data-kebab-action="duplicate">Duplicate</button></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem" data-kebab-action="rebuild">Rebuild</button></li>
        <li class="pf-v6-c-divider" role="separator"></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem">Download image</button></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem">Download blueprint (.json)</button></li>
        <li class="pf-v6-c-divider" role="separator"></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item pf-m-danger" role="menuitem">Delete</button></li>
      </ul>`;
      positionKebabMenu(menu, btn);
      menu.querySelector(".pf-m-danger")?.addEventListener("click", () => {
        deleteImage(id);
        closeAllMenus();
      });
      menu.querySelector('[data-kebab-action="edit"]')?.addEventListener("click", () => {
        openBuildImageModal(id);
        closeAllMenus();
      });
      menu.querySelector('[data-kebab-action="rebuild"]')?.addEventListener("click", () => {
        startImageRebuild([id]);
        closeAllMenus();
      });
      menu.querySelector('[data-kebab-action="duplicate"]')?.addEventListener("click", () => {
        duplicateImages([id]);
        closeAllMenus();
      });
      menu.querySelectorAll(
        ".pf-v6-c-menu__item:not(.pf-m-danger):not([data-kebab-action='edit']):not([data-kebab-action='rebuild']):not([data-kebab-action='duplicate'])"
      ).forEach((b) => {
        b.addEventListener("click", () => {
          showToast(`${b.textContent} — ${id} (prototype)`);
          closeAllMenus();
        });
      });
    });
  });
}

function updateBulkButtons() {
  const hasSelection = state.selected.size > 0;
  $("#btn-edit").disabled = state.selected.size !== 1;
  $("#btn-duplicate").disabled = !hasSelection;
  $("#btn-rebuild").disabled = !hasSelection;
}

function updateSelectAll() {
  const filtered = getFilteredImages();
  const start = (state.page - 1) * state.perPage;
  const pageItems = filtered.slice(start, start + state.perPage);
  const allSelected = pageItems.length > 0 && pageItems.every((i) => state.selected.has(i.id));
  const selectAll = $("#select-all");
  if (selectAll) {
    selectAll.checked = allSelected;
    selectAll.indeterminate =
      !allSelected && pageItems.some((i) => state.selected.has(i.id));
  }
}

function renderIsoCards(containerId, titles) {
  const container = $(containerId);
  container.innerHTML = titles
    .map((title) => {
      const fileName = getIsoFileName(title);
      return `
    <div class="pf-v6-l-gallery__item">
      <div class="pf-v6-c-card pf-m-full-height">
        <div class="pf-v6-c-card__header">
          <div class="pf-v6-c-card__title">
            <h3 class="pf-v6-c-card__title-text">${title}</h3>
          </div>
          <div class="pf-v6-c-card__actions">
            <button type="button" class="pf-v6-c-button pf-m-plain pf-m-no-padding" data-details data-file-name="${escapeAttr(fileName)}" aria-label="Details for ${escapeAttr(title)}">
              <span class="pf-v6-c-button__icon"><i class="fas fa-info-circle" aria-hidden="true"></i></span>
            </button>
          </div>
        </div>
        <div class="pf-v6-c-card__footer">
          <div class="pf-v6-c-action-list">
            <div class="pf-v6-c-action-list__group">
              <button type="button" class="pf-v6-c-button pf-m-primary pf-m-small" data-build-latest>Build latest</button>
              <button type="button" class="pf-v6-c-button pf-m-secondary pf-m-small">Download blueprint (.json)</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join("");

  container.querySelectorAll("[data-details]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const fileNameEl = $("#details-file-name");
      const cardTitle = btn.closest(".pf-v6-c-card")?.querySelector(".pf-v6-c-card__title-text")?.textContent?.trim();
      const fileName =
        btn.getAttribute("data-file-name") || (cardTitle ? getIsoFileName(cardTitle) : "");
      if (fileNameEl) fileNameEl.textContent = fileName || "—";
      const popover = $("#details-popover");
      const rect = btn.getBoundingClientRect();
      popover.style.top = `${rect.top}px`;
      popover.style.left = `${rect.right + 12}px`;
      popover.classList.remove("hidden");
    });
  });
}

const DEFAULT_BUILD_IMAGE_NAME = "rhel-10-x86_64-20240604-1322";

let buildImageEditingId = null;
let buildImageCurrentStep = "base";
const buildImageVisitedSteps = new Set(["base"]);

const BUILD_IMAGE_WIZARD_STEPS = [
  { id: "base", label: "Base settings" },
  { id: "repos", label: "Repositories and packages" },
  { id: "advanced", label: "Advanced settings" },
  { id: "review", label: "Review" },
];

function getBuildImageWizardStepIndex(stepId) {
  return BUILD_IMAGE_WIZARD_STEPS.findIndex((step) => step.id === stepId);
}

const BUILD_TARGET_REVIEW_CATEGORIES = [
  {
    label: "Public cloud",
    values: {
      aws: "Amazon Web Services",
      gcp: "Google Cloud Platform",
      azure: "Microsoft Azure",
      oci: "Oracle Cloud Infrastructure",
    },
  },
  {
    label: "Private cloud",
    values: {
      "vmware-ova": "VMware vSphere (.ova)",
      "vmware-vmdk": "VMware vSphere (.vmdk)",
    },
  },
  {
    label: "Miscellaneous formats",
    values: {
      qcow2: "Virtualization (.qcow2)",
      iso: "Baremetal (.iso)",
      wsl: "Windows Subsystem for Linux (.tar.gz)",
    },
  },
];

function getSelectedBuildTargetValues() {
  return new Set(
    [...$$("#build-image-panel-base input[name='build-target']:checked")].map((cb) => cb.value)
  );
}

function syncBuildImageReviewTargets() {
  const container = $("#build-image-review-targets");
  if (!container) return;

  const selected = getSelectedBuildTargetValues();
  const groups = [
    `<div class="pf-v6-c-description-list__group">
      <dt class="pf-v6-c-description-list__term">Target environments</dt>
      <dd class="pf-v6-c-description-list__description"></dd>
    </div>`,
  ];

  BUILD_TARGET_REVIEW_CATEGORIES.forEach((category) => {
    const labels = Object.entries(category.values)
      .filter(([value]) => selected.has(value))
      .map(([, label]) => label);
    if (!labels.length) return;

    groups.push(`<div class="pf-v6-c-description-list__group">
      <dt class="pf-v6-c-description-list__term">${escapeHtml(category.label)}</dt>
      <dd class="pf-v6-c-description-list__description">${escapeHtml(labels.join(", "))}</dd>
    </div>`);
  });

  container.innerHTML = groups.join("");
}

function syncBuildImageReviewSummary() {
  const name = $("#build-image-name")?.value.trim() || "my-custom-image";
  const description = $("#build-image-description")?.value.trim();
  const release = $("#build-image-release")?.selectedOptions[0]?.textContent?.trim() || "Red Hat Enterprise Linux 9";
  const architecture = $("#build-image-architecture")?.value || "x86_64";

  const reviewName = $("#build-image-review-name");
  const reviewDetails = $("#build-image-review-details");
  const reviewRelease = $("#build-image-review-release");
  const reviewArchitecture = $("#build-image-review-architecture");

  if (reviewName) reviewName.textContent = name;
  if (reviewDetails) reviewDetails.textContent = description || "--";
  if (reviewRelease) {
    reviewRelease.textContent = release
      .replace("Red Hat Enterprise Linux (RHEL)", "Red Hat Enterprise Linux")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (reviewArchitecture) reviewArchitecture.textContent = architecture;
  syncBuildImageReviewTargets();
}

function getPreviousBuildImageStep(stepId) {
  if (stepId === "review") return "advanced";
  if (stepId === "advanced") return "repos";
  if (stepId === "repos") return "base";
  return "base";
}

function getNextBuildImageStep(stepId) {
  if (stepId === "base") return "repos";
  if (stepId === "repos") return "advanced";
  if (stepId === "advanced") return "review";
  return stepId;
}

function setBuildImageWizardStep(stepId) {
  const panels = {
    base: $("#build-image-panel-base"),
    repos: $("#build-image-panel-repos"),
    advanced: $("#build-image-panel-advanced"),
    review: $("#build-image-panel-review"),
  };
  const steps = $$("#modal-build-image .build-image-wizard__step");
  const backBtn = $("#build-image-btn-back");
  const nextBtn = $("#build-image-btn-next");
  const reviewBtn = $("#build-image-btn-review");
  const stepIndex = getBuildImageWizardStepIndex(stepId);

  buildImageCurrentStep = stepId;
  buildImageVisitedSteps.add(stepId);

  Object.entries(panels).forEach(([id, panel]) => {
    if (!panel) return;
    const show = id === stepId;
    panel.classList.toggle("hidden", !show);
    panel.setAttribute("aria-hidden", show ? "false" : "true");
  });

  steps.forEach((stepEl, index) => {
    const step = BUILD_IMAGE_WIZARD_STEPS[index];
    const isCurrent = index === stepIndex;
    const isVisited = buildImageVisitedSteps.has(step.id) && !isCurrent;
    stepEl.classList.toggle("build-image-wizard__step--current", isCurrent);
    stepEl.classList.toggle("build-image-wizard__step--visited", isVisited);
    if (isCurrent) {
      stepEl.setAttribute("aria-current", "step");
    } else {
      stepEl.removeAttribute("aria-current");
    }
    const marker = stepEl.querySelector(".build-image-wizard__step-marker");
    if (marker) marker.textContent = String(index + 1);
  });

  const isBase = stepId === "base";
  const isReview = stepId === "review";
  const canGoNext = stepId === "base" || stepId === "repos" || stepId === "advanced";

  if (backBtn) backBtn.disabled = isBase;
  if (nextBtn) nextBtn.disabled = !canGoNext;
  if (reviewBtn) {
    reviewBtn.disabled = false;
    reviewBtn.textContent = isReview
      ? buildImageEditingId
        ? "Rebuild image"
        : "Build image"
      : "Review image";
    reviewBtn.classList.toggle("pf-m-secondary", !isReview);
    reviewBtn.classList.toggle("pf-m-primary", isReview);
  }

  if (isReview) syncBuildImageReviewSummary();
  panels[stepId]?.scrollTo(0, 0);
}

function releaseToOs(releaseText) {
  const match = releaseText.match(/RHEL\)\s*(\d+)/);
  return match ? `RHEL ${match[1]}` : "RHEL 9";
}

function getPrimaryBuildTarget() {
  const selected = getSelectedBuildTargetValues();
  for (const value of BUILD_TARGET_PRIORITY) {
    if (selected.has(value)) return BUILD_TARGET_TO_IMAGE_TARGET[value];
  }
  return "AWS";
}

function getInstanceActionForTarget(target) {
  if (target === "Bare metal" || target === "WSL") return "download";
  return "launch";
}

function applyBuildImageDetailsFromDialog(img) {
  const name = $("#build-image-name")?.value.trim() || DEFAULT_BUILD_IMAGE_NAME;
  const release = $("#build-image-release")?.selectedOptions[0]?.textContent?.trim() || "";
  const architecture = $("#build-image-architecture")?.value || "x86_64";
  const target = getPrimaryBuildTarget();
  const previousBuildInfo = img.buildInfo;

  img.name = name;
  img.os = releaseToOs(release);
  img.target = target;
  img.lastUpdated = "Just now";
  img.instanceAction = getInstanceActionForTarget(target);

  if (["AWS", "GCP", "Azure", "Oracle"].includes(target)) {
    img.buildInfo = {
      ...(previousBuildInfo ? JSON.parse(JSON.stringify(previousBuildInfo)) : {}),
      architecture,
    };
  } else {
    delete img.buildInfo;
  }

  return img;
}

function buildImageFromDialog() {
  const editingId = buildImageEditingId;
  const existing = editingId ? state.images.find((i) => i.id === editingId) : null;
  let imageId;
  let imageName;

  if (existing) {
    applyBuildImageDetailsFromDialog(existing);
    imageId = existing.id;
    imageName = existing.name;
  } else {
    const newImage = {
      id: imageIdFromName($("#build-image-name")?.value.trim() || DEFAULT_BUILD_IMAGE_NAME),
      createdAt: Date.now(),
      favorited: false,
      status: "pending",
    };
    applyBuildImageDetailsFromDialog(newImage);
    state.images.unshift(newImage);
    state.page = 1;
    imageId = newImage.id;
    imageName = newImage.name;
  }

  buildImageEditingId = null;

  closeModals();
  startImageRebuild([imageId]);
  showToast(`${imageName} build started`);
}

function openBuildImageModal(imageId) {
  const nameInput = $("#build-image-name");
  const img = imageId ? state.images.find((i) => i.id === imageId) : null;
  buildImageEditingId = imageId || null;
  if (nameInput) {
    nameInput.value = img?.name ?? DEFAULT_BUILD_IMAGE_NAME;
  }
  setBuildImageTargetsFromImage(img);
  buildImageVisitedSteps.clear();
  buildImageVisitedSteps.add("base");
  setBuildImageWizardStep("base");
  openModal("build-image");
}

function syncBuildImageTargetNested(checkbox, nested) {
  const show = checkbox.checked;
  nested.classList.toggle("hidden", !show);
  nested.setAttribute("aria-hidden", show ? "false" : "true");
}

function resetBuildImageTargets() {
  $$("#build-image-panel-base input[name='build-target']").forEach((checkbox) => {
    checkbox.checked = false;
    const nested = checkbox.closest(".build-image-target-item")?.querySelector(".build-image-target-nested");
    if (nested) syncBuildImageTargetNested(checkbox, nested);
  });
}

function setBuildImageTargetsFromImage(img) {
  resetBuildImageTargets();
  if (!img) return;

  const targetValue = BUILD_IMAGE_TARGET_MAP[img.target];
  if (!targetValue) return;

  const checkbox = $(`#build-image-panel-base input[name='build-target'][value='${targetValue}']`);
  if (!checkbox) return;

  checkbox.checked = true;
  const nested = checkbox.closest(".build-image-target-item")?.querySelector(".build-image-target-nested");
  if (nested) syncBuildImageTargetNested(checkbox, nested);
}

function initBuildImageTargetToggles() {
  $("#build-image-panel-base")?.querySelectorAll(".build-image-target-item").forEach((item) => {
    const checkbox = item.querySelector(".build-image-target-check input[type='checkbox']");
    const nested = item.querySelector(".build-image-target-nested");
    if (!checkbox || !nested) return;

    syncBuildImageTargetNested(checkbox, nested);
    checkbox.addEventListener("change", () => syncBuildImageTargetNested(checkbox, nested));
  });
}

function initBuildImageModal() {
  const nameInput = $("#build-image-name");
  $("#build-image-name-clear")?.addEventListener("click", () => {
    if (nameInput) {
      nameInput.value = "";
      nameInput.focus();
    }
  });

  $("#build-image-btn-next")?.addEventListener("click", () => {
    const nextStep = getNextBuildImageStep(buildImageCurrentStep);
    if (nextStep !== buildImageCurrentStep) setBuildImageWizardStep(nextStep);
  });

  $("#build-image-btn-review")?.addEventListener("click", (e) => {
    if (buildImageCurrentStep !== "review") {
      setBuildImageWizardStep("review");
      return;
    }
    e.stopPropagation();
    buildImageFromDialog();
  });

  $("#build-image-btn-back")?.addEventListener("click", () => {
    setBuildImageWizardStep(getPreviousBuildImageStep(buildImageCurrentStep));
  });

  $("#build-image-review-edit-overview")?.addEventListener("click", () => {
    setBuildImageWizardStep("base");
  });

  initBuildImageTargetToggles();
}

function openModal(id) {
  const backdrop = $("#modal-backdrop");
  const modal = $(`#modal-${id}`);
  $$("#modal-backdrop .pf-v6-c-modal-box").forEach((m) => m.classList.add("hidden"));
  backdrop.classList.remove("hidden");
  modal.classList.remove("hidden");
  document.documentElement.classList.add("pf-modal-open");

  modal.focus?.();
}

function closeModals() {
  $("#modal-backdrop").classList.add("hidden");
  $$("#modal-backdrop .pf-v6-c-modal-box").forEach((m) => {
    m.classList.add("hidden");
  });
  $("#details-popover").classList.add("hidden");
  document.documentElement.classList.remove("pf-modal-open");
}

function isDismissOnlyByCloseModalOpen() {
  return (
    !$("#modal-build-image").classList.contains("hidden") ||
    !$("#modal-download-rhel").classList.contains("hidden") ||
    !$("#modal-import").classList.contains("hidden")
  );
}

const GCP_IMAGE_CMD_TEMPLATE =
  "gcloud compute images create <desired_image_name_placeholder> --source-image-project red-hat-image-builder";
const GCP_IMAGE_NAME_PLACEHOLDER = "<desired_image_name_placeholder>";

function buildGcpImageCommand(projectId) {
  const name = projectId.trim() || GCP_IMAGE_NAME_PLACEHOLDER;
  return GCP_IMAGE_CMD_TEMPLATE.replace(GCP_IMAGE_NAME_PLACEHOLDER, name);
}

function resizeLaunchExpandedText(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function syncGcpLaunchImageCommand() {
  const projectInput = $("#launch-gcp-project-id");
  const field = $("#launch-gcp-image-cmd-field");
  if (!projectInput || !field) return;

  const cmd = buildGcpImageCommand(projectInput.value);
  const input = field.querySelector(".launch-command-field__input input");
  const expandedText = field.querySelector(".launch-command-field__expanded-text");
  const expandedPanel = field.querySelector(".launch-command-field__expanded");
  const copyBtn = field.querySelector(".launch-command-field__copy");
  if (input) input.value = cmd;
  if (expandedText) {
    expandedText.value = cmd;
    if (expandedPanel && !expandedPanel.classList.contains("hidden")) {
      resizeLaunchExpandedText(expandedText);
    }
  }
  if (copyBtn) copyBtn.dataset.copy = cmd;
}

function bindLaunchCommandExpanders(root) {
  root.querySelectorAll(".launch-command-field__expand").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.closest(".launch-command-field");
      const panel = field?.querySelector(".launch-command-field__expanded");
      const input = field?.querySelector(".launch-command-field__input input");
      const expandedText = field?.querySelector(".launch-command-field__expanded-text");
      const icon = btn.querySelector("i");
      if (!panel || !input || !expandedText) return;

      const isExpanded = !panel.classList.contains("hidden");
      if (isExpanded) {
        panel.classList.add("hidden");
        panel.setAttribute("aria-hidden", "true");
        btn.setAttribute("aria-expanded", "false");
        btn.classList.remove("pf-m-expanded");
        if (icon) icon.className = "fas fa-angle-right";
        return;
      }

      expandedText.value = input.value;
      panel.classList.remove("hidden");
      panel.setAttribute("aria-hidden", "false");
      btn.setAttribute("aria-expanded", "true");
      btn.classList.add("pf-m-expanded");
      if (icon) icon.className = "fas fa-angle-down";
      requestAnimationFrame(() => resizeLaunchExpandedText(expandedText));
    });
  });
}

function launchCommandField(code, { id = "", expandable = false } = {}) {
  const idAttr = id ? ` id="${escapeAttr(id)}"` : "";
  const expandBtn = expandable
    ? `<button type="button" class="launch-command-field__expand" aria-expanded="false" aria-label="Expand command">
        <i class="fas fa-angle-right" aria-hidden="true"></i>
      </button>`
    : "";
  const expandedPanel = expandable
    ? `<div class="launch-command-field__expanded hidden" aria-hidden="true">
        <div class="pf-v6-c-form-control pf-m-readonly launch-command-field__expanded-control">
          <textarea class="launch-command-field__expanded-text" readonly rows="1" aria-label="Full command">${escapeHtml(code)}</textarea>
        </div>
      </div>`
    : "";

  return `
    <div class="launch-command-field pf-v6-u-mt-sm${expandable ? " launch-command-field--expandable" : ""}"${idAttr}>
      <div class="launch-command-field__row">
        ${expandBtn}
        <div class="pf-v6-c-form-control launch-command-field__input">
          <input type="text" value="${escapeAttr(code)}" readonly aria-label="Command" />
        </div>
        <button type="button" class="masthead-util-btn masthead-util-btn--icon launch-command-field__copy btn-copy" data-copy="${escapeAttr(code)}" aria-label="Copy command">
          <i class="fas fa-copy" aria-hidden="true"></i>
        </button>
      </div>
      ${expandedPanel}
    </div>`;
}

function openLaunchModal(img, provider) {
  const target = provider || TARGET_MAP[img.target] || "aws";
  const buildInfo = getBuildInfo(img);
  const title = $("#launch-title");
  const description = $("#launch-description");
  const body = $("#launch-body");
  const providers = {
    aws: {
      title: "Launch with Amazon Web Services",
      html: `
        <ol>
          <li>Navigate to the <a href="https://console.aws.amazon.com" target="_blank" rel="noopener">AWS console <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a>. Locate <strong>${img.name}</strong> on the AMI page.</li>
          <li>Copy <strong>${img.name}</strong> to make it a permanent copy in your account.
            <ul>
              <li>Shared with account: ${buildInfo.sharedWith}</li>
              <li>AMI ID: ${buildInfo.imageValue}</li>
            </ul>
          </li>
          <li>Launch <strong>${img.name}</strong> as an instance.</li>
          <li>Connect to it via SSH using the following username: <strong>ec2-user</strong></li>
        </ol>`,
    },
    azure: {
      title: "Launch with Microsoft Azure",
      html: `
        <ol>
          <li>Locate <strong>${escapeHtml(img.name)}</strong> on the <a href="https://portal.azure.com" target="_blank" rel="noopener">Azure console <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a>.</li>
          <li>Create a Virtual Machine (VM) by using the shared image.<br><br>Note: Review the Availability Zone and the Size to meet your requirements. Adjust these settings as needed.</li>
        </ol>`,
    },
    gcp: {
      title: "Launch with Google Cloud Platform",
      html: `
        <ol>
          <li>Install the gcloud CLI and login. See the <a href="https://cloud.google.com/sdk/docs/install" target="_blank" rel="noopener">Install gcloud CLI <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a> documentation.
            ${launchCommandField("sudo dnf install google-cloud-cli")}
          </li>
          <li>Authorize gcloud CLI to the following account: <strong>anilsson@redhat.com</strong>,</li>
          <li>Enter your project ID to create the image in your project,
            <div class="pf-v6-c-form-control pf-v6-u-mt-sm">
              <input type="text" id="launch-gcp-project-id" placeholder="project ID" aria-label="project ID" />
            </div>
            ${launchCommandField(buildGcpImageCommand(""), { id: "launch-gcp-image-cmd-field", expandable: true })}
          </li>
          <li>Create an instance of your image by either accessing the <a href="https://console.cloud.google.com/compute/instances" target="_blank" rel="noopener">GCP console <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a> or by running the following command:</li>
        </ol>`,
    },
    oci: {
      title: "Launch with Oracle Cloud Infrastructure",
      html: `
        <ol>
          <li>Navigate to <a href="https://cloud.oracle.com" target="_blank" rel="noopener">Oracle Cloud's Custom images <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a> page.</li>
          <li>Select <strong>Import image</strong>, and enter the Object Storage URL of the image.
            <div class="pf-v6-c-form-control pf-v6-u-mt-sm">
              <input type="text" placeholder="object storage URL" aria-label="object storage URL" />
            </div>
          </li>
          <li>After the image is available, click on <strong>Create instance</strong>.</li>
        </ol>`,
    },
  };

  const p = providers[target] || providers.aws;
  title.textContent = p.title;
  description.textContent = img.name;
  body.innerHTML = p.html;
  body.querySelectorAll(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigator.clipboard?.writeText(btn.dataset.copy);
      showToast("Copied to clipboard");
    });
  });
  bindLaunchCommandExpanders(body);

  if (target === "gcp") {
    $("#launch-gcp-project-id")?.addEventListener("input", syncGcpLaunchImageCommand);
    syncGcpLaunchImageCommand();
  }

  openModal("launch");
}

function initImportModal() {
  const filename = $("#upload-filename");
  const clearBtn = $("#btn-clear");
  const importBtn = $("#btn-import-submit");
  const blueprintText = $("#import-blueprint-content");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,.toml";
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  const updateImportState = () => {
    const hasFile = Boolean(filename.value.trim());
    const hasText = Boolean(blueprintText?.value.trim());
    const canImport = hasFile || hasText;
    importBtn.disabled = !canImport;
    clearBtn.disabled = !hasFile && !hasText;
  };

  $("#btn-upload").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
      filename.value = fileInput.files[0].name;
      updateImportState();
    }
  });

  blueprintText?.addEventListener("input", updateImportState);

  clearBtn.addEventListener("click", () => {
    filename.value = "";
    fileInput.value = "";
    if (blueprintText) blueprintText.value = "";
    updateImportState();
  });

  importBtn.addEventListener("click", () => {
    showToast("Blueprint imported (prototype)");
    closeModals();
  });

  updateImportState();
}

function render() {
  renderFilters();
  renderFilterValueControl();
  renderTable();
}

function init() {
  renderIsoCards("#network-images", ISO_CARDS.network);
  renderIsoCards("#offline-dvd-images", ISO_CARDS.offline);
  renderIsoCards("#kvm-images", ISO_CARDS.kvm);

  $("#table-body").addEventListener("click", (e) => {
    const expandBtn = e.target.closest("[data-expand]");
    if (expandBtn) {
      e.preventDefault();
      e.stopPropagation();
      const id = expandBtn.dataset.expand;
      if (state.expanded.has(id)) state.expanded.delete(id);
      else state.expanded.add(id);
      renderTable();
    }
  });

  $("#select-all").addEventListener("change", (e) => {
    const filtered = getFilteredImages();
    const start = (state.page - 1) * state.perPage;
    const pageItems = filtered.slice(start, start + state.perPage);
    if (e.target.checked) {
      pageItems.forEach((i) => state.selected.add(i.id));
    } else {
      pageItems.forEach((i) => state.selected.delete(i.id));
    }
    renderTable();
  });

  $$("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.dataset.modal === "build-image") {
        openBuildImageModal();
        return;
      }
      openModal(btn.dataset.modal);
    });
  });

  $$("[data-close]").forEach((btn) => {
    btn.addEventListener("click", closeModals);
  });

  $("#modal-download-rhel")?.addEventListener("click", (e) => {
    if (e.target.closest("[data-build-latest]")) closeModals();
  });

  $("#modal-backdrop").addEventListener("click", (e) => {
    if (e.target !== e.currentTarget) return;
    if (isDismissOnlyByCloseModalOpen()) return;
    closeModals();
  });

  $("#details-close").addEventListener("click", () => {
    $("#details-popover").classList.add("hidden");
  });

  $("#build-progress-close")?.addEventListener("click", hideBuildProgressPopover);

  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".pf-filter-dropdown") &&
      !e.target.closest(".pf-value-filter-dropdown") &&
      !e.target.closest(".pagination-per-page-wrap") &&
      !e.target.closest(".pf-kebab-wrap") &&
      !e.target.closest(".pf-kebab-menu")
    ) {
      closeAllMenus();
      $$(".pf-kebab-menu").forEach((m) => m.remove());
    }
    if (!e.target.closest(".pf-v6-c-card") && !e.target.closest("#details-popover")) {
      $("#details-popover").classList.add("hidden");
    }
    if (
      !e.target.closest("#build-progress-popover") &&
      !e.target.closest("[data-build-progress]") &&
      !e.target.closest("[data-kebab-action='rebuild']") &&
      !e.target.closest("#btn-rebuild")
    ) {
      hideBuildProgressPopover();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (isDismissOnlyByCloseModalOpen()) return;
    closeModals();
  });

  $$(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigator.clipboard?.writeText(btn.dataset.copy);
      showToast("Copied to clipboard");
    });
  });

  $("#btn-edit")?.addEventListener("click", () => {
    if (state.selected.size !== 1) return;
    const [imageId] = state.selected;
    openBuildImageModal(imageId);
  });

  $("#btn-rebuild")?.addEventListener("click", () => {
    if (state.selected.size) startImageRebuild([...state.selected]);
  });

  $("#btn-duplicate")?.addEventListener("click", () => {
    if (state.selected.size) duplicateImages([...state.selected]);
  });

  initImportModal();
  initBuildImageModal();
  bindBuildProgressClicks();

  const closeMenusOnScroll = () => {
    if (state.openKebab) closeAllMenus();
  };
  window.addEventListener("scroll", closeMenusOnScroll, true);
  window.addEventListener("resize", () => {
    closeMenusOnScroll();
    if (!$("#build-progress-popover")?.classList.contains("hidden") && state.buildAnchorId) {
      positionBuildProgressPopover(state.buildAnchorId);
    }
  });

  render();
}

init();
