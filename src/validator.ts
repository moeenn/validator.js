import { ValidationHandler, ValidationHandlerResult, KnownValidator } from "./types";
import validators from "./validators";

/**
 *  registered validators
 *
 */
const validations: Map<String, KnownValidator> = new Map([
  ["required", { handler: validators.required, priority: 0 }],
  ["alpha", { handler: validators.alpha, priority: 1 }],
  ["num", { handler: validators.num, priority: 1 }],
  ["alphanumeric", { handler: validators.alphanumeic, priority: 1 }],
  ["minlength", { handler: validators.minlength, priority: 2 }],
  ["maxlength", { handler: validators.maxlength, priority: 2 }],
  ["min", { handler: validators.min, priority: 2 }],
  ["max", { handler: validators.max, priority: 2 }],
  ["same", { handler: validators.same, priority: 1 }],
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

  const validator: KnownValidator | undefined =
    validations.get(validation_name);

  if (validator) {
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
 *  entrypoint to the module
 *
 */
export default function validate(form: HTMLElement): boolean {
  const inputs: Array<HTMLInputElement> = get_form_fields(form);

  clear_previous_errors(form);
  const results: Array<boolean> = [];

  for (const field of inputs) {
    const applied_validators: DOMStringMap = field.dataset;
    const field_value: string = field.value;

    for (const [validator, value] of Object.entries(applied_validators)) {
      const known_validator: KnownValidator | undefined =
        validations.get(validator);

      if (!known_validator) {
        console.warn(`Unrecognized validator: ${validator}`);
        results.push(false);
      }

      if (known_validator) {
        const result: ValidationHandlerResult = known_validator.handler({
          input: field_value,
          validator_value: value,
        });

        results.push(result.is_valid);

        if (!result.is_valid && result.message) {
          show_error(field, validator, result.message);
        }
      }
    }
  }

  return results.every((result) => result);
}