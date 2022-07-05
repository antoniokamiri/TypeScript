// Drag and Drop Interface 
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

// Project Type
enum ProjectStatus{
    Active,
    Finished
}

class Project{
    constructor(public id: string, public title: string, public description: string, public people: number, public status: ProjectStatus){

    }
}

// Project State Management
type Listener<T> = (items : T []) => void;

class State<T>{
    protected listeners:Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}


class ProjectState extends State<Project>{
    private projects:Project[] = [];
    private static instance :ProjectState;

    private constructor(){
        super();
    }

    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }



    addProject(title: string, description: string, numOfPeople: number){

        const newProject = new Project(Math.random().toString(),title,description,numOfPeople,ProjectStatus.Active)
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(projectId: string, newStatus: ProjectStatus){
        const project = this.projects.find(p => p.id === projectId);
        if(project && project.status !== newStatus){
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners(){
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance();

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
// Components class

abstract class Component <T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor (templateId: string, hostElementId: string,insertAtStart: boolean, newElementId?: string){
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importNode = document.importNode(this.templateElement.content, true);

        this.element = importNode.firstElementChild as U;
        if(newElementId){
            this.element.id = newElementId;
        }

        this.atttached(insertAtStart);
    }

    private atttached (insertAtStart: boolean){
        this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin":"beforeend", this.element);
    }

    abstract configure (): void;
    abstract renderContent (): void;
}

// Project Item Class
class ProjectItem extends Component <HTMLUListElement, HTMLLIElement> implements Draggable {
    private project: Project;

    get persons (){
       if(this.project.people === 1){
        return '1 person';
       } else{
        return this.project.people.toString() + ' persons'
       }
    }

    constructor(hostId: string, project: Project){
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    @autoBind
    dragStartHandler(event: DragEvent): void {
       event.dataTransfer!.setData('text/plain', this.project.id);
       event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_: DragEvent): void {
        console.log('Drag End')
    }

    configure(): void {
        this.element.addEventListener('dragstart', this.dragStartHandler);
        this.element.addEventListener('dragend', this.dragEndHandler);
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assgined';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

// Project List Clas
class ProjectList extends Component<HTMLDivElement,HTMLElement> implements DragTarget{
    assignedProject: Project[];

    constructor (private type: 'active' | 'finished' ){
        super('project-list','app',false,`${type}-projects`);
        this.assignedProject = [];

        this.configure();
        this.renderContent();
    }

    @autoBind
    dragOverHandler(event: DragEvent): void {
        if(event.dataTransfer && event.dataTransfer.types[0]==='text/plain'){
            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable');
        }
    }

    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
    }

    @autoBind
    dragLeaveHandler(_: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable');
    }
    
    configure(): void {

        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);

        projectState.addListener((projects: Project[]) => {
            const relevantProject = projects.filter(prj => {
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedProject = relevantProject;
            this.renderProjects();
        });
    }

    private renderProjects (){
        const listEL = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
        listEL.innerHTML = "";
        for(const prjitem of this.assignedProject){
            new ProjectItem(this.element.querySelector('ul')!.id, prjitem);
        }
    }


    renderContent (){
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + 'PROJECTS';
    }

}

// ProjectInput Class 
class ProjectInput extends Component<HTMLElement,HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor () {
        super('project-input','app',true,'user-input');

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }
    
    configure(){
        this.element.addEventListener('submit', this.submitHandle);
    }

    renderContent(): void {

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
            projectState.addProject(title,desc,people);
            this.clearInput();
        }

    }


}
const trials = new ProjectInput();
const activeprjList = new ProjectList('active');
const finishedprjList = new ProjectList('finished');

