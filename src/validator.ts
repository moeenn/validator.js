/**
 *  data types i.e. interfaces
 *
 */
interface ValidationHandlerArgs {
  input: string;
  validator_value?: string;
}

type ValidationHandler = (
  details: ValidationHandlerArgs
) => ValidationHandlerResult;

interface ValidationHandlerResult {
  is_valid: boolean;
  message?: string;
}

/**
 *  registered validators
 *
 */
const validations: Map<String, ValidationHandler> = new Map([
  ["required", validate__required],
  ["alpha", validate__alpha],
  ["minlength", validate__minlength],
  ["same", validate__same],
]);

/**
 *  get all input fields from the provided form
 *
 */
function get_form_fields(form: HTMLElement): Array<HTMLInputElement> {
  const inputs: NodeListOf<HTMLInputElement> =
    form.querySelectorAll<HTMLInputElement>("input:not(input[type='submit'])");

  if (!inputs)
    throw new Error("Provided form does not have any valid input fields");

  return [...inputs];
}

/**
 *  clear all previous errors in the form
 *
 */
function clear_previous_errors(form: HTMLElement): void {
  const errors: NodeListOf<HTMLElement> =
    form.querySelectorAll<HTMLElement>("[data-validator]");

  errors.forEach((error: HTMLElement) => error.remove());
}

/**
 *  create element containing error message for insertion into DOM
 *
 */
function create_error_element(
  validation_name: string,
  error_message: string
): HTMLElement {
  const error: HTMLElement = document.createElement("p");

  error.dataset.validator = validation_name;
  error.classList.add("error");

  const handler: ValidationHandler | undefined =
    validations.get(validation_name);

  if (handler) {
    error.innerText = error_message;
  }

  return error;
}

/**
 *  check if a particular error is already being shown on a field
 *
 */
function contains_error(parent: HTMLElement, validation_name: string): boolean {
  const current_errors: NodeListOf<HTMLElement> | undefined =
    parent.querySelectorAll<HTMLElement>(".error");

  if (current_errors.length === 0) return false;

  return (
    [...current_errors].findIndex((error: HTMLElement) => {
      return error.dataset.validation_name === validation_name;
    }) !== -1
  );
}

/**
 *  show / hide validation errors from DOM
 *
 */
function show_error(
  field: HTMLInputElement,
  validation_name: string,
  error_message: string
): void {
  const error: HTMLElement = create_error_element(
    validation_name,
    error_message
  );
  const parent: HTMLElement | null = field.parentElement;

  if (parent) {
    if (!contains_error(parent, validation_name)) {
      parent.appendChild(error);
    }
  }
}

/**
 *  validation handler functions
 *
 */
function validate__required(
  data: ValidationHandlerArgs
): ValidationHandlerResult {
  if (data.input.trim().length === 0)
    return { is_valid: false, message: "Please fill out this field" };

  return { is_valid: true };
}

function validate__alpha(data: ValidationHandlerArgs): ValidationHandlerResult {
  const regexp = new RegExp("^[0-9A-Za-z]*$");
  const is_valid: boolean = regexp.test(data.input);

  if (!is_valid)
    return { is_valid, message: "Please enter alphabets or numbers only" };

  return { is_valid };
}

function validate__minlength(
  data: ValidationHandlerArgs
): ValidationHandlerResult {
  if (!data.validator_value)
    throw new Error("No value provided for data-minlength validator");
  const is_valid: boolean = data.input.length >= parseInt(data.validator_value);

  if (!is_valid)
    return {
      is_valid,
      message: `Please enter atleast ${data.validator_value} characters`,
    };
  return { is_valid };
}

function validate__same(data: ValidationHandlerArgs): ValidationHandlerResult {
  const target_selector: string = `form input[for='${data.validator_value}']`;
  const target_input: HTMLInputElement | null =
    document.querySelector<HTMLInputElement>(target_selector);

  if (!target_input)
    throw new Error(
      `Target element with selector ${target_selector} not found`
    );

  if (target_input.value !== data.input)
    return {
      is_valid: false,
      message: `Input value does not match target ${data.validator_value} field`,
    };

  return { is_valid: true };
}

/**
 *  entrypoint to the module
 *
 */
export default function validate(form: HTMLElement): boolean {
  const inputs: Array<HTMLInputElement> = get_form_fields(form);

  clear_previous_errors(form);
  const results: Array<boolean> = [];

  inputs.forEach((field) => {
    const applied_validators: DOMStringMap = field.dataset;
    const field_value: string = field.value;

    for (const [validator, value] of Object.entries(applied_validators)) {
      const known_validator: ValidationHandler | undefined =
        validations.get(validator);

      if (!known_validator) {
        console.warn(`Unrecognized validator: ${validator}`);
        results.push(false);
      }

      if (known_validator) {
        const result: ValidationHandlerResult = known_validator({
          input: field_value,
          validator_value: value,
        });

        results.push(result.is_valid);

        if (!result.is_valid && result.message) {
          show_error(field, validator, result.message);
        }
      }
    }
  });

  return results.every((result) => result);
}
