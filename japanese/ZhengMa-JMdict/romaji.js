// modified version of https://github.com/markni/romaji.js

var swapJsonKeyValues = function (input) {
    var one, output = {};
    for (one in input) {
        if (input.hasOwnProperty(one)) {
            output[input[one]] = one;
        }
    }
    return output;
}


var replaceAll = function (find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

//maps
var toKanaMap = {};

toKanaMap.hiragana = {
    //Digraphs

    "きゃ": "kya",
    "しゃ": "sha",
    "ちゃ": "cha",
    "にゃ": "nya",
    "ひゃ": "hya",
    "みゃ": "mya",
    "りゃ": "rya",
    "ぎゃ": "gya",
    "ふゅ": "fyu",

    "びゃ": "bya",
    "ぴゃ": "pya",

    "きゅ": "kyu",
    "しゅ": "shu",
    "ちゅ": "chu",
    "にゅ": "nyu",
    "ひゅ": "hyu",
    "みゅ": "myu",
    "りゅ": "ryu",
    "ぎゅ": "gyu",

    "びゅ": "byu",
    "ぴゅ": "pyu",

    "きょ": "kyo",
    "しょ": "sho",
    "ちょ": "cho",
    "にょ": "nyo",
    "ひょ": "hyo",
    "みょ": "myo",
    "りょ": "ryo",
    "ぎょ": "gyo",

    "びょ": "byo",
    "ぴょ": "pyo",



    "つぁ": "tsa",
    "つぃ": "tsi",
    "つぇ": "tse",
    "つぉ": "tso",

    "ちぇ": "che",
    "しぇ": "she",


    "じゃ": "ja",
    "じゅ": "ju",
    "じょ": "jo",

    "ふぁ": "fa",
    "ふぃ": "fi",
    "ふぇ": "fe",
    "ふぉ": "fo",


    "うぃ": "wi",
    "うぇ": "we",


    "ゔぁ": "va",
    "ゔぃ": "vi",
    "ゔぇ": "ve",
    "ゔぉ": "vo",

    "じぇ": "je",
    "てぃ": "thi",
    "でぃ": "dhi",
    "でゅ": "d'yu",
    "とぅ": "tu",

    //Monographs

    "し": "si",
    "ち": "ti",
    "つ": "tu",


    "か": "ka",
    "さ": "sa",
    "た": "ta",
    "な": "na",
    "は": "ha",
    "ま": "ma",
    "ら": "ra",

    "き": "ki",

    "に": "ni",
    "ひ": "hi",
    "み": "mi",
    "り": "ri",

    "く": "ku",

    "す": "su",

    "ぬ": "nu",
    "ふ": "fu",
    "む": "mu",
    "る": "ru",

    "け": "ke",
    "せ": "se",
    "て": "te",
    "ね": "ne",
    "へ": "he",
    "め": "me",
    "れ": "re",

    "こ": "ko",
    "そ": "so",
    "と": "to",
    "の": "no",
    "ほ": "ho",
    "も": "mo",
    "ろ": "ro",

    "わ": "wa",
    "を": "wo",



    "が": "ga",
    "ざ": "za",
    "だ": "da",
    "ば": "ba",
    "ぱ": "pa",

    "ぎ": "gi",


    "ぢ": "di",

    "じ": "ji",



    "び": "bi",
    "ぴ": "pi",

    "ぐ": "gu",
    "ず": "zu",
    "づ": "du",
    "ぶ": "bu",
    "ぷ": "pu",

    "げ": "ge",
    "ぜ": "ze",
    "で": "de",
    "べ": "be",
    "ぺ": "pe",

    "ご": "go",
    "ぞ": "zo",
    "ど": "do",
    "ぼ": "bo",
    "ぽ": "po",

    "ゃ": "lya", "や": "ya",
    "ゅ": "lyu", "ゆ": "yu",
    "ょ": "lyo", "よ": "yo",


    "ぁ": "la", "あ": "a",
    "ぃ": "li", "い": "i",
    "ぅ": "lu", "う": "u",
    "ぇ": "le", "え": "e",
    "ぉ": "lo", "お": "o",
    "ん": "n",

    // long vowel

    "ー": "-"

}

toKanaMap.katakana = {
    "キャ": "kya",
    "シャ": "sha",
    "チャ": "cha",
    "ニャ": "nya",
    "ヒャ": "hya",
    "ミャ": "mya",
    "リャ": "rya",
    "ギャ": "gya",

    "ビャ": "bya",
    "ピャ": "pya",

    "キュ": "kyu",
    "シュ": "shu",
    "チュ": "chu",
    "ニュ": "nyu",
    "ヒュ": "hyu",
    "ミュ": "myu",
    "リュ": "ryu",
    "ギュ": "gyu",

    "ビュ": "byu",
    "ピュ": "pyu",

    "キョ": "kyo",
    "ショ": "sho",
    "チョ": "cho",
    "ニョ": "nyo",
    "ヒョ": "hyo",
    "ミョ": "myo",
    "リョ": "ryo",
    "ギョ": "gyo",

    "ビョ": "byo",
    "ピョ": "pyo",

    "フュ": "fyu",

    "ツァ": "tsa",
    "ツィ": "tsi",
    "ツェ": "tse",
    "ツォ": "tso",

    "チェ": "che",
    "シェ": "she",

    "シ": "si",
    "チ": "ti",
    "ツ": "tu",

    "ジョ": "jo",
    "ジャ": "ja",
    "ジュ": "ju",

    "ファ": "fa",
    "フィ": "fi",
    "フェ": "fe",
    "フォ": "fo",


    "ウィ": "wi",
    "ウェ": "we",



    "ヴァ": "va",
    "ヴィ": "vi",
    "ヴェ": "ve",
    "ヴォ": "vo",



    "ジェ": "je",
    "ティ": "thi",
    "ディ": "dhi",
    "デュ": "d'yu",
    "トゥ": "tu",


    //basic


    "カ": "ka",
    "サ": "sa",
    "タ": "ta",
    "ナ": "na",
    "ハ": "ha",
    "マ": "ma",
    "ラ": "ra",


    "キ": "ki",

    "ニ": "ni",
    "ヒ": "hi",
    "ミ": "mi",
    "リ": "ri",


    "ク": "ku",
    "ス": "su",

    "ヌ": "nu",
    "フ": "fu",
    "ム": "mu",
    "ル": "ru",


    "ケ": "ke",
    "セ": "se",
    "テ": "te",
    "ネ": "ne",
    "ヘ": "he",
    "メ": "me",
    "レ": "re",


    "コ": "ko",
    "ソ": "so",
    "ト": "to",
    "ノ": "no",
    "ホ": "ho",
    "モ": "mo",
    "ロ": "ro",

    "ワ": "wa",
    "ヲ": "wo",


    "ガ": "ga",
    "ザ": "za",
    "ダ": "da",
    "バ": "ba",
    "パ": "pa",

    "ギ": "gi",
    "ジ": "ji",
    "ヂ": "di",
    "ビ": "bi",
    "ピ": "pi",

    "グ": "gu",
    "ズ": "zu",
    "ヅ": "du",
    "ブ": "bu",
    "プ": "pu",

    "ゲ": "ge",
    "ぜ": "ze",
    "デ": "de",
    "ベ": "be",
    "ペ": "pe",

    "ゴ": "go",
    "ゾ": "zo",
    "ド": "do",
    "ボ": "bo",
    "ポ": "po",

    "ャ": "lya", "ヤ": "ya",
    "ュ": "lyu", "ユ": "yu",
    "ョ": "lyo", "ヨ": "yo",


    "ン": "n",
    "ァ": "la", "ア": "a",
    "ィ": "li", "イ": "i",
    "ゥ": "lu", "ウ": "u",
    "ェ": "le", "エ": "e",
    "ォ": "lo", "オ": "o",



    // long vowel

    "ー": "-"

}

var longVowelsMap = {
    'a': 'ā',
    'e': 'ē',
    'i': 'ī',
    'o': 'ō',
    'u': 'ū'
}

var toHiraganaMap = swapJsonKeyValues(toKanaMap.hiragana);
var toKatakanaMap = swapJsonKeyValues(toKanaMap.katakana);
var revLongVowelsMap =  swapJsonKeyValues(longVowelsMap);

function toHiragana(romaji) {
    var result = romaji.toLowerCase();

    result = result.replace(/((?![aeiou])[a-z])\1{1}/g,'っ$1')

    for (var r in toHiraganaMap) {
        result = replaceAll(r, toHiraganaMap[r], result);
    }

    return result;
}

function toKatakana(romaji) {
    var result = romaji.toLowerCase();

    var revlongVowelsReplacer = function(match,p1){
        return revLongVowelsMap[p1]+'ー';
    }

    result = result.replace(/([āēīōū])/g, revlongVowelsReplacer);

    for (var r in toKatakanaMap) {
        result = replaceAll(r, toKatakanaMap[r], result);
    }

    return result;
}

function fromKana(kana) {

    var result = kana;

    var longVowelsReplacer = function (match, p1) {
        return longVowelsMap[p1];
    }

    //basic dictionary matching
    for (var index in toKanaMap) {
        for (var s in toKanaMap[index]) {
            result = replaceAll(s, toKanaMap[index][s], result);
        }
    }

    //replace long vowels
    result = result.replace(/([aeiou])ー/g, longVowelsReplacer);

    //replace the sokuon (doubling)
    result = result.replace(/(ッ|っ)([a-z])/g, "$2$2");

    return result;
}
