/* node:coverage disable */

import {checkWrap} from '@augment-vir/assert';
import {getObjectTypedValues} from '@augment-vir/common';
import {css, defineElement, defineElementEvent, html, listen, onResize} from 'element-vir';
import {setCssVarValue} from 'lit-css-vars';
import {ViraPopUpTrigger, ViraSelect, viraShadows, type ViraSelectOption} from 'vira';
import {
    ColorFormatName,
    type ColorFormatName as ColorFormatNameType,
} from '../color-class/color-formats.js';
import {Color} from '../color-class/color.js';
import {VirColorFormatSliders} from './vir-color-format-sliders.element.js';
import {VirColorSwatch} from './vir-color-swatch.element.js';

const colorFormatOptions: ReadonlyArray<Readonly<ViraSelectOption>> = getObjectTypedValues(
    ColorFormatName,
).map((formatName) => ({
    value: formatName,
    label: formatName.toUpperCase(),
}));

/**
 * A color picker element with a swatch that opens a popup with color format sliders.
 *
 * @category Elements
 */
export const VirColorPicker = defineElement<{
    color: string | Readonly<Color> | undefined;
}>()({
    tagName: 'vir-color-picker',
    cssVars: {
        'vir-color-picker-width': '100px',
        'vir-color-picker-height': '100px',
    },
    styles: ({cssVars}) => css`
        :host {
            display: inline-block;
        }

        ${ViraPopUpTrigger} {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        ${VirColorSwatch} {
            width: ${cssVars['vir-color-picker-width'].value};
            height: ${cssVars['vir-color-picker-height'].value};
            cursor: pointer;
            box-sizing: border-box;
        }

        .popup-content {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 16px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            ${viraShadows.menuShadow}
        }
    `,
    events: {
        colorChange: defineElementEvent<string>(),
    },
    state() {
        return {
            selectedFormatName: ColorFormatName.rgb as ColorFormatNameType,
        };
    },
    render({inputs, dispatch, events, state, updateState, host, cssVars}) {
        const color: Readonly<Color> = Color.isColor(inputs.color)
            ? inputs.color
            : new Color(inputs.color || 'black');

        return html`
            <${ViraPopUpTrigger.assign({
                keepOpenAfterInteraction: true,
            })}
                ${onResize((size) => {
                    setCssVarValue({
                        onElement: host,
                        forCssVar: cssVars['vir-color-picker-width'],
                        toValue: `${size.contentRect.width}px`,
                    });
                    setCssVarValue({
                        onElement: host,
                        forCssVar: cssVars['vir-color-picker-height'],
                        toValue: `${size.contentRect.height}px`,
                    });
                })}
            >
                <${VirColorSwatch.assign({
                    backgroundColor: color,
                })}
                    slot=${ViraPopUpTrigger.slotNames.trigger}
                ></${VirColorSwatch}>
                <div class="popup-content" slot=${ViraPopUpTrigger.slotNames.popUp}>
                    <${ViraSelect.assign({
                        options: colorFormatOptions,
                        value: state.selectedFormatName,
                    })}
                        ${listen(ViraSelect.events.valueChange, (event) => {
                            const selectedFormat = checkWrap.isEnumValue(
                                event.detail,
                                ColorFormatName,
                            );
                            if (selectedFormat) {
                                updateState({
                                    selectedFormatName: selectedFormat,
                                });
                            }
                        })}
                    ></${ViraSelect}>
                    <${VirColorFormatSliders.assign({
                        color,
                        colorFormatName: state.selectedFormatName,
                    })}
                        ${listen(VirColorFormatSliders.events.colorChange, (event) => {
                            dispatch(new events.colorChange(event.detail));
                        })}
                    ></${VirColorFormatSliders}>
                </div>
            </${ViraPopUpTrigger}>
        `;
    },
});
