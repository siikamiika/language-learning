class Input {

    constructor(view) {
        this.view = view;
        this.inputElement = this.view.inputElement;
        this.textInputElement = this.view.textInputElement;

        this.inputElement.addEventListener('input', this._oninput.bind(this));

        this.lastEvent = null;
        this.view.app.api.socket('ws://localhost:9873', null, null, data => {
            this._oninput({target: {value: data.data}});
            this.textInputElement.value = data.data;
        });
    }

    reinput() {
        this._oninput(this.lastEvent);
    }

    _oninput(event) {
        this.lastEvent = event;
        let inputText = event.target.value;
        if (this.view.app.settings.readingChoice == 'translate') {
            // requires ignoring x-frame-options
            this.view.translateIframe.setAttribute('src', `https://translate.google.com/#view=home&op=translate&sl=auto&tl=en&text=${encodeURIComponent(inputText)}`);
        } else {
            this.view.app.api.post('parse', {text: inputText}, null, data => {
                data = data.map(
                    row => row.map(
                        ([word, readings]) => [word, [
                            (readings[0] || []).map(pinyin => ({
                                withNum: pinyin,
                                withMark: pinyinToneNumToMark(pinyin, 'pinyin').replace(/v/g, 'ü').normalize('NFC'),
                            })),
                            (readings[1] || []).map(jyutping => ({
                                withNum: jyutping,
                                withMark: pinyinToneNumToMark(jyutping, 'jyutping').normalize('NFC'),
                            })),
                        ]]
                    )
                );
                this.view.output.outputText(data);
            });
        }
    }

}
