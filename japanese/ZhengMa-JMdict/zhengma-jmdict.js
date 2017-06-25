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
        setTimeout(function() {
            refreshResults(null, true);
        }, 300);
        return;
    }

    var matches = [];

    if (input.value.split('/').length == 1) {
        if (!input.value.match(/^[a-z\.\$]+$/)) {
            for (var i = 0; i < input.value.length; i++) {
                matches.push(input.value[i] + zhengmaDictionary[input.value[i]].join('/'));
            }
        } else {
            for (key in zhengmaDictionary) {
                if (!key.match(/^[a-z]+$/)) {
                    continue;
                }
                if (key.match(new RegExp('^'+input.value))) {
                    for (var i = 0; i < zhengmaDictionary[key].length; i++) {
                        if (!(matches.indexOf(zhengmaDictionary[key][i]) + 1)) {
                            matches.push(zhengmaDictionary[key][i] + zhengmaDictionary[zhengmaDictionary[key][i]].join('/'));
                        }
                    }
                }
            }
        }
    }

    if (!input.value) {
        output.innerHTML = '';
        return;
    }

    var pattern = (!fullText.checked ? '^' : '') + input.value.split('/').map(generatePattern).join('');

    if (pattern.match(/^[\.^]+$/)) {
        output.innerHTML = '';
        return;
    }

    for (var i = 0; i < jmdictWords.length; i++) {
        if (jmdictWords[i].match(pattern)) {
            matches.push(jmdictWords[i])
        }
    }

    output.innerHTML = matches.join('\n');

}

function generatePattern(info) {
    if (info.match(/^[a-z\.\$]+$/)) {
        if (info.match(/^\.+$/)) {
            return '.';
        }
        var output = [];
        for (key in zhengmaDictionary) {
            if (!key.match(/^[a-z]+$/)) {
                continue;
            }
            if (key.match(new RegExp('^'+info))) {
                for (var i = 0; i < zhengmaDictionary[key].length; i++) {
                    if (!(output.indexOf(zhengmaDictionary[key][i]) + 1)) {
                        output.push(zhengmaDictionary[key][i]);
                    }
                }
            }
        }
        return '['+output.join('')+']';
    } else {
        return info || '.';
    }
}
