class App {

    constructor(elementIds) {
        this.elementIds = elementIds;
        this.settings = {
            readingChoice: 'jyutping',
        };

        this.api = new Api(this);
        this.view = new View(this);
    }

}

const app = new App({
    readingChoiceElements: 'reading-choice',
    inputElement: 'input',
    textInputElement: 'text-input',
    outputElement: 'output',
    translateIframe: 'translate-iframe',
    outputTextElement: 'output-text',
    charInfoElement: 'char-info',
    wordInfoElement: 'word-info',
    readingInfoElement: 'reading-info',
    synonymInfoElement: 'synonym-info',
    mouseoverDefinitionElement: 'mouseover-definition',
});
