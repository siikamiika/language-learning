class App {

    constructor(elementIds) {
        this.elementIds = elementIds;
        this.settings = {};

        this.view = new View(this);
        this.api = new Api(this);
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
});
