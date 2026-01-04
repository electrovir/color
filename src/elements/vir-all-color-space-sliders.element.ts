/* node:coverage disable */

import {getObjectTypedKeys, getObjectTypedValues} from '@augment-vir/common';
import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {colorFormatsBySpace} from '../color-class/color-formats.js';
import {type Color} from '../color-class/color.js';
import {VirColorFormatSliders} from './vir-color-format-sliders.element.js';

/**
 * Color sliders for all color spaces.
 *
 * @category Elements
 */
export const VirAllColorSpaceSliders = defineElement<{color: Readonly<Color>}>()({
    tagName: 'vir-all-color-space-sliders',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .color-space {
            display: flex;
            flex-wrap: wrap;
            column-gap: 32px;
            row-gap: 8px;
        }
    `,
    events: {
        colorChange: defineElementEvent<string>(),
    },
    render({inputs, dispatch, events}) {
        const colorSpaceTemplates = getObjectTypedValues(colorFormatsBySpace).map(
            (colorSpaceFormats) => {
                const formatTemplates = getObjectTypedKeys(colorSpaceFormats).map(
                    (colorFormatName) => {
                        return html`
                            <${VirColorFormatSliders.assign({
                                color: inputs.color,
                                colorFormatName,
                            })}
                                ${listen(VirColorFormatSliders.events.colorChange, (event) => {
                                    dispatch(new events.colorChange(event.detail));
                                })}
                            ></${VirColorFormatSliders}>
                        `;
                    },
                );

                return html`
                    <section class="color-space">${formatTemplates}</section>
                `;
            },
        );

        return html`
            ${colorSpaceTemplates}
        `;
    },
});
