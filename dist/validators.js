/**
 *  validation handler functions
 *
 */
function required(data) {
    if (data.input.trim().length === 0)
        return { is_valid: false, message: "Please fill out this field" };
    return { is_valid: true };
}
function alpha(data) {
    const regexp = new RegExp("^[A-Za-z ]*$");
    const is_valid = regexp.test(data.input);
    if (!is_valid)
        return { is_valid, message: "Please enter alphabets only" };
    return { is_valid };
}
function num(data) {
    const regexp = new RegExp("^[0-9]+.[0-9]+$");
    const is_valid = regexp.test(data.input);
    if (!is_valid)
        return { is_valid, message: "Please enter numbers only" };
    return { is_valid };
}
function alphanumeic(data) {
    const regexp = new RegExp("^[0-9A-Za-z ]*$");
    const is_valid = regexp.test(data.input);
    if (!is_valid)
        return { is_valid, message: "Please enter alphabets or numbers only" };
    return { is_valid };
}
function minlength(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-minlength validator");
    const is_valid = data.input.length >= parseInt(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter atleast ${data.validator_value} characters`,
        };
    return { is_valid };
}
function maxlength(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-maxlength validator");
    const is_valid = data.input.length <= parseInt(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter ${data.validator_value} or fewer characters`,
        };
    return { is_valid };
}
function min(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-min validator");
    const is_valid = parseFloat(data.input) >= parseFloat(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter a value greater than or equal to ${data.validator_value}`,
        };
    return { is_valid };
}
function max(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-max validator");
    const is_valid = parseFloat(data.input) <= parseFloat(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter a value less than or equal to ${data.validator_value}`,
        };
    return { is_valid };
}
function same(data) {
    const target_selector = `form input[for='${data.validator_value}']`;
    const target_input = document.querySelector(target_selector);
    if (!target_input)
        throw new Error(`Target element with selector ${target_selector} not found`);
    if (target_input.value !== data.input)
        return {
            is_valid: false,
            message: `Input value does not match target ${data.validator_value} field`,
        };
    return { is_valid: true };
}
export default {
    required,
    alpha,
    num,
    alphanumeic,
    minlength,
    maxlength,
    min,
    max,
    same,
};
