/* node:coverage disable */

import {getObjectTypedKeys} from '@augment-vir/common';
import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {noNativeSpacing} from 'vira';
import {
    type ColorCoordinateName,
    type ColorFormatName,
    colorFormats,
} from '../color-class/color-formats.js';
import {type Color, type ColorUpdate} from '../color-class/color.js';
import {VirColorSlider} from './vir-color-slider.element.js';

/**
 * Color sliders for all coordinates within a specific color format.
 *
 * @category Elements
 */
export const VirColorFormatSliders = defineElement<{
    color: Readonly<Color>;
    colorFormatName: ColorFormatName;
}>()({
    tagName: 'vir-color-format-sliders',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
        }

        h3 {
            ${noNativeSpacing};
        }
    `,
    events: {
        colorChange: defineElementEvent<string>(),
    },
    render({inputs, dispatch, events}) {
        const colorFormat = colorFormats[inputs.colorFormatName];

        const coordinateTemplates = getObjectTypedKeys(colorFormat.coords).map(
            (colorCoordinate: ColorCoordinateName) => {
                return html`
                    <${VirColorSlider.assign({
                        color: inputs.color,
                        colorCoordinateName: colorCoordinate,
                        colorFormatName: inputs.colorFormatName,
                    })}
                        ${listen(VirColorSlider.events.valueChange, (event) => {
                            const newColor = inputs.color.clone();

                            newColor.set({
                                [inputs.colorFormatName]: {
                                    [colorCoordinate]: event.detail,
                                },
                            } as ColorUpdate);
                            const newValue = newColor.toCss()[inputs.colorFormatName];
                            dispatch(new events.colorChange(newValue));
                        })}
                    ></${VirColorSlider}>
                `;
            },
        );

        return html`
            <h3>${inputs.colorFormatName}</h3>
            ${coordinateTemplates}
        `;
    },
});
