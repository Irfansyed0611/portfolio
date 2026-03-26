import React, { memo, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

let runtimePromise = null;
const scenePreloadPromises = new Map();
const OFFSCREEN_PAUSE_DELAY = 180;

const loadSplineRuntime = () => {
  if (!runtimePromise) {
    runtimePromise = import(/* webpackPreload: true */ '@splinetool/runtime');
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

const SplineCanvas = ({ scene, className }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const pauseTimeoutRef = useRef(null);
  const isSoftPausedRef = useRef(false);
  const isVisibleRef = useRef(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) {
      return undefined;
    }

    let isActive = true;
    let visibilityObserver = null;
    let resizeObserver = null;
    let app = null;

    const resize = () => {
      if (!containerRef.current || !appRef.current) {
        return;
      }

      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        appRef.current.setSize(clientWidth, clientHeight);
      }
    };

    const clearPauseTimeout = () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
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
      if (!currentApp || !isSoftPausedRef.current) {
        return;
      }

      if (typeof currentApp._lastTime !== 'undefined') {
        currentApp._lastTime = undefined;
      }
      if (currentApp._controls?.orbitControls) {
        currentApp._controls.orbitControls.enabled = true;
      }
      currentApp._renderer?.setAnimationLoop(currentApp.render);
      isSoftPausedRef.current = false;
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

    const mountApp = async () => {
      try {
        const { Application } = await loadSplineRuntime();
        if (!isActive || !canvasRef.current) {
          return;
        }

        const scenePreload = preloadSplineScene(scene);

        app = new Application(canvasRef.current, { renderMode: 'auto' });
        appRef.current = app;
        isSoftPausedRef.current = false;

        resizeObserver = new ResizeObserver(() => {
          resize();
        });
        resizeObserver.observe(containerRef.current);
        resize();

        await scenePreload;
        await app.load(scene);
        if (isActive) {
          resize();
          resumeIfNeeded();

          visibilityObserver = new IntersectionObserver(
            entries => {
              const entry = entries[0];
              if (!entry) {
                return;
              }

              isVisibleRef.current = entry.isIntersecting;

              if (entry.isIntersecting) {
                resumeIfNeeded();
              } else {
                pauseWhenIdle();
              }
            },
            {
              threshold: 0.01,
              rootMargin: '15% 0px 15% 0px',
            },
          );
          visibilityObserver.observe(containerRef.current);
          setIsLoading(false);
        }
      } catch (error) {
        if (isActive) {
          setIsLoading(true);
        }
      }
    };

    mountApp();

    return () => {
      isActive = false;
      clearPauseTimeout();
      if (visibilityObserver) {
        visibilityObserver.disconnect();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (app) {
        app.dispose();
      }
      isSoftPausedRef.current = false;
      appRef.current = null;
    };
  }, [scene]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: isLoading ? 'none' : 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

SplineCanvas.propTypes = {
  className: PropTypes.string,
  scene: PropTypes.string.isRequired,
};

export default memo(SplineCanvas);
