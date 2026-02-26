type Transition = {
  start: number;
  duration: number;
  update: (p: number) => void;
  done?: () => void;
};

let active: Transition[] = [];

export function startTransition(t: Omit<Transition, "start">) {
  active.push({
    ...t,
    start: performance.now(),
  });
}

export function updateTransitions() {
  if (!active.length) return;

  active = active.filter(t => {
    const p = Math.min(
      1,
      (performance.now() - t.start) / t.duration
    );

    t.update(p);

    if (p === 1) {
      t.done?.();
      return false;
    }

    return true;
  });
}

export function isTransitioning() {
  return active.length > 0;
}
