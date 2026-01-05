import {assert, assertWrap, check} from '@augment-vir/assert';
import {
    copyThroughJson,
    filterMap,
    getEnumValues,
    getObjectTypedEntries,
    getObjectTypedKeys,
    joinWithFinalConjunction,
    mapObjectValues,
    round,
    type AnyObject,
    type PartialWithUndefined,
} from '@augment-vir/common';
import colorNames from 'color-name';
import {clampGamut, converter, formatHex, parse, type Color as CuloriColor} from 'culori';
import {type RequireExactlyOne} from 'type-fest';
import {
    ColorFormatName,
    colorFormats,
    ColorSyntaxName,
    getColorSyntaxFromCssString,
    type ColorCoordinateDefinition,
    type ColorCoordinateName,
    type ColorCoordsByFormat,
    type ColorValue,
    type HexColor,
} from './color-formats.js';
import {maxColorNameLength} from './color-name-length.js';

/**
 * An update to an existing {@link Color} instance. Used in {@link Color.set}.
 *
 * @category Internal
 */
export type ColorUpdate = RequireExactlyOne<
    {
        [FormatName in ColorFormatName]: PartialWithUndefined<
            Record<ColorCoordsByFormat[FormatName], number>
        >;
    } & {
        [ColorSyntaxName.hex]: HexColor;
        [ColorSyntaxName.name]: string;
    }
>;

/**
 * The values of all supported color formats for a given {@link Color} instance. Accessed via
 * `Color.allColors`.
 *
 * @category Internal
 */
export type AllColorsValues = ColorValue & {
    [ColorSyntaxName.hex]: HexColor;
    [ColorSyntaxName.name]: string;
    names: string[];
};

/**
 * The output of `Color.serialize()`.
 *
 * @category Internal
 */
export type SerializedColor = AllColorsValues & {
    originalColorSyntax: ColorSyntaxName;
};

/**
 * A `Color` class with state and the following features:
 *
 * - Color coordinates do not change when they become `'none'`, they stay at their previous value.
 *   This makes for a much smoother UI experience.
 * - All relevant color spaces and formats are always set (no extra conversions necessary).
 * - Matching CSS color names are tracked.
 * - This class is exported correctly and the types aren't a mess.
 *
 * @category Color
 */
export class Color {
    constructor(
        /** Any valid CSS color string or an object of color coordinate values. */
        initValue: string | Readonly<ColorUpdate>,
    ) {
        this.set(initValue);
    }

    /** Checks, with a type guard, that a given input is a Color class instance. */
    public static isColor<T>(value: T): value is Extract<T, Readonly<Color>> {
        return value instanceof Color;
    }

    /**
     * Create a new {@link Color} instance by parsing the output of another instance's
     * {@link Color.serialize} method.
     */
    public static deserialize(input: string) {
        const parsed = JSON.parse(input) as SerializedColor;
        const newColor = new Color('black');
        getObjectTypedEntries(parsed).forEach(
            ([
                key,
                value,
            ]) => {
                if (key === 'originalColorSyntax') {
                    newColor.originalColorSyntax = assertWrap.isEnumValue(
                        value,
                        ColorSyntaxName,
                        'Cannot deserialize: invalid color syntax.',
                    );
                } else {
                    newColor._allColors[key] = value as any;
                }
            },
        );

        return newColor;
    }

    /**
     * Converts the color class to a CSS string format in the color space and format that it was
     * originally set with.
     */
    public toString() {
        return this.toCss()[this.originalColorSyntax];
    }

    /** The color syntax the this color was set with. */
    protected originalColorSyntax: ColorSyntaxName = ColorSyntaxName.hex;
    #internalColor: CuloriColor = assertWrap.isDefined(parse('black'));
    /** All current color values. These are updated whenever {@link Color.set} is called. */
    protected readonly _allColors = {
        names: ['black'] as string[],
        [ColorSyntaxName.name]: 'black' as string,
        [ColorSyntaxName.hex]: '#000000' as HexColor,

        [ColorSyntaxName.rgb]: {
            r: 0 as number,
            g: 0 as number,
            b: 0 as number,
        },

        [ColorSyntaxName.hsl]: {
            h: 0 as number,
            s: 0 as number,
            l: 0 as number,
        },

        [ColorSyntaxName.hwb]: {
            h: 0 as number,
            w: 0 as number,
            b: 0 as number,
        },

        [ColorSyntaxName.lab]: {
            l: 0 as number,
            a: 0 as number,
            b: 0 as number,
        },

        [ColorSyntaxName.lch]: {
            l: 0 as number,
            c: 0 as number,
            h: 0 as number,
        },

        [ColorSyntaxName.oklab]: {
            l: 0 as number,
            a: 0 as number,
            b: 0 as number,
        },

        [ColorSyntaxName.oklch]: {
            l: 0 as number,
            c: 0 as number,
            h: 0 as number,
        },
    };

