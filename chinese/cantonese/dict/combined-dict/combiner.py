#!/usr/bin/env python3

import re
import os
import sys
import itertools

# 0:traditional, 1:simplified, 2:pinyin, 3:definition
CEDICT_PATT = re.compile(r'^([^ ]+) ([^ ]+) \[(.*)?\] /(.*)?/$')
# 0:traditional, 1:simplified, 2:pinyin, 3:jyutping
CCCEDICT_CANTO_PATT = re.compile(r'^([^ ]+) ([^ ]+) \[(.*)?\] \{(.*)?\}$')
# 0:traditional, 1:simplified, 2:pinyin, 3:jyutping, 4:definition
CCCANTO_PATT = re.compile(r'^([^ ]+) ([^ ]+) \[(.*)?\] \{(.*)?\} /(.*)?/$')
# 0:traditional, 1:jytping, 2:pinyin, 3:definition, 4:type, 5:index
CANTODICT_PATT = re.compile(r'^(...*)?\t(.*)?\t(.*)?\t(.*)?\t(.*)?\t(.*)?$')
# 0:traditional, 1:jytping, 2:pinyin, 3:definition, 4:type, 5:index
CANTODICT_CHAR_PATT = re.compile(r'^(.)?\t(.*)?\t(.*)?\t(.*)?\t(.*)?\t(.*)?$')

# single pinyin reading
PINYIN_PATT = re.compile(r'([a-zü:]+)([1-9/*]+)')

# fix common errors
REPLACEMENTS = {
    re.compile('^yau$'): 'jau',
    re.compile('^au$'): 'jau',
    re.compile('^jua$'): 'jau',
    re.compile('eong$'): 'oeng',
    re.compile('eung$'): 'oeng',
    re.compile('u:|ü'): 'v',
}

TONE_REPLACEMENTS = {
    '7': '1',
    '8': '3',
    '9': '6',
}


class DictEntry(object):
    def __init__(self):
        self.definitions = []
        self.jyutping = ''
        self.type = ''


def detect_filetype(filename):
    with open(filename) as f:
        for line in f:
            for filetype in [
                CEDICT_PATT,
                CCCEDICT_CANTO_PATT,
                CCCANTO_PATT,
                CANTODICT_PATT,
                CANTODICT_CHAR_PATT
            ]:
                if filetype.match(line):
                    return filetype

def expand(reading):
    base = reading[0]
    for replace in REPLACEMENTS:
        base = replace.sub(REPLACEMENTS[replace], base)
    readings = []
    for tone in set(re.split(r'[/*]+', reading[1])):
        if tone in TONE_REPLACEMENTS:
            tone = TONE_REPLACEMENTS[tone]
        readings.append(base + tone)
    return readings

def normalize_pinyin(word, pinyin):
    pinyin = pinyin.lower()

    length_test = [PINYIN_PATT.findall(p) for p in re.split(r'(?<=[\s\d])/(?=[^\d*])', pinyin)]
    if len(length_test) == 1:
        parts = length_test[0]
        if len(word) == 1 < len(parts):
            readings = set()
            for part in parts:
                for reading in expand(part):
                    readings.add(reading)
            return '/'.join(sorted(readings))
        else:
            readings = itertools.product(*[expand(r) for r in parts])
            return '/'.join([' '.join(r) for r in sorted(readings)])
    elif (len(length_test) == 2 and len(length_test[0]) == len(length_test[1])):
        return '/'.join([' '.join([''.join(p) for p in r]) for r in sorted(length_test)])
    else:
        readings = [expand(p) for p in length_test[0]]
        for part in length_test[1:]:
            first, rest = part[0], part[1:]
            readings[-1] += expand(first)
            for p in rest:
                readings.append(expand(p))
        readings = list(itertools.product(*readings))
        return '/'.join([' '.join(r) for r in sorted(readings)])


def parse_entries(filename, pattern):
    with open(filename) as f:
        for line in f:
            try:
                yield pattern.match(line).groups()
            except AttributeError:
                pass

def combine_dictionaries():
    input_files = {}

    for filename in os.listdir():
        filetype = detect_filetype(filename)
        if filetype and filetype not in input_files:
            input_files[filetype] = filename

    combined_dict = {}
    pinyin_by_traditional = {}
    def cache_pinyin(traditional, pinyin):
        if traditional not in pinyin_by_traditional:
            pinyin_by_traditional[traditional] = set()
        pinyin_by_traditional[traditional].add(pinyin)

    # basic cedict
    for traditional, _, pinyin, definition in parse_entries(input_files[CEDICT_PATT], CEDICT_PATT):
        pinyin = normalize_pinyin(traditional, pinyin)
        key = (traditional, pinyin)
        cache_pinyin(traditional, pinyin)
        if key not in combined_dict:
            combined_dict[key] = DictEntry()
        combined_dict[key].definitions.append(f'[CC] {definition}')

    # add jyutping
    for traditional, _, pinyin, jyutping in parse_entries(input_files[CCCEDICT_CANTO_PATT], CCCEDICT_CANTO_PATT):
        pinyin = normalize_pinyin(traditional, pinyin)
        jyutping = normalize_pinyin(traditional, jyutping)
        key = (traditional, pinyin)
        cache_pinyin(traditional, pinyin)
        if key in combined_dict:
            combined_dict[key].jyutping = jyutping

    # merge cccanto
    for traditional, _, pinyin, jyutping, definition in parse_entries(input_files[CCCANTO_PATT], CCCANTO_PATT):
        pinyin = normalize_pinyin(traditional, pinyin)
        jyutping = normalize_pinyin(traditional, jyutping)
        key = (traditional, pinyin)
        cache_pinyin(traditional, pinyin)
        if key not in combined_dict:
            combined_dict[key] = DictEntry()
        combined_dict[key].jyutping = jyutping
        definition = re.sub(r'1\.\s?', '', definition)
        definition = re.sub(r'\s*?/\s*', ', ', definition)
        definition = re.sub(r';?\s?\d\.\s?|;\s?', '/', definition)
        combined_dict[key].definitions.append(f'[CCC] {definition}')

    # merge cantodict
    for filename, patt in [(input_files[p], p) for p in [CANTODICT_PATT, CANTODICT_CHAR_PATT]]:
        for traditional, jyutping, pinyin, definition, type, _ in parse_entries(filename, patt):
            if not pinyin and traditional in pinyin_by_traditional:
                pinyin = next(iter(pinyin_by_traditional[traditional]))
            else:
                pinyin = normalize_pinyin(traditional, pinyin)
            jyutping = normalize_pinyin(traditional, jyutping)
            key = (traditional, pinyin)
            if key not in combined_dict:
                combined_dict[key] = DictEntry()
            if not combined_dict[key].jyutping:
                combined_dict[key].jyutping = jyutping
            combined_dict[key].type = type
            combined_dict[key].definitions.append(f'[CD] {definition}')

    return combined_dict

def main():
    combined_dict = combine_dictionaries()

    for key in sorted(combined_dict):
        traditional, pinyin = key
        entry = combined_dict[key]
        output_line = '\t'.join((traditional, pinyin, entry.jyutping, entry.type, '/'.join(entry.definitions)))
        if output_line.count('\t') == 4:
            print(output_line)
        else:
            raise Exception(f'Invalid output line: {output_line}')

if __name__ == '__main__':
    main()
