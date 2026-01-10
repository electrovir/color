/* node:coverage disable */

import {defineBookPage} from 'element-book';
import {html, listen} from 'element-vir';
import {Color} from '../data/color-class/color.js';
import {elementsBookPage} from '../demo/top-level-pages.js';
import {VirAllColorSpaceSliders} from './vir-all-color-space-sliders.element.js';

export const virAllColorSpaceSlidersBookPage = defineBookPage({
    parent: elementsBookPage,
    title: VirAllColorSpaceSliders.tagName,
    defineExamples({defineExample}) {
        defineExample({
            title: 'basic',
            state() {
                return {
                    currentColor: new Color('#3498db'),
                };
            },
            render({state, updateState}) {
                return html`
                    <${VirAllColorSpaceSliders.assign({
                        color: state.currentColor,
                    })}
                        ${listen(VirAllColorSpaceSliders.events.colorChange, (event) => {
                            updateState({currentColor: new Color(event.detail)});
                        })}
                    ></${VirAllColorSpaceSliders}>
                `;
            },
        });
    },
});
