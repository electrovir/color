import {assert, assertWrap, check} from '@augment-vir/assert';
import {
    type AnyObject,
    arrayToObject,
    getObjectTypedEntries,
    getObjectTypedValues,
    getOrSet,
    mapObjectValues,
    type PartialWithUndefined,
    stringify,
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
    suffix?: string | undefined;
    radix?: number | undefined;
    radixPad?: number | undefined;
}>;

/**
 * Color formats supported by culori conversions.
 *
 * @category Internal
 */
export enum CuloriConversionFormat {
    a98 = 'a98',
    cubehelix = 'cubehelix',
    dlab = 'dlab',
    dlch = 'dlch',
    hsi = 'hsi',
    hsl = 'hsl',
    hsv = 'hsv',
    hwb = 'hwb',
    itp = 'itp',
    jab = 'jab',
    jch = 'jch',
    lab = 'lab',
    lab65 = 'lab65',
    lch = 'lch',
    lch65 = 'lch65',
    lchuv = 'lchuv',
    lrgb = 'lrgb',
    luv = 'luv',
    okhsl = 'okhsl',
    okhsv = 'okhsv',
    oklab = 'oklab',
    oklch = 'oklch',
    p3 = 'p3',
    prophoto = 'prophoto',
    rec2020 = 'rec2020',
    rgb = 'rgb',
    xyb = 'xyb',
    xyz50 = 'xyz50',
    xyz65 = 'xyz65',
    yiq = 'yiq',
}

/**
 * The subset of {@link ColorFormatName} that supports color conversion (via culori).
 *
 * @category Internal
 */
export type SupportedConversionFormat = Extract<ColorFormatName, `${CuloriConversionFormat}`>;

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
    hex: {
        coords: {
            r: {
                min: 0,
                max: 255,
                factor: 255,
                radix: 16,
                radixPad: 2,
            },
            g: {
                min: 0,
                max: 255,
                factor: 255,
                radix: 16,
                radixPad: 2,
            },
            b: {
                min: 0,
                max: 255,
                factor: 255,
                radix: 16,
                radixPad: 2,
            },
        },
        conversionFormat: CuloriConversionFormat.rgb,
        rawSyntax: 'hexString',
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
} as const satisfies Record<
    string,
    {
        coords: Record<string, ColorCoordinateDefinition>;
        colorSpace: string;
        /**
         * Only required if the original color format name (the object key) for the color isn't
         * already in {@link CuloriConversionFormat}.
         */
        conversionFormat?: CuloriConversionFormat | undefined;
        rawSyntax?: string | undefined;
    }
>;

/**
 * All supported color format names.
 *
 * @category Internal
 * @enum
 */
export const ColorFormatName = mapObjectValues(
    rawColorFormats,
    (colorName) => colorName,
) satisfies Record<ColorFormatName, ColorFormatName> as AnyObject as {
    [Key in ColorFormatName]: Key;
};

/**
 * {@link ColorFormatName} combined with hex and named CSS color representation.
 *
 * @category Internal
 * @enum
 */
export const ColorSyntaxName = {
    ...ColorFormatName,
    name: 'name',
    hexString: 'hexString',
} as const;
export type ColorSyntaxName = Values<typeof ColorSyntaxName>;

/**
 * All supported color format names.
 *
 * @category Internal
 * @enum
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
        Extract<(typeof rawColorFormats)[FormatName], {colorSpace: any}>['colorSpace'],
        FormatName
    >;
}>;
/**
 * All supported color formats.
 *
 * @category Color Format
 */
