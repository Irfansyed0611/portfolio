import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

let runtimePromise = null;
const scenePreloadPromises = new Map();
const HERO_LOAD_DELAY = 450;
const OFFSCREEN_PAUSE_DELAY = 180;
const LOW_END_DEVICE_MEMORY_GB = 4;
const LOW_END_CPU_CORES = 4;
const DEFAULT_TARGET_FPS = 30;
const LOW_END_TARGET_FPS = 24;

const loadSplineRuntime = () => {
  if (!runtimePromise) {
    runtimePromise = import('@splinetool/runtime');
  }
  return runtimePromise;
};

export const preloadSplineRuntime = () => {
  void loadSplineRuntime();
};

export const preloadSplineScene = scene => {
  if (typeof window === 'undefined' || !scene) {
    return null;
  }

  if (!scenePreloadPromises.has(scene)) {
    const preloadPromise = fetch(scene, {
      mode: 'cors',
      credentials: 'omit',
    }).catch(() => null);

    scenePreloadPromises.set(scene, preloadPromise);
  }

  return scenePreloadPromises.get(scene);
};

export const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveDataEnabled = Boolean(connection?.saveData);
  const lowMemoryDevice =
    typeof navigator.deviceMemory === 'number' &&
    navigator.deviceMemory <= LOW_END_DEVICE_MEMORY_GB;
  const lowCpuDevice =
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= LOW_END_CPU_CORES;

  return saveDataEnabled || lowMemoryDevice || lowCpuDevice;
};

export const shouldEnableSplineExperience = prefersReducedMotion => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(min-width: 769px)').matches && !prefersReducedMotion && !isLowEndDevice()
  );
};

