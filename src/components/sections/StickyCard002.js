import React, { memo, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { GatsbyImage } from 'gatsby-plugin-image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STICKY_CARD_RESPONSIVE_STYLES = `
  .sticky-outer-wrapper {
     margin-left: calc(-50vw + 50%);
     margin-right: calc(-50vw + 50%);
     width: 100vw;
     max-width: 100vw;
  }
  .sticky-card-boundary {
     width: 90% !important;
     margin-top: -3vh;
     contain: layout paint;
  }
  .sticky-cards {
     gap: 0.75rem !important;
  }
  .sticky-heading {
     transform: translateY(-5vh);
  }
  .sticky-card-surface {
     contain: paint;
  }
  .sticky-card-link:hover,
  .sticky-card-link:focus-visible {
     color: var(--green, #64ffda);
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
       aspect-ratio: 4 / 3 !important;
       height: auto !important;
       min-height: unset !important;
       margin-top: 0;
    }
    .sticky-heading {
       padding: 0;
       transform: none;
    }
  }
`;

const StickyCard002 = ({ cards, title }) => {
  const container = useRef(null);
  const stickyRootRef = useRef(null);
  const cardRefs = useRef([]);

  useGSAP(
    () => {
      const cardElements = cardRefs.current;
      const totalCards = cardElements.length;
      if (!cardElements[0] || totalCards === 0) {
        return;
      }
      const stickyRoot = stickyRootRef.current;
      if (!stickyRoot) {
        return;
      }
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        return;
      }

      // Smooth scroll-reveal animation for heading and cards boundary
      gsap.fromTo(
        ['.sticky-heading', '.sticky-card-boundary'],
        {
          opacity: 0,
          y: 60,
        },
        {
          scrollTrigger: {
            trigger: stickyRoot,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
        },
      );

      const mm = gsap.matchMedia();
      let refreshFrame = null;
      const queueRefresh = () => {
        if (refreshFrame !== null) {
          return;
        }
        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = null;
          ScrollTrigger.refresh();
        });
      };

      mm.add(
        {
          isMobile: '(max-width: 767px)',
          isDesktop: '(min-width: 768px)',
        },
        context => {
          const { isMobile } = context.conditions;
          const activeCards = cardElements.filter(Boolean);

          gsap.set(activeCards, {
            backfaceVisibility: 'hidden',
            transformOrigin: 'bottom center',
          });
          gsap.set(activeCards[0], { yPercent: 0, scale: 1, rotation: 0 });
          gsap.set(activeCards.slice(1), { yPercent: 100, scale: 1, rotation: 0 });

          const toggleAcceleration = enabled => {
            activeCards.forEach(card => {
              card.style.willChange = enabled ? 'transform' : '';
            });
          };

          const scrollTimeline = gsap.timeline({
            defaults: {
              duration: 1,
              ease: 'none',
              overwrite: 'auto',
            },
            scrollTrigger: {
              trigger: stickyRoot,
              start: 'center center',
              end: () => `+=${window.innerHeight * Math.max(totalCards - 1, 1)}`,
              pin: true,
              scrub: 0.5,
              pinSpacing: true,
              anticipatePin: 1,
              fastScrollEnd: true,
              invalidateOnRefresh: true,
              onToggle: self => {
                toggleAcceleration(self.isActive);
              },
              onRefreshInit: () => {
                toggleAcceleration(false);
              },
            },
          });

          for (let i = 0; i < totalCards - 1; i++) {
            const currentCard = activeCards[i];
            const nextCard = activeCards[i + 1];
            if (!currentCard || !nextCard) {
              continue;
            }

            scrollTimeline.to(
              currentCard,
              { scale: isMobile ? 0.9 : 0.7, rotation: isMobile ? 0 : 5, force3D: true },
              i,
            );
            scrollTimeline.to(nextCard, { yPercent: 0, force3D: true }, i);
          }

          window.addEventListener('resize', queueRefresh);
          window.addEventListener('orientationchange', queueRefresh);

          return () => {
            window.removeEventListener('resize', queueRefresh);
            window.removeEventListener('orientationchange', queueRefresh);
            toggleAcceleration(false);
            scrollTimeline.kill();
          };
        },
      );

      return () => {
        if (refreshFrame !== null) {
          cancelAnimationFrame(refreshFrame);
        }
        mm.revert();
      };
    },
    { scope: container },
  );

  const renderedCards = useMemo(
    () =>
      cards.map((card, i) => (
        <div
          key={card.id || i}
          ref={el => {
            cardRefs.current[i] = el;
          }}
          className="sticky-card-surface"
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            top: 0,
            left: 0,
            backgroundColor: 'var(--light-navy)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            backfaceVisibility: 'hidden',
            transform: 'translateZ(0)',
            border: '1px solid var(--lightest-navy)',
          }}
        >
          <div
            style={{
              flex: '1 1 auto',
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
                loading={i === 0 ? 'eager' : 'lazy'}
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
                  fontSize: 'clamp(1.25rem, 3vw, 2rem)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                }}
              >
                {card.title}
              </h3>

              <div style={{ display: 'flex', gap: '15px' }}>
                {card.github && (
                  <a
                    href={card.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Link"
                    className="sticky-card-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--light-slate)',
                      transition: 'color 0.2s',
                    }}
                  >
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
                    className="sticky-card-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--light-slate)',
                      transition: 'color 0.2s',
                    }}
                  >
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

            <ul
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px 24px',
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
                      fontSize: 'clamp(12px, 1.5vw, 14px)',
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
      )),
    [cards],
  );

  return (
    <div className="sticky-outer-wrapper" style={{ position: 'relative' }} ref={container}>
      <div
        className="sticky-cards"
        ref={stickyRootRef}
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
              __html: STICKY_CARD_RESPONSIVE_STYLES,
            }}
          />
          {renderedCards}
        </div>
      </div>
    </div>
  );
};

StickyCard002.propTypes = {
  cards: PropTypes.array.isRequired,
  title: PropTypes.node,
};

const MemoizedStickyCard002 = memo(StickyCard002);

MemoizedStickyCard002.propTypes = StickyCard002.propTypes;

export { MemoizedStickyCard002 as StickyCard002 };
