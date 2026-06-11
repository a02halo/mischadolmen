const header = document.querySelector("[data-header]");
const reveals = document.querySelectorAll(".reveal");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const depthScenes = document.querySelectorAll("[data-depth-scene]");
const transitionItems = document.querySelectorAll("[data-transition]");
const slider = document.querySelector("[data-slider]");
const sliderTrack = document.querySelector("[data-slider-track]");
const sliderPrev = document.querySelector("[data-slider-prev]");
const sliderNext = document.querySelector("[data-slider-next]");
const serviceJumps = document.querySelectorAll("[data-service-jump]");
const responsiveVideos = document.querySelectorAll("[data-responsive-video]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const sideMenu = document.querySelector("[data-side-menu]");
const menuCloseItems = document.querySelectorAll("[data-menu-close], [data-side-menu] a");
const planityModal = document.querySelector("[data-planity-modal]");
const planityFrame = document.querySelector("[data-planity-frame]");
const planityCloseItems = document.querySelectorAll("[data-planity-close]");
const planityServiceLabel = document.querySelector("[data-planity-service-label]");
const planityFallback = document.querySelector(".planity-modal__fallback");
const planityTriggers = document.querySelectorAll(
  "[data-planity-trigger], .site-header .header-cta, .desktop-nav a[href$='#reservation'], .side-menu a[href$='#reservation'], .side-menu__cta, .care-hero__content .button, .care-card a, .care-cta .button, .service-card a[href$='#reservation']"
);
const principleTrack = document.querySelector("[data-principle-track]");
const principlePrev = document.querySelector("[data-principle-prev]");
const principleNext = document.querySelector("[data-principle-next]");
const principleStatus = document.querySelector("[data-principle-status]");
const principleCopy = document.querySelector("[data-principle-copy]");
const principleTitle = document.querySelector("[data-principle-title]");
const principleText = document.querySelector("[data-principle-text]");
const principleDots = document.querySelectorAll("[data-principle-dot]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileVideoQuery = window.matchMedia("(max-width: 760px), (orientation: portrait)");
let ticking = false;

const syncResponsiveVideos = () => {
  responsiveVideos.forEach((video) => {
    // Change only these data attributes in the HTML when the final videos are ready.
    const selectedSource = mobileVideoQuery.matches
      ? video.dataset.videoMobile
      : video.dataset.videoDesktop;

    if (!selectedSource || video.dataset.activeSource === selectedSource) return;

    video.dataset.activeSource = selectedSource;
    video.src = selectedSource;
    video.load();

    if (!reduceMotion) {
      video.play().catch(() => {
        // Autoplay can be blocked by some browsers; the poster remains visible.
      });
    }
  });
};

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
  document.documentElement.style.setProperty(
    "--scroll-progress",
    String(Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1))
  );
};

const setMenuOpen = (isOpen) => {
  document.body.classList.toggle("menu-open", isOpen);
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
  sideMenu?.setAttribute("aria-hidden", String(!isOpen));
};

if (menuToggle && sideMenu) {
  menuToggle.addEventListener("click", () => {
    setMenuOpen(!document.body.classList.contains("menu-open"));
  });

  menuCloseItems.forEach((item) => {
    item.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuOpen(false);
    }
  });
}

const closePlanityModal = () => {
  document.body.classList.remove("planity-open");
  planityModal?.setAttribute("aria-hidden", "true");
};

const getPlanityContext = (trigger) => {
  const card = trigger?.closest(".care-card, .service-card");
  const serviceName = trigger?.dataset.planityService || card?.querySelector("h3")?.textContent.trim() || "";

  // If Planity provides a deep link for a specific service later, add
  // data-planity-url="..." to the clicked button or its card.
  const planityUrl =
    trigger?.dataset.planityUrl ||
    card?.dataset.planityUrl ||
    planityModal?.dataset.planityUrl ||
    "";

  return { planityUrl, serviceName };
};

const openPlanityModal = (trigger = null) => {
  if (!planityModal || !planityFrame) return;

  const { planityUrl, serviceName } = getPlanityContext(trigger);

  document.body.classList.add("planity-open");
  planityModal.setAttribute("aria-hidden", "false");
  setMenuOpen(false);

  if (planityServiceLabel) {
    planityServiceLabel.textContent = serviceName
      ? `Soin demandé : ${serviceName}`
      : "Mischa Dolmen Studio";
  }

  if (planityFallback && planityUrl) {
    planityFallback.href = planityUrl;
  }

  // The Planity iframe is created only after a reservation click.
  if (planityUrl) {
    const existingIframe = planityFrame.querySelector("iframe");

    if (existingIframe) {
      if (existingIframe.dataset.activeSource !== planityUrl) {
        existingIframe.dataset.activeSource = planityUrl;
        existingIframe.src = planityUrl;
      }

      return;
    }

    const iframe = document.createElement("iframe");
    iframe.title = "Réservation Planity - Mischa Dolmen Studio";
    iframe.src = planityUrl;
    iframe.dataset.activeSource = planityUrl;
    iframe.loading = "lazy";
    planityFrame.append(iframe);
  }
};

