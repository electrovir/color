import {assert, assertWrap, check} from '@augment-vir/assert';
import {
    copyThroughJson,
    filterMap,
    getObjectTypedEntries,
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
    colorFormatNames,
    colorFormats,
    type ColorCoordinateName,
    type ColorCoordsByFormat,
    type ColorFormatName,
    type ColorValues,
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
        hex: HexColor;
        name: string;
    }
>;

/**
 * The values of all supported color formats for a given {@link Color} instance. Accessed via
 * {@link Color.allColors}.
 *
 * @category Internal
 */
export type AllColorsValues = ColorValues & {hex: HexColor; names: string[]};

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
    /**
     * Create a new {@link Color} instance by parsing the output of another instance's
     * {@link Color.serialize} method.
     */
    public static deserialize(input: string) {
        const parsed = JSON.parse(input) as AllColorsValues;
        const newColor = new Color('black');
        getObjectTypedEntries(parsed).forEach(
            ([
                key,
                value,
            ]) => {
                newColor._allColors[key] = value as any;
            },
        );

        return newColor;
    }

    #internalColor: CuloriColor = assertWrap.isDefined(parse('black'));
    /** All current color values. These are updated whenever {@link Color.set} is called. */
    protected readonly _allColors = {
        names: ['black'] as string[],
        hex: '#000000' as HexColor,

        rgb: {
            r: 0 as number,
            g: 0 as number,
            b: 0 as number,
        },

        hsl: {
            h: 0 as number,
            s: 0 as number,
            l: 0 as number,
        },

        hwb: {
            h: 0 as number,
            w: 0 as number,
            b: 0 as number,
        },

        lab: {
            l: 0 as number,
            a: 0 as number,
            b: 0 as number,
        },

        lch: {
            l: 0 as number,
            c: 0 as number,
            h: 0 as number,
        },

        oklab: {
            l: 0 as number,
            a: 0 as number,
            b: 0 as number,
        },

        oklch: {
            l: 0 as number,
            c: 0 as number,
            h: 0 as number,
        },
    };

    constructor(
        /** Any valid CSS color string or an object of color coordinate values. */
        initValue: string | Readonly<ColorUpdate>,
    ) {
        this.set(initValue);
    }

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
                mapObjectValues(colorFormatDefinition.coords, (coordName) => {
                    const coordValue = colorValues[coordName];
                    const coordDefinition = assertWrap.isDefined(
                        colorFormatDefinition.coords[coordName],
                    );

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
        colorFormatNames.forEach((colorFormatName) => {
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

            Object.keys(this[colorFormatName]).forEach((coordName) => {
                const coordValue = (
                    converted as AnyObject as Record<ColorCoordinateName, number | undefined | null>
                )[coordName as ColorCoordinateName];

                if (coordValue != undefined) {
                    (this._allColors[colorFormatName] as Record<string, number>)[coordName] = round(
                        (coordValue || 0) * (colorFormatDefinition.coords[coordName]?.factor || 1),
                        {
                            digits: colorFormatDefinition.coords[coordName]?.digits || 0,
                        },
                    );
                }
            });
        });

        this._allColors.hex = formatHex(this.#internalColor) as HexColor;
        this._allColors.names = findMatchingColorNames(this.rgb);
    }

    /**
     * Create a string that can be serialized into a new {@link Color} instance which will exactly
     * match the current {@link Color} instance.
     */
    public serialize() {
        return JSON.stringify(this.allColors);
    }

    /** This individual color expressed in all the supported color formats. */
    public get allColors(): AllColorsValues {
        return copyThroughJson(this._allColors);
    }

    /**
     * Converts the values for each supported color format into a padded string for easy display
     * purposes.
     */
    public toFormattedStrings(): Record<ColorFormatName | 'hex' | 'names', string> {
        const colorFormatStrings = mapObjectValues(colorFormats, (colorFormatName) => {
            const coordValues = Object.values(this[colorFormatName]);
            return coordValues.map((coordValue) => String(coordValue).padStart(6, ' ')).join(' ');
        });

        return {
            hex: this.hex,
            ...colorFormatStrings,
            names: this.names.join(', ').padEnd(maxColorNameLength, ' '),
        };
    }

    /**
     * Converts the values for each supported color format in a CSS string that can be directly used
     * in any modern CSS code.
     */
    public toCss(): Record<ColorFormatName | 'hex' | 'name', string> {
        const colorFormatStrings = mapObjectValues(colorFormats, (colorFormatName) => {
            const coordValues = Object.values(this[colorFormatName]);
            return `${colorFormatName}(${coordValues.join(' ')})`;
        });

        return {
            hex: this.hex,
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
    /** The current color expressed as an RGB hex string. */
    public get hex() {
        return copyThroughJson(this._allColors.hex) as HexColor;
    }
    /** The current color expressed as its RGB coordinate values. */
    public get rgb() {
        return copyThroughJson(this._allColors.rgb);
    }
    /** The current color expressed as its HSL coordinate values. */
    public get hsl() {
        return copyThroughJson(this._allColors.hsl);
    }
    /** The current color expressed as its HWB coordinate values. */
    public get hwb() {
        return copyThroughJson(this._allColors.hwb);
    }
    /** The current color expressed as its LAB coordinate values. */
    public get lab() {
        return copyThroughJson(this._allColors.lab);
    }
    /** The current color expressed as its LCH coordinate values. */
    public get lch() {
        return copyThroughJson(this._allColors.lch);
    }
    /** The current color expressed as its Oklab coordinate values. */
    public get oklab() {
        return copyThroughJson(this._allColors.oklab);
    }
    /** The current color expressed as its Oklch coordinate values. */
    public get oklch() {
        return copyThroughJson(this._allColors.oklch);
    }
}

function findMatchingColorNames(rgb: Readonly<ColorValues['rgb']>): string[] {
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