const SplineCanvas = ({ scene, className, shouldLoad, loadDelayMs, onReadyChange }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const loadDelayTimeoutRef = useRef(null);
  const initPromiseRef = useRef(null);
  const hasStartedLoadingRef = useRef(false);
  const isSoftPausedRef = useRef(false);
  const isDisposedRef = useRef(false);
  const isVisibleRef = useRef(false);
  const targetFpsRef = useRef(isLowEndDevice() ? LOW_END_TARGET_FPS : DEFAULT_TARGET_FPS);
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const clearLoadDelay = () => {
    if (loadDelayTimeoutRef.current) {
      clearTimeout(loadDelayTimeoutRef.current);
      loadDelayTimeoutRef.current = null;
    }
  };

  const clearPauseTimeout = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  const resize = () => {
    if (!containerRef.current || !appRef.current) {
      return;
    }

    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth > 0 && clientHeight > 0) {
      appRef.current.setSize(clientWidth, clientHeight);
    }
  };

  const createManagedLoop = currentApp => {
    const targetFrameDuration = 1000 / targetFpsRef.current;
    let previousFrameTime = 0;

    return now => {
      if (!previousFrameTime || now - previousFrameTime >= targetFrameDuration) {
        previousFrameTime = now;
        currentApp.render();
      }
    };
  };

  const softPause = () => {
    const currentApp = appRef.current;
    if (!currentApp || isSoftPausedRef.current) {
      return;
    }

    currentApp._renderer?.setAnimationLoop(null);
    if (currentApp._controls?.orbitControls) {
      currentApp._controls.orbitControls.enabled = false;
    }
    isSoftPausedRef.current = true;
  };

  const resumeIfNeeded = () => {
    clearPauseTimeout();

    const currentApp = appRef.current;
    if (!currentApp) {
      return;
    }

    if (typeof currentApp._lastTime !== 'undefined') {
      currentApp._lastTime = undefined;
    }
    if (currentApp._controls?.orbitControls) {
      currentApp._controls.orbitControls.enabled = true;
    }
    if (isSoftPausedRef.current) {
      currentApp._renderer?.setAnimationLoop(createManagedLoop(currentApp));
      isSoftPausedRef.current = false;
    }
  };

  const pauseWhenIdle = () => {
    clearPauseTimeout();
    pauseTimeoutRef.current = setTimeout(() => {
      pauseTimeoutRef.current = null;

      if (!isVisibleRef.current && appRef.current) {
        softPause();
      }
    }, OFFSCREEN_PAUSE_DELAY);
  };

  useEffect(() => {
    onReadyChange?.(isReady);
  }, [isReady, onReadyChange]);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    let visibilityObserver = null;

    visibilityObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        const nextVisibility = entry.isIntersecting;
        isVisibleRef.current = nextVisibility;
        setIsVisible(nextVisibility);
      },
      {
        threshold: 0.01,
        rootMargin: '15% 0px 15% 0px',
      },
    );

    visibilityObserver.observe(containerRef.current);

    return () => {
      visibilityObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    isDisposedRef.current = false;

    return () => {
      isDisposedRef.current = true;
      clearLoadDelay();
      clearPauseTimeout();
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (appRef.current) {
        appRef.current.dispose();
      }
      initPromiseRef.current = null;
      hasStartedLoadingRef.current = false;
      isSoftPausedRef.current = false;
      appRef.current = null;
      setIsReady(false);
    };
  }, [scene]);

  useEffect(() => {
    if (!shouldLoad || !isVisible || hasStartedLoadingRef.current) {
      if (!isVisible) {
        clearLoadDelay();
      }
      return undefined;
    }

    loadDelayTimeoutRef.current = setTimeout(() => {
      loadDelayTimeoutRef.current = null;
      hasStartedLoadingRef.current = true;

      if (!initPromiseRef.current && canvasRef.current && containerRef.current) {
        const startInitialization = async () => {
          const scenePreload = preloadSplineScene(scene);
          const { Application } = await loadSplineRuntime();

          if (isDisposedRef.current || !canvasRef.current || !containerRef.current) {
            return;
          }

          const nextApp = new Application(canvasRef.current, { renderMode: 'auto' });
          appRef.current = nextApp;
          isSoftPausedRef.current = false;

          if (nextApp._renderer?.setPixelRatio) {
            const preferredPixelRatio = isLowEndDevice()
              ? 1
              : Math.min(window.devicePixelRatio || 1, 1.5);
            nextApp._renderer.setPixelRatio(preferredPixelRatio);
          }

          resizeObserverRef.current = new ResizeObserver(() => {
            resize();
          });
          resizeObserverRef.current.observe(containerRef.current);
          resize();

          await scenePreload;
          await nextApp.load(scene);

          if (isDisposedRef.current || !canvasRef.current || !containerRef.current) {
            return;
          }

          resize();
          setIsReady(true);

          if (isVisibleRef.current) {
            resumeIfNeeded();
          } else {
            softPause();
          }
        };

        initPromiseRef.current = startInitialization()
          .catch(() => {
            hasStartedLoadingRef.current = false;
            setIsReady(false);
          })
          .finally(() => {
            initPromiseRef.current = null;
          });
      }
    }, loadDelayMs);

    return () => {
      clearLoadDelay();
    };
  }, [isVisible, loadDelayMs, scene, shouldLoad]);

  useEffect(() => {
    if (!appRef.current || !isReady) {
      return undefined;
    }

    if (isVisible) {
      resumeIfNeeded();
      return undefined;
    }

    pauseWhenIdle();

    return () => {
      clearPauseTimeout();
    };
  }, [isReady, isVisible]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: isReady ? 'block' : 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

SplineCanvas.propTypes = {
  className: PropTypes.string,
  loadDelayMs: PropTypes.number,
  onReadyChange: PropTypes.func,
  scene: PropTypes.string.isRequired,
  shouldLoad: PropTypes.bool,
};

SplineCanvas.defaultProps = {
  className: undefined,
  loadDelayMs: HERO_LOAD_DELAY,
  onReadyChange: undefined,
  shouldLoad: true,
};

export default memo(SplineCanvas);
