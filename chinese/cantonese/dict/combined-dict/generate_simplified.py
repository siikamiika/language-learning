#!/usr/bin/env python3

import re
import os

MAX_TRY_FILETYPE = 100

# 0:traditional, 1:simplified, 2:pinyin, 3:definition
CEDICT_PATT = re.compile(r'^([^ ]+) ([^ ]+) \[(.*)?\] /(.*)?/$')
# 0:traditional, 1:simplified, 2:pinyin, 3:jyutping
CCCEDICT_CANTO_PATT = re.compile(r'^([^ ]+) ([^ ]+) \[(.*)?\] \{(.*)?\}$')
# 0:traditional, 1:simplified, 2:pinyin, 3:jyutping, 4:definition
CCCANTO_PATT = re.compile(r'^([^ ]+) ([^ ]+) \[(.*)?\] \{(.*)?\} /(.*)?/$')


def detect_filetype(filename):
    with open(filename) as f:
        line_count = 0
        for line in f:
            line_count += 1
            for filetype in [
                CEDICT_PATT,
                CCCEDICT_CANTO_PATT,
                CCCANTO_PATT,
            ]:
                if filetype.match(line):
                    return filetype
            if line_count >= MAX_TRY_FILETYPE:
                return


def parse_entries(filename, pattern):
    with open(filename) as f:
        for line in f:
            try:
                yield pattern.match(line).groups()
            except AttributeError:
                pass


def main():
    input_files = {}

    for filename in os.listdir():
        filetype = detect_filetype(filename)
        if filetype and filetype not in input_files:
            input_files[filetype] = filename

    trad_to_simp = {}
    simp_to_trad = {}

    for filetype, filename in input_files.items():
        for traditional, simplified, *_ in parse_entries(filename, filetype):
            for trad_char, simp_char in zip(traditional, simplified):
                if trad_char not in trad_to_simp:
                    trad_to_simp[trad_char] = []
                if simp_char not in trad_to_simp[trad_char]:
                    trad_to_simp[trad_char].append(simp_char)

                if simp_char not in simp_to_trad:
                    simp_to_trad[simp_char] = []
                if trad_char not in simp_to_trad[simp_char]:
                    simp_to_trad[simp_char].append(trad_char)

    open('trad_to_simp.tsv', 'w').close()
    with open('trad_to_simp.tsv', 'a') as f:
        for trad_char in trad_to_simp:
            if len(trad_to_simp[trad_char]) == 1 and trad_to_simp[trad_char][0] == trad_char:
                continue
            simp_chars = '\t'.join(trad_to_simp[trad_char])
            f.write(f'{trad_char}\t{simp_chars}\n')

    open('simp_to_trad.tsv', 'w').close()
    with open('simp_to_trad.tsv', 'a') as f:
        for simp_char in simp_to_trad:
            if len(simp_to_trad[simp_char]) == 1 and simp_to_trad[simp_char][0] == simp_char:
                continue
            trad_chars = '\t'.join(simp_to_trad[simp_char])
            f.write(f'{simp_char}\t{trad_chars}\n')

if __name__ == '__main__':
    main()
