export const ENTER = 900;
export const HOLD = 1600;
export const EXIT = 500;
export const SLOT = 3000;
export const BAR_ENTER = 600;

export const HERO_TITLE_TIMINGS = {
  ENTER: 900,
  HOLD: 1600,
  EXIT: 500,
  SLOT: 3000,
  BAR_ENTER: 600,
  LINE1_STAGGER: 70,
  LINE1_DURATION: 550,
  LINE2_STAGGER: 90,
  LINE2_DURATION: 550,
  RISE_PX: 14,
  ENTER_BLUR_PX: 12,
  EXIT_BLUR_PX: 8,
} as const;

export const motionTokens = {
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
  distance: 16,
  smallDistance: 10,
  blur: 10,
  durationFast: 400,
  durationFilter: 150,
  durationHover: 250,
  durationBase: 700,
  durationBar: 600,
  durationReduced: 150,
  wordStagger: 70,
  lineStagger: 140,
  cardStagger: 80,
  rowStagger: 40,
  footerStagger: 100,
  captionDelay: 200,
  breadcrumbDelay: 300,
  sectionTitleDelay: 100,
  maxStaggeredItems: 8,
  maxTableRows: 12,
  maxWait: 1200,
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
  triggerThreshold: 0.25,
  triggerRootMargin: 80,
} as const;

export type MotionEffect = "block" | "eyebrow" | "heading" | "line" | "fade" | "caption" | "bar" | "row";

const observedElements = new Map<Element, (element: Element) => void>();
let sharedObserver: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const enter = observedElements.get(entry.target);
          if (entry.isIntersecting && entry.intersectionRatio >= motionTokens.triggerThreshold && enter) {
            observedElements.delete(entry.target);
            sharedObserver?.unobserve(entry.target);
            enter(entry.target);
          }
        }
      },
      { threshold: motionTokens.triggerThreshold, rootMargin: `0px 0px ${motionTokens.triggerRootMargin}px 0px` }
    );
  }
  return sharedObserver;
}

export function setMotionVisible(element: HTMLElement): void {
  element.dataset.motionState = "visible";
}

export function observeMotion(
  element: HTMLElement,
  enter: (element: HTMLElement) => void,
  options: { animateOnMount?: boolean; onSkip?: (element: HTMLElement) => void } = {}
): () => void {
  if (element.dataset.motionState === "visible") return () => undefined;
  if (document.documentElement.classList.contains("motion-reveal-timeout")) {
    setMotionVisible(element);
    options.onSkip?.(element);
    return () => undefined;
  }
  if (prefersReducedMotion()) {
    enter(element);
    return () => undefined;
  }

  const rect = element.getBoundingClientRect();
  const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
  const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
  const visibleRatio = rect.width > 0 && rect.height > 0
    ? (visibleWidth * visibleHeight) / (rect.width * rect.height)
    : 0;
  const alreadyVisible = visibleRatio >= motionTokens.triggerThreshold;
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const restoredScroll = window.scrollY > 0 || navigation?.type === "back_forward";
  if (element.id && window.location.hash === `#${element.id}`) {
    setMotionVisible(element);
    options.onSkip?.(element);
    return () => undefined;
  }
  if (alreadyVisible && (!options.animateOnMount || restoredScroll)) {
    setMotionVisible(element);
    options.onSkip?.(element);
    return () => undefined;
  }
  if (alreadyVisible && options.animateOnMount) {
    enter(element);
    return () => undefined;
  }

  const observer = getObserver();
  if (!observer) {
    enter(element);
    return () => undefined;
  }

  observedElements.set(element, enter as (element: Element) => void);
  observer.observe(element);
  return () => {
    observedElements.delete(element);
    observer.unobserve(element);
  };
}

interface MotionOptions {
  effect: MotionEffect;
  delay?: number;
  duration?: number;
  reduced?: boolean;
}

export function prefersReducedMotion(): boolean {
  return (
    window.matchMedia(motionTokens.reducedMotionQuery).matches ||
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
  );
}

