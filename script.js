// année dans le footer
document.getElementById("year").textContent = `© ${new Date().getFullYear()}, tous droits réservés`;

// filtre projets : tous / chronologie (semestre) / catégorie
const projectCards = document.querySelectorAll("#projectGrid .project-card");
const projectEmpty = document.getElementById("projectEmpty");
const projectGrid = document.getElementById("projectGrid");

const filterState = { mode: "all", semester: "all", category: "all" };

// pas de colonne vide : le nb de colonnes suit le nb de cartes visibles
function updateGridColumns() {
  if (!projectGrid) return;
  let visible = 0;
  projectCards.forEach((card) => { if (!card.hidden) visible++; });
  const columns = Math.min(3, Math.max(1, visible || 1));
  projectGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

function applyProjectFilters() {
  let visible = 0;
  projectCards.forEach((card) => {
    let match = true;
    if (filterState.mode === "chrono") {
      if (filterState.semester !== "all" && card.dataset.semester !== filterState.semester) match = false;
    } else if (filterState.mode === "category") {
      if (filterState.category !== "all" && card.dataset.category !== filterState.category) match = false;
    }
    card.hidden = !match;
    if (match) visible++;
  });
  if (projectEmpty) projectEmpty.hidden = visible > 0;
  updateGridColumns();
}

updateGridColumns();

function resetSecondaryDropdown(role, defaultLabel) {
  const dd = document.querySelector(`.filter-dropdown[data-role="${role}"]`);
  if (!dd) return;
  dd.querySelectorAll(".filter-options li").forEach((li, i) => li.classList.toggle("is-selected", i === 0));
  dd.querySelector(".filter-toggle-label strong").textContent = defaultLabel;
}

function initDropdown(container, onSelect) {
  const toggle = container.querySelector(".filter-toggle");
  const labelStrong = container.querySelector(".filter-toggle-label strong");
  const opts = container.querySelectorAll(".filter-options li");

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const wasOpen = container.classList.contains("is-open");
    document.querySelectorAll(".filter-dropdown.is-open").forEach((d) => {
      d.classList.remove("is-open");
      d.querySelector(".filter-toggle")?.setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      container.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  opts.forEach((li) => {
    li.addEventListener("click", () => {
      opts.forEach((o) => o.classList.remove("is-selected"));
      li.classList.add("is-selected");
      labelStrong.textContent = li.textContent;
      container.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      onSelect(li.dataset.value);
    });
  });
}

const modeDropdown = document.querySelector('.filter-dropdown[data-role="mode"]');
const semesterDropdown = document.querySelector('.filter-dropdown[data-role="semester"]');
const categoryDropdown = document.querySelector('.filter-dropdown[data-role="category"]');

if (modeDropdown) {
  initDropdown(modeDropdown, (value) => {
    filterState.mode = value;
    filterState.semester = "all";
    filterState.category = "all";
    resetSecondaryDropdown("semester", "par défaut");
    resetSecondaryDropdown("category", "par défaut");

    if (semesterDropdown) semesterDropdown.hidden = value !== "chrono";
    if (categoryDropdown) categoryDropdown.hidden = value !== "category";

    applyProjectFilters();
  });
}
if (semesterDropdown) initDropdown(semesterDropdown, (value) => { filterState.semester = value; applyProjectFilters(); });
if (categoryDropdown) initDropdown(categoryDropdown, (value) => { filterState.category = value; applyProjectFilters(); });

document.addEventListener("click", () => {
  document.querySelectorAll(".filter-dropdown.is-open").forEach((d) => {
    d.classList.remove("is-open");
    d.querySelector(".filter-toggle")?.setAttribute("aria-expanded", "false");
  });
});

// favoris (coeur) sur les cartes
document.querySelectorAll(".project-fav").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOn = btn.getAttribute("aria-pressed") === "true";
    btn.setAttribute("aria-pressed", isOn ? "false" : "true");
    btn.textContent = isOn ? "♡" : "♥";
    btn.setAttribute("aria-label", isOn ? "Ajouter aux favoris" : "Retirer des favoris");
  });
});

// modale détail projet
const modal = document.getElementById("projectModal");
const modalClose = document.getElementById("modalClose");
const modalTag = document.getElementById("modalTag");
const modalSemester = document.getElementById("modalSemester");
const modalTitle = document.getElementById("modalTitle");
const modalShot = document.getElementById("modalShot");
const modalGallery = document.getElementById("modalGallery");
const modalGalleryBlock = document.getElementById("modalGalleryBlock");

const semesterNames = { s1: "semestre 1", s2: "semestre 2", s3: "semestre 3", s4: "semestre 4" };

// bloc, id du texte, attribut data- correspondant
const modalTextBlocks = [
  { block: "modalContextBlock", text: "modalContext", data: "context" },
  { block: "modalResultatBlock", text: "modalResultat", data: "resultat" },
  { block: "modalObjectifsBlock", text: "modalObjectifs", data: "objectifs" },
  { block: "modalRoleBlock", text: "modalRole", data: "role" },
  { block: "modalDifficultesBlock", text: "modalDifficultes", data: "difficultes" },
];

const modalKpisBlock = document.getElementById("modalKpisBlock");
const modalKpiList = document.getElementById("modalKpiList");
const modalBrief = document.getElementById("modalBrief");
const modalRepo = document.getElementById("modalRepo");

