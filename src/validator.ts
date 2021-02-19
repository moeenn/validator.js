import { ValidationDetail } from "./types";

export default class Validator {
  private _form_element: HTMLElement;
  private _fields: NodeListOf<HTMLInputElement>;
  private _validations: Map<String, ValidationDetail> = new Map([
    [
      "required",
      {
        error: "Please fill out this field",
        handler: this.validate_required,
      },
    ],
    [
      "alpha",
      {
        error: "Please enter alphabets and numbers only",
        handler: this.validate_alpha,
      },
    ],
  ]);

  public constructor(element: HTMLElement) {
    this._form_element = element;
    this._fields = this.get_input_fields();
  }

  /**
   *  get all fields in form except submit button
   *
   */
  private get_input_fields(): NodeListOf<HTMLInputElement> {
    return this._form_element.querySelectorAll<HTMLInputElement>(
      "input:not([type='submit'])"
    );
  }

  public validate(): void {
    this._form_element.addEventListener("submit", (e: Event) => {
      e.preventDefault();
      this._fields = this.get_input_fields();

      this._fields.forEach(field => {
        const applied_validators: DOMStringMap = field.dataset;
        const value: string = field.value;
  
        for (const validator in applied_validators) {
          const know_validator:
            | ValidationDetail
            | undefined = this._validations.get(validator);
          if (know_validator) {
            const is_valid = know_validator.handler(value);
            console.log(validator, is_valid);
            if (!is_valid) {
              this.show_error(field, validator);
            } else {
              this.remove_error(field);
            }
          }
        }
      });

      console.log("Form Validated!");
    });
  }

  /**
   *  create element containing error message for insertion into DOM
   *
   */
  private create_error_element(validation_name: String): HTMLElement {
    const error: HTMLElement = document.createElement("p");
    error.classList.add("error");

    const validation: ValidationDetail | undefined = this._validations.get(
      validation_name
    );

    if (validation) {
      error.innerText = validation.error;
    }

    return error;
  }

  /**
   *  show / hide validation errors from DOM
   *
   */
  private show_error(field: HTMLInputElement, validation_name: String): void {
    const error: HTMLElement = this.create_error_element(validation_name);
    const parent: HTMLElement | null = field.parentElement;

    if (parent) {
      if (!this.contains_error(parent, error)) {
        /**
         *  for some reason parent.appendChild(error)
         *  isn't working
        */
        const error_html: string = error.outerHTML;
        parent.innerHTML += error_html;
      }
    }
  }

  /**
   *  check if a particular error is already being shown on a field
   *
   */
  private contains_error(parent: HTMLElement, element: HTMLElement): boolean {
    const current_errors:
      | NodeListOf<HTMLElement>
      | undefined = parent.querySelectorAll<HTMLElement>(".error");
    let flag: boolean = false;

    if (current_errors.length === 0) flag = false;

    current_errors.forEach((error) => {
      if (error.isEqualNode(element)) flag = true;
    });

    return flag;
  }

  private remove_error(field: HTMLInputElement): void {
    const parent = field.parentElement;
    if (parent) {
      const error_msgs: NodeListOf<HTMLElement> | null = parent.querySelectorAll<HTMLElement>(
        ".error"
      );

      if (error_msgs) {
        error_msgs.forEach((msg) => {
          msg.remove();
        });
      }
    }
  }

  /**
   *  validation handler functions
   *
   */
  private validate_required(input: string): boolean {
    if (input.trim().length === 0) return false;
    return true;
  }

  private validate_alpha(value: string): boolean {
    const regexp = new RegExp("^[0-9A-Za-z]*$");
    return regexp.test(value);
  }
}
