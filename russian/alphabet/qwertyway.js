function prepare_buttons () {
    var buttons = document.getElementsByClassName('button');
    for (var i = 0; i < buttons.length; i++) {
        (function () {
            var button = buttons[i];
            var charcode = button.getAttribute('charcode');
            // sound
            button.onclick = function (e) {
                play_sound(charcode);
            }
            // popup
            var popup = document.createElement('span');
            var qwerty = 'qwerty key: ' + (charcode != -1 ? String.fromCharCode(charcode) : '');
            var sound = 'sound: ' + (button.getAttribute('sound') || '');
            var desc = 'description: ' + (button.getAttribute('description') || '');
            popup.innerHTML = [qwerty, sound, desc].join('<br>');
            button.appendChild(popup);
        })();
    }
}

function play_sound (charcode) {
    var sound = new Audio('sound/' + charcode + '.ogg');
    sound.play();
}

function keyboard_press(e) {
    var charcode = e.which;
    // firefox quick find
    if (charcode == 39) {
        e.preventDefault();
    }
    console.log(charcode);
    play_sound(charcode);
}

window.addEventListener('keypress', function (e) {
    keyboard_press(e);
}, false)

window.addEventListener("load", function () {
    prepare_buttons();
}, false);
