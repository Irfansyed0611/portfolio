/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

export const onRouteUpdate = () => {
  if (typeof window !== 'undefined' && typeof window.initReveal === 'function') {
    window.initReveal();
  }
};
