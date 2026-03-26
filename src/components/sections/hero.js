import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { navDelay } from '@utils';
import { usePrefersReducedMotion } from '@hooks';
import SplineCanvas, { preloadSplineRuntime, preloadSplineScene } from '@components/spline-canvas';
import MobileSocials from '@components/MobileSocials';

const HERO_SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

const StyledHeroSection = styled.section`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  width: 100%;
  max-width: 1320px;
  min-height: 100vh;
  padding: 0;
  overflow: visible;
`;

const HeroContainer = styled.div`
  width: 100%;
  max-width: 1320px; /* Revert to 1000px if you want the previous boxed width */
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: visible;

  @media (min-width: 768px) {
    flex-direction: row;
    min-height: 100vh;
  }
  background-color: transparent;
`;

const ContentPanel = styled.div`
  flex: 1;
  min-width: 0;
  padding: calc(var(--nav-height) + 8px) 0 24px;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (min-width: 768px) {
    padding: calc(var(--nav-height) + 32px) 60px 60px;
    justify-content: center;
    ${({ $passThrough }) =>
      $passThrough &&
      `
        pointer-events: none;

        p.intro,
        h1.name,
        h2.tagline,
        p.description,
        .resume-link,
        .mobile-socials,
        .mobile-socials * {
          pointer-events: auto;
        }
      `}
  }

  p.intro {
    margin: 0 0 10px;
    color: var(--green); /* Mapped existing green coordinate */
    font-family: var(--font-body);
    font-size: 15px;
  }

  h1.name {
    margin: 10px 0 30px 4px;
    font-size: clamp(40px, 8vw, 80px);
    font-weight: 700;
    color: var(--lightest-slate);
    line-height: 1.1;
  }

  h2.tagline {
    margin: 5px 0 0;
    font-size: clamp(22px, 4.6vw, 48px);
    font-weight: 600;
    color: var(--slate);
    line-height: 0.9;
    white-space: nowrap;
  }

  p.description {
    margin: 20px 0 0;
    max-width: 540px;
    color: var(--slate);
    font-size: var(--fz-lg);
  }

  .resume-link {
    ${({ theme }) => theme.mixins.bigButton};
    align-self: flex-start;
    margin-top: 30px;
  }

  .mobile-socials {
    align-self: flex-start;
    width: auto;
    max-width: none;
    margin-top: 18px;
    margin-left: 0;
    margin-right: 0;
  }

  .mobile-socials ul {
    justify-content: flex-start;
    gap: 6px;
  }
`;

