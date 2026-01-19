import {css, type CSSResult} from 'element-vir';
import {type SingleCssVarDefinition} from 'lit-css-vars';

/**
 * A foreground/background color pair.
 *
 * @category Internal
 */
export type ColorPair = Record<'foreground' | 'background', SingleCssVarDefinition>;

/**
 * Creates foreground and background CSS code. The foreground color is applied to the CSS `color`
 * property and the background color is applied to the CSS `background-color` property.
 *
 * @category Color Theme
 */
export function colorCss(color: Readonly<ColorPair>): CSSResult {
    return css`
        color: ${color.foreground.value};
        background-color: ${color.background.value};
    `;
}
