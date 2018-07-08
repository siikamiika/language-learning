class Output {

    constructor(view) {
        this.view = view;
        this.outputElement = this.view.outputElement;
        this.outputTextElement = this.view.outputTextElement;
        this.charInfoElement = this.view.charInfoElement;
        this.wordInfoElement = this.view.wordInfoElement;
        this.readingInfoElement = this.view.readingInfoElement;
    }

    outputText(data) {
        clearChildren(this.outputTextElement);

        for (let line of data) {
            // row
            this.outputTextElement.appendChild(buildDom({E: 'div',
                className: 'output-row',
                // word with readings
                C: line.map(word => ({E: 'ruby',
                    className: 'wordreading',
                    onclick: _ => this._outputWordInfo(word[0]),
                    C: [
                        // the word
                        {E: 'rb', className: 'word',
                            C: Array.from(word[0]).map(character => ({E: 'span',
                                onclick: _ => this._outputCharInfo(character),
                                C: character
                            }))
                        },
                        // the readings
                        {E: 'rt',
                            C: (word[1] || []).map(reading => ({E: 'span',
                                className: 'reading',
                                onclick: e => {
                                    this._outputReadingInfo(reading);
                                    e.stopPropagation();
                                },
                                C: reading
                            }))
                        },
                    ]
                }))
            }));
        }
    }

    _outputWordInfo(word) {
        clearChildren(this.readingInfoElement);  // hide unrelated info
        clearChildren(this.wordInfoElement);

        this.wordInfoElement.appendChild(buildDom({E: 'div',
            C: word
        }));
    }

    _outputCharInfo(character) {
        clearChildren(this.charInfoElement);

        this.charInfoElement.appendChild(buildDom({E: 'div',
            C: character
        }));
    }

    _outputReadingInfo(reading) {
        clearChildren(this.wordInfoElement);  // hide unrelated info
        clearChildren(this.charInfoElement);  //
        clearChildren(this.readingInfoElement);

        this.readingInfoElement.appendChild(buildDom({E: 'div',
            C: reading
        }));
    }

}
