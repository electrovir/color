import {assert, assertWrap, check} from '@augment-vir/assert';
import {
    awaitedForEach,
    copyThroughJson,
    getEnumValues,
    omitObjectKeys,
    stringify,
} from '@augment-vir/common';
import {assertSnapshot, describe, it, itCases} from '@augment-vir/test';
import {ColorFormatName, ColorSyntaxName} from './color-formats.js';
import {Color, type ColorUpdate, type SerializedColor} from './color.js';
import {allExamples, namedExamples} from './color.mock.js';

describe(Color.name, () => {
    it('has all color formats', () => {
        assert.tsType<ColorFormatName>().matches<keyof Color>;
        /** Verify that adding a new color format will fail this test. */
        assert.tsType<ColorFormatName | 'intentional-extra'>().notMatches<keyof Color>;
        const instance = new Color('black');
        getEnumValues(ColorFormatName).forEach((colorFormatName) => {
            assert.isObject(instance[colorFormatName]);
        });
    });
    it('preserves original type in isColor', () => {
        const value = {} as any as Readonly<Color> | string | undefined;
        const value2 = {} as any as Color | string | undefined;

        if (Color.isColor(value)) {
            assert.tsType(value).equals<Readonly<Color>>();
            assert.tsType(value).notEquals<Color>();
        }
        if (Color.isColor(value2)) {
            assert.tsType(value2).notEquals<Readonly<Color>>();
            assert.tsType(value2).equals<Color>();
        }
    });
    it('converts itself to a valid CSS string', () => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        assert.strictEquals(`${new Color('rgb(256, 40, 100)')}`, 'rgb(255 40 100)');
    });
    it('sets initial values', async (testContext) => {
        await assertSnapshot(testContext, new Color('red').allColors);
    });
    it('works with setting hex coords', async (testContext) => {
        await assertSnapshot(
            testContext,
            new Color({
                hex: {
                    r: 100,
                    g: 100,
                    b: 100,
                },
            }).allColors,
        );
    });
    it('formats as CSS', async (testContext) => {
        await assertSnapshot(testContext, new Color(namedExamples.hwbSet).toCss());
    });
    it('formats as strings', async (testContext) => {
        await assertSnapshot(testContext, new Color(namedExamples.hwbSet).toFormattedStrings());
    });
    it('updates a single coordinate', () => {
        const color = new Color('#583758');
        const originalHsl = color.hsl;
        color.set({
            hsl: {
                l: 100,
            },
        });
        assert.deepEquals(color.hsl, {
            /** In particular, this should not change the `s` color coordinate. */
            ...originalHsl,
            l: 100,
        });
    });
    it('gets a copy of the color format', () => {
        const color = new Color('#583758');
        const originalHsl = color.hsl;
        const originalHslCloned = copyThroughJson(color.hsl);
        assert.deepEquals(originalHsl, originalHslCloned);
        color.set({
            hsl: {
                l: 100,
            },
        });
        assert.deepEquals(originalHsl, originalHslCloned);
        assert.notDeepEquals(originalHsl, color.hsl);
        assert.notDeepEquals(originalHslCloned, color.hsl);
    });
    it('clones itself', () => {
        const originalColor = new Color('#583758');
        assert.deepEquals(originalColor.clone(), originalColor);
    });
    it('accurately serializes', async (testContext) => {
        const originalColor = new Color('#583758');
        assert.deepEquals(JSON.parse(originalColor.serialize()), {
            [ColorSyntaxName.hex]: originalColor.hex,
            [ColorSyntaxName.rgb]: originalColor.rgb,
            [ColorSyntaxName.hsl]: originalColor.hsl,
            [ColorSyntaxName.hwb]: originalColor.hwb,
            [ColorSyntaxName.lab]: originalColor.lab,
            [ColorSyntaxName.lch]: originalColor.lch,
            [ColorSyntaxName.oklab]: originalColor.oklab,
            [ColorSyntaxName.oklch]: originalColor.oklch,
            [ColorSyntaxName.name]: originalColor.name,
            [ColorSyntaxName.hexString]: originalColor.hexString,
            names: originalColor.names,
            originalColorSyntax: ColorSyntaxName.hexString,
        } satisfies SerializedColor);
        await assertSnapshot(testContext, JSON.parse(originalColor.serialize()));
        await assertSnapshot(testContext, originalColor.serialize());
    });
    it('prevents out of range sets', () => {
        const color = new Color('red');
        const originalDump = color.allColors;

        color.set({rgb: {r: -10}});
        assert.deepEquals(originalDump, color.allColors);
    });
    it('updates its values', async (testContext) => {
        const color = new Color('red');
        const originalDump = color.allColors;

        color.set({hwb: {w: 10}});
        assert.deepEquals(color.hwb, {h: 0, w: 10, b: 0}, 'properly mutated the hwb colors');
        assert.notDeepEquals(
            originalDump,
            color.allColors,
            'no longer equals original color values',
        );
        await assertSnapshot(testContext, color.allColors);
        assert.deepEquals(
            color.allColors,
            new Color({hwb: color.hwb}).allColors,
            'equals a new color constructed from the same hwb values',
        );
        assert.deepEquals(
            new Color('hwb(0 10 0)').allColors,
            color.allColors,
            'equals a new color constructed from the same hwb string',
        );
    });
    it('sets to a hex', () => {
        const color = new Color({
            lab: {
                l: 55,
                a: 68,
                b: 68,
            },
        });
        const originalColors = color.allColors;

        color.set({
            [ColorSyntaxName.hexString]: '#123',
        });

        assert.notDeepEquals(originalColors, color.allColors);
    });
    it('keeps previous coord value when setting to none', () => {
        const color = new Color({
            hsl: {
                h: 120,
                s: 50,
                l: 50,
            },
        });
        const originalDump = color.allColors;
        color.set({
            hsl: {
                l: 0,
            },
        });
        assert.deepEquals(
            {
                ...originalDump.hsl,
                l: 0 as number,
            },
            color.allColors.hsl,
        );
    });
    it('fails to parse invalid color', () => {
        assert.throws(() => new Color(''));
    });
    it('can update from any color format', async (testContext) => {
        const formatsUsed = new Set<string>();
        const color = new Color('black');

        async function updateColor(setValue: Readonly<ColorUpdate> | string) {
            if (!check.isString(setValue)) {
                formatsUsed.add(assertWrap.isDefined(Object.keys(setValue)[0]));
            }
            color.set(setValue);
            await assertSnapshot(testContext, {
                original: check.isString(setValue) ? setValue : stringify(setValue),
                ...color.allColors,
            });
        }

        await awaitedForEach(allExamples, async (example) => {
            await updateColor(example);
        });

        const expectedKeys = Object.keys(omitObjectKeys(color.allColors, ['names'])).sort();
        assert.hasValues(Array.from(formatsUsed), expectedKeys);
    });

    describe(Color.isValidColorString.name, () => {
        itCases(Color.isValidColorString, [
            {
                it: 'accepts color names',
                input: 'blue',
                expect: true,
            },
            {
                it: 'accepts rgb',
                input: 'rgb(255 255 255)',
                expect: true,
            },
            {
                it: 'rejects invalid colors',
                input: 'I like turtles',
                expect: false,
            },
        ]);
    });
});
