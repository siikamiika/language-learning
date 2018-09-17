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
        traditional = raw_dictionary[pos]
        if JYUTPING_PATT.match(traditional):
            raise Exception("something's wrong")
        pos += 1

        simplified = raw_dictionary[pos]
        if JYUTPING_PATT.match(traditional):
            raise Exception("something's wrong")
        pos += 1

        jyutping = raw_dictionary[pos]
        if not JYUTPING_PATT.match(jyutping):
            raise Exception("something's wrong")
        pos += 1

        yield traditional, simplified, jyutping


def main():
    trad_to_simp = {}
    simp_to_trad = {}
    for traditional, simplified, jyutping in parse_entries(read_file(sys.argv[1])):
        if simplified not in simp_to_trad:
            simp_to_trad[simplified] = []
        if traditional not in simp_to_trad[simplified]:
            simp_to_trad[simplified].append(traditional)

        if traditional not in trad_to_simp:
            trad_to_simp[traditional] = []
        if simplified not in trad_to_simp[traditional]:
            trad_to_simp[traditional].append(simplified)

    open("trad_to_simp.tsv", "w").close()
    with open("trad_to_simp.tsv", "a") as f:
        for trad_char in trad_to_simp:
            if (
                len(trad_to_simp[trad_char]) == 1
                and trad_to_simp[trad_char][0] == trad_char
            ):
                continue
            simp_chars = "\t".join(trad_to_simp[trad_char])
            f.write(f"{trad_char}\t{simp_chars}\n")

    open("simp_to_trad.tsv", "w").close()
    with open("simp_to_trad.tsv", "a") as f:
        for simp_char in simp_to_trad:
            if (
                len(simp_to_trad[simp_char]) == 1
                and simp_to_trad[simp_char][0] == simp_char
            ):
                continue
            trad_chars = "\t".join(simp_to_trad[simp_char])
            f.write(f"{simp_char}\t{trad_chars}\n")


if __name__ == "__main__":
    main()
