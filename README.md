![Holy Loader](https://github.com/user-attachments/assets/4058eb51-92ce-4df2-86ac-73ce4c049ded)

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
- **Manual controls**: Start & stop the loader yourself.
- **i18n ready**: Supports `ltr` (left-to-right) & `rtl` (right-to-left) layouts with the `dir` prop.

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
        color="linear-gradient(to right, #ff7e5f, #feb47b)"
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

### Manual Control (Client Components)

Have an async operation before an eventual route change? You might be interested in holy-loader's manual controls. These only work in client components!

```typescript
'use client';

import { startHolyLoader, stopHolyLoader } from 'holy-loader';

try {
  startHolyLoader();
  await signOut()
} catch (error) {
  stopHolyLoader();
} finally {
  stopHolyLoader();
  /* OR */
  router.push('/');
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

| Prop                 | Type                 | Description                                                                                                  | Default      |
|----------------------|----------------------|--------------------------------------------------------------------------------------------------------------|--------------|
| `color`              | `string`             | Specifies the color of the top-loading bar. Accepts any valid CSS `background` value, including gradients.   | `#59a2ff`  |
| `initialPosition`    | `number`             | Sets the initial position of the top-loading bar as a percentage of the total width.                         | `0.08`       |
| `height`             | `number` or `string` | Defines the height of the top-loading bar in pixels or CSS unit.                                             | `4px`        |
| `easing`             | `string`             | Specifies the easing function to use for the loading animation. Accepts any valid CSS easing string.         | `ease`     |
| `speed`              | `number`             | Sets the animation speed of the top-loading bar in milliseconds.                                             | `200`        |
| `zIndex`             | `number`             | Defines the z-index property of the top-loading bar, controlling its stacking order.                         | `2147483647` |
| `boxShadow`          | `string`             | Sets the box-shadow property of the top-loading bar. Turned off by default.                                  | `null`       |
| `showSpinner`        | `boolean`            | Determines whether to accompany the loading bar with a spinner. Turned off by default.                       | `false`      |
| `ignoreSearchParams` | `boolean`            | Determines whether to ignore search parameters in the URL when triggering the loader. Turned off by default. | `false`      |
| `dir`                | `ltr` or `rtl`       | Sets the direction of the top-loading bar.                                                                   | `ltr`      |