export const colorFormats = mapObjectValues(
    rawColorFormats,
    (colorFormatName, colorFormatValue) => {
        /* node:coverage disable */
        const conversionFormat: SupportedConversionFormat | undefined =
            check.isEnumValue(colorFormatName, CuloriConversionFormat) &&
            check.isEnumValue(colorFormatName, ColorFormatName)
                ? colorFormatName
                : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  'conversionFormat' in colorFormatValue && colorFormatValue.conversionFormat
                  ? check.isEnumValue(colorFormatValue.conversionFormat, CuloriConversionFormat) &&
                    check.isEnumValue(colorFormatValue.conversionFormat, ColorFormatName)
                      ? colorFormatValue.conversionFormat
                      : undefined
                  : undefined;

        assert.isTruthy(
            conversionFormat,
            `Invalid conversion format for color format '${colorFormatName}' ${stringify(colorFormatValue)}.`,
        );

        return {
            ...colorFormatValue,
            colorFormat: colorFormatName,
            conversionFormat,
            rawSyntax: assertWrap.isEnumValue(
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                'rawSyntax' in colorFormatValue && colorFormatValue.rawSyntax
                    ? colorFormatValue.rawSyntax
                    : colorFormatName,
                ColorSyntaxName,
            ),
        } satisfies ColorFormatDefinition;
        /* node:coverage enable */
    },
) satisfies Record<ColorFormatName, ColorFormatDefinition> as Record<
    ColorFormatName,
    ColorFormatDefinition
> as ColorFormats;

/**
 * All supported color space names.
 *
 * @category Internal
 * @enum
 */
export type ColorSpaceName = Values<typeof rawColorFormats>['colorSpace'];

/**
 * All supported color space names.
 *
 * @category Internal
 * @enum
 */
export const ColorSpaceName = arrayToObject(
    getObjectTypedValues(rawColorFormats),
    (format) => {
        return {
            key: format.colorSpace,
            value: format.colorSpace,
        };
    },
    {
        useRequired: true,
    },
) as {[Key in ColorSpaceName]: Key};

/**
 * All value types for all supported color formats.
 *
 * @category Internal
 */
export type ColorValue = {
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
export const colorFormatsBySpace = getObjectTypedEntries(colorFormats).reduce(
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
) satisfies Record<ColorSpaceName, Record<ColorFormatName, ColorFormatDefinition>> as {
    [ColorSpace in ColorSpaceName]: {
        [ColorFormat in ColorFormatName]: ColorFormatDefinition<ColorSpace, ColorFormat>;
    };
};

/**
 * Determines the color syntax / format in use based on the given CSS color string.
 *
 * @category Util
 */
export function getColorSyntaxFromCssString(cssString: string): ColorSyntaxName {
    if (cssString.startsWith('rgb')) {
        return ColorSyntaxName.rgb;
    } else if (cssString.startsWith('hsl')) {
        return ColorSyntaxName.hsl;
    } else if (cssString.startsWith('hwb')) {
        return ColorSyntaxName.hwb;
    } else if (cssString.startsWith('oklab')) {
        return ColorSyntaxName.oklab;
    } else if (cssString.startsWith('oklch')) {
        return ColorSyntaxName.oklch;
    } else if (cssString.startsWith('lab')) {
        return ColorSyntaxName.lab;
    } else if (cssString.startsWith('lch')) {
        return ColorSyntaxName.lch;
    } else if (cssString.startsWith('#')) {
        return ColorSyntaxName.hexString;
    } else {
        return ColorSyntaxName.name;
    }
}

/**
 * All possible coordinate names for all supported color formats in a union.
 *
 * @category Internal
 */
export type ColorCoordinateName = keyof UnionToIntersection<
    Values<typeof rawColorFormats>['coords']
>;

/**
 * A single color format definition.
 *
 * @category Internal
 */
export type ColorFormatDefinition<
    ColorSpace extends ColorSpaceName = any,
    ColorFormat extends ColorFormatName = any,
> = {
    /** Which exact color coordinates exist in here depends on the set color space. */
    coords: Record<ColorCoordsByFormat[ColorFormat], ColorCoordinateDefinition>;
    /** This name for this color to be used in `Colorjs.to()`. Defaults to the color format key. */
    colorSpace: ColorSpace;
    colorFormat: ColorFormat;
    conversionFormat: SupportedConversionFormat;
    rawSyntax: ColorSyntaxName;
};
