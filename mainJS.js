const translations = window.portfolioTranslations;
let currentLanguage = "sv";
try {
  const savedLanguage = localStorage.getItem("portfolio-language");
  if (savedLanguage === "sv" || savedLanguage === "en") currentLanguage = savedLanguage;
} catch (_) {
  // Swedish remains the default if storage is unavailable.
}

function translate(key) {
  return translations[currentLanguage]?.[key] ?? translations.sv?.[key] ?? key;
}

function formatTranslation(key, values = {}) {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    translate(key),
  );
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu]");
const nav = document.querySelector("[data-nav]");
const menuLinks = [...nav.querySelectorAll("a")];
const languageButtons = [...document.querySelectorAll("[data-language]")];
const languageStatus = document.querySelector("[data-language-status]");
const progressBar = document.querySelector(".page-progress span");
const mobileMenuQuery = window.matchMedia("(max-width: 900px)");
const introWasSeen = document.documentElement.classList.contains("intro-seen");
const mainContent = document.querySelector("main");
const footerContent = document.querySelector("footer");
const chapterRail = document.querySelector("[data-chapter-rail]");
const chapterLinks = [...document.querySelectorAll("[data-chapter-link]")];
const commandTrigger = document.querySelector("[data-command-open]");
const commandShortcut = document.querySelector("[data-command-shortcut]");
const commandDialog = document.querySelector("[data-command-dialog]");
const commandCloseButton = document.querySelector("[data-command-close]");
const commandSearch = document.querySelector("[data-command-search]");
const commandResults = document.querySelector("[data-command-results]");
const commandStatus = document.querySelector("[data-command-status]");

const platformName = navigator.userAgentData?.platform ?? navigator.platform ?? "";
if (/mac/i.test(platformName)) commandShortcut.textContent = "⌘ K";

document.querySelector("[data-year]").textContent = new Date().getFullYear();
try {
  sessionStorage.setItem("portfolio-intro-seen", "true");
} catch (_) {
  // The intro still works when session storage is unavailable.
}

function updatePageChrome() {
  header.classList.toggle("scrolled", window.scrollY > 32);
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
}

let scrollFramePending = false;
function requestPageChromeUpdate() {
  if (scrollFramePending) return;
  scrollFramePending = true;
  requestAnimationFrame(() => {
    updatePageChrome();
    scrollFramePending = false;
  });
}

updatePageChrome();
window.addEventListener("scroll", requestPageChromeUpdate, { passive: true });
window.addEventListener("resize", requestPageChromeUpdate, { passive: true });

let menuScrollPosition = 0;

