import {assert, assertWrap, check} from '@augment-vir/assert';
import {awaitedForEach, copyThroughJson, getEnumValues, stringify} from '@augment-vir/common';
import {assertSnapshot, describe, it} from '@augment-vir/test';
import {ColorFormatName} from './color-formats.js';
import {Color, type ColorUpdate} from './color.js';
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
    it('sets initial values', async (testContext) => {
        await assertSnapshot(testContext, new Color('red').allColors);
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
            hex: originalColor.hex,
            rgb: originalColor.rgb,
            hsl: originalColor.hsl,
            hwb: originalColor.hwb,
            lab: originalColor.lab,
            lch: originalColor.lch,
            oklab: originalColor.oklab,
            oklch: originalColor.oklch,
            names: originalColor.names,
        });
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
            hex: '#123',
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
        const expectedKeys = Object.keys(color.allColors)
            .map((entry) => {
                if (entry === 'names') {
                    return 'name';
                } else {
                    return entry;
                }
            })
            .sort();

        await awaitedForEach(allExamples, async (example) => {
            await updateColor(example);
        });

        assert.hasValues(Array.from(formatsUsed), expectedKeys);
    });
});
