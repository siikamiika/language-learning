var zhengmaDictionary;
var jmdictWords;

var input = document.getElementById('input');
var decomposeInput = document.getElementById('decompose-input');
var output = document.getElementById('output');
var decomposeOutput = document.getElementById('decompose-output');
var fullText = document.getElementById('fulltext');
var layout = document.getElementById('layout');

input.oninput = refreshResults;
fullText.oninput = refreshResults;
input.onfocus = showLayout;
input.onblur = hideLayout;

decomposeInput.oninput = refreshTree;

function showLayout() {
    layout.style.visibility = 'visible';
}

function hideLayout() {
    layout.style.visibility = 'hidden';
}

function refreshTree() {
    if (!decomposeInput.value.length) {
        decomposeOutput.innerHTML = '';
        return;
    }

    decomposeOutput.innerHTML = recursiveTreeOutput(recursiveGetTree(decomposeInput.value[0]), 0).join('\n');
}

function recursiveTreeOutput(obj, depth) {
    var output = [];
    if (typeof(obj) !== 'object') {
        return [];
    }
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            output.push(' '.repeat(depth * 2) + key);
            output = output.concat(recursiveTreeOutput(obj[key], depth + 1));
        }
    }
    return output;
}

var refreshId = 0;

function refreshResults(event, timer) {

    if (!timer) {
        clearTimeout(refreshId);
        refreshId = setTimeout(function() {
            refreshResults(null, true);
        }, 600);
        return;
    }

    var inputValue = splitInput();

    var characters = [];
    if (inputValue.length == 0) {
        output.innerHTML = '';
        return;
    } else if (inputValue.length == 1) {
        if (isAscii(inputValue[0])) {
            if (inputValue[0].indexOf(';') != -1) {
                var zhengmaInput = inputValue[0].split(';');
                var decompInput = zhengmaInput[1].split(',');
                zhengmaInput = zhengmaInput[0];
                characters = getUniqueZhengmaCharacters(zhengmaInput, decompInput);
            } else {
                characters = getUniqueZhengmaCharacters(inputValue[0]);
            }
        } else {
            for (var i = 0; i < inputValue[0].length; i++) {
                characters.push(inputValue[0][i]);
            }
        }
    }

    var words = [];
    var wordPattern = generateWordPattern(inputValue);
    if (!wordPattern.match(/^[\.]*$/)) {
        words = words.concat(getWords(RegExp((fullText.checked ? '' : '^') + wordPattern)));
    }

    output.innerHTML = generateCharacterHtml(characters, zhengmaDictionary.code[inputValue[0].split(';')[0]]) + (characters.length ? '<hr>' : '') + words.join('<br>');

}

