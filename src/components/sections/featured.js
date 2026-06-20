import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { getImage } from 'gatsby-plugin-image';
import { StickyCard002 } from './StickyCard002';

const Featured = () => {
  const data = useStaticQuery(graphql`
    {
      featured: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/featured/" } }
        sort: { fields: [frontmatter___date], order: ASC }
      ) {
        edges {
          node {
            frontmatter {
              title
              cover {
                childImageSharp {
                  gatsbyImageData(width: 900, placeholder: BLURRED, formats: [AUTO, WEBP, AVIF])
                }
              }
              tech
              github
              external
            }
            html
          }
        }
      }
    }
  `);

  const featuredProjects = data.featured.edges.filter(({ node }) => node);

  // Map Gatsby GraphQL data → CardData shape that StickyCard002 expects
  const cards = featuredProjects.map(({ node }, i) => {
    const { frontmatter } = node;
    const { title, tech, github, external, cover } = frontmatter;
    const image = getImage(cover);

    return {
      id: i,
      gatsbyImage: image,
      alt: title,
      title,
      tech,
      github,
      external,
    };
  });

  return (
    <section
      id="projects"
      data-reveal-ignore
      style={{ position: 'relative', paddingBottom: '20px' }}
    >
      {/* 
        This wrapper is critical. The GSAP pin adds window.innerHeight * (cards.length - 1) 
        of scrollable padding. If it's not wrapped or styled properly, the next section 
        might jump up and overlap. GSAP's pinSpacing: true usually handles it, but 
        ensuring relative positioning and clearing it sometimes helps.
      */}
      <div style={{ position: 'relative', width: '100%' }}>
        <StickyCard002
          cards={cards}
          title={<h2 className="numbered-heading">Solutions I've Engineered</h2>}
        />
      </div>
    </section>
  );
};

export default Featured;
