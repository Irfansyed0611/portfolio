import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { GatsbyImage } from 'gatsby-plugin-image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StickyCard002 = ({ cards, title }) => {
  const container = useRef(null);
  const cardRefs = useRef([]);

  useGSAP(
    () => {
      const cardElements = cardRefs.current;
      const totalCards = cardElements.length;
      if (!cardElements[0] || totalCards === 0) {
        return;
      }
      const stickyRoot = container.current?.querySelector('.sticky-cards');
      if (!stickyRoot) {
        return;
      }
      const isMobile = window.matchMedia('(max-width: 767px)').matches;

      gsap.set(cardElements, { force3D: true, backfaceVisibility: 'hidden' });
      gsap.set(cardElements[0], { yPercent: 0, scale: 1, rotation: 0 });
      for (let i = 1; i < totalCards; i++) {
        if (!cardElements[i]) {
          continue;
        }
        gsap.set(cardElements[i], { yPercent: 100, scale: 1, rotation: 0 });
      }

      const scrollTimeline = gsap.timeline({
        defaults: { duration: 1, ease: 'none', force3D: true, overwrite: 'auto' },
        scrollTrigger: {
          trigger: stickyRoot,
          start: 'center center',
          end: `+=${window.innerHeight * (totalCards - 1)}`,
          pin: true,
          scrub: isMobile ? 0.12 : 0.2,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 0; i < totalCards - 1; i++) {
        const currentCard = cardElements[i];
        const nextCard = cardElements[i + 1];
        const position = i;
        if (!currentCard || !nextCard) {
          continue;
        }
        scrollTimeline.to(
          currentCard,
          { scale: isMobile ? 0.9 : 0.82, rotation: isMobile ? 0 : 2.5 },
          position,
        );
        scrollTimeline.to(nextCard, { yPercent: 0 }, position);
      }

      let refreshFrame = null;
      let lastWidth = 0;
      let lastHeight = 0;
      const queueRefresh = () => {
        if (refreshFrame !== null) {
          return;
        }
        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = null;
          ScrollTrigger.refresh();
        });
      };
      const resizeObserver = new ResizeObserver(entries => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        const width = Math.round(entry.contentRect.width);
        const height = Math.round(entry.contentRect.height);
        if (width !== lastWidth || height !== lastHeight) {
          lastWidth = width;
          lastHeight = height;
          queueRefresh();
        }
      });
      if (container.current) {
        resizeObserver.observe(container.current);
      }

      return () => {
        if (refreshFrame !== null) {
          cancelAnimationFrame(refreshFrame);
        }
        resizeObserver.disconnect();
        scrollTimeline.kill();
      };
    },
    { scope: container },
  );

  return (
    // Outer container avoids breaking GSAP pin matrix
    <div className="sticky-outer-wrapper" style={{ position: 'relative' }} ref={container}>
      <div
        className="sticky-cards"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: 'auto',
          padding: '5vh 0',
          width: '100%',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {title && (
          <div
            className="sticky-heading"
            style={{
              width: '100%',
              maxWidth: '1000px',
              padding: '0 1rem',
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            {title}
          </div>
        )}

        <div
          className="sticky-card-boundary"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1000px', // Restored max-width suitable for structural desktop layout
            maxHeight: '85vh', // Pushed up slightly to close gaps
            // Reduce mobile height so cards feel less vertically heavy
            minHeight: '420px',
            height: '60vh',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px -15px var(--navy-shadow)',
          }}
        >
          {/* Injecting responsive styles directly for aspect-ratio transition and escaping global padding */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .sticky-outer-wrapper {
               /* Escape the global section padding on mobile to become wider */
               margin-left: calc(-50vw + 50%);
               margin-right: calc(-50vw + 50%);
               width: 100vw;
               max-width: 100vw;
            }
            .sticky-card-boundary {
               width: 90% !important; /* Take up 90% of the newly widened viewport space */
               margin-top: -3vh;
            }
            .sticky-cards {
               gap: 0.75rem !important;
            }
            .sticky-heading {
               transform: translateY(-5vh);
            }
            @media (min-width: 768px) {
              .sticky-outer-wrapper {
                 margin-left: 0;
                 margin-right: 0;
                 width: 100%;
                 max-width: 100%;
              }
              .sticky-card-boundary {
                 width: 80% !important;
                 max-width: 800px !important;
                 aspect-ratio: 4 / 3 !important; /* Made significantly taller structure to reduce gaps */
                 height: auto !important;
                 min-height: unset !important;
                 margin-top: 0;
              }
              .sticky-heading {
                 padding: 0;
                 transform: none;
              }
            }
          `,
            }}
          />

          {cards.map((card, i) => (
            <div
              key={card.id || i}
              ref={el => {
                cardRefs.current[i] = el;
              }}
              style={{
                position: 'absolute',
                height: '100%',
                width: '100%',
                top: 0,
                left: 0,
                backgroundColor: 'var(--light-navy)', // Panel background color
                borderRadius: '24px',
                display: 'flex',
                flexDirection: 'column',
                transformOrigin: 'bottom center',
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                border: '1px solid var(--lightest-navy)', // Give it slightly more definition
              }}
            >
              {/* Image Section (Dynamically crops remaining height) */}
              <div
                style={{
                  flex: '1 1 auto', // Eat up all new height
                  width: '100%',
                  overflow: 'hidden',
                  borderRadius: '24px 24px 0 0',
                  borderBottom: '1px solid var(--lightest-navy, #233554)',
                  position: 'relative',
                  backgroundColor: 'var(--navy)',
                }}
              >
                {card.gatsbyImage ? (
                  <GatsbyImage
                    image={card.gatsbyImage}
                    alt={card.alt || card.title || ''}
                    loading={i < 2 ? 'eager' : 'lazy'}
                    style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                    imgStyle={{
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      transform: 'translateZ(0)',
                    }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%' }} />
                )}
              </div>

              {/* Text Panel (Shrinkwraps to reduce footer height footprint) */}
              <div
                style={{
                  flex: '0 0 auto',
                  width: '100%',
                  padding: 'clamp(1.25rem, 3.5vw, 2.5rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: 'var(--lightest-slate)',
                      fontSize: 'clamp(1.25rem, 3vw, 2rem)', // Matches standard projects.js title sizing
                      fontWeight: 600,
                      lineHeight: 1.1,
                    }}
                  >
                    {card.title}
                  </h3>

                  {/* Links */}
                  {/* Container for links (GitHub / External) */}
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {card.github && (
                      <a
                        href={card.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub Link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--light-slate)',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--green, #64ffda)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--light-slate)';
                        }}
                      >
                        {/* GitHub Icon */}
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                      </a>
                    )}

                    {card.external && !card.github && (
                      <a
                        href={card.external}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="External Link"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--light-slate)',
                          transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--green, #64ffda)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--light-slate)';
                        }}
                      >
                        {/* External Icon */}
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* Tech tags */}
                <ul
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px 24px', // generous spacing for readability
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {card.tech &&
                    card.tech.map((t, ti) => (
                      <li
                        key={ti}
                        style={{
                          color: 'var(--green, #64ffda)',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontSize: 'clamp(12px, 1.5vw, 14px)', // Scale down slightly on mobile
                          whiteSpace: 'nowrap',
                          margin: 0,
                        }}
                      >
                        {t}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

StickyCard002.propTypes = {
  cards: PropTypes.array.isRequired,
  title: PropTypes.node,
};

export { StickyCard002 };
