import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';
import {defineCssVars} from 'lit-css-vars';
import {colorCss, type ColorPair} from './color-css.js';

describe(colorCss.name, () => {
    it('generates foreground and background CSS', () => {
        const testColors = defineCssVars({
            'mock-foreground': 'black',
            'mock-background': 'white',
        });

        const colorPair: ColorPair = {
            foreground: testColors['mock-foreground'],
            background: testColors['mock-background'],
        };

        assert.strictEquals(
            String(colorCss(colorPair)).trim(),
            `color: var(--mock-foreground);\n        background-color: var(--mock-background);`,
        );
    });

    it('handles CSS var values correctly', () => {
        const testColors = defineCssVars({
            'mock-foreground': '#ff0000',
            'mock-background': '#00ff00',
        });

        const colorPair: ColorPair = {
            foreground: testColors['mock-foreground'],
            background: testColors['mock-background'],
        };

        assert.strictEquals(
            String(colorCss(colorPair)).trim(),
            `color: var(--mock-foreground);\n        background-color: var(--mock-background);`,
        );
    });
});
