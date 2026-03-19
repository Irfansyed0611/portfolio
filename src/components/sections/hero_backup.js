import React, { useState, useEffect, Suspense, lazy } from 'react';
import styled from 'styled-components';
import { navDelay } from '@utils';
import { usePrefersReducedMotion } from '@hooks';

const Spline = lazy(() => import('@splinetool/react-spline'));

const StyledHeroSection = styled.section`
  ${({ theme }) => theme.mixins.flexCenter};
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
`;

const StyledCard = styled.div`
  width: 100%;
  max-width: 1200px;
  height: auto;
  background-color: rgba(0, 0, 0, 0.96);
  border: 1px solid #262626; /* border-neutral-800 */
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);

  @media (min-width: 768px) {
    flex-direction: row;
    height: 500px;
  }
`;

const SpotlightSVG = styled.svg`
  position: absolute;
  pointer-events: none;
  z-index: 1;
  height: 169%;
  width: 138%;
  opacity: 0;
  top: -160px;
  left: 0;
  animation: spotlight 2s ease 0.75s 1 forwards;

  @media (min-width: 768px) {
    width: 84%;
    top: -80px;
    left: 240px;
  }

  @keyframes spotlight {
    0% {
      opacity: 0;
      transform: translate(-72%, -62%) scale(0.5);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -40%) scale(1);
    }
  }
`;

const ContentPanel = styled.div`
  flex: 1;
  padding: 40px;
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (min-width: 768px) {
    padding: 60px;
  }

  p.intro {
    margin: 0 0 10px;
    color: var(--green); /* Mapped existing green coordinate */
    font-family: var(--font-mono);
    font-size: var(--fz-md);
  }

  h1.name {
    margin: 0;
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 700;
    background: linear-gradient(to bottom, #ffffff, #a3a3a3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  h2.tagline {
    margin: 5px 0 0;
    font-size: clamp(24px, 4vw, 32px);
    font-weight: 600;
    color: var(--light-slate);
  }

  p.description {
    margin: 20px 0 0;
    max-width: 480px;
    color: var(--slate);
    line-height: 1.6;
    font-size: var(--fz-md);
  }

  .resume-link {
    ${({ theme }) => theme.mixins.bigButton};
    align-self: flex-start;
    margin-top: 30px;
  }
`;

const ScenePanel = styled.div`
  flex: 1;
  position: relative;
  height: 320px;

  @media (min-width: 768px) {
    height: 100%;
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
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    const timeout = setTimeout(() => setIsMounted(true), navDelay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <StyledHeroSection>
      <StyledCard>
        <SpotlightSVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3787 2842" fill="none">
          <g filter="url(#filter-spotlight)">
            <ellipse
              cx="1924.71"
              cy="273.501"
              rx="1924.71"
              ry="273.501"
              transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
              fill="white"
              fillOpacity="0.21"
            ></ellipse>
          </g>
          <defs>
            <filter
              id="filter-spotlight"
              x="0.860352"
              y="0.838989"
              width="3785.16"
              height="2840.26"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              ></feBlend>
              <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur"></feGaussianBlur>
            </filter>
          </defs>
        </SpotlightSVG>

        <ContentPanel>
          <p className="intro">Hi, my name is</p>
          <h1 className="name">Syed Irfan.</h1>
          <h2 className="tagline">I build things in the cloud.</h2>
          <p className="description">
            I’m a certified AWS Solutions Architect with expertise in designing and implementing
            secure, scalable, and cost-optimized cloud infrastructures. Currently working on DevOps
            projects, leveraging tools like Terraform, Docker, and CI/CD pipelines to automate cloud
            operations at{' '}
            <a href="https://www.stratogent.com" target="_blank" rel="noreferrer">
              Stratogent
            </a>
            .
          </p>
          <a className="resume-link" href="/Resume.pdf" target="_blank" rel="noreferrer">
            Resume
          </a>
        </ContentPanel>

        <ScenePanel>
          <Suspense
            fallback={
              <div className="loader-wrapper">
                <div className="loader-spin"></div>
              </div>
            }
          >
            {isMounted && (
              <Spline
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            )}
          </Suspense>
        </ScenePanel>
      </StyledCard>
    </StyledHeroSection>
  );
};

export default Hero;
