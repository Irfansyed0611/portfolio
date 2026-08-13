import React, { useEffect, useRef } from 'react';
import { StaticImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';
import SkillsSection from './SkillsSection';

const StyledAboutSection = styled.section`
  max-width: 1000px;

  .inner {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-gap: 50px;
    align-items: start;

    @media (max-width: 768px) {
      display: block;
    }
  }
`;
const StyledText = styled.div`
  p {
    text-align: left;
  }

  .skills-block {
    margin-top: 56px;
  }

  .skills-heading {
    display: flex;
    align-items: center;
    position: relative;
    margin: 0 0 24px;
    width: 100%;
    color: var(--lightest-slate);
    font-family: var(--font-heading);
    font-size: clamp(26px, 5vw, var(--fz-heading));
    font-weight: 600;
    line-height: 1.1;
    white-space: nowrap;

    &:after {
      content: '';
      display: block;
      position: relative;
      top: -2px;
      width: 220px;
      height: 1px;
      margin-left: 20px;
      background-color: var(--lightest-navy);
      @media (max-width: 1080px) {
        width: 160px;
      }
      @media (max-width: 768px) {
        width: 100%;
      }
      @media (max-width: 600px) {
        margin-left: 10px;
      }
    }
  }
`;

const StyledPic = styled.div`
  position: relative;
  max-width: 300px;

  @media (max-width: 768px) {
    display: none;
  }

  .wrapper {
    ${({ theme }) => theme.mixins.boxShadow};
    display: block;
    position: relative;
    width: 100%;
    border-radius: var(--border-radius);
    background-color: var(--green);

    &:hover,
    &:focus {
      outline: 0;
      transform: translate(-4px, -4px);

      &:after {
        transform: translate(8px, 8px);
      }

      .img {
        filter: none;
        mix-blend-mode: normal;
      }
    }

    .img {
      position: relative;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before,
    &:after {
      content: '';
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }

    &:before {
      top: 0;
      left: 0;
    }

    &:after {
      border: 2px solid var(--green);
      top: 14px;
      left: 14px;
      z-index: -1;
    }
  }
`;

const About = () => {
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealContainer.current, srConfig());
  }, []);
  return (
    <StyledAboutSection id="about" ref={revealContainer}>
      <h2 className="numbered-heading">About Me</h2>

      <div className="inner">
        <StyledText>
          <div>
            <p>
              I&apos;m a Senior Cloud Engineer at <a href="https://ptp.cloud/">PTP</a>, building and
              maintaining AWS infrastructure for life science companies.
            </p>

            <p>
              My work sits at the intersection of security and scale, whether I&apos;m standing up
              greenfield environments from scratch or hardening and extending existing
              infrastructure. Life science data is sensitive by nature, so security isn&apos;t an
              afterthought in what I build; it&apos;s the starting point.
            </p>

            <p>
              I use Terraform for IaC and GitHub Actions for CI/CD, and I regularly audit accounts
              for cost optimisation, keeping spend lean without cutting corners on compliance or
              reliability.
            </p>
          </div>
          <div className="skills-block">
            <h3 className="skills-heading">My Current Skill Sets</h3>
            <SkillsSection />
          </div>
        </StyledText>

        <StyledPic>
          <div className="wrapper">
            <StaticImage
              className="img"
              src="../../images/me5.png"
              width={500}
              quality={95}
              formats={['AUTO', 'WEBP', 'AVIF']}
              alt="Headshot"
            />
          </div>
        </StyledPic>
      </div>
    </StyledAboutSection>
  );
};

export default About;
