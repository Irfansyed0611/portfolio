import React, { useEffect, useRef } from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';
import { srConfig } from '@config';
import sr from '@utils/sr';
import { usePrefersReducedMotion } from '@hooks';

const StyledProjectsSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0 50px;

  @media (max-width: 768px) {
    padding: 20px 0 40px;
  }

  @media (max-width: 480px) {
    padding: 10px 0 30px;
  }

  .more-button {
    ${({ theme }) => theme.mixins.button};
    margin: 0 auto;
  }
`;

const Projects = () => {
  const revealButton = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    sr.reveal(revealButton.current, srConfig());
  }, []);

  return (
    <StyledProjectsSection>
      <div ref={revealButton}>
        <Link className="more-button" to="/archive">
          View Project Archive
        </Link>
      </div>
    </StyledProjectsSection>
  );
};

export default Projects;
