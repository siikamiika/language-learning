class Input {

    constructor(view) {
        this.view = view;
        this.inputElement = this.view.inputElement;
        this.textInputElement = this.view.textInputElement;

        this.inputElement.addEventListener('input', this._oninput.bind(this));
    }

    _oninput(event) {
        let inputText = event.target.value;
        this.view.app.api.post('parse', {text: inputText}, null, data => {
            this.view.output.outputText(data);
        });
    }

}
