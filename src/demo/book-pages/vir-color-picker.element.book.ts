/* node:coverage disable */

import {defineBookPage} from 'element-book';
import {css, defineElement, html, listen} from 'element-vir';
import {VirColorPicker} from '../../elements/vir-color-picker.element.js';
import {elementsBookPage} from '../top-level-pages.js';

const VirAnimatedSizeWrapper = defineElement()({
    tagName: 'vir-animated-size-wrapper',
    styles: css`
        :host {
            display: block;
            animation: resize 3s ease-in-out infinite alternate;
        }

        @keyframes resize {
            0% {
                width: 50px;
                height: 50px;
            }
            100% {
                width: 200px;
                height: 200px;
            }
        }
    `,
    render() {
        return html`
            <slot></slot>
        `;
    },
});

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
                            updateState({currentColor: event.detail});
                        })}
                    ></${VirColorPicker}>
                `;
            },
        });
        defineExample({
            title: 'resized',
            styles: css`
                ${VirColorPicker} {
                    width: 50px;
                    height: 50px;
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
                            updateState({currentColor: event.detail});
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
                ${VirColorPicker} {
                    width: 100%;
                    height: 100%;
                    border: 1px solid black;
                }

                .max-size {
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
                        <${VirAnimatedSizeWrapper}>
                            <${VirColorPicker.assign({
                                color: state.currentColor,
                            })}
                                ${listen(VirColorPicker.events.colorChange, (event) => {
                                    updateState({currentColor: event.detail});
                                })}
                            ></${VirColorPicker}>
                        </${VirAnimatedSizeWrapper}>
                    </div>
                `;
            },
        });
    },
});