const HeroSceneLayer = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: visible;
    pointer-events: auto;
  }

  .scene-shell {
    position: absolute;
    inset: 0;
    overflow: visible;
  }

  .scene-shell > div {
    width: 100%;
    height: 100%;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
    outline: none;
  }

  .loader-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
  }

  .loader-spin {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-left-color: var(--green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ScenePanel = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    flex: 1;
    min-width: 0;
    position: relative;
    min-height: clamp(620px, 78vh, 860px);
    align-items: flex-end;
    justify-content: center;
    align-self: stretch;
    overflow: visible;
    isolation: isolate;
    contain: layout paint;
  }

  .scene-shell {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: visible;
  }

  .scene-shell > div {
    width: 100%;
    height: 100%;
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
    outline: none;
  }

  .loader-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
  }

  .loader-spin {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-left-color: var(--green);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Hero = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showHero, setShowHero] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    const shouldRunSpline = desktopQuery.matches && !prefersReducedMotion;

    setIsDesktop(desktopQuery.matches);
    setIsMounted(shouldRunSpline);

    if (shouldRunSpline) {
      preloadSplineRuntime();
      preloadSplineScene(HERO_SCENE_URL);
    }

    const preconnectHref = 'https://prod.spline.design';
    const existingPreconnect = document.head.querySelector(`link[href="${preconnectHref}"]`);
    const existingDnsPrefetch = document.head.querySelector(
      `link[rel="dns-prefetch"][href="${preconnectHref}"]`,
    );
    const existingScenePreload = document.head.querySelector(
      `link[rel="preload"][href="${HERO_SCENE_URL}"]`,
    );
    let appendedPreconnect = null;
    let appendedDnsPrefetch = null;
    let appendedScenePreload = null;
    if (!existingPreconnect) {
      appendedPreconnect = document.createElement('link');
      appendedPreconnect.rel = 'preconnect';
      appendedPreconnect.href = preconnectHref;
      appendedPreconnect.crossOrigin = 'anonymous';
      document.head.appendChild(appendedPreconnect);
    }
    if (!existingDnsPrefetch) {
      appendedDnsPrefetch = document.createElement('link');
      appendedDnsPrefetch.rel = 'dns-prefetch';
      appendedDnsPrefetch.href = preconnectHref;
      document.head.appendChild(appendedDnsPrefetch);
    }
    if (!existingScenePreload && shouldRunSpline) {
      appendedScenePreload = document.createElement('link');
      appendedScenePreload.rel = 'preload';
      appendedScenePreload.as = 'fetch';
      appendedScenePreload.href = HERO_SCENE_URL;
      appendedScenePreload.crossOrigin = 'anonymous';
      document.head.appendChild(appendedScenePreload);
    }

    const handleMediaChange = event => {
      const isNowDesktop = event.matches;
      setIsDesktop(isNowDesktop);
      const mountSpline = isNowDesktop && !prefersReducedMotion;
      setIsMounted(mountSpline);
      if (mountSpline) {
        preloadSplineRuntime();
        preloadSplineScene(HERO_SCENE_URL);
      }
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', handleMediaChange);
    } else {
      desktopQuery.addListener(handleMediaChange);
    }

    const cleanupMediaListener = () => {
      if (desktopQuery.removeEventListener) {
        desktopQuery.removeEventListener('change', handleMediaChange);
      } else {
        desktopQuery.removeListener(handleMediaChange);
      }
    };

    if (prefersReducedMotion) {
      return () => {
        cleanupMediaListener();
        if (appendedPreconnect) {
          appendedPreconnect.remove();
        }
        if (appendedDnsPrefetch) {
          appendedDnsPrefetch.remove();
        }
        if (appendedScenePreload) {
          appendedScenePreload.remove();
        }
      };
    }

    return () => {
      cleanupMediaListener();
      if (appendedPreconnect) {
        appendedPreconnect.remove();
      }
      if (appendedDnsPrefetch) {
        appendedDnsPrefetch.remove();
      }
      if (appendedScenePreload) {
        appendedScenePreload.remove();
      }
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShowHero(true);
      return;
    }

    const timeout = setTimeout(() => setShowHero(true), 100);
    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  const shouldShowSpline = isMounted && isDesktop;

  return (
    <StyledHeroSection>
      <HeroContainer>
        {prefersReducedMotion ? (
          <>
            <ContentPanel>
              <p className="intro">Hi, my name is</p>
              <h1 className="name">Syed Irfan.</h1>
              <h2 className="tagline">I build things in the cloud.</h2>
              <a className="resume-link" href="/Resume.pdf" target="_blank" rel="noreferrer">
                Resume
              </a>
              <MobileSocials className="mobile-socials" />
            </ContentPanel>

            <ScenePanel>
              {shouldShowSpline ? (
                <div className="scene-shell" aria-hidden="true">
                  <SplineCanvas scene={HERO_SCENE_URL} />
                </div>
              ) : (
                <div className="loader-wrapper">
                  <div className="loader-spin"></div>
                </div>
              )}
            </ScenePanel>
          </>
        ) : (
          <>
            <TransitionGroup component={null}>
              {showHero && (
                <CSSTransition classNames="fadeup" timeout={navDelay}>
                  <HeroSceneLayer style={{ transitionDelay: '100ms' }} aria-hidden="true">
                    {shouldShowSpline ? (
                      <div className="scene-shell">
                        <SplineCanvas scene={HERO_SCENE_URL} />
                      </div>
                    ) : (
                      <div className="loader-wrapper">
                        <div className="loader-spin"></div>
                      </div>
                    )}
                  </HeroSceneLayer>
                </CSSTransition>
              )}
            </TransitionGroup>

            <TransitionGroup component={null}>
              {showHero && (
                <CSSTransition classNames="fadeup" timeout={navDelay}>
                  <ContentPanel $passThrough>
                    <p className="intro">Hi, my name is</p>
                    <h1 className="name">Syed Irfan.</h1>
                    <h2 className="tagline">I build things in the cloud.</h2>
                    <a className="resume-link" href="/Resume.pdf" target="_blank" rel="noreferrer">
                      Resume
                    </a>
                    <MobileSocials className="mobile-socials" />
                  </ContentPanel>
                </CSSTransition>
              )}
            </TransitionGroup>

            <ScenePanel aria-hidden="true" />
          </>
        )}
      </HeroContainer>
    </StyledHeroSection>
  );
};

export default Hero;
