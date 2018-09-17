#!/usr/bin/env python3

import os


class SimplifiedData(object):
    def __init__(self, path):
        self.trad_to_simp = []
        self.trad_to_simp_map = {}
        self.simp_to_trad = []
        self.simp_to_trad_map = {}

        with open(os.path.join(path, "trad_to_simp.tsv")) as f:
            for i, line in enumerate(f.read().splitlines()):
                key, *values = line.split("\t")
                self.trad_to_simp.append([key] + values)
                self.trad_to_simp_map[key] = i

        with open(os.path.join(path, "simp_to_trad.tsv")) as f:
            for i, line in enumerate(f.read().splitlines()):
                key, *values = line.split("\t")
                self.simp_to_trad.append([key] + values)
                self.simp_to_trad_map[key] = i

    def _expand_dict(self, this_dict, this_dict_map, other_dict, priorize):
        for line in other_dict:
            key, *values = line
            if key not in this_dict_map:
                this_dict_map[key] = len(this_dict)
                this_dict.append([key] + values)
            else:
                if priorize:
                    new_line = [key] + values
                    for value in this_dict[this_dict_map[key]][1:]:
                        if value not in new_line[1:]:
                            new_line.append(value)
                    this_dict[this_dict_map[key]] = new_line
                else:
                    line = this_dict[this_dict_map[key]]
                    for value in values:
                        if value not in line[1:]:
                            line.append(value)

    def expand(self, other, priorize=False):
        self._expand_dict(
            self.trad_to_simp, self.trad_to_simp_map, other.trad_to_simp, priorize
        )
        self._expand_dict(
            self.simp_to_trad, self.simp_to_trad_map, other.simp_to_trad, priorize
        )


def main():
    base_dict = SimplifiedData("combined-dict")
    other_dict = SimplifiedData("kaifang")
    base_dict.expand(other_dict, priorize=True)

    open("trad_to_simp.tsv", "w").close()
    with open("trad_to_simp.tsv", "a") as f:
        for line in base_dict.trad_to_simp:
            f.write("\t".join(line) + "\n")

    open("simp_to_trad.tsv", "w").close()
    with open("simp_to_trad.tsv", "a") as f:
        for line in base_dict.simp_to_trad:
            f.write("\t".join(line) + "\n")


if __name__ == "__main__":
    main()
