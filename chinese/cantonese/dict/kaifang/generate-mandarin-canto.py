#!/usr/bin/env python3

import sys
import json
import re

JYUTPING_PATT = re.compile(r"[a-z]+[1-6]")


def read_file(filename):
    with open(filename) as f:
        for line in f:
            if line.startswith("["):
                return json.loads(line)


def parse_entries(raw_dictionary):
    pos = 0

    while pos < len(raw_dictionary):
        canto_word = raw_dictionary[pos]
        if JYUTPING_PATT.match(canto_word):
            raise Exception("something's wrong")
        pos += 1

        jyutping = []
        try:
            while True:
                if JYUTPING_PATT.match(raw_dictionary[pos]):
                    jyutping.append(raw_dictionary[pos])
                    pos += 1
                else:
                    break
        except IndexError:
            yield canto_word, jyutping, []
            break

        mandarin_words = []
        if JYUTPING_PATT.match(raw_dictionary[pos + 1]):
            pass
        else:
            mandarin_words = [w for w in raw_dictionary[pos].split('，') if w]
            pos += 1

        yield canto_word, jyutping, mandarin_words


def main():
    mandarin_to_canto = {}
    for canto_word, jyutping, mandarin_words in parse_entries(read_file(sys.argv[1])):
        for mandarin_word in mandarin_words:
            if mandarin_word not in mandarin_to_canto:
                mandarin_to_canto[mandarin_word] = []
            if canto_word not in mandarin_to_canto[mandarin_word]:
                mandarin_to_canto[mandarin_word].append(canto_word)

    for mandarin_word in sorted(mandarin_to_canto):
        canto_words = "\t".join(mandarin_to_canto[mandarin_word])
        print(f"{mandarin_word}\t{canto_words}")


if __name__ == "__main__":
    main()
