import { inputValidate } from '../client/js/inputValidate';

describe('Validate URL function', () => {
    test('It should return either true or false depending on if the URL entered is valid', () => {
        const validFormInputElement = document.createElement('input');
        validFormInputElement.value = 'Manchester';
        expect(inputValidate([validFormInputElement])).toBeTruthy();

        const invalidFormInputElement = document.createElement('input');
        invalidFormInputElement.value = '';
        expect(inputValidate([invalidFormInputElement])).toBeFalsy();
    });
});
