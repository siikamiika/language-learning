// DOM vars
let initialsElement = document.getElementById('initials');
let finalsElement = document.getElementById('finals');
let resultsElement = document.getElementById('results');
let positionElement = document.getElementById('position');
let resetElement = document.getElementById('reset');
// other vars
let state = {
    tone: 0,
    initial: null,
    final: null,
    position: -1,
    positions: [{
        tone: 0,
        initial: null,
        final: null
    }]
};
let dictTrie = {};

// tone init
Array.from(document.getElementsByName('tone')).forEach(
    b => {
        b.onclick = _ => {
            setState('tone', Number(b.value));
            update();
        }
    }
);
// position init
positionElement.oninput = e => {
    state.position = Number(e.target.value);
    if (!state.positions[state.position]) {
        state.positions[state.position] = {
            tone: 0,
            initial: null,
            final: null
        }
    }
    update();
}
// reset init
resetElement.onclick = _ => {
    state.tone = 0;
    state.initial = null;
    state.final = null;
    state.position = -1;
    state.positions = [{
        tone: 0,
        initial: null,
        final: null
    }];
    document.getElementsByName('tone')[0].checked = true;
    positionElement.value = -1;
    update();
    return false;
}

// table data
let tableLayout = {
    "initials": [
        "b |p |m |f| ",
        "d |t |n | |l",
        "g |k |ng|h| ",
        "gw|kw|  | |w",
        "z |c |  |s|j"
    ],
    "finals": [
        "aa|aai|aau|aam|aan|aang|aap|aat|aak",
        "  |ai |au |am |an |ang |ap |at |ak ",
        "e |ei |eu |em |   |eng |ep |   |ek ",
        "i |   |iu |im |in |ing |ip |it |ik ",
        "o |oi |ou |   |on |ong |   |ot |ok ",
        "u |ui |   |   |un |ung |   |ut |uk ",
        "oe|eoi|   |   |eon|oeng|   |eot|oek",
        "yu|   |   |   |yun|    |   |yut|   ",
        "  |   |   |m  |   |ng  |   |   |   "
    ]
}
tableLayout.initials = tableLayout.initials
    .map(row => row.split('|').map(w => w.trim()));
tableLayout.finals = tableLayout.finals
    .map(row => row.split('|').map(w => w.trim()));

initialsElement.appendChild(buildDom({
    E: 'tr',
    C: ['◌˭', '◌ʰ', 'M', '', ''].map(t => ({E: 'th', C: t}))
}));
for (let row of tableLayout.initials) {
    initialsElement.appendChild(buildDom({
        E: 'tr',
        C: row.map(i => ({E: 'td', id: `i_${i}`, onclick: _ => {setState('initial', i); update()}, C: i}))
    }));
}

finalsElement.appendChild(buildDom({
    E: 'tr',
    C: ['', '-', 'I', 'U', 'M', 'N', 'NG', 'P', 'T', 'K'].map(t => ({E: 'th', C: t}))
}));
let finalStart = ['AA', 'A', 'E', 'I', 'O', 'U', 'Ö', 'Y', 'M'];
for (let i = 0; i < tableLayout.finals.length; i++) {
    finalsElement.appendChild(buildDom({
        E: 'tr',
        C: [{E: 'th', C: finalStart[i]}].concat(tableLayout.finals[i].map(f => ({E: 'td',
            id: `f_${f}`,
            onclick: _ => {
                setState('final', f);
                update();
            },
            C: f
        })))
    }));
}