function splitInput() {
    return input.value.split(/[\/'\s]/);
}

function isAscii(text) {
    return text.split(';')[0].match(/^[\!-~]+$|^$/);
}

function generateCharacterHtml(characters, exactChars) {
    var output = {
        'exact': [],
        'enclosure': [], // s.*
        'across': [], // a
        'downwards': [], // d
        'repeat': [], // r.*
        'other': [] // c, lock, m.*, w.*, ...
    };
    var enclosure = /^s.*/;
    var across = /^a$/;
    var downwards = /^d$/;
    var repeat = /^r.*/;
    for (var i = 0; i < characters.length; i++) {
        if (!decomp[characters[i]]) {
            continue;
        } else if (exactChars && exactChars.indexOf(characters[i]) !== -1) {
            output.exact.push([characters[i]]);
        } else if (decomp[characters[i]][0][0].match(enclosure)) {
            output.enclosure.push([characters[i]]);
        } else if (decomp[characters[i]][0][0].match(across)) {
            output.across.push([characters[i]]);
        } else if (decomp[characters[i]][0][0].match(downwards)) {
            output.downwards.push([characters[i]]);
        } else if (decomp[characters[i]][0][0].match(repeat)) {
            output.repeat.push([characters[i]]);
        } else {
            output.other.push([characters[i]]);
        }
    }
    outputHtml = [];
    var categories = ['exact', 'other', 'downwards', 'across', 'enclosure', 'repeat'];

    categories.forEach(function(category) {
        if (output[category].length == 0) {return};
        outputHtml.push('<b class="clickable" onclick="toggle(\''+category+'\')">' + category + '</b><br>');
        outputHtml.push('<div style="display: '+(category == 'exact' ? '' : 'none')+';" id="'+category+'">')
        for (var i = 0; i < output[category].length; i++) {
            outputHtml.push(output[category][i][0] + ' ' + zhengmaDictionary.character[output[category][i][0]].join('/') +
                ' <span class="clickable" onclick="select(\''+output[category][i][0]+'\')">[+]</span>' +
                '<br>');
        }
        outputHtml.push('</div>')
    })
    return outputHtml.join('');
}

function toggle(category) {
    var el = document.getElementById(category);
    if (el.style.display == 'none') {
        el.style.display = '';
    } else {
        el.style.display = 'none';
    }
}

function select(character) {
    input.value = character;
    input.oninput();
}

function generateWordPattern(inputValue) {
    var output = [];
    for (var i = 0; i < inputValue.length; i++) {
        if (inputValue[i][0] == 'H') {
            output.push(toHiragana(inputValue[i].slice(1)));
        } else if (inputValue[i][0] == 'K') {
            output.push(toKatakana(inputValue[i].slice(1)));
        } else if (inputValue[i][0] == '$') {
            output.push('$');
        } else if (isAscii(inputValue[i])) {
            var characters;
            (function() {
            if (inputValue[i].indexOf(';') != -1) {
                var zhengmaInput = inputValue[i].split(';');
                var decompInput = zhengmaInput[1].split(',');
                zhengmaInput = zhengmaInput[0];
                characters = getUniqueZhengmaCharacters(zhengmaInput, decompInput);
            } else {
                characters = getUniqueZhengmaCharacters(inputValue[i]);
            }
            })();
            if (characters.length) {
                output.push('['+characters.join('')+']');
            } else {
                output.push('.');
            }
        } else if (inputValue[i].length == 0) {
            output.push('.');
        } else {
            output.push(inputValue[i]);
        }
    }
    return output.join('');
}

function getUniqueZhengmaCharacters(code, parts) {
    var output = [];
    if (!code.match(/[a-z]/) && !parts) {
        return output;
    }
    var codePattern = RegExp('^'+code);
    for (code in zhengmaDictionary.code) {
        if (code.match(codePattern)) {
            for (var i = 0; i < zhengmaDictionary.code[code].length; i++) {
                if (output.indexOf(zhengmaDictionary.code[code][i]) === -1) {
                    if (parts) {
                        (function() {
                        var thisParts = recursiveGetParts(zhengmaDictionary.code[code][i]);
                        var match = true;
                        for (var j = 0; j < parts.length; j++) {
                            if (!parts[j]) {
                                continue;
                            } else if (isAscii(parts[j])) {
                                if (intersection(zhengmaDictionary.code[parts[j]], thisParts).length == 0) {
                                    match = false;
                                    break;
                                }
                            } else if (thisParts.indexOf(parts[j]) === -1) {
                                match = false;
                                break;
                            }
                        }
                        if (match) {
                            output.push(zhengmaDictionary.code[code][i]);
                        }
                        })();
                    } else {
                        output.push(zhengmaDictionary.code[code][i]);
                    }
                }
            }
        }
    }
    return output;
}

function intersection(a, b) {
    return a.filter(function(i) {
        if(b.indexOf(i) > -1) {
            return true;
        }
        else {
            return false;
        }
    });
}

function getWords(pattern) {
    var output = [];
    for (var i = 0; i < jmdictWords.length; i++) {
        if (jmdictWords[i].match(pattern)) {
            output.push(jmdictWords[i]);
        }
    }
    return output;
}
