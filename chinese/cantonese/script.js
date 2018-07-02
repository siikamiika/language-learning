// DOM vars
let initialsElement = document.getElementById('initials');
let finalsElement = document.getElementById('finals');
let resultsElement = document.getElementById('results');
let positionElement = document.getElementById('position');
// other vars
let state = {
    tone: 0,
    initial: null,
    final: null,
    position: 0
};
let dictTrie = {};

// tone init
Array.from(document.getElementsByName('tone')).forEach(
    b => {
        b.onclick = _ => {
            state.tone = Number(b.value);
            update();
        }
    }
);
// position init
positionElement.oninput = e => {
    state.position = Number(e.target.value);
    update();
}

// table data
let tableLayout = JSON.parse(`{
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
}`);
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
        C: row.map(i => ({E: 'td', id: `i_${i}`, onclick: _ => {state.initial = i; update()}, C: i}))
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
        C: [{E: 'th', C: finalStart[i]}].concat(tableLayout.finals[i].map(f => ({E: 'td', id: `f_${f}`, onclick: _ => {state.final = f; update()}, C: f})))
    }));
}

// dictionary data
// build trie
for (let initialRow of tableLayout.initials) {
    for (let initial of initialRow) {
        if (!initial) {
            continue;
        }
        dictTrie[initial] = {};
        for (let finalRow of tableLayout.finals) {
            for (let final of finalRow) {
                if (!final) {
                    continue;
                }
                dictTrie[initial][final] = {};
                for (let tone of [1, 2, 3, 4, 5, 6]) {
                    dictTrie[initial][final][tone] = [];
                }
            }
        }
    }
}
// add words to trie
for (let i = 0; i < dictWords.length; i++) {
    let word = dictWords[i];
    let readings = word.split('\t')[1].replace(' / ', '/').split(' ');
    let indexedReadings = [];
    for (let j = 0; j < readings.length; j++) {
        let curReadings = readings[j].split('/');
        for (let r of curReadings) {
            indexedReadings.push([j, r]);
        }
    }
    for (let reading of indexedReadings) {
        let offset = 0;
        for (let initial in dictTrie) {
            if (reading[1].slice(0, initial.length) === initial &&
                (initial.length == 2 ||  // n, k <---> ng, gw, kw
                 !(['g', 'w'].includes(reading[1].charAt(initial.length))))) {
                for (let final in dictTrie[initial]) {
                    // m is not duplicated
                    if (initial === 'm' && final === 'm') {
                        offset = -1;
                    } else {
                        offset = 0;
                    }
                    if (reading[1].slice(initial.length + offset, reading[1].length - 1) === final) {
                        for (let tone in dictTrie[initial][final]) {
                            if (reading[1].slice(reading[1].length - 1) == tone) {  // compare string with int
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
    let results = dictionarySearch(state.initial, state.final, state.tone, state.position);
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

function dictionarySearch(initial, final, tone, position) {
    if (!initial || !final) {
        return [];
    }

    let words = dictTrie[initial][final];
    // tone
    if (tone >= 1 && tone <= 6) {
        words = words[tone];
    } else {
        let out = [];
        for (let t = 1; t <= 6; t++) {
            Array.prototype.push.apply(out, words[t]);
        }
        words = out;
    }
    // position
    if (position == -1) {
        let out = [];
        for (let p of words) {
            if (!p) {
                continue;
            }
            Array.prototype.push.apply(out, p.map(i => dictWords[i]))
        }
        words = out;
    } else {
        words = words[position].map(i => dictWords[i]);
    }
    return words;
}
