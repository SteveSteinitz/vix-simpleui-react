import $ from 'jquery';
import 'jquery-validation';

export const validate = (form, options) => $(form).validate(options);
export const valid = form => $(form).valid();