    /** Create a new {@link Color} instance that matches this one exactly. */
    public clone(): Color {
        return Color.deserialize(this.serialize());
    }

    /**
     * Update the color to match the given string.
     *
     * @throws Error if `cssColorString` is not able to be parsed.
     */
    protected setByString(cssColorString: string) {
        const newColor = parse(cssColorString);

        if (!newColor) {
            throw new Error(`Unable to parse invalid color string: '${cssColorString}'`);
        }
        this.originalColorSyntax = getColorSyntaxFromCssString(cssColorString);

        this.#internalColor = newColor;
        this.pullFromInternalColor();
    }

    /**
     * Update the current color by setting a whole new color, a single coordinate in a single color
     * format, or multiple coordinates in a single color format. This mutates the current
     * {@link Color} instance.
     */
    public set(newValue: Readonly<ColorUpdate> | string) {
        if (check.isString(newValue)) {
            return this.setByString(newValue);
        }

        assert.isLengthExactly(
            Object.keys(newValue),
            1,
            `Cannot set multiple color formats at once: got '${joinWithFinalConjunction(Object.keys(newValue))}'`,
        );

        if (newValue.hex || newValue.name) {
            this.setByString(newValue.hex || newValue.name);
        } else {
            const [
                colorFormatName,
                colorValues,
            ]: [
                ColorFormatName,
                Partial<Record<string,
                        number>>,
            ] = assertWrap.isDefined(
                getObjectTypedEntries(newValue as Omit<typeof newValue, 'name' | 'hex'>)[0],
            );
            const colorFormatDefinition = colorFormats[colorFormatName];

            const orderedColorCoords = Object.values(
                mapObjectValues(colorFormatDefinition.coords, (coordName: ColorCoordinateName) => {
                    const coordValue = colorValues[coordName];
                    const coordDefinition: ColorCoordinateDefinition =
                        colorFormatDefinition.coords[
                            assertWrap.isKeyOf(coordName, colorFormatDefinition.coords)
                        ];

                    const rawCoordValue =
                        coordValue != undefined &&
                        coordValue >= coordDefinition.min &&
                        coordValue <= coordDefinition.max
                            ? colorValues[coordName]
                            : (this[colorFormatName] as Record<string, number>)[coordName];

                    return assertWrap.isDefined(rawCoordValue);
                }),
            ) satisfies number[] as [number, number, number];

            this.setByString(`${colorFormatName}(${orderedColorCoords.join(' ')})`);
        }
    }

