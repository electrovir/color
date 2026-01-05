/* node:coverage disable */

import {getObjectTypedEntries, omitObjectKeys} from '@augment-vir/common';
import {css, defineElement, defineElementEvent, html, listen} from 'element-vir';
import {defineTable, noNativeSpacing, viraFontCssVars, ViraInput} from 'vira';
import {Color} from '../color-class/color.js';
import {VirColorSwatch} from './vir-color-swatch.element.js';

/**
 * A color swatch alongside the color in all of its different supported formats.
 *
 * @category Internal
 */
export const VirColorDetails = defineElement<{
    color: string;
    /** Show a text input that triggers an event when it is edited, for changing the color. */
    showInput: boolean;
}>()({
    tagName: 'vir-color-details',
    styles: css`
        :host {
            display: flex;
            gap: 16px;
        }

        ${VirColorSwatch} {
            height: 200px;
            width: 200px;
        }

        .swatch {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: center;
        }

        ${ViraInput} {
            font-size: 14px;
            font-family: ${viraFontCssVars['vira-monospace'].value};
            max-width: 200px;
        }

        td {
            font-weight: bold;
        }

        th {
            padding: 4px 8px;
            font-weight: normal;
            text-align: right;
        }
        pre {
            ${noNativeSpacing};
            font-family: ${viraFontCssVars['vira-monospace'].value};
        }
    `,
    events: {
        colorChange: defineElementEvent<string>(),
    },
    state() {
        return {
            inputColorString: undefined as undefined | string,
        };
    },
    render({inputs, dispatch, events, state, updateState}) {
        const color = new Color(inputs.color);
        const colorStrings = omitObjectKeys(color.toFormattedStrings(), ['name']);

        if (state.inputColorString == undefined) {
            updateState({
                inputColorString: inputs.color,
            });
        }

        const {rows} = defineTable(
            [
                {
                    key: 'colorFormat',
                },
                {
                    key: 'formattedString',
                },
            ],
            getObjectTypedEntries(colorStrings),
            ([
                colorFormat,
                value,
            ]) => {
                return {
                    colorFormat: `${colorFormat}:`,
                    formattedString: html`
                        <pre>${value}</pre>
                    `,
                };
            },
        );

        const inputTemplate = inputs.showInput
            ? html`
                  <${ViraInput.assign({
                      value: state.inputColorString || '',
                      fitText: true,
                  })}
                      ${listen(ViraInput.events.valueChange, (event) => {
                          updateState({
                              inputColorString: event.detail,
                          });
                          dispatch(new events.colorChange(event.detail));
                      })}
                  ></${ViraInput}>
              `
            : '';

        return html`
            <div class="swatch">
                <${VirColorSwatch.assign({
                    backgroundColor: inputs.color,
                })}></${VirColorSwatch}>
                ${inputTemplate}
            </div>
            <table>
                <tbody>
                    ${rows.map((row) => {
                        const cells = row.cells.map((cell, index) => {
                            const element = index ? 'td' : 'th';

                            return html`
                                <${element}>${cell.content}</${element}>
                            `;
                        });

                        return html`
                            <tr>${cells}</tr>
                        `;
                    })}
                </tbody>
            </table>
        `;
    },
});
