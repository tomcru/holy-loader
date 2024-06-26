![Holy Loader](https://github.com/tomcru/holy-loader/assets/35841182/cd2d108a-6429-40c4-9881-df8b79cc9725)

<h1>Holy Loader</h1>
<a href="https://www.npmjs.com/package/holy-loader"><img src="https://img.shields.io/npm/v/holy-loader.svg?style=flat" /></a>
<br>
<br>

> Holy Loader is a lightweight and customizable top-loading progress bar component, specifically designed for React applications and optimized for Next.js with app router.

Want to see it in use? Visit: [GameGator](https://gamegator.net).

Also check out [Holy Time](https://github.com/badosz0/holy-time), yet another (type-safe) date time library.

## Features

- Easy to integrate with any React application.
- Highly customizable with sensible defaults.
- Utilizes a custom implementation for smooth, aesthetic progress indications.
- Supports dynamic configuration for color, height, speed, easing, and more.
- Supports manual controls - starting & stopping the loader yourself.

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
import HolyLoader from "holy-loader";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <HolyLoader
        color="#ff4500"
        height="1rem"
        speed={250}
        easing="linear"
        showSpinner
      />
      {children}
    </html>
  );
}
```

### Programmatic Control (Client Components)

Have an async operation before an eventual route change? You might be interested in holy-loader's manual controls. These only work in client components!

```typescript
'use client';

import { startHolyLoader, stopHolyLoader } from 'holy-loader';

try {
  startHolyLoader(); // Trigger the loader beforehand
  await signOut(); // Example async operation
} catch (error) {
  stopHolyLoader(); // Stop the loader on error
  // Handle the error
} finally {
  stopHolyLoader(); // Stop the loader after the operation, and potentially do something else
  /* OR */
  router.push('/'); // Navigate to the desired route, which will automatically stop the loader
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

`<HolyLoader />` accepts the following props for customization:

- `color` (string): Specifies the color of the top-loading bar. Default: "#59a2ff" (a shade of blue).
- `initialPosition` (number): Sets the initial position of the top-loading bar as a percentage of the total width. Default: 0.08 (8% of the total width).
- `height` (number | string): Defines the height of the top-loading bar in pixels or css unit. Default: 4 pixels.
- `easing` (string): Specifies the easing function to use for the loading animation. Accepts any valid CSS easing string. Default: "ease".
- `speed` (number): Sets the animation speed of the top-loading bar in milliseconds. Default: 200 milliseconds.
- `zIndex` (number): Defines the z-index property of the top-loading bar, controlling its stacking order. Default: 2147483647.
- `boxShadow` (string): Sets the box-shadow property of the top-loading bar. Turned off by default.
- `showSpinner` (boolean): Determines whether to accompany the loading bar with a spinner. Turned off by default.

Project inspired by [nextjs-toploader](https://github.com/TheSGJ/nextjs-toploader) & [nprogress](https://github.com/rstacruz/nprogress)
