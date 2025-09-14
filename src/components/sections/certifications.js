import React, { useEffect, useRef } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

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
  gap: 20px;
  margin-top: 50px;
  width: 100%;
`;

const StyledCertification = styled.a`
  ${({ theme }) => theme.mixins.boxShadow};
  border-radius: var(--border-radius);
  transition: var(--transition);
  width: 120px;
  flex-shrink: 0;

  &:hover,
  &:focus {
    transform: translateY(-5px);
  }

  .gatsby-image-wrapper {
    border-radius: var(--border-radius);
  }
`;

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
                  gatsbyImageData(width: 120, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
                }
              }
            }
          }
        }
      }
    }
  `);

  const revealTitle = useRef(null);
  const revealCerts = useRef([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }
    sr.reveal(revealTitle.current, srConfig());
    revealCerts.current.forEach((ref, i) => sr.reveal(ref, srConfig(i * 100)));
  }, []);

  const certs = data.certifications.edges;

  return (
    <StyledCertificationsSection id="certifications">
      <h2 className="numbered-heading" ref={revealTitle}>
        Certifications
      </h2>
      <StyledGrid>
        {certs &&
          certs.map(({ node }, i) => {
            const { frontmatter } = node;
            const { url, title, cover } = frontmatter;
            const image = getImage(cover);

            return (
              <StyledCertification
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                ref={el => (revealCerts.current[i] = el)}
              >
                <GatsbyImage image={image} alt={title} />
              </StyledCertification>
            );
          })}
      </StyledGrid>
    </StyledCertificationsSection>
  );
};

export default Certifications;
