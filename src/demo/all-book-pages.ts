import {type BookPage} from 'element-book';
import {virAllSpacesColorPickerBookPage} from '../elements/vir-all-spaces-color-picker.element.book.js';
import {virColorPairContrastSummaryBookPage} from '../elements/vir-color-pair-contrast-summary.element.book.js';
import {virColorPairBookPage} from '../elements/vir-color-pair.element.book.js';
import {virColorPickerBookPage} from '../elements/vir-color-picker.element.book.js';
import {colorExamplesPage} from './color-examples.book.js';
import {elementsBookPage, examplesBookPage} from './top-level-pages.js';

export const allBookPages: BookPage[] = [
    elementsBookPage,
    examplesBookPage,

    colorExamplesPage,
    virAllSpacesColorPickerBookPage,
    virColorPairBookPage,
    virColorPairContrastSummaryBookPage,
    virColorPickerBookPage,
];