function setMenuState(open, restoreFocus = true) {
  const wasOpen = document.body.classList.contains("menu-open");
  document.body.classList.toggle("menu-open", open);
  document.documentElement.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", translate(open ? "menu.close" : "menu.open"));
  [mainContent, footerContent, chapterRail].forEach((element) => {
    element?.toggleAttribute("inert", open);
  });

  if (mobileMenuQuery.matches && open && !wasOpen) {
    menuScrollPosition = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${menuScrollPosition}px`;
    document.body.style.width = "100%";
  } else if (!open && wasOpen && document.body.style.position === "fixed") {
    document.body.style.removeProperty("position");
    document.body.style.removeProperty("top");
    document.body.style.removeProperty("width");
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, menuScrollPosition);
    if (previousScrollBehavior) {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    } else {
      document.documentElement.style.removeProperty("scroll-behavior");
    }
  }

  if (open) {
    requestAnimationFrame(() => menuLinks[0]?.focus({ preventScroll: true }));
  } else if (restoreFocus) {
    menuButton.focus({ preventScroll: true });
  }
}

menuButton.addEventListener("click", () => {
  setMenuState(!document.body.classList.contains("menu-open"));
});

nav.addEventListener("click", (event) => {
  if (!event.target.matches("a")) return;
  setMenuState(false, false);
});

document.addEventListener("keydown", (event) => {
  if (!document.body.classList.contains("menu-open")) return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenuState(false);
    return;
  }

  if (event.key !== "Tab") return;
  const focusableElements = [...menuLinks, commandTrigger, ...languageButtons, menuButton];
  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

mobileMenuQuery.addEventListener("change", (event) => {
  if (!event.matches && document.body.classList.contains("menu-open")) {
    setMenuState(false, false);
  }
});

const commandItems = [
  {
    group: "sections",
    mark: "00",
    labelKey: "chapter.top",
    detailKey: "command.sectionStartDetail",
    href: "#top",
    keywords: "start hero intro presentation developer utvecklare",
  },
  {
    group: "sections",
    mark: "01",
    labelKey: "nav.projects",
    detailKey: "command.sectionProjectsDetail",
    href: "#projects",
    keywords: "projects projekt work portfolio case",
  },
  {
    group: "sections",
    mark: "02",
    labelKey: "nav.about",
    detailKey: "command.sectionAboutDetail",
    href: "#about",
    keywords: "about om mig background bakgrund learn språk language",
  },
  {
    group: "sections",
    mark: "03",
    labelKey: "chapter.process",
    detailKey: "command.sectionProcessDetail",
    href: "#process",
    keywords: "process arbetssätt workflow method metod",
  },
  {
    group: "sections",
    mark: "04",
    labelKey: "nav.experience",
    detailKey: "command.sectionExperienceDetail",
    href: "#experience",
    keywords: "experience erfarenhet education utbildning internship praktik",
  },
  {
    group: "sections",
    mark: "05",
    labelKey: "chapter.toolkit",
    detailKey: "command.sectionToolkitDetail",
    href: "#toolkit",
    keywords: "technology teknik stack tools verktyg c# asp.net dotnet api backend frontend integration react typescript azure",
  },
  {
    group: "sections",
    mark: "06",
    labelKey: "chapter.contact",
    detailKey: "command.sectionContactDetail",
    href: "#contact",
    keywords: "contact kontakt email mejl linkedin github",
  },
  {
    group: "projects",
    mark: "01",
    label: "CreaCV",
    detailKey: "command.projectCreaCvDetail",
    href: "https://staging.creacv.net/",
    external: true,
    keywords: "nextjs typescript openai ai saas pdf cv",
  },
  {
    group: "projects",
    mark: "02",
    labelKey: "project2.title",
    detailKey: "command.projectClimbDetail",
    href: "https://eskilstunaklatterklubb.se/",
    external: true,
    keywords: "umbraco dotnet swish climbing klättring integration",
  },
  {
    group: "projects",
    mark: "05",
    label: "Pure SkinLab",
    detailKey: "command.projectSkinDetail",
    href: "https://pureskinlab.se/",
    external: true,
    keywords: "client kund website webb responsive skin hud",
  },
  {
    group: "projects",
    mark: "06",
    label: "Nordic Axis",
    detailKey: "command.projectAxisDetail",
    href: "https://www.nordicaxiskiropraktik.se/",
    external: true,
    keywords: "client kund website webb chiropractic kiropraktik responsive",
  },
  {
    group: "actions",
    mark: "PDF",
    labelKey: "command.actionCv",
    detailKey: "command.actionCvDetail",
    href: "cv/yaarub-nassr-cv.pdf",
    download: true,
    keywords: "cv resume meritförteckning download ladda ner pdf",
  },
  {
    group: "actions",
    mark: "@",
    labelKey: "command.actionEmail",
    detailKey: "command.actionEmailDetail",
    href: "mailto:yaarubnassr@gmail.com",
    keywords: "email mejl contact kontakt message meddelande",
  },
  {
    group: "actions",
    mark: "SV",
    labelKey: "command.actionLanguage",
    detailKey: "command.actionLanguageDetail",
    action: "language",
    keywords: "language språk english engelska swedish svenska",
  },
];

const commandGroupLabels = {
  sections: "command.groupSections",
  projects: "command.groupProjects",
  actions: "command.groupActions",
};

let lastCommandTrigger = commandTrigger;
let restoreCommandFocus = true;

function normalizeSearchValue(value) {
  return value
    .toLocaleLowerCase(currentLanguage)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getCommandItemLabel(item) {
  return item.labelKey ? translate(item.labelKey) : item.label;
}

function createCommandItem(item) {
  const control = document.createElement(item.href ? "a" : "button");
  control.className = "command-item";
  control.dataset.commandItem = "";
  if (item.href) {
    control.href = item.href;
    if (item.external) {
      control.target = "_blank";
      control.rel = "noreferrer";
    }
    if (item.download) control.setAttribute("download", "");
  } else {
    control.type = "button";
  }

  const mark = document.createElement("span");
  mark.className = "command-item__mark";
  mark.textContent = item.action === "language" ? (currentLanguage === "sv" ? "EN" : "SV") : item.mark;

  const copy = document.createElement("span");
  copy.className = "command-item__copy";
  const label = document.createElement("strong");
  label.textContent = getCommandItemLabel(item);
  const detail = document.createElement("span");
  detail.textContent = translate(item.detailKey);
  copy.append(label, detail);

  const arrow = document.createElement("span");
  arrow.className = "command-item__arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = item.external ? "↗" : "→";
  control.append(mark, copy, arrow);

  control.addEventListener("click", (event) => {
    if (item.action === "language") {
      event.preventDefault();
      applyLanguage(currentLanguage === "sv" ? "en" : "sv", { announce: true });
    }
    closeCommandPalette(false);
  });
  return control;
}

function renderCommandResults(query = "") {
  const normalizedQuery = normalizeSearchValue(query.trim());
  const matches = commandItems.filter((item) => {
    if (!normalizedQuery) return true;
    const searchableText = [
      getCommandItemLabel(item),
      translate(item.detailKey),
      item.keywords,
    ].join(" ");
    return normalizeSearchValue(searchableText).includes(normalizedQuery);
  });

  commandResults.replaceChildren();
  Object.keys(commandGroupLabels).forEach((groupName) => {
    const groupItems = matches.filter((item) => item.group === groupName);
    if (!groupItems.length) return;

    const group = document.createElement("section");
    group.className = "command-group";
    const label = document.createElement("p");
    label.className = "command-group__label";
    label.textContent = translate(commandGroupLabels[groupName]);
    const items = document.createElement("div");
    items.className = "command-group__items";
    groupItems.forEach((item) => items.append(createCommandItem(item)));
    group.append(label, items);
    commandResults.append(group);
  });

  if (!matches.length) {
    const empty = document.createElement("p");
    empty.className = "command-empty";
    empty.textContent = translate("command.noResults");
    commandResults.append(empty);
  }
  commandStatus.textContent = formatTranslation("command.results", { count: matches.length });
}

function openCommandPalette(trigger = commandTrigger) {
  if (document.body.classList.contains("menu-open")) setMenuState(false, false);
  lastCommandTrigger = trigger;
  restoreCommandFocus = true;
  document.body.classList.add("command-open");
  commandSearch.value = "";
  renderCommandResults();
  commandDialog.showModal();
  requestAnimationFrame(() => commandSearch.focus({ preventScroll: true }));
}

function closeCommandPalette(restoreFocus = true) {
  if (!commandDialog.open) return;
  restoreCommandFocus = restoreFocus;
  commandDialog.close();
}

commandTrigger.addEventListener("click", () => openCommandPalette(commandTrigger));
commandCloseButton.addEventListener("click", () => closeCommandPalette());
commandDialog.addEventListener("click", (event) => {
  if (event.target === commandDialog) closeCommandPalette();
});
commandDialog.addEventListener("cancel", () => {
  restoreCommandFocus = true;
});
commandDialog.addEventListener("close", () => {
  document.body.classList.remove("command-open");
  if (!restoreCommandFocus) return;
  const desktopFocusTarget = lastCommandTrigger === document.body ? commandTrigger : lastCommandTrigger;
  const focusTarget = mobileMenuQuery.matches ? menuButton : desktopFocusTarget;
  focusTarget?.focus({ preventScroll: true });
});
commandSearch.addEventListener("input", () => renderCommandResults(commandSearch.value));
commandSearch.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown") return;
  const firstResult = commandResults.querySelector("[data-command-item]");
  if (!firstResult) return;
  event.preventDefault();
  firstResult.focus();
});
commandResults.addEventListener("keydown", (event) => {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const resultItems = [...commandResults.querySelectorAll("[data-command-item]")];
  if (!resultItems.length) return;
  event.preventDefault();
  const currentIndex = resultItems.indexOf(document.activeElement);
  let nextIndex = currentIndex;
  if (event.key === "ArrowDown") nextIndex = (currentIndex + 1) % resultItems.length;
  if (event.key === "ArrowUp") nextIndex = (currentIndex - 1 + resultItems.length) % resultItems.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = resultItems.length - 1;
  resultItems[nextIndex].focus();
});
document.addEventListener("keydown", (event) => {
  if (event.key.toLocaleLowerCase() !== "k" || (!event.ctrlKey && !event.metaKey)) return;
  event.preventDefault();
  if (commandDialog.open) {
    closeCommandPalette();
  } else {
    openCommandPalette(document.activeElement);
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -7%" },
);

document.querySelectorAll(".reveal").forEach((element, index) => {
  if (element.closest(".hero")) {
    const baseDelay = introWasSeen ? 0.05 : 0.78;
    element.style.transitionDelay = `${baseDelay + index * 0.07}s`;
  }
  revealObserver.observe(element);
});

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav a")];
const heroChapterCount = document.querySelector(".hero__footer > span:last-child");

function setActiveChapter(sectionId) {
  navLinks.forEach((link) => {
    const active = link.hash === `#${sectionId}`;
    link.classList.toggle("active", active);
    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  chapterLinks.forEach((link) => {
    const active = link.dataset.chapterLink === sectionId;
    link.classList.toggle("is-active", active);
    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
  const activeIndex = Math.max(
    0,
    chapterLinks.findIndex((link) => link.dataset.chapterLink === sectionId),
  );
  const progress = chapterLinks.length > 1 ? activeIndex / (chapterLinks.length - 1) : 0;
  chapterRail.style.setProperty("--chapter-progress", String(progress));
  chapterRail.classList.toggle("is-on-light", sectionId === "toolkit");
}

if (heroChapterCount) {
  heroChapterCount.textContent = `00 / ${String(Math.max(0, chapterLinks.length - 1)).padStart(2, "0")}`;
}
setActiveChapter("top");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
    if (!visible) return;
    setActiveChapter(visible.target.id);
  },
  { rootMargin: "-34% 0px -56%", threshold: 0 },
);
sections.forEach((section) => sectionObserver.observe(section));

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    },
    { passive: true },
  );

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1100px) rotateX(${y * -2.5}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1100px) rotateX(0) rotateY(0)";
    });
  });

  document.querySelectorAll(".project:has(> a)").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--card-x", `${x}%`);
      card.style.setProperty("--card-y", `${y}%`);
      card.classList.add("is-pointer-active");
    });
    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-pointer-active");
    });
  });

  document.querySelectorAll(".magnetic").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      element.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
    });
    element.addEventListener("pointerleave", () => {
      element.style.transform = "translate(0, 0)";
    });
  });

  const cursorOrb = document.querySelector(".cursor-orb");
  window.addEventListener(
    "pointermove",
    (event) => {
      cursorOrb.style.left = `${event.clientX}px`;
      cursorOrb.style.top = `${event.clientY}px`;
    },
    { passive: true },
  );
  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("[data-cursor]");
    if (!target) return;
    cursorOrb.querySelector("span").textContent = target.dataset.cursor || translate("global.cursorOpen");
    cursorOrb.classList.add("is-visible");
  });
  document.addEventListener("pointerout", (event) => {
    const target = event.target.closest("[data-cursor]");
    if (!target || target.contains(event.relatedTarget)) return;
    cursorOrb.classList.remove("is-visible");
  });
  document.documentElement.addEventListener("mouseleave", () => cursorOrb.classList.remove("is-visible"));
}

