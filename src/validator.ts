/**
 *  data types i.e. interfaces
 *
 */
interface ValidationHandlerArgs {
  input: string;
  validator_value?: string | number;
}

interface ValidationDetail {
  error: string;
  handler(details: ValidationHandlerArgs): boolean;
}

/**
 *  registered validators
 *
 */
const validations: Map<String, ValidationDetail> = new Map([
  [
    "required",
    {
      error: "Please fill out this field",
      handler: validate__required,
    },
  ],
  [
    "alpha",
    {
      error: "Please enter alphabets and numbers only",
      handler: validate__alpha,
    },
  ],
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
function create_error_element(validation_name: string): HTMLElement {
  const error: HTMLElement = document.createElement("p");

  error.dataset.validator = validation_name;
  error.classList.add("error");

  const validation: ValidationDetail | undefined =
    validations.get(validation_name);

  if (validation) {
    error.innerText = validation.error;
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
function show_error(field: HTMLInputElement, validation_name: string): void {
  console.log("showing error :", validation_name);

  const error: HTMLElement = create_error_element(validation_name);
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
function validate__required(data: ValidationHandlerArgs): boolean {
  if (data.input.trim().length === 0) return false;
  return true;
}

function validate__alpha(data: ValidationHandlerArgs): boolean {
  const regexp = new RegExp("^[0-9A-Za-z]*$");
  return regexp.test(data.input);
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
      const known_validator: ValidationDetail | undefined =
        validations.get(validator);

      if (!known_validator) {
        console.warn(`Unrecognized validator: ${validator}`);
        results.push(false);
      }

      if (known_validator) {
        const is_valid = known_validator.handler({
          input: field_value,
          validator_value: value,
        });

        results.push(is_valid);

        if (!is_valid) {
          show_error(field, validator);
        }
      }
    }
  });

  return results.every((result) => result);
}
