/* node:coverage disable */

import {assertWrap} from '@augment-vir/assert';
import {createArray} from '@augment-vir/common';
import {extractEventTarget} from '@augment-vir/web';
import {css, defineElement, defineElementEvent, html, listen, unsafeCSS} from 'element-vir';
import {viraFontCssVars, ViraInput} from 'vira';
import {
    type ColorCoordinateName,
    type ColorFormatDefinition,
    type ColorFormatName,
    colorFormats,
} from '../color-class/color-formats.js';
import {Color, type ColorUpdate} from '../color-class/color.js';

/**
 * A slider for a specific color coordinate in a specific color space in a specific color.
 *
 * @category Elements
 */
export const VirColorSlider = defineElement<{
    color: Readonly<Color>;
    colorFormatName: ColorFormatName;
    colorCoordinateName: ColorCoordinateName;
}>()({
    tagName: 'vir-color-slider',
    cssVars: {
        'vir-color-slider-gradient': 'black',
    },
    styles: ({cssVars}) => css`
        :host {
            display: flex;
            align-items: center;
            font-family: ${viraFontCssVars['vira-monospace'].value};
            gap: 2px;
        }

        input[type='range'] {
            flex-grow: 1;
            appearance: none;
            background: ${cssVars['vir-color-slider-gradient'].value};
            height: 9px;
            border-radius: 4px;
            cursor: pointer;
        }

        ${ViraInput} {
            width: 76px;
        }

        .coordinate {
            font-size: 18px;
            margin-top: -4px;
        }
    `,
    events: {
        valueChange: defineElementEvent<number>(),
    },
    render({inputs, events, dispatch, cssVars}) {
        const formatDefinition: ColorFormatDefinition = colorFormats[inputs.colorFormatName];
        const coordinateDefinition = formatDefinition.coords[inputs.colorCoordinateName];

        if (!coordinateDefinition) {
            throw new Error(
                `Invalid color coordinate '${inputs.colorCoordinateName}' for color format '${inputs.colorFormatName}'`,
            );
        }

        const totalStops = 10;
        const colorStops: string[] = createArray(totalStops, (index) => {
            const value =
                coordinateDefinition.min +
                (coordinateDefinition.max - coordinateDefinition.min) * (index / totalStops);

            const stopColor = new Color({
                [inputs.colorFormatName]: {
                    ...inputs.color[inputs.colorFormatName],
                    [inputs.colorCoordinateName]: value,
                },
            } as ColorUpdate);

            return stopColor.toCss()[inputs.colorFormatName];
        });

        const gradient = css`linear-gradient(to right, ${unsafeCSS(colorStops.join(','))})`;

        const coordinateValue = assertWrap.isNumber(
            (
                inputs.color[inputs.colorFormatName] as Record<
                    ColorCoordinateName,
                    undefined | string | number
                >
            )[inputs.colorCoordinateName],
        );

        return html`
            <span class="coordinate">${inputs.colorCoordinateName.toUpperCase()}</span>
            <input
                type="range"
                style=${css`
                    ${cssVars['vir-color-slider-gradient'].name}: ${gradient};
                `}
                min=${coordinateDefinition.min}
                max=${coordinateDefinition.max}
                .value=${String(coordinateValue)}
                step=${Math.pow(10, coordinateDefinition.digits ? -coordinateDefinition.digits : 0)}
                ${listen('input', (event) => {
                    const element = extractEventTarget(event, HTMLInputElement);
                    const newValue = Number(element.value);
                    if (isNaN(newValue)) {
                        return;
                    }

                    dispatch(new events.valueChange(newValue));
                })}
            />
            <${ViraInput.assign({
                value: String(coordinateValue),
            })}
                ${listen(ViraInput.events.valueChange, (event) => {
                    const newValue = Number(event.detail);
                    if (isNaN(newValue)) {
                        return;
                    }

                    dispatch(new events.valueChange(newValue));
                })}
            ></${ViraInput}>
        `;
    },
});