const heroFocusButtons = [...document.querySelectorAll("[data-hero-focus]")];
const heroFocusCopy = document.querySelector("[data-hero-focus-copy]");
const routeNodes = [...document.querySelectorAll("[data-route-node]")];
const routeOrder = ["idea", "backend", "frontend", "integration"];

heroFocusButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const focus = button.dataset.heroFocus;
    heroFocusButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    const focusIndex = routeOrder.indexOf(focus);
    routeNodes.forEach((node) => node.classList.toggle("is-active", routeOrder.indexOf(node.dataset.routeNode) <= focusIndex));
    heroFocusCopy.animate?.(
      [
        { opacity: 0, transform: "translateY(5px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: reducedMotion ? 1 : 280, easing: "ease-out" },
    );
    heroFocusCopy.textContent = translate(`hero.focus.${focus}`);
  });
});

const projectFilterButtons = [...document.querySelectorAll("[data-project-filter]")];
const projects = [...document.querySelectorAll(".project[data-category]")];
const projectStatus = document.querySelector("[data-project-status]");
let activeProjectFilter = "all";

function updateProjectFilterCounts() {
  projectFilterButtons.forEach((button) => {
    const filter = button.dataset.projectFilter;
    const count = filter === "all"
      ? projects.length
      : projects.filter((project) => project.dataset.category === filter).length;
    const countElement = button.querySelector("span");
    if (countElement) countElement.textContent = String(count).padStart(2, "0");
  });
}

