/* node:coverage disable */

import {defineBookPage} from 'element-book';
import {css, html, listen} from 'element-vir';
import {elementsBookPage} from '../demo/top-level-pages.js';
import {VirColorPicker} from './vir-color-picker.element.js';

export const virColorPickerBookPage = defineBookPage({
    parent: elementsBookPage,
    title: VirColorPicker.tagName,
    defineExamples({defineExample}) {
        defineExample({
            title: 'basic',
            state() {
                return {
                    currentColor: undefined as string | undefined,
                };
            },
            render({state, updateState}) {
                return html`
                    <${VirColorPicker.assign({
                        color: state.currentColor,
                    })}
                        ${listen(VirColorPicker.events.colorChange, (event) => {
                            updateState({
                                currentColor: event.detail,
                            });
                        })}
                    ></${VirColorPicker}>
                `;
            },
        });
        defineExample({
            title: 'resized',
            styles: css`
                ${VirColorPicker} {
                    ${VirColorPicker.cssVars['vir-color-picker-swatch-width'].name}: 50px;
                    ${VirColorPicker.cssVars['vir-color-picker-swatch-height'].name}: 50px;
                }
            `,
            state() {
                return {
                    currentColor: undefined as string | undefined,
                };
            },
            render({state, updateState}) {
                return html`
                    <${VirColorPicker.assign({
                        color: state.currentColor,
                    })}
                        ${listen(VirColorPicker.events.colorChange, (event) => {
                            updateState({
                                currentColor: event.detail,
                            });
                        })}
                    ></${VirColorPicker}>
                `;
            },
        });
        defineExample({
            title: 'animated resize',
            descriptionParagraphs: [
                'Verifying that vir-color-picker automatically adjusts sizing.',
            ],
            styles: css`
                @keyframes resize {
                    0% {
                        ${VirColorPicker.cssVars['vir-color-picker-swatch-width'].name}: 50px;
                        ${VirColorPicker.cssVars['vir-color-picker-swatch-height'].name}: 50px;
                    }
                    100% {
                        ${VirColorPicker.cssVars['vir-color-picker-swatch-width'].name}: 200px;
                        ${VirColorPicker.cssVars['vir-color-picker-swatch-height'].name}: 200px;
                    }
                }

                ${VirColorPicker} {
                    border: 1px solid red;
                    animation: resize 2s ease-in-out infinite alternate;
                }

                .max-size {
                    display: block;
                    width: 200px;
                    height: 200px;
                }
            `,
            state() {
                return {
                    currentColor: undefined as string | undefined,
                };
            },
            render({state, updateState}) {
                return html`
                    <div class="max-size">
                        <${VirColorPicker.assign({
                            color: state.currentColor,
                        })}
                            ${listen(VirColorPicker.events.colorChange, (event) => {
                                updateState({
                                    currentColor: event.detail,
                                });
                            })}
                        ></${VirColorPicker}>
                    </div>
                `;
            },
        });
        defineExample({
            title: 'always show picker',
            state() {
                return {
                    currentColor: undefined as string | undefined,
                };
            },
            render({state, updateState}) {
                return html`
                    <${VirColorPicker.assign({
                        color: state.currentColor,
                        alwaysShowPicker: true,
                    })}
                        ${listen(VirColorPicker.events.colorChange, (event) => {
                            updateState({
                                currentColor: event.detail,
                            });
                        })}
                    ></${VirColorPicker}>
                `;
            },
        });
        defineExample({
            title: 'show hex',
            state() {
                return {
                    currentColor: undefined as string | undefined,
                };
            },
            render({state, updateState}) {
                return html`
                    <${VirColorPicker.assign({
                        color: state.currentColor,
                        alwaysShowPicker: true,
                        showHexValue: true,
                    })}
                        ${listen(VirColorPicker.events.colorChange, (event) => {
                            updateState({
                                currentColor: event.detail,
                            });
                        })}
                    ></${VirColorPicker}>
                `;
            },
        });
    },
});