if (planityModal) {
  planityTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openPlanityModal(trigger);
    });
  });

  planityCloseItems.forEach((item) => {
    item.addEventListener("click", closePlanityModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePlanityModal();
    }
  });
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getViewportProgress = (rect) => {
  return clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1);
};

const updateParallax = () => {
  if (reduceMotion) return;

  const viewportCenter = window.innerHeight / 2;
  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.speed || 0);
    const range = Number(item.dataset.range || 38);
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const offset = clamp((viewportCenter - itemCenter) * speed, -range, range);

    item.style.setProperty("--parallax-y", `${offset.toFixed(2)}px`);
  });
};

const updateDepthScenes = () => {
  if (reduceMotion) return;

  depthScenes.forEach((scene) => {
    const progress = getViewportProgress(scene.getBoundingClientRect());
    scene.style.setProperty("--scene-progress", progress.toFixed(3));
  });

  transitionItems.forEach((transition) => {
    const progress = getViewportProgress(transition.getBoundingClientRect());
    transition.style.setProperty("--transition-progress", progress.toFixed(3));
  });
};

const requestTick = () => {
  if (ticking) return;

  ticking = true;
  window.requestAnimationFrame(() => {
    updateHeader();
    updateParallax();
    updateDepthScenes();
    ticking = false;
  });
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

reveals.forEach((element) => observer.observe(element));

const serviceDescriptions = {
  "miracle-touch": "Le rituel signature qui associe drainage, remodelage et gestuelle visage pour une sensation de légèreté globale.",
  drainage: "Une méthode manuelle précise pour stimuler la circulation lymphatique, décongestionner et retrouver une silhouette plus légère.",
  remodelage: "Un protocole tonique et sculptant qui cible les volumes, relance les tissus et affine visuellement les contours.",
  "miracle-face": "Un soin facial liftant et drainant pour défatiguer les traits, raviver l'éclat et redessiner l'ovale.",
  kobido: "Un massage facial japonais rythmé, précis et liftant, idéal pour tonifier les muscles du visage et réveiller l'éclat.",
  madotherapie: "Un travail localisé avec instruments en bois pour stimuler, lisser et accompagner une zone ciblée.",
  "Massage Relaxant": "Une parenthèse enveloppante pour relâcher les tensions, apaiser le système nerveux et retrouver une respiration calme.",
  "GUA SHA": "Un rituel visage aux gestes lissants et drainants avec pierre, pour relancer la microcirculation et apaiser les tensions.",
  "Hydro-Facial Complet": "Un nettoyage profond et lumineux pour purifier, hydrater et lisser la peau en douceur.",
  Nanoneedling: "Un soin ciblé pour accompagner la qualité de peau, les marques, le grain irrégulier et la perte d'éclat.",
  "Peeling ciblé": "Une exfoliation professionnelle adaptée aux besoins de la peau pour révéler un teint plus uniforme et frais.",
  "Miracle Face + Drainage": "L'alliance visage et corps pour un résultat global : traits allégés, corps drainé, sensation de légèreté.",
  "Miracle Face + Remodelage": "Un combo liftant et sculptant pour travailler l'ovale du visage et les contours du corps dans la même séance.",
  "1 zone": "Un travail ciblé sur une zone prioritaire, idéal pour découvrir la madothérapie ou accompagner un besoin précis.",
  "Sur mesure": "Un protocole complet adapté à vos priorités pour travailler plusieurs zones avec une intensité maîtrisée.",
  "Massage crânien": "Un soin express profond pour relâcher la nuque, le cuir chevelu et la charge mentale.",
};

if (slider && sliderTrack && sliderPrev && sliderNext) {
  let isDragging = false;
  let dragStartCard = null;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragDistance = 0;
  let suppressClick = false;

  const highlightCard = (card) => {
    sliderTrack.querySelectorAll(".service-card").forEach((item) => {
      item.classList.toggle("is-highlighted", item === card);
    });

    serviceJumps.forEach((jump) => {
      jump.classList.toggle("is-active", card?.dataset.serviceCard === jump.dataset.serviceJump);
    });
  };

  const setExpandedCard = (card, shouldExpand) => {
    sliderTrack.querySelectorAll(".service-card").forEach((item) => {
      const isCurrent = item === card && shouldExpand;
      const detail = item.querySelector(".service-detail");
      const hint = item.querySelector(".service-detail-hint");

      item.classList.toggle("is-expanded", isCurrent);
      item.setAttribute("aria-expanded", String(isCurrent));

      if (detail) {
        detail.setAttribute("aria-hidden", String(!isCurrent));
      }

      if (hint) {
        hint.textContent = isCurrent ? "Masquer" : "Détail";
      }
    });
  };

  const updateSliderState = () => {
    const maxScroll = sliderTrack.scrollWidth - sliderTrack.clientWidth - 4;

    sliderPrev.disabled = sliderTrack.scrollLeft <= 4;
    sliderNext.disabled = sliderTrack.scrollLeft >= maxScroll;
  };

  const moveSlider = (direction) => {
    const firstCard = sliderTrack.querySelector(".service-card");
    const gap = Number.parseFloat(getComputedStyle(sliderTrack).columnGap || "0");
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : 346;

    sliderTrack.scrollBy({
      left: direction * distance,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  sliderPrev.addEventListener("click", () => moveSlider(-1));
  sliderNext.addEventListener("click", () => moveSlider(1));
  sliderTrack.addEventListener("scroll", updateSliderState, { passive: true });
  window.addEventListener("resize", updateSliderState);

  sliderTrack.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("a")) return;

    isDragging = true;
    dragStartCard = event.target.closest(".service-card");
    dragStartX = event.clientX;
    dragStartScroll = sliderTrack.scrollLeft;
    dragDistance = 0;
    sliderTrack.classList.add("is-dragging");
    sliderTrack.setPointerCapture(event.pointerId);
  });

  sliderTrack.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    dragDistance = event.clientX - dragStartX;
    sliderTrack.scrollLeft = dragStartScroll - dragDistance;

    if (Math.abs(dragDistance) > 5) {
      event.preventDefault();
    }
  });

  const endDrag = (event) => {
    if (!isDragging) return;

    const hasDragged = Math.abs(dragDistance) > 6;
    isDragging = false;
    suppressClick = hasDragged;
    sliderTrack.classList.remove("is-dragging");

    if (sliderTrack.hasPointerCapture(event.pointerId)) {
      sliderTrack.releasePointerCapture(event.pointerId);
    }

    updateSliderState();

    if (!hasDragged && dragStartCard) {
      const shouldExpand = !dragStartCard.classList.contains("is-expanded");
      setExpandedCard(dragStartCard, shouldExpand);
      highlightCard(dragStartCard);
    }

    dragStartCard = null;

    if (suppressClick) {
      window.setTimeout(() => {
        suppressClick = false;
      }, 140);
    }
  };

  sliderTrack.addEventListener("pointerup", endDrag);
  sliderTrack.addEventListener("pointercancel", endDrag);
  sliderTrack.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;

      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  sliderTrack.querySelectorAll(".service-card").forEach((card, index) => {
    const title = card.querySelector("h3")?.textContent.trim();
    const description = serviceDescriptions[card.dataset.serviceCard] || serviceDescriptions[title];
    const price = card.querySelector("p");
    const link = card.querySelector("a");

    if (!title || !description || !link) return;

    price?.classList.add("service-price");
    card.tabIndex = 0;
    card.setAttribute("aria-expanded", "false");
    card.setAttribute("aria-label", `${title} : afficher le détail du soin`);

    const detail = document.createElement("p");
    detail.className = "service-detail";
    detail.id = `service-detail-${index}`;
    detail.textContent = description;
    detail.setAttribute("aria-hidden", "true");

    const hint = document.createElement("span");
    hint.className = "service-detail-hint";
    hint.textContent = "Détail";

    card.insertBefore(detail, link);
    card.insertBefore(hint, link);

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      const shouldExpand = !card.classList.contains("is-expanded");
      setExpandedCard(card, shouldExpand);
      highlightCard(card);
    });
  });

  serviceJumps.forEach((jump) => {
    jump.addEventListener("click", () => {
      const card = sliderTrack.querySelector(`[data-service-card="${jump.dataset.serviceJump}"]`);

      if (!card) return;

      document.querySelector("#soins")?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });

      sliderTrack.scrollTo({
        left: card.offsetLeft - sliderTrack.offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth",
      });

      highlightCard(card);
      setExpandedCard(card, true);
    });
  });

  updateSliderState();
}