function updateProjectStatus() {
  const visibleCount = projects.filter((project) => !project.hidden).length;
  if (activeProjectFilter === "all") {
    projectStatus.textContent = formatTranslation("projects.statusAll", { count: visibleCount });
  } else if (visibleCount === 1) {
    projectStatus.textContent = translate("projects.statusOne");
  } else {
    projectStatus.textContent = formatTranslation("projects.statusCount", { count: visibleCount });
  }
}

projectFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.projectFilter;
    activeProjectFilter = filter;
    const updateProjects = () => {
      projects.forEach((project) => {
        const visible = filter === "all" || project.dataset.category === filter;
        project.hidden = !visible;
      });
      projectFilterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      updateProjectStatus();
    };

    if (!reducedMotion && document.startViewTransition) {
      try {
        document.startViewTransition(updateProjects);
      } catch (_) {
        updateProjects();
      }
      return;
    }
    updateProjects();
  });
});
updateProjectFilterCounts();

const processDeck = document.querySelector("[data-process-deck]");
const processCards = [...document.querySelectorAll("[data-process-card]")];
const processCount = document.querySelector("[data-process-count]");
const processProgress = document.querySelector("[data-process-progress]");
const processPrevious = document.querySelector("[data-process-prev]");
const processNext = document.querySelector("[data-process-next]");
let processIndex = 0;
let processStartX = 0;
let processDragX = 0;
let suppressProcessClickUntil = 0;

