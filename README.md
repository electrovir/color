# @electrovir/color

A color package that wraps [the `culori` package](https://www.npmjs.com/package/culori) with an _extremely_ simple API for color string parsing and color space/model conversion. It is primarily built for https://electrovir.github.io/color-picker-app.

-   Conversion examples: https://electrovir.github.io/color/examples/conversions/all-color-formats
-   Reference docs: https://electrovir.github.io/color/docs

## Install

```sh
npm i @electrovir/color
```

## Usage

All functionality is accessed through the [`Color`](https://electrovir.github.io/color/docs/classes/Color.html) class:

<!-- example-link: src/readme-examples/color.example.ts -->

```TypeScript
import {Color} from '@electrovir/color';

/** Create a new color instance by parsing any valid CSS color string. */
const color = new Color('#123');

/** Update an individual color format's coordinate */
color.set({
    hsl: {
        h: 100,
    },
});

/** Access the color values in multiple formats. */
console.info(color.hex); // #1c3311
console.info(color.rgb); // {r: 28, g: 51, b: 17}
console.info(color.lab); // {l: 18.6, a: -15, b: 18}

/** Express the color value as a valid CSS string. */
console.info(color.toCss().hsl); // hsl(100 50 13.3)
```

### Supported color formats / spaces

-   [RGB](https://developer.mozilla.org/docs/Web/CSS/color_value/rgb)
-   [HSL](https://developer.mozilla.org/docs/Web/CSS/color_value/hsl)
-   [HWB](https://developer.mozilla.org/docs/Web/CSS/color_value/hwb)
-   [LAB](https://developer.mozilla.org/docs/Web/CSS/color_value/lab)
-   [LCH](https://developer.mozilla.org/docs/Web/CSS/color_value/lch)
-   [Oklab](https://developer.mozilla.org/docs/Web/CSS/color_value/oklab)
-   [Oklch](https://developer.mozilla.org/docs/Web/CSS/color_value/oklch)
