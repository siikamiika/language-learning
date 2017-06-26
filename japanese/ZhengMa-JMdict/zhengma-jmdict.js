var zhengmaDictionary;
var jmdictWords;

var input = document.getElementById('input');
var output = document.getElementById('output');
var fullText = document.getElementById('fulltext');
var layout = document.getElementById('layout');

input.oninput = refreshResults;
fullText.oninput = refreshResults;
input.onfocus = showLayout;
input.onblur = hideLayout;

function showLayout() {
    layout.style.visibility = 'visible';
}

function hideLayout() {
    layout.style.visibility = 'hidden';
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
            characters = getUniqueZhengmaCharacters(inputValue[0]);
        } else {
            for (var i = 0; i < inputValue[0].length; i++) {
                characters.push(inputValue[0][i]);
            }
        }
    }

    var words = [];
    var wordPattern = generateWordPattern(inputValue);
    if (!wordPattern.match(/^[\.]*$/)) {
        words = getWords(RegExp((fullText.checked ? '' : '^') + wordPattern));
    }

    output.innerHTML = characters.map(generateCharacterHtml).join('') + words.join('<br>');

}

function splitInput() {
    return input.value.split(/[\/'\s]/);
}

function isAscii(text) {
    return text.match(/^[\!-~]+$/);
}

function generateCharacterHtml(character) {
    var code = zhengmaDictionary.character[character];
    if (!code) {
        return '';
    }
    return character+' '+code.join('/')+'<br>';
}

function generateWordPattern(inputValue) {
    var output = [];
    for (var i = 0; i < inputValue.length; i++) {
        if (isAscii(inputValue[i])) {
            var characters = getUniqueZhengmaCharacters(inputValue[i]);
            if (characters.length) {
                output.push('['+getUniqueZhengmaCharacters(inputValue[i]).join('')+']');
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

function getUniqueZhengmaCharacters(code) {
    var output = [];
    if (!code.match(/[a-z]/)) {
        return output;
    }
    var codePattern = RegExp('^'+code);
    for (code in zhengmaDictionary.code) {
        if (code.match(codePattern)) {
            for (var i = 0; i < zhengmaDictionary.code[code].length; i++) {
                if (output.indexOf(zhengmaDictionary.code[code][i]) === -1) {
                    output.push(zhengmaDictionary.code[code][i]);
                }
            }
        }
    }
    return output;
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
