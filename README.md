![Holy Loader](https://github.com/tomcru/holy-loader/assets/35841182/cd2d108a-6429-40c4-9881-df8b79cc9725)

<h1>Holy Loader</h1>
<a href="https://www.npmjs.com/package/holy-loader"><img src="https://img.shields.io/npm/v/holy-loader.svg?style=flat" /></a>
<br>
<br>

> Holy Loader is a lightweight and customizable top-loading progress bar component, specifically designed for React applications and optimized for Next.js with app router.

⚠️ Next.js 14.0.3 added experimental support for history.pushState and history.replaceState, breaking Holy Loader. It has been fixed in Next.js 14.0.4: https://github.com/vercel/next.js/pull/58861

Want to see it in use? Visit: [GameGator](https://main.gamegator.net).

Also check out [Holy Time](https://github.com/badosz0/holy-time), yet another (type-safe) date time library.

## Features

- Easy to integrate with any React application.
- Highly customizable with sensible defaults.
- Utilizes NProgress for smooth, aesthetic progress indications.
- Supports dynamic configuration for color, height, speed, easing, and more.

## Installation

To install Holy Loader, run the following command in your project directory:

```bash
npm install holy-loader
```

OR

```bash
yarn add holy-loader
```

## Usage

To use Holy Loader in your Next.js application using the app router:

```typescript
import HolyLoader from "holy-loader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <HolyLoader />
      {children}
    </html>
  );
}
```

To use Holy Loader in your Next.js application using the pages router:

```typescript
import HolyLoader from "holy-loader";

export default function App({ Component, pageProps }) {
  return (
    <>
      <HolyLoader />
      <Component {...pageProps} />;
    </>
  );
}
```

### Custom Configuration

```typescript
import React from "react";
import HolyLoader from "holy-loader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <HolyLoader color="#ff4500" height={5} crawlSpeed={250} easing="linear" />
      {children}
    </html>
  );
}
```

## Common issues

Prevent triggering the loader when clicking a Button within a Next link:

```typescript
onClick={(e) => {
  e.preventDefault();
  e.nativeEvent.stopImmediatePropagation();
}}
```

## API

Holy Loader accepts the following props for customization:

- `color` (string): Specifies the color of the top-loading bar. Default: "#59a2ff" (a shade of blue).
- `initialPosition` (number): Sets the initial position of the top-loading bar as a percentage of the total width. Default: 0.08 (8% of the total width).
- `crawlSpeed` (number): Determines the delay speed for the incremental movement of the top-loading bar, in milliseconds. Default: 200 milliseconds.
- `height` (number): Defines the height of the top-loading bar in pixels. Default: 4 pixels.
- `crawl` (boolean): Enables or disables the automatic incremental movement of the top-loading bar. Default: true (enabled).
- `easing` (string): Specifies the easing function to use for the loading animation. Accepts any valid CSS easing string. Default: "ease".
- `speed` (number): Sets the animation speed of the top-loading bar in milliseconds. Default: 200 milliseconds.
- `zIndex` (number): Defines the z-index property of the top-loading bar, controlling its stacking order. Default: 2147483647.

Project inspired by [nextjs-toploader](https://github.com/TheSGJ/nextjs-toploader).
