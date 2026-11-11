import { registerSharedAnimationFrame } from '@/internal/sharedAnimationFrame';
import { getLoadingIndicatorFrame, staticLoadingIndicatorFrame } from './loadingIndicatorPath';

type Runtime = {
  register: (path: SVGPathElement) => {
    cleanup: () => void;
    setActive: (active: boolean) => void;
  };
};

const runtimes = new WeakMap<Document, Runtime>();

const applyFrame = (path: SVGPathElement, frame: ReturnType<typeof getLoadingIndicatorFrame>) => {
  if (path.getAttribute('d') !== frame.path) path.setAttribute('d', frame.path);
  path.style.transform = `rotate(${frame.rotation}deg)`;
};

function createRuntime(document: Document, onEmpty: () => void): Runtime {
  const motionMediaQuery = document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
  const activeTargets = new Set<() => void>();
  const frames = new Map<number, ReturnType<typeof getLoadingIndicatorFrame>>();
  let registrations = 0;

  const onMotionPreferenceChange = () => {
    for (const syncAnimation of activeTargets) syncAnimation();
  };

  motionMediaQuery?.addEventListener('change', onMotionPreferenceChange);

  return {
    register(path) {
      const animation = registerSharedAnimationFrame(path.ownerSVGElement!, (elapsed, hasPeers) => {
        if (!hasPeers) {
          applyFrame(path, getLoadingIndicatorFrame(elapsed));
          return;
        }

        let frame = frames.get(elapsed);
        if (!frame) {
          if (frames.size === 0) queueMicrotask(() => frames.clear());
          frame = getLoadingIndicatorFrame(elapsed);
          frames.set(elapsed, frame);
        }
        applyFrame(path, frame);
      });
      registrations++;
      let cleaned = false;

      const syncAnimation = () => {
        if (motionMediaQuery?.matches) {
          animation.stop();
          applyFrame(path, staticLoadingIndicatorFrame);
        } else {
          animation.start();
        }
      };

      return {
        setActive(active) {
          if (cleaned || active === activeTargets.has(syncAnimation)) return;
          if (active) {
            activeTargets.add(syncAnimation);
            syncAnimation();
          } else {
            activeTargets.delete(syncAnimation);
            animation.stop();
          }
        },
        cleanup() {
          if (cleaned) return;
          cleaned = true;
          activeTargets.delete(syncAnimation);
          animation.cleanup();
          if (--registrations === 0) {
            motionMediaQuery?.removeEventListener('change', onMotionPreferenceChange);
            onEmpty();
          }
        },
      };
    },
  };
}

export function registerLoadingIndicatorAnimation(path: SVGPathElement) {
  const document = path.ownerDocument;
  let runtime = runtimes.get(document);
  if (!runtime) {
    runtime = createRuntime(document, () => runtimes.delete(document));
    runtimes.set(document, runtime);
  }
  return runtime.register(path);
}
