import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { usePrefersReducedMotion } from '@hooks';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StyledCertificationsSection = styled.section`
  max-width: 1000px;
  margin: 0 auto 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
  margin-top: 50px;
  width: 100%;

  @media (max-width: 480px) {
    gap: 30px;
  }
`;

const CardWrapper = styled.div`
  position: relative;
  width: 180px;
  height: 270px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    width: 155px;
    height: 240px;
  }
`;

const HoloCardFrame = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: rgba(13, 13, 13, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(201, 169, 110, 0.1);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  transition: border-color 0.4s, box-shadow 0.4s;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border-color: rgba(201, 169, 110, 0.45);
    box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4), 0 0 20px rgba(201, 169, 110, 0.15);
  }

  /* Shimmer sweep effect on hover */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -150%;
    width: 60%;
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(201, 169, 110, 0.15) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: skewX(-20deg);
    pointer-events: none;
  }

  &:hover::after {
    left: 150%;
    transition: left 0.8s ease-in-out;
  }
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;

  .gatsby-image-wrapper {
    width: 80px;
    height: 80px;
    filter: grayscale(1) opacity(0.8) drop-shadow(0 0 5px rgba(201, 169, 110, 0.15));
    transition: filter 0.4s, transform 0.4s;

    @media (hover: none) {
      filter: grayscale(0) opacity(1) drop-shadow(0 0 10px rgba(201, 169, 110, 0.25));
    }

    @media (max-width: 480px) {
      width: 70px;
      height: 70px;
    }

    .card-container:hover & {
      filter: grayscale(0) opacity(1) drop-shadow(0 0 12px rgba(201, 169, 110, 0.35));
      transform: scale(1.06);
    }
  }
`;

const CertTitle = styled.h4`
  font-size: var(--fz-xs);
  font-family: var(--font-body);
  color: var(--light-slate);
  text-align: center;
  font-weight: 600;
  line-height: 1.4;
  margin-top: 12px;
  padding: 0 2px;
  transition: color 0.3s;

  @media (max-width: 480px) {
    font-size: 11px;
    margin-top: 8px;
  }

  .card-container:hover & {
    color: var(--white);
  }
`;

const CardFooter = styled.div`
  font-size: 8px;
  font-family: var(--font-mono);
  color: var(--slate);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  padding-top: 12px;
  text-align: center;
  transition: color 0.3s, border-color 0.3s;

  @media (max-width: 480px) {
    font-size: 7px;
    margin-top: 15px;
    padding-top: 8px;
  }

  .card-container:hover & {
    color: var(--green);
    border-top-color: rgba(201, 169, 110, 0.15);
  }
`;

const ScanLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--green);
  opacity: 0;
  box-shadow: 0 0 8px var(--green), 0 0 15px var(--green);
  pointer-events: none;
  z-index: 5;
`;

