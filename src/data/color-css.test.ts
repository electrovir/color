import {assert} from '@augment-vir/assert';
import {trimLines} from '@augment-vir/common';
import {describe, it} from '@augment-vir/test';
import {css} from 'element-vir';
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
            trimLines(String(colorCss(colorPair))),
            trimLines(
                String(css`
                    color: var(--mock-foreground, black);
                    background-color: var(--mock-background, white);
                `),
            ),
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
            trimLines(String(colorCss(colorPair))),
            trimLines(
                String(css`
                    color: var(--mock-foreground, #ff0000);
                    background-color: var(--mock-background, #00ff00);
                `),
            ),
        );
    });
});
