import { bindElementEnvironment } from '@/internal/elementEnvironment';
import { registerSharedAnimationFrame } from '@/internal/sharedAnimationFrame';
import { getLoadingIndicatorFrame, getStaticLoadingIndicatorFrame } from './loadingIndicatorPath';

type Target = {
  path: SVGPathElement;
  startTime: number | undefined;
};

type Runtime = {
  register: (path: SVGPathElement) => {
    cleanup: () => void;
    setActive: (active: boolean) => void;
  };
};

const runtimes = new WeakMap<Document, Runtime>();

const applyFrame = (target: Target, frame: ReturnType<typeof getLoadingIndicatorFrame>) => {
  if (target.path.getAttribute('d') !== frame.path) target.path.setAttribute('d', frame.path);
  target.path.style.transform = `rotate(${frame.rotation}deg)`;
};

function createRuntime(document: Document, onEmpty: () => void): Runtime {
  const view = document.defaultView;
  const targets = new Set<Target>();
  const activeTargets = new Set<Target>();
  const motionMediaQuery = view?.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
  let reducedMotion = motionMediaQuery?.matches ?? false;

  const frameController = registerSharedAnimationFrame(document, (elapsed) => {
    const frames = new Map<number, ReturnType<typeof getLoadingIndicatorFrame>>();

    for (const target of activeTargets) {
      target.startTime ??= elapsed;
      let frame = frames.get(target.startTime);
      if (!frame) {
        frame = getLoadingIndicatorFrame(elapsed - target.startTime);
        frames.set(target.startTime, frame);
      }
      applyFrame(target, frame);
    }
  });

  const syncAnimation = () => {
    if (activeTargets.size === 0 || reducedMotion) {
      frameController.stop();
      if (reducedMotion) {
        const frame = getStaticLoadingIndicatorFrame();
        for (const target of activeTargets) applyFrame(target, frame);
      }
      return;
    }

    frameController.start();
  };

  const onMotionPreferenceChange = () => {
    reducedMotion = motionMediaQuery?.matches ?? false;
    for (const target of activeTargets) target.startTime = undefined;
    syncAnimation();
  };

  motionMediaQuery?.addEventListener('change', onMotionPreferenceChange);

  const destroy = () => {
    frameController.cleanup();
    motionMediaQuery?.removeEventListener('change', onMotionPreferenceChange);
    onEmpty();
  };

  return {
    register(path) {
      const target: Target = { path, startTime: undefined };
      targets.add(target);
      let active = false;
      let cleaned = false;

      return {
        setActive(nextActive) {
          if (cleaned || nextActive === active) return;
          active = nextActive;

          if (active) {
            target.startTime = undefined;
            activeTargets.add(target);
          } else {
            activeTargets.delete(target);
            target.startTime = undefined;
          }
          syncAnimation();
        },
        cleanup() {
          if (cleaned) return;
          cleaned = true;
          activeTargets.delete(target);
          targets.delete(target);
          syncAnimation();
          if (targets.size === 0) destroy();
        },
      };
    },
  };
}

function registerInDocument(path: SVGPathElement) {
  const document = path.ownerDocument;
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document, () => runtimes.delete(document));
    runtimes.set(document, runtime);
  }
  return runtime.register(path);
}

export function registerLoadingIndicatorAnimation(path: SVGPathElement) {
  let current: ReturnType<typeof registerInDocument>;
  let active = false;
  const cleanup = bindElementEnvironment(path, () => {
    current = registerInDocument(path);
    current.setActive(active);
    return () => current.cleanup();
  });
  return {
    cleanup,
    setActive(value: boolean) {
      active = value;
      current.setActive(value);
    },
  };
}
