import {check} from '@augment-vir/assert';
import {filterMap, filterObject, mapObjectValues} from '@augment-vir/common';
import colorNames from 'color-name';

/**
 * The longest CSS color name. Used for color name padding calculations.
 *
 * @category Internal
 */
export const longestColorName = Object.keys(colorNames).reduce((longest, current) => {
    if (current.length > longest.length) {
        return current;
    } else {
        return longest;
    }
});

/**
 * All CSS color names with identical value matches to other CSS color names. Used for color name
 * padding calculations.
 *
 * @category Internal
 */
export const identicalColorNames = filterObject(
    mapObjectValues(colorNames, (colorName, rgbValues) => {
        const matches = filterMap(
            Object.entries(colorNames),
            ([colorName]) => colorName,
            (
                innerColorName,
                [
                    ,
                    innerRgbValues,
                ],
            ) => {
                if (innerColorName === colorName) {
                    return false;
                }

                return check.deepEquals(innerRgbValues, rgbValues);
            },
        );

        return matches;
    }),
    (colorName, matches) => !!matches.length,
);

/**
 * The longest collection of CSS color names with identical values. Used for color name padding
 * calculations.
 *
 * @category Internal
 */
export const longestIdenticalColorNames = Object.entries(identicalColorNames)
    .reduce((longest, current): [string, string[]] => {
        const longestString = [
            longest[0],
            ...longest[1],
        ].join(', ');
        const currentString = [
            current[0],
            ...current[1],
        ].join(', ');

        if (currentString.length > longestString.length) {
            return current;
        } else {
            return longest;
        }
    })
    .reduce((combined: string[], current): string[] => {
        if (check.isArray(current)) {
            return [
                ...combined,
                ...current,
            ];
        } else {
            return [
                ...combined,
                current,
            ];
        }
    }, [] as string[]);

/**
 * The maximum length that a single-value collection of matching CSS color names can be (when joined
 * with `', '`). Used for color name padding calculations.
 *
 * @category Internal
 */
export const maxColorNameLength = Math.max(
    longestColorName.length,
    longestIdenticalColorNames.length + (longestIdenticalColorNames.length - 1) * ', '.length,
);
