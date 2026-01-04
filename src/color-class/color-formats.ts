import {
    type AnyObject,
    getObjectTypedEntries,
    getObjectTypedKeys,
    getOrSet,
    mapObjectValues,
    type PartialWithUndefined,
    type UnionToIntersection,
    type Values,
} from '@augment-vir/common';

/**
 * A hex color string.
 *
 * @category Internal
 */
export type HexColor = `#${string}`;

/**
 * An individual definition for a single color format coordinate (like `h` or `s` or `r` or `g`).
 *
 * @category Internal
 */
export type ColorCoordinateDefinition = {
    min: number;
    max: number;
} & PartialWithUndefined<{
    /**
     * The number of digits to round this coordinate to.
     *
     * @default 0
     */
    digits?: number | undefined;
    /**
     * A factor to multiple the values in the `Color` class by.
     *
     * @default 1
     */
    factor?: number | undefined;
    suffix?: string;
}>;

/**
 * A single color format definition.
 *
 * @category Internal
 */
export type ColorFormatDefinition<ColorSpace extends string = string> = {
    coords: Record<string, ColorCoordinateDefinition>;
    /** This name for this color to be used in `Colorjs.to()`. Defaults to the color format key. */
    colorSpace: ColorSpace;
};

/**
 * All raw supported color formats.
 *
 * @category Internal
 */
export const rawColorFormats = {
    rgb: {
        coords: {
            r: {
                min: 0,
                max: 255,
                factor: 255,
            },
            g: {
                min: 0,
                max: 255,
                factor: 255,
            },
            b: {
                min: 0,
                max: 255,
                factor: 255,
            },
        },
        colorSpace: 'rgb',
    },
    hsl: {
        coords: {
            h: {
                min: 0,
                max: 360,
            },
            s: {
                min: 0,
                max: 100,
                factor: 100,
                digits: 1,
            },
            l: {
                min: 0,
                max: 100,
                factor: 100,
                digits: 1,
            },
        },
        colorSpace: 'rgb',
    },
    hwb: {
        coords: {
            h: {
                min: 0,
                max: 360,
            },
            w: {
                min: 0,
                max: 100,
                factor: 100,
                digits: 1,
            },
            b: {
                min: 0,
                max: 100,
                factor: 100,
                digits: 1,
            },
        },
        colorSpace: 'rgb',
    },
    lab: {
        coords: {
            l: {
                min: 0,
                max: 100,
                digits: 1,
            },
            a: {
                min: -128,
                max: 127,
            },
            b: {
                min: -128,
                max: 127,
            },
        },
        colorSpace: 'lab',
    },
    lch: {
        coords: {
            l: {
                min: 0,
                max: 100,
                digits: 1,
            },
            c: {
                min: 0,
                max: 230,
            },
            h: {
                min: 0,
                max: 360,
            },
        },
        colorSpace: 'lab',
    },
    oklab: {
        coords: {
            l: {
                min: 0,
                max: 1,
                digits: 3,
            },
            a: {
                min: -0.5,
                max: 0.5,
                digits: 3,
            },
            b: {
                min: -0.5,
                max: 0.5,
                digits: 3,
            },
        },
        colorSpace: 'oklab',
    },
    oklch: {
        coords: {
            l: {
                min: 0,
                max: 1,
                digits: 3,
            },
            c: {
                min: 0,
                max: 0.4,
                digits: 3,
            },
            h: {
                min: 0,
                max: 360,
                digits: 1,
            },
        },
        colorSpace: 'oklab',
    },
} as const satisfies Record<string, ColorFormatDefinition>;

/**
 * All supported color format names. This can be used as an enum.
 *
 * @category Internal
 */
export const ColorFormatName = mapObjectValues(
    rawColorFormats,
    (colorName) => colorName,
) satisfies Record<ColorFormatName, ColorFormatName> as AnyObject as {
    [FormatName in ColorFormatName]: FormatName;
};
/**
 * All supported color format names. This can be used as an enum.
 *
 * @category Internal
 */
export type ColorFormatName = keyof typeof rawColorFormats;

/**
 * List the color coordinate keys (like `r` or `g` or `b`) for each supported color format in a
 * union.
 *
 * @category Internal
 */
export type ColorCoordsByFormat = {
    [FormatName in ColorFormatName]: keyof (typeof rawColorFormats)[FormatName]['coords'];
};

/**
 * Type for {@link colorFormats}.
 *
 * @category Internal
 */
export type ColorFormats = Readonly<{
    [FormatName in ColorFormatName]: ColorFormatDefinition<
        'colorSpace' extends keyof (typeof rawColorFormats)[FormatName]
            ? Extract<(typeof rawColorFormats)[FormatName], {colorSpace: any}>['colorSpace']
            : FormatName
    >;
}>;

/**
 * All supported color formats.
 *
 * @category Color Format
 */
export const colorFormats = rawColorFormats as ColorFormats;

/**
 * All available color space names.
 *
 * @category Internal
 */
export type ColorSpaceName = Values<typeof rawColorFormats>['colorSpace'];

/**
 * All value types for all supported color formats.
 *
 * @category Internal
 */
export type ColorValues = {
    [FormatName in ColorFormatName]: Record<
        keyof (typeof rawColorFormats)[FormatName]['coords'],
        number
    >;
};

/**
 * All color formats grouped by their color space.
 *
 * @category Color Format
 */
export const colorSpaces = getObjectTypedEntries(colorFormats).reduce(
    (
        accum,
        [
            colorFormatName,
            colorFormatDefinition,
        ],
    ) => {
        getOrSet(accum, colorFormatDefinition.colorSpace, () => {
            return {} as Record<ColorFormatName, ColorFormatDefinition>;
        })[colorFormatName] = colorFormatDefinition;
        return accum;
    },
    {} as Record<ColorSpaceName, Record<ColorFormatName, ColorFormatDefinition>>,
);

/**
 * All color format names in an array.
 *
 * @category Internal
 */
export const colorFormatNames: ColorFormatName[] = getObjectTypedKeys(colorFormats);

/**
 * All possible coordinate names for all supported color formats in a union.
 *
 * @category Internal
 */
export type ColorCoordinateName = keyof UnionToIntersection<
    Values<typeof rawColorFormats>['coords']
>;