// dictionary data
// build trie
let skipEmpty = false;
for (let initialRow of [['']].concat(tableLayout.initials)) {
    for (let initial of initialRow) {
        if (skipEmpty && !initial) {
            continue;
        } else {
            skipEmpty = true;
        }
        dictTrie[initial] = {};
        for (let finalRow of tableLayout.finals) {
            for (let final of finalRow) {
                if (!final) {
                    continue;
                }
                dictTrie[initial][final] = {};
                for (let tone of [1, 2, 3, 4, 5, 6]) {
                    dictTrie[initial][final][tone] = {};
                }
            }
        }
    }
}
// empty initial last
let initials = Object.keys(dictTrie);
initials.splice(initials.indexOf(''), 1);
initials.push('');
// add words to trie
for (let i = 0; i < dictWords.length; i++) {
    let word = dictWords[i];
    let readings = word.split('\t')[1].replace(' / ', '/').replace('，', '').split(/\s+/);
    let indexedReadings = [];
    for (let j = 0; j < readings.length; j++) {
        let curReadings = readings[j].split('/');
        for (let r of curReadings) {
            indexedReadings.push([j, r]);
        }
    }
    for (let reading of indexedReadings) {
        for (let initial of initials) {
            if (reading[1].slice(0, initial.length) === initial &&
                reading[1].slice(0, -1) !== initial) {
                let skip = false;
                for (let digraph of ['gw', 'kw', 'ng']) {
                    if (initial === digraph[0] && reading[1].slice(0, 2) == digraph) {
                        skip = true;
                        break;
                    }
                }
                if (skip) {
                    continue;
                }

                for (let final in dictTrie[initial]) {
                    if (reading[1].slice(initial.length, initial.length + final.length) === final &&
                        initial.length + final.length + 1 == reading[1].length) {
                        for (let tone of [1, 2, 3, 4, 5, 6]) {
                            if (reading[1].slice(initial.length + final.length) == tone) {  // compare string with int
                                let readingTrie = dictTrie[initial][final][tone];
                                if (!readingTrie[reading[0]]) {
                                    readingTrie[reading[0]] = [];
                                }
                                readingTrie[reading[0]].push(i);
                                break;
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
    }
}

// functions
function update() {
    let results = dictionarySearch();
    clearChildren(resultsElement);
    resultsElement.appendChild(buildDom({E: 'ul',
        C: results.map(r => ({E: 'li',
            C: {E: 'span',
                C: [
                    r,
                    ' ',
                    {E: 'button',
                        onclick: _ => {
                            var url = 'https://code.responsivevoice.org/getvoice.php?t='+encodeURIComponent(r.split('\t')[0])+'&tl=zh-HK&sv=g1&vn=&pitch=0.5&rate=0.3&vol=1&gender=female';
                            new Audio(url).play();
                        },
                        C: '🔊'
                    }
                ]
            }
        }))
    }));
}

function setState(prop, val) {
    if (state.position == -1) {
        state[prop] = val;
    } else {
        state.positions[state.position][prop] = val;
    }
}

function getState(prop) {
    if (prop === 'position') {
        return state.position;
    }

    if (state.position == -1) {
        return state[prop];
    } else {
        return state.positions[state.position][prop];
    }
}

function dictionarySearch() {
    if (getState('position') == -1) {
        return searchSingle(state.initial, state.final, state.tone, state.position);
    } else {
        let results = range(0, state.positions.length)
            .map(i => state.positions[i])
            .map((position, i) => searchSingle(position.initial, position.final, position.tone, i))
            .filter(result => result.length);

        if (results.length > 1) {
            return intersect(...results);
        } else {
            return results[0] || [];
        }
    }
}

function searchSingle(initial, final, tone, position) {
    if (!initial) {
        if (!final) {
            return [];
        }
        initial = '';
    }
    let words = dictTrie[initial];
    // final
    if (final) {
        words = words[final];
    } else {
        let out = {1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}};
        for (let f in words) {
            let tempWords = words[f];
            for (let t of [1, 2, 3, 4, 5, 6]) {
                for (let p in tempWords[t]) {
                    if (!out[t][p]) {
                        out[t][p] = [];
                    }
                    Array.prototype.push.apply(out[t][p], tempWords[t][p]);
                }
            }
        }
        words = out;
    }
    // tone
    if (tone >= 1 && tone <= 6) {
        words = words[tone];
    } else {
        let out = {};
        for (let t of [1, 2, 3, 4, 5, 6]) {
            for (let p in words[t]) {
                if (!out[p]) {
                    out[p] = [];
                }
                Array.prototype.push.apply(out[p], words[t][p]);
            }
        }
        words = out;
    }
    // position
    if (position == -1) {
        let out = [];
        for (let p in words) {
            if (!p) {
                continue;
            }
            Array.prototype.push.apply(out, words[p].map(i => dictWords[i]))
        }
        words = out;
    } else {
        words = words[position].map(i => dictWords[i]);
    }
    return words;
}
