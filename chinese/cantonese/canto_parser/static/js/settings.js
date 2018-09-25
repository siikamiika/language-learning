class Settings {

    constructor(view) {
        this.view = view;
        this.readingChoiceElements = document.getElementsByName('reading');

        // reading choice
        for (let readingChoice of this.readingChoiceElements) {
            readingChoice.addEventListener('click', e => this._updateSettings());
        }
    }

    _updateSettings() {
        // reading choice
        for (let readingChoice of this.readingChoiceElements) {
            if (readingChoice.checked) {
                this.view.app.settings.readingChoice = readingChoice.value;
                this.view.input.reinput();
                if (readingChoice.value == 'pinyin') {
                    document.documentElement.lang = 'zh-CN';
                } else {
                    document.documentElement.lang = 'zh-HK';
                }
                break;
            }
        }
    }

}
