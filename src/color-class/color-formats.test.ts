import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {type ColorValue, type HexColor} from './color-formats.js';

describe('HexColor', () => {
    it('is compatible with hex color strings', () => {
        const testAssignment: HexColor = '#ffffff';
    });
});

describe('ColorValues', () => {
    it('has all color coordinates', () => {
        assert.tsType<ColorValue>().equals<{
            rgb: Record<'r' | 'g' | 'b', number>;
            hsl: Record<'h' | 's' | 'l', number>;
            hwb: Record<'b' | 'h' | 'w', number>;
            lab: Record<'b' | 'l' | 'a', number>;
            lch: Record<'h' | 'l' | 'c', number>;
            oklab: Record<'b' | 'l' | 'a', number>;
            oklch: Record<'h' | 'l' | 'c', number>;
        }>();
    });
});
