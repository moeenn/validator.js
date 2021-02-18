import { ValidationDetail } from './types';

export default class Validator {
  private _form_element: HTMLElement;
  private _validations: Map<String, ValidationDetail> = new Map([
    ['required', {
      selector: '[data-required]',
      error: 'Please fill out this field',
    }],

    ['alpha', {
      selector: '[data-alpha]',
      regexp: new RegExp('^[0-9A-Za-z]*$'),
      error: 'Please enter alphabets and numbers only',
    }]
  ]);

  public constructor(element: HTMLElement) {
    this._form_element = element;
    this.validate();
  }

  public validate(): void {
    this._form_element.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      this._validations.forEach((value: ValidationDetail, key: String) => {
        this.test_validation(key, value);
      });

      console.log('Form Validated!');
    });
  }

  private test_validation(validation_name: String, validator: ValidationDetail): void {
    const selector: string = validator.selector;

    if (selector) {
      const fields = this._form_element.querySelectorAll<HTMLInputElement>(selector);
      fields.forEach(field => {
        const value: string = field.value;
        const validation: ValidationDetail | undefined = this._validations.get(validation_name);

        if (validation && validation.regexp) {
          const is_valid = validation.regexp.test(value);
          if (!is_valid) {
            this.show_error(field, validation_name);
          } else {
            this.remove_error(field);
          }
        }
      });
    }
  }

  private show_error(field: HTMLElement, validation_name: String): void {
    const para = document.createElement('p');
    para.classList.add('error');

    const validation: ValidationDetail | undefined = this._validations.get(validation_name); 
    if (validation) {
      para.innerText = validation.error;
    }

    const parent: HTMLElement | null = field.parentElement;
    if (parent) {
      parent.appendChild(para);
    }
  }

  private remove_error(field: HTMLElement): void {
    const parent = field.parentElement;
    if (parent) {
      const error_msgs = parent.querySelectorAll<HTMLElement>('.error');
      if (error_msgs) {
        error_msgs.forEach(msg => {
          msg.remove();
        });
      }
    }
  }
}