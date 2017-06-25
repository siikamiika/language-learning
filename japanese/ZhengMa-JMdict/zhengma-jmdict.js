var zhengmaDictionary;
var jmdictWords;

var input = document.getElementById('input');
var output = document.getElementById('output');

input.oninput = refreshResults;
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

    if (!input.value) {
        output.innerHTML = '';
        return;
    }

    var pattern = input.value.split('/').map(generatePattern).join('');

    if (pattern.match(/^\.+$/)) {
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
