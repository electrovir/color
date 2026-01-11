/* node:coverage disable */

import {defineBookPage} from 'element-book';
import {html, listen} from 'element-vir';
import {elementsBookPage} from '../demo/top-level-pages.js';
import {VirAllSpacesColorPicker} from './vir-all-spaces-color-picker.element.js';

export const virAllSpacesColorPickerBookPage = defineBookPage({
    parent: elementsBookPage,
    title: VirAllSpacesColorPicker.tagName,
    defineExamples({defineExample}) {
        defineExample({
            title: 'basic',
            state() {
                return {
                    currentColor: '#3498db',
                };
            },
            render({state, updateState}) {
                return html`
                    <${VirAllSpacesColorPicker.assign({
                        color: state.currentColor,
                    })}
                        ${listen(VirAllSpacesColorPicker.events.colorChange, (event) => {
                            updateState({currentColor: event.detail});
                        })}
                    ></${VirAllSpacesColorPicker}>
                `;
            },
        });
    },
});
