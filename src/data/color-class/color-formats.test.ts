import {assert} from '@augment-vir/assert';
import {describe, it, itCases} from '@augment-vir/test';
import {
    ColorSyntaxName,
    getColorSyntaxFromCssString,
    type ColorValue,
    type HexColor,
} from './color-formats.js';

describe('HexColor', () => {
    it('is compatible with hex color strings', () => {
        assert.tsType<'#ffffff'>().matches<HexColor>();
    });
});

describe('ColorValues', () => {
    it('has all color coordinates', () => {
        assert.tsType<ColorValue>().equals<{
            rgb: Record<'r' | 'g' | 'b', number>;
            hex: Record<'r' | 'g' | 'b', number>;
            hsl: Record<'h' | 's' | 'l', number>;
            hwb: Record<'b' | 'h' | 'w', number>;
            lab: Record<'b' | 'l' | 'a', number>;
            lch: Record<'h' | 'l' | 'c', number>;
            oklab: Record<'b' | 'l' | 'a', number>;
            oklch: Record<'h' | 'l' | 'c', number>;
        }>();
    });
});

describe(getColorSyntaxFromCssString.name, () => {
    itCases(getColorSyntaxFromCssString, [
        {
            it: 'detects rgb',
            input: 'rgb(255, 0, 0)',
            expect: ColorSyntaxName.rgb,
        },
        {
            it: 'detects rgba',
            input: 'rgba(255, 0, 0, 0.5)',
            expect: ColorSyntaxName.rgb,
        },
        {
            it: 'detects hsl',
            input: 'hsl(120, 100%, 50%)',
            expect: ColorSyntaxName.hsl,
        },
        {
            it: 'detects hsla',
            input: 'hsla(120, 100%, 50%, 0.5)',
            expect: ColorSyntaxName.hsl,
        },
        {
            it: 'detects hwb',
            input: 'hwb(120 0% 0%)',
            expect: ColorSyntaxName.hwb,
        },
        {
            it: 'detects lab',
            input: 'lab(50% 0 0)',
            expect: ColorSyntaxName.lab,
        },
        {
            it: 'detects lch',
            input: 'lch(50% 0 0)',
            expect: ColorSyntaxName.lch,
        },
        {
            it: 'detects oklab',
            input: 'oklab(0.5 0 0)',
            expect: ColorSyntaxName.oklab,
        },
        {
            it: 'detects oklch',
            input: 'oklch(0.5 0.1 120)',
            expect: ColorSyntaxName.oklch,
        },
        {
            it: 'detects hex with 6 characters',
            input: '#ff0000',
            expect: ColorSyntaxName.hexString,
        },
        {
            it: 'detects hex with 3 characters',
            input: '#f00',
            expect: ColorSyntaxName.hexString,
        },
        {
            it: 'detects hex with 8 characters',
            input: '#ff0000ff',
            expect: ColorSyntaxName.hexString,
        },
        {
            it: 'detects named color',
            input: 'red',
            expect: ColorSyntaxName.name,
        },
        {
            it: 'detects another named color',
            input: 'blue',
            expect: ColorSyntaxName.name,
        },
    ]);
});
