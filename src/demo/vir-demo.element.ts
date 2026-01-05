/* node:coverage disable */

import {ElementBookApp, ElementBookSlotName} from 'element-book';
import {css, defineElement, html} from 'element-vir';
import {noNativeSpacing} from 'vira';
import {allBookPages} from './all-book-pages.js';

export const VirDemo = defineElement()({
    tagName: 'vir-demo',
    styles: css`
        :host {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            box-sizing: border-box;
        }

        ${ElementBookApp} {
            flex-grow: 1;
            max-width: 100%;
            box-sizing: border-box;
        }

        h1 {
            ${noNativeSpacing};
            font-size: 16px;
            margin-bottom: 16px;
            text-align: center;
        }
    `,
    render() {
        return html`
            <${ElementBookApp.assign({
                pages: allBookPages,
                internalRouterConfig: {
                    useInternalRouter: true,
                    basePath: 'color',
                },
            })}>
                <h1 slot=${ElementBookSlotName.NavHeader}>@electrovir/color</h1>
            </${ElementBookApp}>
        `;
    },
});
