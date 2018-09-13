class Output {

    constructor(view) {
        this.view = view;
        this.outputElement = this.view.outputElement;
        this.outputTextElement = this.view.outputTextElement;
        this.charInfoElement = this.view.charInfoElement;
        this.wordInfoElement = this.view.wordInfoElement;
        this.readingInfoElement = this.view.readingInfoElement;
        this.synonymInfoElement = this.view.synonymInfoElement;
    }

    outputText(data) {
        clearChildren(this.outputTextElement);

        for (let line of data) {
            // row
            this.outputTextElement.appendChild(buildDom({E: 'div',
                className: 'output-row',
                // tts
                C: [{E: 'button',
                    onclick: _ => this.view.app.api.tts(line.map(w => w[0]).join('')),
                    C: '🔊'
                }]
                // words with readings
                .concat(line.map(word => ({E: 'ruby',
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
            )}));
        }
    }

    _outputWordInfo(word, skipSynonyms) {
        clearChildren(this.readingInfoElement);  // hide unrelated info
        clearChildren(this.wordInfoElement);

        // synonyms
        if (!skipSynonyms) {
            clearChildren(this.synonymInfoElement);
            let outputSynonyms = (data) => {
                this.synonymInfoElement.appendChild(buildDom({E: 'ul',
                    C: data.map(w => ({E: 'li',
                        onclick: _ => this._outputWordInfo(w, true),
                        C: w
                    }))
                }));
            }
            this.view.app.api.get('synonym_dict', {query: word}, null, outputSynonyms);
        }

        // external links
        this.wordInfoElement.appendChild(buildDom({E: 'div',
            id: 'external-links',
            C: {E: 'ul',
                C: EXTERNAL_LINKS.word.map(link => ({E: 'li',
                    C: {E: 'a',
                        rel: 'noopener noreferrer',
                        target: '_blank',
                        href: link.urlTemplate.replace('%QUERY%', word),
                        C: `[${link.name}]`
                    }
                }))
            }
        }));

        // translations
        let outputTranslations = (data) => {
            this.wordInfoElement.appendChild(buildDom({E: 'div',
                C: {E: 'ul',
                    C: data.map(tl => ({E: 'li',
                        C: [
                            {E: 'span', className: 'word-trad', C: tl[0]}, ' ',
                            {E: 'span', className: 'word-simp', C: tl[1]}, ' ',
                            {E: 'span', className: 'word-type', C: tl[4]}, ' ',
                            {E: 'span', className: 'reading-canto', C: tl[3]}, ' ',
                            {E: 'span', className: 'reading-mandarin', C: `{${tl[2]}}`},
                            {E: 'ol', C: tl[5].split('/').filter(g => g).map(gloss => ({E: 'li', C: gloss}))}
                        ]
                    }))
                }
            }));
        }
        this.view.app.api.get('dict', {query: word}, null, outputTranslations);
    }

    // TODO
    _outputCharInfo(character) {
        clearChildren(this.charInfoElement);

        this.charInfoElement.appendChild(buildDom({E: 'div',
            C: character
        }));
    }

    // TODO
    _outputReadingInfo(reading) {
        clearChildren(this.wordInfoElement);  // hide unrelated info
        clearChildren(this.charInfoElement);  //
        clearChildren(this.readingInfoElement);

        this.readingInfoElement.appendChild(buildDom({E: 'div',
            C: reading
        }));
    }

}
