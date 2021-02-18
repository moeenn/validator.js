import { ValidationDetail } from "./types";

export default class Validator {
  private _form_element: HTMLElement;
  private _fields: NodeListOf<HTMLInputElement>;
  private _validations: Map<String, ValidationDetail> = new Map([
    [
      "required",
      {
        selector: "[data-required]",
        error: "Please fill out this field",
        handler: this.validate_required,
      },
    ],
    [
      "alpha",
      {
        selector: "[data-alpha]",
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

      this._fields.forEach((field: HTMLInputElement): void => {
        const applied_validators: DOMStringMap = field.dataset;
        const value: string = field.value;
        for (const validator in applied_validators) {
          const know_validator: ValidationDetail | undefined = this._validations.get(validator);
          if (know_validator) {
            const is_valid = know_validator.handler(value);
            if (!is_valid) {
              this.show_error(field, validator);
            } else {
              this.remove_error(field);
            }
          }
        }
      })

      console.log("Form Validated!");
    });
  }

  /**
   *  show / hide validation errors from DOM
   *
   */
  private show_error(field: HTMLInputElement, validation_name: String): void {
    const para = document.createElement("p");
    para.classList.add("error");

    const validation: ValidationDetail | undefined = this._validations.get(
      validation_name
    );
    if (validation) {
      para.innerText = validation.error;
    }

    const parent: HTMLElement | null = field.parentElement;
    if (parent) {
      parent.appendChild(para);
    }
  }

  private remove_error(field: HTMLInputElement): void {
    const parent = field.parentElement;
    if (parent) {
      const error_msgs = parent.querySelectorAll<HTMLElement>(".error");
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
  private validate_required(value: string): boolean {
    if (value.trim().length === 0) return false;
    return true;
  }

  private validate_alpha(value: string): boolean {
    const regexp = new RegExp("^[0-9A-Za-z]*$");
    return regexp.test(value);
  }
}
