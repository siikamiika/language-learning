class App {

    constructor(elementIds) {
        this.elementIds = elementIds;
        this.settings = {};

        this.api = new Api(this);
        this.view = new View(this);
    }

}

const app = new App({
    inputElement: 'input',
    textInputElement: 'text-input',
    outputElement: 'output',
    outputTextElement: 'output-text',
    charInfoElement: 'char-info',
    wordInfoElement: 'word-info',
    readingInfoElement: 'reading-info',
    synonymInfoElement: 'synonym-info',
    mouseoverDefinitionElement: 'mouseover-definition',
});
