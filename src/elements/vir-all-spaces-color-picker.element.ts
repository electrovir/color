/* node:coverage disable */

import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {type ColorSyntaxName, getColorSyntaxFromCssString} from '../color-class/color-formats.js';
import {Color} from '../color-class/color.js';
import {VirAllColorSpaceSliders} from './vir-all-color-space-sliders.element.js';
import {VirColorDetails} from './vir-color-details.element.js';

/**
 * A color picker element that shows sliders for all supported color spaces at once, as well as all
 * the values for all supported color spaces in a table.
 *
 * @category Elements
 */
export const VirAllSpacesColorPicker = defineElement<{color: string}>()({
    tagName: 'vir-all-spaces-color-picker',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
    `,
    events: {
        colorChange: defineElementEvent<string>(),
    },
    state() {
        return {
            inputColorString: undefined as undefined | string,
            overrideInputColor: undefined as undefined | ColorSyntaxName,
        };
    },
    render({inputs, dispatch, events, state, updateState}) {
        const color = new Color(inputs.color);

        if (state.overrideInputColor) {
            updateState({
                inputColorString: color.toCss()[state.overrideInputColor],
            });
        }

        if (state.inputColorString == undefined) {
            updateState({
                inputColorString: inputs.color,
            });
        }

        return html`
            <${VirColorDetails.assign({
                color: inputs.color,
                showInput: true,
            })}
                ${listen(VirColorDetails.events.colorChange, (event) => {
                    updateState({
                        inputColorString: event.detail,
                        overrideInputColor: undefined,
                    });
                    dispatch(new events.colorChange(event.detail));
                })}
            ></${VirColorDetails}>
            <${VirAllColorSpaceSliders.assign({color})}
                ${listen(VirAllColorSpaceSliders.events.colorChange, (event) => {
                    const colorSyntax = getColorSyntaxFromCssString(state.inputColorString || '#');
                    updateState({
                        overrideInputColor: colorSyntax,
                    });
                    dispatch(new events.colorChange(event.detail));
                })}
            ></${VirAllColorSpaceSliders}>
        `;
    },
});
