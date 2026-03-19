import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import styled from 'styled-components';

const StyledSkills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 28px;

  .skill-card {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    padding: 0;
    transition: var(--transition);

    &:hover,
    &:focus-within {
      transform: scale(1.05);
    }
  }

  .skill-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;

    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .skill-name {
    color: var(--slate);
    font-family: var(--font-body);
    font-size: var(--fz-lg);
    line-height: 1.3;
    white-space: nowrap;
  }

  @media (max-width: 480px) {
    gap: 16px;

    .skill-card {
      justify-content: flex-start;
    }
  }
`;

const SkillsSection = () => {
  const data = useStaticQuery(graphql`
    query {
      skillSets: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/content/skill_set/" } }
        limit: 1
      ) {
        nodes {
          frontmatter {
            skills {
              name
              svg
            }
          }
        }
      }
    }
  `);

  const skills = data.skillSets.nodes[0]?.frontmatter?.skills || [];

  if (!skills.length) {
    return null;
  }

  return (
    <StyledSkills>
      {skills.map(skill => (
        <div className="skill-card" key={skill.name}>
          <span className="skill-icon" dangerouslySetInnerHTML={{ __html: skill.svg }} />
          <span className="skill-name">{skill.name}</span>
        </div>
      ))}
    </StyledSkills>
  );
};

export default SkillsSection;
