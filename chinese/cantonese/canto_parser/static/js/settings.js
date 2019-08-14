function toggle(a, b) {
    a.classList.remove('remove');
    b.classList.add('remove');
}

class Settings {

    constructor(view) {
        this.view = view;
        this.readingChoiceElements = document.getElementsByName('reading');

        const storedSettings = localStorage.getItem('settings');
        if (storedSettings) {
            this.view.app.settings = JSON.parse(storedSettings);
        }

        // reading choice
        for (let readingChoice of this.readingChoiceElements) {
            if (readingChoice.value == this.view.app.settings.readingChoice) {
                readingChoice.checked = true;
            }
            readingChoice.addEventListener('click', e => this._updateSettings());
        }
    }

    _updateSettings() {
        // reading choice
        for (let readingChoice of this.readingChoiceElements) {
            if (readingChoice.checked) {
                this.view.app.settings.readingChoice = readingChoice.value;
                if (readingChoice.value == 'pinyin') {
                    document.documentElement.lang = 'zh-CN';
                    toggle(this.view.outputTextElement, this.view.translateIframe);
                } else if (readingChoice.value == 'jyutping') {
                    document.documentElement.lang = 'zh-HK';
                    toggle(this.view.outputTextElement, this.view.translateIframe);
                } else if (readingChoice.value == 'translate') {
                    toggle(this.view.translateIframe, this.view.outputTextElement);
                }
                this.view.input.reinput();
                this.view.output.retranslate();
                break;
            }
        }
        localStorage.setItem('settings', JSON.stringify(this.view.app.settings));
    }

}
