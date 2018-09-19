#!/usr/bin/env python3

import sys
import re

LINE_PATT = re.compile(r"^U\+[0-9A-F]+\t(.*)$")
VARIANT_PATT = re.compile(r"^([^\[]+)")


def choose_variant(variants):
    choice_type = None
    choice = variants[0]
    for variant in variants:
        if choice_type in [None, "G"] and "T" in variant:
            choice = variant
            break
        elif not choice_type and "G" in variant:
            choice = variant
    return VARIANT_PATT.search(choice).group(1)


def main():
    with open(sys.argv[1]) as f:
        for line in f:
            match = LINE_PATT.match(line)
            if match:
                data = match.group(1).split('\t')
                print(f'{data[0]}\t{choose_variant(data[1:])}')


if __name__ == "__main__":
    main()
