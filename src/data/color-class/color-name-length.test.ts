import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {
    identicalColorNames,
    longestColorName,
    longestIdenticalColorNames,
    maxColorNameLength,
} from './color-name-length.js';

describe('identicalColorNames', () => {
    it('finds all identical colors', () => {
        assert.deepEquals(identicalColorNames, {
            aqua: ['cyan'],
            cyan: ['aqua'],
            darkgray: ['darkgrey'],
            darkgrey: ['darkgray'],
            darkslategray: ['darkslategrey'],
            darkslategrey: ['darkslategray'],
            dimgray: ['dimgrey'],
            dimgrey: ['dimgray'],
            fuchsia: ['magenta'],
            gray: ['grey'],
            grey: ['gray'],
            lightgray: ['lightgrey'],
            lightgrey: ['lightgray'],
            lightslategray: ['lightslategrey'],
            lightslategrey: ['lightslategray'],
            magenta: ['fuchsia'],
            slategray: ['slategrey'],
            slategrey: ['slategray'],
        });
    });
});

describe('longestColorPair', () => {
    it('is light slate grey/gray', () => {
        assert.deepEquals(longestIdenticalColorNames, [
            'lightslategray',
            'lightslategrey',
        ]);
    });
});

describe('longestColorName', () => {
    it('is lightgoldenrodyellow', () => {
        assert.strictEquals(longestColorName, 'lightgoldenrodyellow');
    });
});

describe('colorNameLength', () => {
    it('is 20', () => {
        assert.strictEquals(maxColorNameLength, 20);
    });
});
