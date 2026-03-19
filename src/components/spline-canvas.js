import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

let runtimePromise = null;

const loadSplineRuntime = () => {
  if (!runtimePromise) {
    runtimePromise = import('@splinetool/runtime');
  }
  return runtimePromise;
};

export const preloadSplineRuntime = () => {
  void loadSplineRuntime();
};

const SplineCanvas = ({ scene, className }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) {
      return undefined;
    }

    let isActive = true;
    let observer = null;
    let visibilityObserver = null;
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

    const mountApp = async () => {
      try {
        const { Application } = await loadSplineRuntime();
        if (!isActive || !canvasRef.current) {
          return;
        }

        app = new Application(canvasRef.current, { renderOnDemand: true });
        appRef.current = app;

        observer = new ResizeObserver(() => {
          resize();
        });
        observer.observe(containerRef.current);
        resize();

        visibilityObserver = new IntersectionObserver(
          entries => {
            const entry = entries[0];
            if (!entry || !appRef.current) {
              return;
            }
            if (entry.isIntersecting) {
              appRef.current.play();
            } else {
              appRef.current.stop();
            }
          },
          { threshold: 0.05 },
        );
        visibilityObserver.observe(containerRef.current);

        await app.load(scene);
        if (isActive) {
          resize();
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
      if (visibilityObserver) {
        visibilityObserver.disconnect();
      }
      if (observer) {
        observer.disconnect();
      }
      if (app) {
        app.dispose();
      }
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

export default SplineCanvas;
