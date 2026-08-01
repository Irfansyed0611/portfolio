import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import styled from 'styled-components';
import { navDelay } from '@utils';
import { usePrefersReducedMotion } from '@hooks';
import { StaticImage } from 'gatsby-plugin-image';
import { email } from '@config';
import SplineCanvas, {
  shouldEnableSplineExperience,
  preloadSplineScene,
  preloadSplineRuntime,
} from '@components/spline-canvas';

const HERO_SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

if (typeof window !== 'undefined') {
  preloadSplineRuntime();
  preloadSplineScene(HERO_SCENE_URL);
}

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
        .email-link,
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
`;

const HeroAvatar = styled.div`
  display: block;
  margin: 0 0 25px 4px;
  width: 130px;
  height: 130px;

  .wrapper {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius);
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(201, 169, 110, 0.25);

    .avatar-img {
      display: block;
      border-radius: var(--border-radius);
    }
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const HeroButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 30px;

  .resume-link {
    ${({ theme }) => theme.mixins.bigButton};
    margin-top: 0;
  }

  .email-link {
    display: none;
  }

  @media (max-width: 767px) {
    .email-link {
      display: inline-block;
      ${({ theme }) => theme.mixins.bigButton};
      margin-top: 0;
      pointer-events: auto !important;
    }
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
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    max-width: 100vw;
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
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    max-width: 100vw;
    pointer-events: none;
    opacity: ${({ $sceneReady }) => ($sceneReady ? 0 : 1)};
    transition: opacity 280ms ease;
  }

  .fallback-shell {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: radial-gradient(circle at 68% 34%, rgba(100, 255, 218, 0.22), transparent 22%),
      radial-gradient(circle at 52% 58%, rgba(72, 152, 255, 0.18), transparent 28%),
      linear-gradient(135deg, rgba(10, 25, 47, 0.96), rgba(17, 34, 64, 0.9));
  }

  .fallback-shell::before {
    content: '';
    position: absolute;
    inset: 10% 8%;
    border: 1px solid rgba(100, 255, 218, 0.16);
    border-radius: 32px;
    transform: skew(-10deg);
  }

  .fallback-shell::after {
    content: '';
    position: absolute;
    inset: auto 12% 12% auto;
    width: min(28vw, 280px);
    height: min(28vw, 280px);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(100, 255, 218, 0.28), transparent 68%);
    filter: blur(12px);
  }

  .fallback-copy {
    position: absolute;
    right: clamp(24px, 4vw, 48px);
    bottom: clamp(24px, 5vw, 56px);
    max-width: 260px;
    padding: 18px 20px;
    border: 1px solid rgba(100, 255, 218, 0.16);
    border-radius: 18px;
    background: rgba(10, 25, 47, 0.64);
    backdrop-filter: blur(10px);
    color: var(--slate);
    font-size: 14px;
    line-height: 1.6;
  }

  .fallback-copy strong {
    display: block;
    margin-bottom: 6px;
    color: var(--lightest-slate);
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    max-width: 100vw;
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
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    max-width: 100vw;
    pointer-events: none;
    opacity: ${({ $sceneReady }) => ($sceneReady ? 0 : 1)};
    transition: opacity 280ms ease;
  }

  .fallback-shell {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 28px;
    background: radial-gradient(circle at 68% 34%, rgba(100, 255, 218, 0.22), transparent 22%),
      radial-gradient(circle at 52% 58%, rgba(72, 152, 255, 0.18), transparent 28%),
      linear-gradient(135deg, rgba(10, 25, 47, 0.96), rgba(17, 34, 64, 0.9));
  }

  .fallback-shell::before {
    content: '';
    position: absolute;
    inset: 10% 8%;
    border: 1px solid rgba(100, 255, 218, 0.16);
    border-radius: 32px;
    transform: skew(-10deg);
  }

  .fallback-shell::after {
    content: '';
    position: absolute;
    inset: auto 12% 12% auto;
    width: min(28vw, 280px);
    height: min(28vw, 280px);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(100, 255, 218, 0.28), transparent 68%);
    filter: blur(12px);
  }

  .fallback-copy {
    position: absolute;
    right: clamp(24px, 4vw, 48px);
    bottom: clamp(24px, 5vw, 56px);
    max-width: 260px;
    padding: 18px 20px;
    border: 1px solid rgba(100, 255, 218, 0.16);
    border-radius: 18px;
    background: rgba(10, 25, 47, 0.64);
    backdrop-filter: blur(10px);
    color: var(--slate);
    font-size: 14px;
    line-height: 1.6;
  }

  .fallback-copy strong {
    display: block;
    margin-bottom: 6px;
    color: var(--lightest-slate);
    font-size: 13px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`;

const HeroSceneFallback = () => (
  <div>
    <div className="fallback-shell">
      <div className="fallback-copy">
        <strong>Interactive Preview</strong>
        The 3D scene loads only after the hero stays in view, keeping the first paint fast and
        stable.
      </div>
    </div>
  </div>
);

const Hero = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [canUseSpline, setCanUseSpline] = useState(false);
  const [hasCheckedCapability, setHasCheckedCapability] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 769px)');
    // usePrefersReducedMotion() defaults to `true` for one render (SSR-safe placeholder)
    // before its own effect resolves the real value, so read the media query directly
    // here to avoid computing shouldShowSpline off that stale default.
    const actualPrefersReducedMotion = !window.matchMedia('(prefers-reduced-motion: no-preference)')
      .matches;

    setIsDesktop(desktopQuery.matches);
    setCanUseSpline(shouldEnableSplineExperience(actualPrefersReducedMotion));
    setHasCheckedCapability(true);

    const handleMediaChange = event => {
      setIsDesktop(event.matches);
      setCanUseSpline(shouldEnableSplineExperience(actualPrefersReducedMotion));
      setIsSceneReady(false);
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', handleMediaChange);
    } else {
      desktopQuery.addListener(handleMediaChange);
    }

    return () => {
      if (desktopQuery.removeEventListener) {
        desktopQuery.removeEventListener('change', handleMediaChange);
      } else {
        desktopQuery.removeListener(handleMediaChange);
      }
    };
  }, [prefersReducedMotion]);

  const shouldShowSpline = canUseSpline && isDesktop;

  useEffect(() => {
    if (!hasCheckedCapability) {
      return;
    }

    if (isSceneReady || !shouldShowSpline) {
      window.dispatchEvent(new CustomEvent('hero-robot-ready'));
    }
  }, [hasCheckedCapability, isSceneReady, shouldShowSpline]);

  return (
    <StyledHeroSection>
      <Helmet>
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        <link rel="preload" as="fetch" href={HERO_SCENE_URL} crossOrigin="anonymous" />
        <link rel="preconnect" href="https://unpkg.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
      </Helmet>
      <HeroContainer>
        {prefersReducedMotion ? (
          <>
            <ContentPanel>
              <HeroAvatar>
                <div className="wrapper">
                  <StaticImage
                    className="avatar-img"
                    src="../../images/me.png"
                    width={130}
                    height={130}
                    quality={95}
                    formats={['AUTO', 'WEBP', 'AVIF']}
                    alt="Headshot"
                  />
                </div>
              </HeroAvatar>
              <p className="intro">Hi, my name is</p>
              <h1 className="name">Syed Irfan.</h1>
              <h2 className="tagline">I build things in the cloud.</h2>
              <HeroButtonContainer>
                <a className="resume-link" href="/Resume.pdf" target="_blank" rel="noreferrer">
                  Resume
                </a>
                <a className="email-link" href={`mailto:${email}`}>
                  Say Hello
                </a>
              </HeroButtonContainer>
            </ContentPanel>

            <ScenePanel $sceneReady={isSceneReady}>
              <div className="loader-wrapper" aria-hidden="true">
                <HeroSceneFallback />
              </div>
              {shouldShowSpline && (
                <div className="scene-shell" aria-hidden="true">
                  <SplineCanvas scene={HERO_SCENE_URL} onReadyChange={setIsSceneReady} />
                </div>
              )}
            </ScenePanel>
          </>
        ) : (
          <>
            <TransitionGroup component={null}>
              <CSSTransition classNames="fadeup" timeout={navDelay}>
                <HeroSceneLayer
                  $sceneReady={isSceneReady}
                  style={{ transitionDelay: '100ms' }}
                  aria-hidden="true"
                >
                  <div className="loader-wrapper">
                    <HeroSceneFallback />
                  </div>
                  {shouldShowSpline && (
                    <div className="scene-shell">
                      <SplineCanvas scene={HERO_SCENE_URL} onReadyChange={setIsSceneReady} />
                    </div>
                  )}
                </HeroSceneLayer>
              </CSSTransition>
            </TransitionGroup>

            <TransitionGroup component={null}>
              <CSSTransition classNames="fadeup" timeout={navDelay}>
                <ContentPanel $passThrough>
                  <HeroAvatar>
                    <div className="wrapper">
                      <StaticImage
                        className="avatar-img"
                        src="../../images/me.png"
                        width={130}
                        height={130}
                        quality={95}
                        formats={['AUTO', 'WEBP', 'AVIF']}
                        alt="Headshot"
                      />
                    </div>
                  </HeroAvatar>
                  <p className="intro">Hi, my name is</p>
                  <h1 className="name">Syed Irfan.</h1>
                  <h2 className="tagline">I build things in the cloud.</h2>
                  <HeroButtonContainer>
                    <a className="resume-link" href="/Resume.pdf" target="_blank" rel="noreferrer">
                      Resume
                    </a>
                    <a className="email-link" href={`mailto:${email}`}>
                      Say Hello
                    </a>
                  </HeroButtonContainer>
                </ContentPanel>
              </CSSTransition>
            </TransitionGroup>

            <ScenePanel aria-hidden="true" />
          </>
        )}
      </HeroContainer>
    </StyledHeroSection>
  );
};

export default Hero;
