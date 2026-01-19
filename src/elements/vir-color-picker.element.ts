/* node:coverage disable */

import {checkWrap} from '@augment-vir/assert';
import {getObjectTypedValues, type PartialWithUndefined} from '@augment-vir/common';
import {css, defineElement, defineElementEvent, html, listen, nothing} from 'element-vir';
import {CssVarSyntaxName} from 'lit-css-vars';
import {
    Copy24Icon,
    noNativeFormStyles,
    viraFontCssVars,
    viraFormCssVars,
    ViraIcon,
    ViraInput,
    ViraPopUpTrigger,
    ViraSelect,
    viraShadows,
    type ViraSelectOption,
} from 'vira';
import {ColorFormatName, colorFormats} from '../data/color-class/color-formats.js';
import {Color} from '../data/color-class/color.js';
import {colorLocalStorageClient} from '../data/local-storage.client.js';
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
 * Set the width and height of the swatch using the provided CSS variables.
 *
 * @category Elements
 */
export const VirColorPicker = defineElement<
    Readonly<
        {
            color: string | Readonly<Color> | undefined;
        } & PartialWithUndefined<{
            alwaysShowPicker: boolean;
            showHexValue: boolean;
        }>
    >
>()({
    tagName: 'vir-color-picker',
    cssVars: {
        'vir-color-picker-swatch-width': {
            default: '100px',
            syntax: CssVarSyntaxName.Length,
        },
        'vir-color-picker-swatch-height': {
            default: '100px',
            syntax: CssVarSyntaxName.Length,
        },
    },
    state() {
        return {
            selectedFormatName: colorLocalStorageClient.get.lastFormat() || ColorFormatName.rgb,
            rawInput: undefined as undefined | string,
        };
    },
    hostClasses: {
        'vir-color-picker-always-show': ({inputs}) => !!inputs.alwaysShowPicker,
    },
    styles: ({cssVars, hostClasses}) => css`
        :host {
            display: inline-flex;
        }

        ${hostClasses['vir-color-picker-always-show'].selector} {
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        button {
            ${noNativeFormStyles}
            cursor: pointer;
            display: flex;
        }

        ${ViraPopUpTrigger} {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
        }

        .swatch-wrapper {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: center;

            & ${VirColorSwatch} {
                width: ${cssVars['vir-color-picker-swatch-width'].value};
                height: ${cssVars['vir-color-picker-swatch-height'].value};
                box-sizing: border-box;
            }
        }

        .code-button {
            font-family: ${viraFontCssVars['vira-monospace'].value};
            font-size: 12px;
            color: #666;
            display: flex;
            justify-content: center;
            gap: 2px;
            align-items: center;

            & ${ViraIcon} {
                width: 18px;
                aspect-ratio: 1;
            }

            &:hover {
                color: #000;
            }

            &:active {
                color: dodgerblue;
            }
        }

        .picker {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 16px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
        }

        .pop-up .picker {
            ${viraShadows.menuShadow}
        }

        .raw-input-wrapper {
            text-align: left;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 12px;
            ${viraFormCssVars['vira-form-border-color'].name}: #ddd;
            color: #666;

            & ${ViraInput} {
                flex-grow: 1;
                width: unset;
                color: inherit;
                height: 20px;
                border: none;
            }
        }
    `,
    events: {
        colorChange: defineElementEvent<string>(),
    },
    render({inputs, dispatch, events, state, updateState}) {
        const color: Readonly<Color> = Color.isColor(inputs.color)
            ? inputs.color
            : new Color(inputs.color || 'black');
        const formatDefinition = colorFormats[state.selectedFormatName];

        const rawInput = state.rawInput ?? color.toCss()[formatDefinition.rawSyntax];

        const rawInputTemplate = html`
            <div class="raw-input-wrapper">
                <${ViraInput.assign({
                    value: rawInput,
                })}
                    ${listen(ViraInput.events.valueChange, (event) => {
                        const rawInput = event.detail;
                        updateState({
                            rawInput,
                        });
                        if (Color.isValidColorString(rawInput)) {
                            dispatch(new events.colorChange(rawInput));
                        }
                    })}
                ></${ViraInput}>
                <button
                    class="code-button"
                    ${listen('click', async () => {
                        await globalThis.navigator.clipboard.writeText(rawInput);
                    })}
                >
                    <${ViraIcon.assign({
                        icon: Copy24Icon,
                        fitContainer: true,
                    })}></${ViraIcon}>
                </button>
            </div>
        `;

        const hexValueTemplate = html`
            <button
                class="code-button"
                ${listen('click', async () => {
                    await globalThis.navigator.clipboard.writeText(color.hexString);
                })}
            >
                <span>${color.hexString}</span>
                <${ViraIcon.assign({
                    icon: Copy24Icon,
                    fitContainer: true,
                })}></${ViraIcon}>
            </button>
        `;

        const swatchTemplate = html`
            <div class="swatch-wrapper">
                <${VirColorSwatch.assign({
                    backgroundColor: color,
                })}></${VirColorSwatch}>
                ${inputs.showHexValue ? hexValueTemplate : nothing}
            </div>
        `;

        const pickerTemplate = html`
            <div class="picker">
                <${ViraSelect.assign({
                    options: colorFormatOptions,
                    value: state.selectedFormatName,
                })}
                    ${listen(ViraSelect.events.valueChange, (event) => {
                        const selectedFormat = checkWrap.isEnumValue(event.detail, ColorFormatName);
                        if (selectedFormat) {
                            updateState({
                                selectedFormatName: selectedFormat,
                            });
                            colorLocalStorageClient.set.lastFormat(selectedFormat);
                        }
                    })}
                ></${ViraSelect}>
                ${rawInputTemplate}
                <${VirColorFormatSliders.assign({
                    color,
                    colorFormatName: state.selectedFormatName,
                    showFormatName: false,
                })}
                    ${listen(VirColorFormatSliders.events.colorChange, (event) => {
                        dispatch(new events.colorChange(event.detail));
                        updateState({
                            rawInput: undefined,
                        });
                    })}
                ></${VirColorFormatSliders}>
            </div>
        `;

        if (inputs.alwaysShowPicker) {
            return html`
                ${swatchTemplate} ${pickerTemplate}
            `;
        } else {
            return html`
                <${ViraPopUpTrigger.assign({
                    keepOpenAfterInteraction: true,
                })}>
                    <button
                        class="trigger"
                        slot=${ViraPopUpTrigger.slotNames.trigger}
                        ${listen('mousedown', () => {
                            const storedFormat = colorLocalStorageClient.get.lastFormat();
                            if (storedFormat) {
                                updateState({
                                    selectedFormatName: storedFormat,
                                });
                            }
                        })}
                    >
                        ${swatchTemplate}
                    </button>
                    <div class="pop-up" slot=${ViraPopUpTrigger.slotNames.popUp}>
                        ${pickerTemplate}
                    </div>
                </${ViraPopUpTrigger}>
            `;
        }
    },
});
