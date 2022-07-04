"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function validate(ValidatableInput) {
    let isValid = true;
    if (ValidatableInput.required) {
        isValid = isValid && ValidatableInput.value.toString().trim().length !== 0;
    }
    if (ValidatableInput.minimumLenght != null && ValidatableInput.value === 'string') {
        isValid = isValid && ValidatableInput.value.length >= ValidatableInput.minimumLenght;
    }
    if (ValidatableInput.maxmimumLenght != null && ValidatableInput.value === 'string') {
        isValid = isValid && ValidatableInput.value.length <= ValidatableInput.maxmimumLenght;
    }
    if (ValidatableInput.minimum != null && typeof ValidatableInput.value === 'number') {
        isValid = isValid && ValidatableInput.value >= ValidatableInput.minimum;
    }
    if (ValidatableInput.maximum != null && typeof ValidatableInput.value === 'number') {
        isValid = isValid && ValidatableInput.value <= ValidatableInput.maximum;
    }
    return isValid;
}
function autoBind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild;
        this.element.id = "user-input";
        this.titleInputElement = this.element.querySelector('#title');
        this.descriptionInputElement = this.element.querySelector('#description');
        this.peopleInputElement = this.element.querySelector('#people');
        this.configure();
        this.atttached();
    }
    gatherUserInput() {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidable = {
            value: enteredDescription,
            required: true,
            minimumLenght: 5
        };
        const peopleValidable = {
            value: +enteredPeople,
            required: true,
            minimum: 1,
            maximum: 5
        };
        if (!validate(titleValidable) ||
            !validate(descriptionValidable) ||
            !validate(peopleValidable)) {
            alert('Invalid input, please try again!!');
            return;
        }
        else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }
    clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    submitHandle(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, desc, people] = userInput;
            console.log(title, desc, people);
            this.clearInput();
        }
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandle);
    }
    atttached() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}
__decorate([
    autoBind
], ProjectInput.prototype, "submitHandle", null);
const trials = new ProjectInput();
//# sourceMappingURL=app.js.map