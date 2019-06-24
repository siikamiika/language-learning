class Output {

    constructor(view) {
        this.view = view;
        this.outputElement = this.view.outputElement;
        this.outputTextElement = this.view.outputTextElement;
        this.charInfoElement = this.view.charInfoElement;
        this.wordInfoElement = this.view.wordInfoElement;
        this.synonymInfoElement = this.view.synonymInfoElement;
        this.mouseoverDefinitionElement = this.view.mouseoverDefinitionElement;

        this.lastTranslated = [];
    }

    retranslate() {
        this._outputWordInfo(...this.lastTranslated);
    }

    outputText(data) {
        clearChildren(this.outputTextElement);

        for (let line of data) {
            // row
            this.outputTextElement.appendChild(buildDom({E: 'div',
                className: 'output-row',
                onmouseup: _ => {
                    const selectedText = window.getSelection().toString().replace(/\s/g, '');
                    if (selectedText) {
                        this._outputWordInfo(selectedText, true);
                    }
                },
                // tts
                C: [{E: 'button',
                    onclick: _ => this.view.app.api.tts(
                        line.map(w => w[0]).join(''),
                        this.view.app.settings.readingChoice == 'jyutping' ? 'zh-HK' : 'zh-CN'
                    ),
                    C: '🔊'
                }]
                // words with readings
                .concat(line.map(word => ({E: 'ruby',
                    className: 'wordreading',
                    onclick: _ => {
                        if (!window.getSelection().toString()) {
                            this._outputWordInfo(word[0]);
                        }
                    },
                    onmousemove: e => this._updateMouseoverPosition(e),
                    onmouseleave: _ => this._hideMouseoverDefinition(),
                    C: [
                        // the word
                        {E: 'rb', className: 'word clickable',
                            onmouseenter: _ => this._outputMouseoverDefinition(word[0]),
                            C: Array.from(word[0]).map(character => ({E: 'span',
                                onclick: _ => this._outputCharInfo(character),
                                C: character
                            }))
                        },
                        // the readings
                        {E: 'rt', C: {E: 'ul', className: 'reading-list',
                            C: (word[1][this.view.app.settings.readingChoice == 'jyutping' ? 1 : 0] || []).map(reading => ({E: 'li',
                                className: 'reading clickable',
                                onclick: e => {
                                    this._outputWordInfo(word[0], false, reading);
                                    e.stopPropagation();
                                },
                                onmouseenter: _ => this._outputMouseoverDefinition(word[0], reading),
                                C: reading
                            }))
                        }},
                    ]
                })))
            }));
        }
    }

    _outputMouseoverDefinition(word, reading) {
        let outputTranslations = (data) => {
            let newDefinition = buildDom({E: 'ul',
                C: data.map(tl => ({E: 'li',
                    C: [
                        {E: 'span', className: 'word-trad', C: tl[0]}, ' ',
                        {E: 'span', className: 'word-simp', C: tl[1]}, ' ',
                        {E: 'span', className: 'word-type', C: tl[4]}, ' ',
                        {E: 'span', className: 'definition-reading', C: this.view.app.settings.readingChoice == 'jyutping' ? tl[3] : tl[2]},
                        {E: 'br'},
                        {E: 'ol', className: 'mouseover-columns',
                            C: tl[5].split('/').filter(g => g)
                            .map(gloss => ({E: 'li', C: {E: 'span', C: processGloss(gloss)}}))
                        },
                    ]
                }))
            });
            this.mouseoverDefinitionElement.replaceChild(newDefinition, this.mouseoverDefinitionElement.firstChild);
        }
        this.view.app.api.get('dict', {query: word}, null, data => this._filterByReading(data, reading, outputTranslations));

        this.mouseoverDefinitionElement.style.visibility = 'visible';
    }

    _updateMouseoverPosition(event) {
        let X = Math.min(event.clientX, innerWidth - this.mouseoverDefinitionElement.clientWidth - 10) + 10;
        let Y = Math.min(event.clientY, innerHeight - this.mouseoverDefinitionElement.clientHeight);
        this.mouseoverDefinitionElement.style.left = X + 'px';
        this.mouseoverDefinitionElement.style.top = Y + 'px';
    }

    _hideMouseoverDefinition(word) {
        this.mouseoverDefinitionElement.style.visibility = 'hidden';
    }

    _outputWordInfo(word, skipSynonyms, reading) {
        this.lastTranslated = [word, skipSynonyms, reading];
        clearChildren(this.wordInfoElement);

        // synonyms
        if (!skipSynonyms) {
            clearChildren(this.synonymInfoElement);
            let outputSynonyms = (data) => {
                this.synonymInfoElement.appendChild(buildDom({E: 'ul',
                    C: data.map(w => ({E: 'li',
                        C: {E: 'span', className: 'clickable',
                            onclick: _ => this._outputWordInfo(w, true),
                            onmouseenter: _ => this._outputMouseoverDefinition(w),
                            onmousemove: e => this._updateMouseoverPosition(e),
                            onmouseleave: _ => this._hideMouseoverDefinition(),
                            C: Array.from(w).map(c => ({E: 'span',
                                onclick: _ => this._outputCharInfo(c),
                                C: c
                            }))
                        }
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
                            {E: 'span', className: 'word-trad',
                                C: Array.from(tl[0]).map(c => ({E: 'span', className: 'clickable',
                                    onmouseenter: _ => this._outputMouseoverDefinition(c),
                                    onmousemove: e => this._updateMouseoverPosition(e),
                                    onmouseleave: _ => this._hideMouseoverDefinition(),
                                    onclick: _ => this._outputCharInfo(c),
                                    C: c
                                }))
                            }, ' ',
                            {E: 'span', className: 'word-simp',
                                C: Array.from(tl[1]).map(c => ({E: 'span', className: 'clickable',
                                    onmouseenter: _ => this._outputMouseoverDefinition(c),
                                    onmousemove: e => this._updateMouseoverPosition(e),
                                    onmouseleave: _ => this._hideMouseoverDefinition(),
                                    onclick: _ => this._outputCharInfo(c),
                                    C: c
                                }))
                            }, ' ',
                            {E: 'span', className: 'word-type', C: tl[4]}, ' ',
                            {E: 'span', className: 'definition-reading', C: this.view.app.settings.readingChoice == 'jyutping' ? tl[3] : tl[2]},
                            {E: 'ol', className: 'definition-columns',
                                C: tl[5].split('/').filter(g => g)
                                .map(gloss => ({E: 'li', C: {E: 'span', C: processGloss(gloss)}}))
                            }
                        ]
                    }))
                }
            }));
        }
        this.view.app.api.get('dict', {query: word}, null, data => this._filterByReading(data, reading, outputTranslations));
    }

    _filterByReading(data, reading, cb) {
        const mode = this.view.app.settings.readingChoice == 'jyutping' ? 3 : 2;
        cb(
            !reading
            ? data
            : data.filter(d => d[mode].split('/').includes(reading))
        );
    }

    _outputCharInfo(character) {
        clearChildren(this.charInfoElement);

        let outputDecomp = (data) => {
            this.charInfoElement.appendChild(buildDom({E: 'div',
                C: Array.from(character + data).map(chr => ({E: 'span', className: 'clickable',
                    onclick: _ => {
                        this._outputWordInfo(chr);
                        this._outputCharInfo(chr);
                        this._hideMouseoverDefinition();
                    },
                    onmouseenter: _ => this._outputMouseoverDefinition(chr),
                    onmousemove: e => this._updateMouseoverPosition(e),
                    onmouseleave: _ => this._hideMouseoverDefinition(),
                    C: chr
                }))
            }));
        }
        this.view.app.api.get('decomp_dict', {query: character}, null, outputDecomp);
    }
}
