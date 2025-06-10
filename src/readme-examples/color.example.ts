import {Color} from '../index.js';

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
