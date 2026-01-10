import {LocalStorageClient} from '@electrovir/local-storage-client';
import {enumShape} from 'object-shape-tester';
import {ColorFormatName} from './color-class/color-formats.js';

export const colorLocalStorageClient = new LocalStorageClient({
    lastFormat: enumShape(ColorFormatName),
});