    /**
     * Update all internally stored color format values ({@link Color.allColors}) from the updated
     * internal color object.
     */
    protected pullFromInternalColor() {
        getEnumValues(ColorFormatName).forEach((colorFormatName) => {
            const colorFormatDefinition = colorFormats[colorFormatName];
            const originalColorDefinition = check.isKeyOf(this.#internalColor.mode, colorFormats)
                ? colorFormats[this.#internalColor.mode]
                : undefined;

            const converted = clampGamut(
                colorFormatDefinition.colorSpace === originalColorDefinition?.colorSpace
                    ? colorFormatName
                    : 'rgb',
            )(converter(colorFormatName)(this.#internalColor));

            /* node:coverage ignore next 5: technically this shouldn't happen, idk how to manually trigger it. */
            if (!converted) {
                assert.never(
                    `Failed to convert color '${JSON.stringify(this.#internalColor)}' to '${colorFormatName}'.`,
                );
            }

            getObjectTypedKeys(this[colorFormatName]).forEach((coordName: ColorCoordinateName) => {
                const coordValue = (
                    converted as AnyObject as Record<ColorCoordinateName, number | undefined | null>
                )[coordName];

                const coordinateDefinition: ColorCoordinateDefinition =
                    colorFormatDefinition.coords[
                        assertWrap.isKeyOf(coordName, colorFormatDefinition.coords)
                    ];

                if (coordValue != undefined) {
                    (this._allColors[colorFormatName] as Record<string, number>)[coordName] = round(
                        (coordValue || 0) * (coordinateDefinition.factor || 1),
                        {
                            digits: coordinateDefinition.digits || 0,
                        },
                    );
                }
            });
        });

        this._allColors[ColorSyntaxName.hex] = formatHex(this.#internalColor) as HexColor;
        this._allColors.names = findMatchingColorNames(this.rgb);
        this._allColors[ColorSyntaxName.name] = this._allColors.names[0] || '';
    }

    /**
     * Create a string that can be serialized into a new {@link Color} instance which will exactly
     * match the current {@link Color} instance.
     */
    public serialize() {
        return JSON.stringify({
            ...this.allColors,
            originalColorSyntax: this.originalColorSyntax,
        } satisfies SerializedColor);
    }

    /** This individual color expressed in all the supported color formats. */
    public get allColors(): AllColorsValues {
        return copyThroughJson(this._allColors);
    }

    /**
     * Converts the values for each supported color format into a padded string for easy display
     * purposes.
     *
     * @see `.toCss()`
     */
    public toFormattedStrings(): Record<ColorSyntaxName | 'names', string> {
        const colorFormatStrings = mapObjectValues(colorFormats, (colorFormatName) => {
            const coordValues = Object.values(this[colorFormatName]);
            return coordValues.map((coordValue) => String(coordValue).padStart(6, ' ')).join(' ');
        });

        return {
            [ColorSyntaxName.hex]: this.hex,
            ...colorFormatStrings,
            names: this.names.join(', ').padEnd(maxColorNameLength, ' '),
            name: (this.names[0] || '').padEnd(maxColorNameLength, ' '),
        };
    }

    /**
     * Converts the values for each supported color format in a CSS string that can be directly used
     * in any modern CSS code.
     *
     * @see `.toFormattedStrings()`
     */
    public toCss(): Record<ColorSyntaxName, string> {
        const colorFormatStrings = mapObjectValues(colorFormats, (colorFormatName) => {
            const coordValues = Object.values(this[colorFormatName]);
            return `${colorFormatName}(${coordValues.join(' ')})`;
        });

        return {
            [ColorSyntaxName.hex]: this.hex,
            ...colorFormatStrings,
            name: this.names[0] || '',
        };
    }

    /**
     * The current color expressed as hardcoded CSS color keywords. If no CSS color keywords match
     * the current color, this array will be empty.
     */
    public get names() {
        return copyThroughJson(this._allColors.names);
    }
    /**
     * The current color expressed as a single CSS color name string. If there is no color name that
     * matches the current color, this will be an empty string.
     */
    public get name() {
        return this._allColors.names[0] || '';
    }
    /** The current color expressed as an RGB hex string. */
    public get hex() {
        return copyThroughJson(this._allColors[ColorSyntaxName.hex]) as HexColor;
    }
    /** The current color expressed as its RGB coordinate values. */
    public get rgb() {
        return copyThroughJson(this._allColors[ColorSyntaxName.rgb]);
    }
    /** The current color expressed as its HSL coordinate values. */
    public get hsl() {
        return copyThroughJson(this._allColors[ColorSyntaxName.hsl]);
    }
    /** The current color expressed as its HWB coordinate values. */
    public get hwb() {
        return copyThroughJson(this._allColors[ColorSyntaxName.hwb]);
    }
    /** The current color expressed as its LAB coordinate values. */
    public get lab() {
        return copyThroughJson(this._allColors[ColorSyntaxName.lab]);
    }
    /** The current color expressed as its LCH coordinate values. */
    public get lch() {
        return copyThroughJson(this._allColors[ColorSyntaxName.lch]);
    }
    /** The current color expressed as its Oklab coordinate values. */
    public get oklab() {
        return copyThroughJson(this._allColors[ColorSyntaxName.oklab]);
    }
    /** The current color expressed as its Oklch coordinate values. */
    public get oklch() {
        return copyThroughJson(this._allColors[ColorSyntaxName.oklch]);
    }
}

function findMatchingColorNames(rgb: Readonly<ColorValue[typeof ColorSyntaxName.rgb]>): string[] {
    return filterMap(
        getObjectTypedEntries(colorNames),
        ([
            colorName,
        ]) => {
            return colorName;
        },
        (
            colorName,
            [
                ,
                colorValues,
            ],
        ) => {
            return check.deepEquals(colorValues, [
                rgb.r,
                rgb.g,
                rgb.b,
            ]);
        },
    );
}