const HoloCertCard = ({ cert, index }) => {
  const { title, url, cover } = cert.node.frontmatter;
  const image = getImage(cover);

  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const scanLineRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasBeenVerified, setHasBeenVerified] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const floatTweenRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isVerified = localStorage.getItem(`cert-verified-${index}`);
      if (isVerified === 'true') {
        setHasBeenVerified(true);
      }
    }
  }, [index]);

  // Staggered floating effect
  useGSAP(
    () => {
      if (prefersReducedMotion) {
        return;
      }

      floatTweenRef.current = gsap.to(cardRef.current, {
        y: -6,
        duration: 2.2 + index * 0.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    },
    { scope: containerRef },
  );

  const onMouseEnter = () => {
    if (prefersReducedMotion || isScanning) {
      return;
    }
    if (floatTweenRef.current) {
      floatTweenRef.current.pause();
    }
    gsap.to(cardRef.current, {
      y: -10,
      scale: 1.03,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const onMouseLeave = () => {
    if (prefersReducedMotion || isScanning) {
      return;
    }
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
      onComplete: () => {
        if (floatTweenRef.current && !isScanning) {
          floatTweenRef.current.play();
        }
      },
    });
  };

  // High-tech single-sweep scan effect on click
  const handleClick = e => {
    e.preventDefault();
    if (isScanning) {
      return;
    }

    setIsScanning(true);
    if (floatTweenRef.current) {
      floatTweenRef.current.pause();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsScanning(false);
        setHasBeenVerified(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`cert-verified-${index}`, 'true');
        }
        gsap.set(cardRef.current, { clearProps: 'all' });
        gsap.set(scanLineRef.current, { clearProps: 'all' });
        if (floatTweenRef.current) {
          floatTweenRef.current.play();
        }
      },
    });

    if (!prefersReducedMotion) {
      // 1. Initial click scale down
      tl.to(cardRef.current, {
        scale: 0.96,
        y: -4,
        borderColor: 'rgba(201, 169, 110, 0.5)',
        duration: 0.1,
        ease: 'power1.inOut',
      });

      // 2. Animate scan line sweeping from top to bottom
      tl.set(scanLineRef.current, {
        top: '0%',
        opacity: 0.9,
      });

      tl.to(scanLineRef.current, {
        top: '100%',
        duration: 0.6,
        ease: 'power2.inOut',
      });

      // Simultaneously animate card scaling back to hovered position
      tl.to(
        cardRef.current,
        {
          scale: 1.03,
          y: -10,
          borderColor: 'rgba(201, 169, 110, 0.8)',
          boxShadow: '0 0 25px rgba(201, 169, 110, 0.35)',
          duration: 0.4,
          ease: 'power2.out',
        },
        '-=0.4',
      );

      // Fade out scan line at the bottom
      tl.to(scanLineRef.current, {
        opacity: 0,
        duration: 0.15,
      });
    } else {
      tl.to({}, { duration: 0.1 });
    }
  };

  return (
    <CardWrapper ref={containerRef} className="card-container">
      <HoloCardFrame
        ref={cardRef}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        title={`Click to verify: ${title}`}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
          }
        }}
      >
        <ScanLine ref={scanLineRef} />

        <ImageContainer>
          <GatsbyImage image={image} alt={title} />
        </ImageContainer>

        <CertTitle>{title}</CertTitle>

        <CardFooter>
          <span>{hasBeenVerified ? 'Verified' : 'Click to Verify'}</span>
        </CardFooter>
      </HoloCardFrame>
    </CardWrapper>
  );
};

HoloCertCard.propTypes = {
  cert: PropTypes.shape({
    node: PropTypes.shape({
      frontmatter: PropTypes.shape({
        title: PropTypes.string.isRequired,
        url: PropTypes.string.isRequired,
        cover: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Certifications = () => {
  const data = useStaticQuery(graphql`
    query {
      certifications: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/certifications/" } }
        sort: { fields: [frontmatter___date], order: ASC }
      ) {
        edges {
          node {
            frontmatter {
              title
              url
              cover {
                childImageSharp {
                  gatsbyImageData(width: 200, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
                }
              }
            }
          }
        }
      }
    }
  `);

  const revealTitle = useRef(null);
  const revealGrid = useRef(null);
  const revealContainer = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Premium orchestrated ScrollTrigger reveal sequences
  useGSAP(
    () => {
      if (prefersReducedMotion) {
        return;
      }

      // Smooth reveal for section header
      gsap.from(revealTitle.current, {
        scrollTrigger: {
          trigger: revealTitle.current,
          start: 'top 85%',
        },
        opacity: 0,
        y: 20,
        duration: 0.6,
        ease: 'power2.out',
      });

      // Orchestrated staggered emergence for the cards grid
      gsap.fromTo(
        gsap.utils.toArray(revealGrid.current.children),
        {
          opacity: 0,
          y: 40,
          scale: 0.95,
        },
        {
          scrollTrigger: {
            trigger: revealGrid.current,
            start: 'top 82%',
          },
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.12,
          duration: 0.9,
          ease: 'power4.out',
        },
      );
    },
    { scope: revealContainer },
  );

  const certs = data.certifications.edges;

  if (!certs.length) {
    return null;
  }

  return (
    <StyledCertificationsSection id="certifications" ref={revealContainer}>
      <h2 className="numbered-heading" ref={revealTitle}>
        Certifications
      </h2>
      <StyledGrid ref={revealGrid}>
        {certs.map((edge, i) => (
          <HoloCertCard key={i} cert={edge} index={i} />
        ))}
      </StyledGrid>
    </StyledCertificationsSection>
  );
};

export default Certifications;
