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
PINYIN_PATT = re.compile(r'([a-z]+)([1-9/*]+)')

# fix common errors
REPLACEMENTS = {
    'yau': 'jau',
    'au': 'jau',
    'jua': 'jau',
    'seong': 'soeng',
    'leong': 'loeng',
    'zeong': 'zoeng',
    'ceong': 'coeng',
    'geong': 'goeng',
    'jeong': 'joeng',
    'heong': 'hoeng',
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
    if base in REPLACEMENTS:
        base = REPLACEMENTS[base]
    elif not base:
        return []
    readings = []
    for tone in set(re.split(r'[/*]', reading[1])):
        readings.append(base + tone)
    return readings

def normalize_pinyin(word, pinyin):
    pinyin = pinyin.lower()
    parts = list(PINYIN_PATT.findall(pinyin))
    if len(word) == 1 < len(parts):
        readings = set()
        for part in parts:
            for reading in expand(part):
                readings.add(reading)
        return '/'.join(sorted(readings))
    else:
        readings = itertools.product(*[expand(r) for r in parts])
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

    # basic cedict
    for traditional, _, pinyin, definition in parse_entries(input_files[CEDICT_PATT], CEDICT_PATT):
        pinyin = normalize_pinyin(traditional, pinyin)
        key = (traditional, pinyin)
        if key not in combined_dict:
            combined_dict[key] = DictEntry()
        combined_dict[key].definitions.append(definition)

    # add jyutping
    for traditional, _, pinyin, jyutping in parse_entries(input_files[CCCEDICT_CANTO_PATT], CCCEDICT_CANTO_PATT):
        pinyin = normalize_pinyin(traditional, pinyin)
        jyutping = normalize_pinyin(traditional, jyutping)
        key = (traditional, pinyin)
        if key in combined_dict:
            combined_dict[key].jyutping = jyutping

    # merge cccanto
    for traditional, _, pinyin, jyutping, definition in parse_entries(input_files[CCCANTO_PATT], CCCANTO_PATT):
        pinyin = normalize_pinyin(traditional, pinyin)
        jyutping = normalize_pinyin(traditional, jyutping)
        key = (traditional, pinyin)
        if key not in combined_dict:
            combined_dict[key] = DictEntry()
        combined_dict[key].jyutping = jyutping
        combined_dict[key].definitions.append(definition)

    # merge cantodict
    for filename, patt in [(input_files[p], p) for p in [CANTODICT_PATT, CANTODICT_CHAR_PATT]]:
        for traditional, jyutping, pinyin, definition, type, _ in parse_entries(filename, patt):
            pinyin = normalize_pinyin(traditional, pinyin)
            jyutping = normalize_pinyin(traditional, jyutping)
            key = (traditional, pinyin)
            if key not in combined_dict:
                combined_dict[key] = DictEntry()
            if not combined_dict[key].jyutping:
                combined_dict[key].jyutping = jyutping
            combined_dict[key].type = type
            combined_dict[key].definitions.append(definition)

    return combined_dict

def main():
    combined_dict = combine_dictionaries()

    for key in sorted(combined_dict):
        traditional, pinyin = key
        entry = combined_dict[key]
        for definition in entry.definitions:
            output_line = '\t'.join((traditional, pinyin, entry.jyutping, entry.type, definition))
            if output_line.count('\t') == 4:
                print(output_line)
            else:
                raise Exception(f'Invalid output line: {output_line}')

if __name__ == '__main__':
    main()
