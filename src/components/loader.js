import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

const pulseDot = keyframes`
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
`;

const sweep = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(100%);
  }
`;

const TOTAL_SEGMENTS = 24;

// A slow, even fade reads smoother than a quick one: long enough to feel like a
// dissolve rather than a cut, on an ease-out curve so it clears the last of the
// black gently instead of snapping off at the end.
const FADE_OUT_MS = 700;

const StyledLoader = styled.div`
  ${({ theme }) => theme.mixins.flexCenter};
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  padding: 24px;
  background: #000;
  z-index: 9999;
  overflow: hidden;
  opacity: ${props => (props.$isExiting ? 0 : 1)};
  transition: opacity ${FADE_OUT_MS}ms cubic-bezier(0.33, 0, 0.2, 1);
  /* Promote to its own layer up front so the fade is composited, never repainted. */
  will-change: opacity;
  pointer-events: ${props => (props.$isExiting ? 'none' : 'auto')};

  .shell {
    width: 100%;
    max-width: 600px;
    color: #fff;
    font-family: var(--font-mono);
    user-select: none;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  .bar-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  .top-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding: 0 4px 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .dot {
    width: 10px;
    height: 10px;
    background: #fff;
    animation: ${pulseDot} 1s ease-in-out infinite;
    flex: 0 0 auto;
  }

  .label {
    font-family: var(--font-sans);
    font-size: clamp(14px, 2vw, 16px);
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .counter {
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    letter-spacing: 0.25em;
    white-space: nowrap;
  }

  .frame {
    position: relative;
    margin-top: 4px;
    padding: 6px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: #000;
    clip-path: polygon(
      15px 0,
      100% 0,
      100% calc(100% - 15px),
      calc(100% - 15px) 100%,
      0 100%,
      0 15px
    );
  }

  .corner {
    position: absolute;
    width: 32px;
    height: 32px;
    pointer-events: none;
  }

  .corner--tr {
    top: 0;
    right: 0;
    border-top: 2px solid #fff;
    border-right: 2px solid #fff;
  }

  .corner--bl {
    bottom: 0;
    left: 0;
    border-bottom: 2px solid #fff;
    border-left: 2px solid #fff;
  }

  .segments {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 4px;
    width: 100%;
    height: 40px;
    padding: 6px;
    background: rgba(255, 255, 255, 0.05);
    clip-path: polygon(
      10px 0,
      100% 0,
      100% calc(100% - 10px),
      calc(100% - 10px) 100%,
      0 100%,
      0 10px
    );
  }

  .segment {
    position: relative;
    flex: 1;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    border-right: 1px solid rgba(0, 0, 0, 0.5);
    transform: skewX(-20deg);
  }

  .segment.is-filled {
    background: #fff;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
    transition: background-color 0.2s ease-out, box-shadow 0.2s ease-out;
  }

  .segment.is-current::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.7);
    animation: ${sweep} 0.6s linear infinite;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding: 0 4px;
  }

  .track-a,
  .track-b,
  .track-c,
  .track-d {
    height: 4px;
  }

  .track-a {
    flex: 4;
    background: rgba(255, 255, 255, 0.4);
  }

  .track-b {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
  }

  .track-c {
    width: 24px;
    background: rgba(255, 255, 255, 0.6);
  }

  .track-d {
    width: 8px;
    background: #fff;
  }

  .sys {
    margin-left: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    padding: 16px;

    .top-row {
      align-items: center;
    }

    .counter {
      display: none;
    }

    .segments {
      height: 48px;
      gap: 6px;
      padding: 8px;
    }

    .bottom-row {
      gap: 6px;
    }

    .track-a,
    .track-b,
    .track-c,
    .track-d {
      height: 6px;
    }

    .sys {
      font-size: 8px;
      margin-left: 4px;
    }
  }
`;

const STATUS_LOADING = 'Loading...';

const Loader = ({ finishLoading }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const isRobotReadyRef = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    document.body.classList.add('hidden');

    return () => {
      document.body.classList.remove('hidden');
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 769) {
      finishLoading();
      return undefined;
    }

    const handleRobotReady = () => {
      isRobotReadyRef.current = true;
    };

    window.addEventListener('hero-robot-ready', handleRobotReady);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (isRobotReadyRef.current) {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }

          return Math.min(100, prev + 8);
        }

        if (prev < 85) {
          return prev + Math.floor(Math.random() * 4 + 2);
        }

        return 85;
      });
    }, 50);

    const safetyTimeout = setTimeout(() => {
      isRobotReadyRef.current = true;
    }, 5500);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
      window.removeEventListener('hero-robot-ready', handleRobotReady);
    };
  }, [finishLoading]);

  useEffect(() => {
    if (progress < 100) {
      return undefined;
    }

    // Note: `isExiting` must stay out of the dependency list. Including it made this
    // effect re-run as soon as setIsExiting(true) landed, which ran the cleanup below
    // and cancelled the timer before it could fire, so finishLoading() was never called
    // and the (now invisible) loader stayed mounted holding `body.hidden` — which locks
    // page scrolling.
    setIsExiting(true);

    // Unmount only once the fade has fully finished, so it never cuts off early.
    const exitTimer = setTimeout(() => {
      finishLoading();
    }, FADE_OUT_MS);

    return () => clearTimeout(exitTimer);
  }, [progress, finishLoading]);

  const displayProgress = Math.floor(progress);
  const filledSegments = Math.floor((progress / 100) * TOTAL_SEGMENTS);

  return (
    <StyledLoader className="loader" $isExiting={isExiting}>
      <div className="shell">
        <div className="stack">
          <div className="bar-group">
            <div className="top-row">
              <div className="status">
                <span className="dot" />
                <span className="label">{STATUS_LOADING}</span>
              </div>

              <div className="counter">{String(displayProgress).padStart(3, '0')} / 100</div>
            </div>

            <div className="frame">
              <span className="corner corner--tr" />
              <span className="corner corner--bl" />

              <div className="segments">
                {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => {
                  const isFilled = i < filledSegments;
                  const isCurrent = i === filledSegments && progress < 100;

                  return (
                    <div
                      key={i}
                      className={`segment${isFilled ? ' is-filled' : ''}${
                        isCurrent ? ' is-current' : ''
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="bottom-row">
              <div className="track-a" />
              <div className="track-b" />
              <div className="track-c" />
              <div className="track-d" />
              <div className="sys">
                SYS_IDLE_0x{displayProgress.toString(16).padStart(2, '0').toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledLoader>
  );
};

Loader.propTypes = {
  finishLoading: PropTypes.func.isRequired,
};

export default Loader;