export function animateMotion(element: Element, options: MotionOptions): Animation | null {
  if (!(element instanceof HTMLElement) || typeof element.animate !== "function") return null;

  const { effect, delay = 0, duration = motionTokens.durationBase } = options;
  const reduced = options.reduced ?? prefersReducedMotion();
  if (reduced && effect !== "fade" && effect !== "row") {
    element.dataset.motionState = "visible";
    return null;
  }
  const css = getComputedStyle(document.documentElement);
  const distance = css.getPropertyValue("--motion-distance").trim() || `${motionTokens.distance}px`;
  const smallDistance = css.getPropertyValue("--motion-distance-small").trim() || `${motionTokens.smallDistance}px`;
  const blur = css.getPropertyValue("--motion-blur").trim() || `${motionTokens.blur}px`;
  const easing = css.getPropertyValue("--motion-ease").trim() || motionTokens.ease;
  const safeDelay = reduced ? 0 : delay;
  const safeDuration = reduced ? Math.min(duration, motionTokens.durationReduced) : duration;

  let frames: Keyframe[];
  if (effect === "bar") {
    frames = [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }];
  } else if (effect === "row" || effect === "fade" || reduced) {
    frames = [{ opacity: 0 }, { opacity: 1 }];
  } else if (effect === "eyebrow") {
    frames = [
      { opacity: 0, transform: `translate3d(0, ${smallDistance}, 0)` },
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
    ];
  } else if (effect === "heading") {
    frames = [
      { opacity: 0, transform: `translate3d(0, ${distance}, 0)`, filter: `blur(${blur})` },
      { opacity: 1, transform: "translate3d(0, 0, 0)", filter: "blur(0px)" },
    ];
  } else {
    frames = [
      { opacity: 0, transform: `translate3d(0, ${distance}, 0)` },
      { opacity: 1, transform: "translate3d(0, 0, 0)" },
    ];
  }

  element.style.willChange = effect === "row" || effect === "fade"
    ? "opacity"
    : effect === "bar"
      ? "transform"
      : effect === "heading"
        ? "opacity, transform, filter"
        : "opacity, transform";
  const animation = element.animate(frames, {
    duration: safeDuration,
    delay: safeDelay,
    easing,
    fill: "both",
  });
  animation.finished
    .catch(() => undefined)
    .then(() => {
      element.style.willChange = "";
      if (element instanceof HTMLElement) element.dataset.motionState = "visible";
      animation.cancel();
    });
  return animation;
}

export function animateMotionGroup(
  container: HTMLElement,
  elements: Element[],
  effect: MotionEffect,
  stagger: number,
  delay = 0,
  maxItems: number = motionTokens.maxStaggeredItems
): void {
  container.dataset.motionState = "animating";
  const maxIndex = Math.max(0, Math.min(elements.length - 1, maxItems - 1));
  const animations = elements.slice(0, 39).map((element, index) =>
    animateMotion(element, {
      effect,
      delay: delay + Math.min(index, maxIndex) * stagger,
    })
  );
  elements.slice(39).forEach((element) => {
    if (element instanceof HTMLElement) setMotionVisible(element);
  });
  Promise.all(animations.map((animation) => animation?.finished.catch(() => undefined)))
    .then(() => setMotionVisible(container));
}

export function animateMotionLines(
  container: HTMLElement,
  elements: HTMLElement[],
  delay = 0
): void {
  const lines = new Map<number, HTMLElement[]>();
  for (const element of elements) {
    const top = Math.round(element.getBoundingClientRect().top);
    const line = lines.get(top) ?? [];
    line.push(element);
    lines.set(top, line);
  }

  container.dataset.motionState = "animating";
  const lineTops = Array.from(lines.keys()).sort((a, b) => a - b);
  const cappedLine = Math.max(0, motionTokens.maxStaggeredItems - 1);
  const animations = lineTops.flatMap((top, lineIndex) =>
    (lines.get(top) ?? []).map((element) =>
      animateMotion(element, {
        effect: "line",
        delay: delay + Math.min(lineIndex, cappedLine) * motionTokens.lineStagger,
      })
    )
  ).slice(0, 39);
  elements.slice(39).forEach(setMotionVisible);
  Promise.all(animations.map((animation) => animation?.finished.catch(() => undefined)))
    .then(() => setMotionVisible(container));
}
