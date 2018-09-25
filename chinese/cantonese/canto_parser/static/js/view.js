class View {

    constructor(app) {
        this.app = app;

        // DOM
        // settings
        this.readingChoiceElements = null;
        // input
        this.inputElement = null;
        this.textInputElement = null;
        // output
        this.outputElement = null;
        this.outputTextElement = null;
        this.charInfoElement = null;
        this.wordInfoElement = null;
        this.readingInfoElement = null;
        this.synonymInfoElement = null;
        this.mouseoverDefinitionElement = null;

        for (let k in this.app.elementIds) {
            this[k] = document.getElementById(this.app.elementIds[k]);
        }


        // views
        this.settings = new Settings(this);
        this.input = new Input(this);
        this.output = new Output(this);
    }

}
