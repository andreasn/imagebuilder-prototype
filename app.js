const IMAGES = [
  {
    id: "web-frontend",
    name: "web-frontend",
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
    lastUpdated: "3 hours ago",
    os: "RHEL 8",
    target: "Azure",
    status: "expired",
    statusBadgeText: "Expires in 6 hours",
    favorited: false,
    instanceAction: "download",
  },
  {
    id: "notification-service",
    name: "notification-service",
    lastUpdated: "Aug 25, 2025",
    os: "RHEL 9",
    target: "GCP",
    status: "failed",
    favorited: true,
    instanceAction: "download",
  },
  {
    id: "api-backend",
    name: "api-backend",
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
    lastUpdated: "Aug 16, 2025",
    os: "RHEL 8",
    target: "GCP",
    status: "expired",
    favorited: false,
    instanceAction: "download",
  },
  {
    id: "demo-environment",
    name: "demo-environment",
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
};

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

function renderStatusBadge(status, tooltip, { forFilter = false, img = null } = {}) {
  const st = statusLabel(status);
  const displayText = img?.statusBadgeText ?? st.text;
  const tipText = tooltip ?? (img ? getStatusTooltip(img) : STATUS_TOOLTIPS[status] || "");
  const filterClass = forFilter ? " pf-m-status-filter-label" : "";
  const badge = `<span class="pf-v6-c-label pf-m-${st.mod} pf-m-outline${filterClass}">
    <span class="pf-v6-c-label__content">
      <span class="pf-v6-c-label__icon"><i class="fas ${st.icon}" aria-hidden="true"></i></span>
      <span class="pf-v6-c-label__text">${displayText}</span>
    </span>
  </span>`;

  if (forFilter || !tipText) return badge;

  return `<span class="status-label-tooltip-host" tabindex="0" aria-label="${escapeAttr(tipText)}">${badge}${renderStatusTooltip(tipText)}</span>`;
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

  list.sort((a, b) => {
    const cmp = a.name.localeCompare(b.name);
    return state.sortAsc ? cmp : -cmp;
  });

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
        ${dl("Status", renderStatusBadge(img.status, null, { forFilter: true }))}
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
        const instanceLabel =
          img.instanceAction === "launch"
            ? `<button type="button" class="pf-v6-c-button pf-m-link" data-launch="${img.id}">Launch instance</button>`
            : `<button type="button" class="pf-v6-c-button pf-m-link" data-download="${img.id}">Download image</button>`;
        const expanded = state.expanded.has(img.id);
        const selected = state.selected.has(img.id);
        const favoriteCellClass = img.favorited ? " pf-m-favorited" : "";

        const expandContentId = `expand-content-${img.id}`;

        let rows = `
          <tr class="pf-v6-c-table__tr${expanded ? " pf-m-expanded" : ""}" data-id="${img.id}">
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
            <th class="pf-v6-c-table__td" data-label="Name" scope="row">
              <button type="button" class="pf-v6-c-button pf-m-link">${img.name}</button>
            </th>
            <td class="pf-v6-c-table__td" data-label="Last updated">${img.lastUpdated}</td>
            <td class="pf-v6-c-table__td" data-label="Operating system">${img.os}</td>
            <td class="pf-v6-c-table__td" data-label="Target environment">${img.target}</td>
            <td class="pf-v6-c-table__td" data-label="Status">${renderStatusBadge(img.status, null, { img })}</td>
            <td class="pf-v6-c-table__td" data-label="Instance">${instanceLabel}</td>
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
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem">Edit</button></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem">Duplicate</button></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem">Rebuild</button></li>
        <li class="pf-v6-c-divider" role="separator"></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem">Download image</button></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item" role="menuitem">Download blueprint (.json)</button></li>
        <li class="pf-v6-c-divider" role="separator"></li>
        <li role="none"><button type="button" class="pf-v6-c-menu__item pf-m-danger" role="menuitem">Delete</button></li>
      </ul>`;
      positionKebabMenu(menu, btn);
      menu.querySelector(".pf-m-danger")?.addEventListener("click", () => {
        showToast(`Delete ${id} (prototype)`);
        closeAllMenus();
      });
      menu.querySelectorAll(".pf-v6-c-menu__item:not(.pf-m-danger)").forEach((b) => {
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
  $("#btn-edit").disabled = !hasSelection;
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
              <button type="button" class="pf-v6-c-button pf-m-primary pf-m-small">Build latest</button>
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
  $$("#modal-backdrop .pf-v6-c-modal-box").forEach((m) => m.classList.add("hidden"));
  $("#details-popover").classList.add("hidden");
  document.documentElement.classList.remove("pf-modal-open");
}

function launchCodeBlock(code) {
  return `
    <div class="pf-v6-c-code-block pf-v6-u-mt-sm">
      <div class="pf-v6-c-code-block__header">
        <div class="pf-v6-c-code-block__actions">
          <button type="button" class="pf-v6-c-button pf-m-plain btn-copy" data-copy="${escapeAttr(code)}" aria-label="Copy">
            <span class="pf-v6-c-button__icon"><i class="fas fa-copy" aria-hidden="true"></i></span>
          </button>
        </div>
      </div>
      <div class="pf-v6-c-code-block__content">
        <pre class="pf-v6-c-code-block__pre"><code>${code}</code></pre>
      </div>
    </div>`;
}

function openLaunchModal(img, provider) {
  const target = provider || TARGET_MAP[img.target] || "aws";
  const buildInfo = getBuildInfo(img);
  const title = $("#launch-title");
  const description = $("#launch-description");
  const body = $("#launch-body");
  const gcloudCmd = `gcloud compute images create ${img.name} --source-image-project red-hat-image-builder`;

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
          <li>Locate <strong>${img.name}</strong> on the <a href="https://portal.azure.com" target="_blank" rel="noopener">Azure console <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a>.</li>
          <li>Create a Virtual Machine (VM) by using the shared image.<br>
            <em>Note: Review the Availability Zone and the Size to meet your requirements. Adjust these settings as needed.</em></li>
        </ol>`,
    },
    gcp: {
      title: "Launch with Google Cloud Platform",
      html: `
        <ol>
          <li>Install the gcloud CLI and login. See the <a href="https://cloud.google.com/sdk/docs/install" target="_blank" rel="noopener">Install gcloud CLI <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a> documentation.
            ${launchCodeBlock("sudo dnf install google-cloud-cli")}
          </li>
          <li>Authorize gcloud CLI to the following account: <strong>anilsson@redhat.com</strong></li>
          <li>Enter your project ID to create the image in your project.
            <div class="pf-v6-c-form-control pf-v6-u-mt-sm">
              <input type="text" placeholder="project ID" aria-label="project ID" />
            </div>
            ${launchCodeBlock(gcloudCmd)}
          </li>
          <li>Create an instance of your image by either accessing the <a href="https://console.cloud.google.com/compute/instances" target="_blank" rel="noopener">GCP console <i class="fas fa-external-link-alt pf-v6-u-ml-xs" aria-hidden="true"></i></a> or by running the gcloud command.</li>
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
  openModal("launch");
}

function initImportModal() {
  const filename = $("#upload-filename");
  const clearBtn = $("#btn-clear");
  const importBtn = $("#btn-import-submit");
  const dropzone = $("#upload-dropzone");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,.toml";
  fileInput.hidden = true;
  document.body.appendChild(fileInput);

  $("#btn-upload").addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
      filename.value = fileInput.files[0].name;
      clearBtn.disabled = false;
      importBtn.disabled = false;
      dropzone.innerHTML = `<p><strong>${fileInput.files[0].name}</strong></p><p class="upload-hint">Ready to import.</p>`;
    }
  });

  clearBtn.addEventListener("click", () => {
    filename.value = "";
    fileInput.value = "";
    clearBtn.disabled = true;
    importBtn.disabled = true;
    dropzone.innerHTML = '<p class="upload-hint">Upload your blueprint file. Supported formats: JSON, TOML.</p>';
  });

  importBtn.addEventListener("click", () => {
    showToast("Blueprint imported (prototype)");
    closeModals();
  });

  ["dragenter", "dragover"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add("pf-m-dragover");
    });
  });
  ["dragleave", "drop"].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove("pf-m-dragover");
      if (ev === "drop" && e.dataTransfer?.files[0]) {
        filename.value = e.dataTransfer.files[0].name;
        clearBtn.disabled = false;
        importBtn.disabled = false;
      }
    });
  });
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
    btn.addEventListener("click", () => openModal(btn.dataset.modal));
  });

  $$("[data-close]").forEach((btn) => {
    btn.addEventListener("click", closeModals);
  });

  $("#modal-backdrop").addEventListener("click", closeModals);

  $("#details-close").addEventListener("click", () => {
    $("#details-popover").classList.add("hidden");
  });

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
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModals();
  });

  $$(".btn-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigator.clipboard?.writeText(btn.dataset.copy);
      showToast("Copied to clipboard");
    });
  });

  ["#btn-edit", "#btn-duplicate", "#btn-rebuild"].forEach((sel) => {
    $(sel)?.addEventListener("click", () => {
      if (state.selected.size) showToast(`${sel.slice(5)} action on ${state.selected.size} item(s) (prototype)`);
    });
  });

  initImportModal();

  const closeMenusOnScroll = () => {
    if (state.openKebab) closeAllMenus();
  };
  window.addEventListener("scroll", closeMenusOnScroll, true);
  window.addEventListener("resize", closeMenusOnScroll);

  render();
}

init();