function updateProcessDeck(nextIndex) {
  processIndex = (nextIndex + processCards.length) % processCards.length;
  processCards.forEach((card, cardIndex) => {
    const position = (cardIndex - processIndex + processCards.length) % processCards.length;
    card.dataset.position = String(position);
    card.classList.toggle("is-active", position === 0);
    card.setAttribute("aria-hidden", String(position !== 0));
    card.style.removeProperty("--drag-x");
    card.style.removeProperty("--drag-r");
  });
  processCount.textContent = `${String(processIndex + 1).padStart(2, "0")} / ${String(processCards.length).padStart(2, "0")}`;
  processProgress.style.transform = `scaleX(${(processIndex + 1) / processCards.length})`;
}

processPrevious.addEventListener("click", () => updateProcessDeck(processIndex - 1));
processNext.addEventListener("click", () => updateProcessDeck(processIndex + 1));
processDeck.addEventListener("click", (event) => {
  if (Date.now() < suppressProcessClickUntil || event.target.closest("button")) return;
  updateProcessDeck(processIndex + 1);
});
processDeck.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) return;
  event.preventDefault();
  updateProcessDeck(event.key === "ArrowLeft" ? processIndex - 1 : processIndex + 1);
});

processCards.forEach((card) => {
  card.addEventListener("pointerdown", (event) => {
    if (card.dataset.position !== "0" || event.button !== 0) return;
    processStartX = event.clientX;
    processDragX = 0;
    card.classList.add("is-dragging");
    card.setPointerCapture(event.pointerId);
  });
  card.addEventListener("pointermove", (event) => {
    if (!card.classList.contains("is-dragging")) return;
    processDragX = event.clientX - processStartX;
    card.style.setProperty("--drag-x", `${processDragX}px`);
    card.style.setProperty("--drag-r", `${processDragX * 0.018}deg`);
  });
  card.addEventListener("pointerup", (event) => {
    if (!card.classList.contains("is-dragging")) return;
    card.classList.remove("is-dragging");
    card.releasePointerCapture(event.pointerId);
    if (Math.abs(processDragX) > 65) {
      suppressProcessClickUntil = Date.now() + 350;
      updateProcessDeck(processDragX < 0 ? processIndex + 1 : processIndex - 1);
    } else {
      card.style.removeProperty("--drag-x");
      card.style.removeProperty("--drag-r");
    }
  });
  card.addEventListener("pointercancel", () => {
    card.classList.remove("is-dragging");
    card.style.removeProperty("--drag-x");
    card.style.removeProperty("--drag-r");
  });
});
updateProcessDeck(0);

