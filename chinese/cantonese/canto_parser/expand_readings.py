#!/usr/bin/env python3
import sys
import re

def expand_reading(word):
    length = len(word[0])
    readings_raw = re.sub(r'[^a-z0-9 ]+', ' ', word[1])
    readings_raw = re.sub(r'\s+\/\s+', '/', word[1])

    first = True
    type = -1
    prev = []
    groups = readings_raw.split('/')
    for group in groups:
        group = group.split()
        if first:
            first = False
        else:
            size = min(len(prev), len(group))
            if size < length:
                type = 0
            else:
                type = 1
            break
        prev = group
    readings = []
    if type == 0 and len(groups) == 2:
        base = groups[0].split()
        readings.append(base)
        readings.append([*base[:-1], groups[1]])
    elif type == 1:
        readings = [g.split() for g in groups]
    else:
        raise ValueError

    return readings

def main():
    with open(sys.argv[1]) as f:
        words = [w.split('\t') for w in f.read().splitlines()]
    for w in words:
        if '/' in w[1]:
            for r in expand_reading(w):
                print(f"{w[0]}\t{' '.join(r)}")
        else:
            print(f'{w[0]}\t{w[1]}')

if __name__ == '__main__':
    main()
