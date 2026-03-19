import { css } from 'styled-components';

const variables = css`
  :root {
    --dark-navy: #000000;
    --navy: #050505;
    --light-navy: #0d0d0d;
    --lightest-navy: #1a1a1a;
    --navy-shadow: rgba(0, 0, 0, 0.7);
    --dark-slate: #5f5a53;
    --slate: #8e877d;
    --light-slate: #c2baae;
    --lightest-slate: #e9e1d5;
    --white: #faf7f2;
    --green: #c9a96e;
    --green-tint: rgba(201, 169, 110, 0.1);
    --pink: #f57dff;
    --blue: #57cbff;

    --font-heading: 'Syne', sans-serif;
    --font-body: 'Space Grotesk', sans-serif;
    --font-sans: 'Space Grotesk', sans-serif;
    --font-mono: 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;

    --fz-xxs: 12px;
    --fz-xs: 13px;
    --fz-sm: 14px;
    --fz-md: 16px;
    --fz-lg: 18px;
    --fz-xl: 20px;
    --fz-xxl: 22px;
    --fz-heading: 32px;

    --border-radius: 4px;
    --nav-height: 100px;
    --nav-scroll-height: 70px;

    --tab-height: 42px;
    --tab-width: 120px;

    --easing: cubic-bezier(0.645, 0.045, 0.355, 1);
    --transition: all 0.25s cubic-bezier(0.645, 0.045, 0.355, 1);

    --hamburger-width: 30px;

    --ham-before: top 0.1s ease-in 0.25s, opacity 0.1s ease-in;
    --ham-before-active: top 0.1s ease-out, opacity 0.1s ease-out 0.12s;
    --ham-after: bottom 0.1s ease-in 0.25s, transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19);
    --ham-after-active: bottom 0.1s ease-out,
      transform 0.22s cubic-bezier(0.215, 0.61, 0.355, 1) 0.12s;
  }
`;

export default variables;