const stackContent = {
  backend: {
    label: "BACKEND",
    title: "Backend",
    descriptionKey: "stack.backendDescription",
    pipeline: ["C#", "ASP.NET Core", "Web API"],
    tools: ["C#", "ASP.NET Core", "Razor Pages", "Web API", "Entity Framework", "SQL"],
  },
  frontend: {
    label: "FRONTEND",
    title: "Frontend",
    descriptionKey: "stack.frontendDescription",
    pipeline: ["TypeScript", "React / Next.js", "UI"],
    tools: ["TypeScript", "JavaScript", "React", "Next.js", "HTML", "CSS"],
  },
  delivery: {
    labelKey: "stack.deliveryLabel",
    titleKey: "stack.deliveryTitle",
    descriptionKey: "stack.deliveryDescription",
    pipeline: ["Integration", "Azure / CI/CD", "Live"],
    tools: ["Azure", "Azure DevOps", "CI/CD", "Docker", "Git", "Umbraco", "Optimizely", "Swish"],
  },
};
const stackTabs = [...document.querySelectorAll("[data-stack-tab]")];
const stackPanel = document.querySelector(".stack-panel");
const stackPipeline = document.querySelector("[data-stack-pipeline]");
const stackLabel = document.querySelector("[data-stack-label]");
const stackTitle = document.querySelector("[data-stack-title]");
const stackDescription = document.querySelector("[data-stack-description]");
const stackTools = document.querySelector("[data-stack-tools]");

function selectStack(tab, focusPanel = false) {
  const content = stackContent[tab.dataset.stackTab];
  stackTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  stackLabel.textContent = content.labelKey ? translate(content.labelKey) : content.label;
  stackTitle.textContent = content.titleKey ? translate(content.titleKey) : content.title;
  stackDescription.textContent = translate(content.descriptionKey);
  stackPipeline.innerHTML = content.pipeline.map((item, index) => `${index ? "<i></i>" : ""}<span>${item}</span>`).join("");
  stackTools.innerHTML = content.tools.map((item) => `<span>${item}</span>`).join("");
  stackPanel.setAttribute("aria-labelledby", tab.id);
  stackPipeline.classList.remove("is-animating");
  requestAnimationFrame(() => stackPipeline.classList.add("is-animating"));
  if (focusPanel) stackPanel.focus({ preventScroll: true });
}

stackTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectStack(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (["ArrowRight", "ArrowDown"].includes(event.key)) nextIndex = (index + 1) % stackTabs.length;
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) nextIndex = (index - 1 + stackTabs.length) % stackTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = stackTabs.length - 1;
    stackTabs[nextIndex].focus();
    selectStack(stackTabs[nextIndex]);
  });
});
selectStack(stackTabs[0]);

const timelineItems = [...document.querySelectorAll(".timeline__item")];
const timelineObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => entry.target.classList.toggle("is-current", entry.isIntersecting));
  },
  { rootMargin: "-38% 0px -42%", threshold: 0 },
);
timelineItems.forEach((item) => timelineObserver.observe(item));

const copyEmailButton = document.querySelector("[data-copy-email]");
const copyEmailStatus = document.querySelector("[data-copy-status]");
let copyResetTimer;
copyEmailButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("yaarubnassr@gmail.com");
    window.clearTimeout(copyResetTimer);
    copyEmailButton.textContent = translate("contact.copied");
    copyEmailButton.classList.add("is-copied");
    copyEmailStatus.textContent = translate("contact.copyStatus");
    copyResetTimer = window.setTimeout(() => {
      copyEmailButton.textContent = translate("contact.copy");
      copyEmailButton.classList.remove("is-copied");
    }, 2200);
  } catch (_) {
    copyEmailStatus.textContent = translate("contact.copyError");
  }
});

const translatedAttributes = [
  ["data-i18n-aria-label", "aria-label"],
  ["data-i18n-aria-roledescription", "aria-roledescription"],
  ["data-i18n-alt", "alt"],
  ["data-i18n-content", "content"],
  ["data-i18n-cursor", "data-cursor"],
  ["data-i18n-placeholder", "placeholder"],
];

function applyLanguage(language, { persist = true, announce = false } = {}) {
  if (!translations[language]) return;
  currentLanguage = language;
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = translate(element.dataset.i18nHtml);
  });
  translatedAttributes.forEach(([sourceAttribute, targetAttribute]) => {
    document.querySelectorAll(`[${sourceAttribute}]`).forEach((element) => {
      element.setAttribute(targetAttribute, translate(element.getAttribute(sourceAttribute)));
    });
  });

  languageButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });

  const menuIsOpen = document.body.classList.contains("menu-open");
  menuButton.setAttribute("aria-label", translate(menuIsOpen ? "menu.close" : "menu.open"));

  const activeHeroFocus = document.querySelector("[data-hero-focus].is-active")?.dataset.heroFocus ?? "backend";
  heroFocusCopy.textContent = translate(`hero.focus.${activeHeroFocus}`);
  updateProjectFilterCounts();
  updateProjectStatus();
  if (commandDialog.open) renderCommandResults(commandSearch.value);

  const activeStackTab = document.querySelector("[data-stack-tab][aria-selected='true']") ?? stackTabs[0];
  selectStack(activeStackTab);

  if (copyEmailButton.classList.contains("is-copied")) {
    copyEmailButton.textContent = translate("contact.copied");
    copyEmailStatus.textContent = translate("contact.copyStatus");
  } else {
    copyEmailStatus.textContent = "";
  }

  if (persist) {
    try {
      localStorage.setItem("portfolio-language", language);
    } catch (_) {
      // The switch still works for the current page view.
    }
  }

  if (announce) {
    languageStatus.textContent = "";
    requestAnimationFrame(() => {
      languageStatus.textContent = translate("language.changed");
    });
  }
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.language, { announce: true });
  });
});

applyLanguage(currentLanguage, { persist: false });