if (principleTrack && principlePrev && principleNext && principleStatus) {
  const principleSlides = Array.from(principleTrack.querySelectorAll(".principle-slide"));
  let activePrinciple = 0;
  let principleTicking = false;
  let principleAutoplay = null;
  let copyTimer = null;
  let isProgrammaticScroll = false;

  const formatPrinciple = (index) => String(index + 1).padStart(2, "0");

  const updatePrincipleCopy = (slide, shouldAnimate) => {
    if (!principleCopy || !principleTitle || !principleText) return;

    const nextTitle = slide.dataset.principleTitle || "";
    const nextText = slide.dataset.principleCopy || "";

    if (!nextTitle || !nextText || principleTitle.textContent === nextTitle) return;

    window.clearTimeout(copyTimer);

    if (!shouldAnimate) {
      principleTitle.textContent = nextTitle;
      principleText.textContent = nextText;
      return;
    }

    principleCopy.classList.add("is-changing");
    copyTimer = window.setTimeout(() => {
      principleTitle.textContent = nextTitle;
      principleText.textContent = nextText;
      principleCopy.classList.remove("is-changing");
    }, 180);
  };

  const setActivePrinciple = (index, shouldScroll = false) => {
    if (!principleSlides.length) return;

    const previousPrinciple = activePrinciple;
    activePrinciple = (index + principleSlides.length) % principleSlides.length;

    principleSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activePrinciple);
      slide.setAttribute("aria-hidden", String(slideIndex !== activePrinciple));
    });

    principleDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activePrinciple;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    principleStatus.textContent = `${formatPrinciple(activePrinciple)} / ${String(
      principleSlides.length
    ).padStart(2, "0")}`;

    updatePrincipleCopy(principleSlides[activePrinciple], previousPrinciple !== activePrinciple);

    if (shouldScroll) {
      isProgrammaticScroll = true;
      principleTrack.scrollTo({
        left: principleSlides[activePrinciple].offsetLeft - principleTrack.offsetLeft,
        behavior: reduceMotion ? "auto" : "smooth",
      });

      window.setTimeout(() => {
        isProgrammaticScroll = false;
      }, reduceMotion ? 0 : 620);
    }
  };

  const syncPrincipleFromScroll = () => {
    if (principleTicking || isProgrammaticScroll) return;

    principleTicking = true;
    window.requestAnimationFrame(() => {
      const nearestIndex = principleSlides.reduce((nearest, slide, index) => {
        const currentDistance = Math.abs(slide.offsetLeft - principleTrack.offsetLeft - principleTrack.scrollLeft);
        const nearestDistance = Math.abs(
          principleSlides[nearest].offsetLeft - principleTrack.offsetLeft - principleTrack.scrollLeft
        );

        return currentDistance < nearestDistance ? index : nearest;
      }, activePrinciple);

      if (nearestIndex !== activePrinciple) {
        setActivePrinciple(nearestIndex);
      }

      principleTicking = false;
    });
  };

  const stopPrincipleAutoplay = () => {
    window.clearInterval(principleAutoplay);
    principleAutoplay = null;
  };

  const startPrincipleAutoplay = () => {
    if (reduceMotion || principleSlides.length < 2 || principleAutoplay) return;

    principleAutoplay = window.setInterval(() => {
      setActivePrinciple(activePrinciple + 1, true);
    }, 4200);
  };

  const restartPrincipleAutoplay = () => {
    stopPrincipleAutoplay();
    startPrincipleAutoplay();
  };

  principlePrev.addEventListener("click", () => {
    setActivePrinciple(activePrinciple - 1, true);
    restartPrincipleAutoplay();
  });

  principleNext.addEventListener("click", () => {
    setActivePrinciple(activePrinciple + 1, true);
    restartPrincipleAutoplay();
  });

  principleDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      setActivePrinciple(Number(dot.dataset.principleDot), true);
      restartPrincipleAutoplay();
    });
  });

  principleTrack.addEventListener("scroll", syncPrincipleFromScroll, { passive: true });
  window.addEventListener("resize", () => setActivePrinciple(activePrinciple, true));
  principleTrack.closest("[data-principle-carousel]")?.addEventListener("focusin", stopPrincipleAutoplay);
  principleTrack.closest("[data-principle-carousel]")?.addEventListener("focusout", startPrincipleAutoplay);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopPrincipleAutoplay();
    } else {
      startPrincipleAutoplay();
    }
  });

  setActivePrinciple(0);
  startPrincipleAutoplay();
}

syncResponsiveVideos();

if (mobileVideoQuery.addEventListener) {
  mobileVideoQuery.addEventListener("change", syncResponsiveVideos);
} else {
  mobileVideoQuery.addListener(syncResponsiveVideos);
}

updateHeader();
updateParallax();
updateDepthScenes();
window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", requestTick);