// "a, b, c" -> badges
function renderBadges(container, value) {
  if (!container) return false;
  if (value && value.trim()) {
    container.innerHTML = value
      .split(",")
      .map((v) => `<span class="badge">${v.trim()}</span>`)
      .join("");
    return true;
  }
  container.innerHTML = "";
  return false;
}

function openModal(card) {
  if (!modal) return;

  modalTag.textContent = card.querySelector(".project-tag")?.textContent || "";
  modalSemester.textContent = semesterNames[card.dataset.semester] || card.dataset.label || "";
  modalTitle.textContent = card.querySelector("h3")?.textContent || "";
  modalShot.innerHTML = card.querySelector(".project-shot")?.innerHTML || "";

  modalTextBlocks.forEach(({ block, text, data }) => {
    const value = card.dataset[data];
    const blockEl = document.getElementById(block);
    if (value) {
      document.getElementById(text).textContent = value;
      blockEl.hidden = false;
    } else {
      blockEl.hidden = true;
    }
  });

  const kpis = card.dataset.kpis;
  if (kpis) {
    modalKpiList.innerHTML = kpis.split(",").map((k) => `<li>${k.trim()}</li>`).join("");
    modalKpisBlock.hidden = false;
  } else {
    modalKpisBlock.hidden = true;
  }

  const hasCompetences = renderBadges(document.getElementById("modalCompetencesRow"), card.dataset.competences);
  document.getElementById("modalCompetencesBlock").hidden = !hasCompetences;

  // pas de badges outils ? on retombe sur le texte de la carte
  const toolsRow = document.getElementById("modalToolsRow");
  const toolsBlock = document.getElementById("modalToolsBlock");
  const hasToolsBadges = renderBadges(toolsRow, card.dataset.toolsList);
  if (!hasToolsBadges) {
    const fallbackText = (card.querySelector(".project-stack")?.textContent || "").trim();
    if (fallbackText) {
      toolsRow.innerHTML = `<span class="badge">${fallbackText}</span>`;
      toolsBlock.hidden = false;
    } else {
      toolsBlock.hidden = true;
    }
  } else {
    toolsBlock.hidden = false;
  }

  const gallery = card.dataset.gallery;
  if (gallery) {
    modalGallery.innerHTML = gallery.split(",").map((src) => `<img src="${src.trim()}" alt="">`).join("");
    modalGalleryBlock.hidden = false;
  } else {
    modalGalleryBlock.hidden = true;
  }

  if (card.dataset.brief) {
    modalBrief.href = card.dataset.brief;
    modalBrief.hidden = false;
  } else {
    modalBrief.hidden = true;
  }

  if (card.dataset.repo) {
    modalRepo.href = card.dataset.repo;
    modalRepo.hidden = false;
  } else {
    modalRepo.hidden = true;
  }

  modal.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.hidden = true;
  document.body.style.overflow = "";
}

// zoom plein écran sur une image de la fiche
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(src, alt) {
  if (!lightbox || !src) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.hidden = false;
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  lightboxImg.src = "";
}

if (modal) {
  modal.addEventListener("click", (e) => {
    const img = e.target.closest("#modalShot img, #modalGallery img");
    if (img) {
      e.stopPropagation();
      openLightbox(img.src, img.alt);
    }
  });
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightbox) {
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// cartes cliquables (uni + perso)
document.querySelectorAll("#projectGrid .project-card, #perso .project-card").forEach((card) => {
  card.addEventListener("click", () => openModal(card));
});

if (modalClose) modalClose.addEventListener("click", closeModal);
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// menu mobile
const toggle = document.getElementById("navToggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("nav--open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav--open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// bouton copier l'adresse mail
const copyBtn = document.getElementById("copyEmail");

if (copyBtn) {
  const defaultLabel = copyBtn.textContent;

  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.dataset.email;

    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      // pas de presse-papiers dispo (ex: fichier ouvert direct sans serveur) -> repli
      const tmp = document.createElement("textarea");
      tmp.value = email;
      document.body.appendChild(tmp);
      tmp.select();
      try { document.execCommand("copy"); } catch (e) {}
      tmp.remove();
    }

    copyBtn.textContent = "copié ✓";
    copyBtn.classList.add("is-copied");
    setTimeout(() => {
      copyBtn.textContent = defaultLabel;
      copyBtn.classList.remove("is-copied");
    }, 1800);
  });
}

// photo profil : légère inclinaison qui suit la souris
const photoFrame = document.getElementById("photoFrame");
const canHover = window.matchMedia("(hover: hover)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (photoFrame && canHover && !reduceMotion) {
  photoFrame.addEventListener("mousemove", (e) => {
    const r = photoFrame.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width * 2 - 1;
    const ny = (e.clientY - r.top) / r.height * 2 - 1;
    photoFrame.style.transform = `perspective(700px) rotateX(${-ny * 7}deg) rotateY(${nx * 7}deg)`;
  });
  photoFrame.addEventListener("mouseleave", () => {
    photoFrame.style.transform = "";
  });
}

// si photo_moi.jpg n'existe pas, on essaie les autres extensions
const photoImg = document.querySelector("#photoFrame img");
if (photoImg) {
  const exts = ["jpeg", "png", "webp", "JPG", "PNG", "JPEG"];
  let attempt = 0;
  photoImg.addEventListener("error", () => {
    if (attempt < exts.length) {
      photoImg.src = `icons/photo_moi.${exts[attempt++]}`;
    }
  });
}