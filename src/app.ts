// Validation
interface Validatable{
    value: string | number;
    required?: boolean;
    minimumLenght?: number;
    maxmimumLenght?: number;
    minimum?: number;
    maximum?: number;
}

function validate(ValidatableInput: Validatable){
    let isValid = true;

    if(ValidatableInput.required){
        isValid = isValid && ValidatableInput.value.toString().trim().length !== 0
    } 
    if(ValidatableInput.minimumLenght != null && ValidatableInput.value === 'string'){
        isValid = isValid && ValidatableInput.value.length >= ValidatableInput.minimumLenght;
    }
    if(ValidatableInput.maxmimumLenght != null && ValidatableInput.value === 'string'){
        isValid = isValid && ValidatableInput.value.length <= ValidatableInput.maxmimumLenght;
    }
    if(ValidatableInput.minimum != null && typeof ValidatableInput.value === 'number'){
        isValid = isValid && ValidatableInput.value >= ValidatableInput.minimum;
    }
    if(ValidatableInput.maximum != null && typeof ValidatableInput.value === 'number'){
        isValid = isValid && ValidatableInput.value <= ValidatableInput.maximum;
    }

    return isValid;
}

// autoBind decorator

function autoBind(_: any, _2: string, descriptor: PropertyDescriptor){

    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get () {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

// ProjectInput Class 
class ProjectInput{
    templateElement: HTMLTemplateElement;
    hostElement: HTMLElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor () {
        this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
        this.hostElement = document.getElementById("app")! as HTMLElement;
        
        const importNode = document.importNode(this.templateElement.content, true);

        this.element = importNode.firstElementChild as HTMLFormElement;
        this.element.id = "user-input";

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.atttached();
    }

    private gatherUserInput(): [string,string,number] | void{

        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descriptionValidable: Validatable = {
            value: enteredDescription,
            required: true,
            minimumLenght: 5
        };
        const peopleValidable: Validatable = {
            value: +enteredPeople,
            required: true,
            minimum: 1,
            maximum: 5
        };

        if(
            !validate(titleValidable)||
            !validate(descriptionValidable)||
            !validate(peopleValidable)
        ){
            alert('Invalid input, please try again!!');
            return;
        }else{
            return[enteredTitle,enteredDescription,+enteredPeople];
        }
    }

    private clearInput () {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }

    @autoBind
    private submitHandle(event : Event){
        event.preventDefault();

        const userInput = this.gatherUserInput();
        if(Array.isArray(userInput)){
            const [title,desc,people] = userInput;
            console.log(title,desc,people);
            this.clearInput();
        }

    }

    private configure(){
        this.element.addEventListener('submit', this.submitHandle);
    }

    private atttached (){
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }

}
const trials = new ProjectInput();

