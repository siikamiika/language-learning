#!/usr/bin/env python3
import sys

class CantoParser(object):
    def __init__(self, dict_path):
        self.dict_path = dict_path
        # {word: reading}
        self.dict = {}
        # {'a': {'b': {'c': {'EOW': True}}}} -> 'abc'
        self.trie = {}
        # update self.dict and self.trie
        self._read_dict()

    def parse_text(self, text):
        pos = 0
        # (word, [reading1, ...])
        matches = []
        while pos < len(text):
            # longest word from pos
            match = self._find_word(text[pos:])
            if match:
                matches.append((match, self._get_reading(match)))
                pos += len(match)
            # no match, add char to matches without readings
            else:
                matches.append((text[pos], self._get_reading(text[pos])))
                pos += 1
        return matches

    def _find_word(self, text):
        pos = 0
        trie_pos = self.trie
        # longest possible word so far
        last_eow = 0
        while pos < len(text):
            # trie continues
            if text[pos] in trie_pos:
                # a word ends here but another can continue and overwrite last_eow
                if 'EOW' in trie_pos[text[pos]]:
                    last_eow = pos
                trie_pos = trie_pos[text[pos]]
                pos += 1
            # trie ends
            else:
                break
        return text[:last_eow + 1]

    def _get_reading(self, word):
        if word in self.dict:
            return self.dict[word]
        else:
            return ''

    def _read_dict(self):
        with open(self.dict_path) as f:
            words = [w.split('\t') for w in f.read().splitlines()]
        # generate readings for individual characters not in the dictionary by themselves
        chars = {}
        for word, reading in words:
            # add word to dictionary
            if word not in self.dict:
                self.dict[word] = []
            self.dict[word].append(reading)
            # add word to trie and individual chars to chars
            trie_pos = self.trie
            char_readings = reading.split()
            if len(char_readings) != len(word):
                # TODO: handle these instead of skipping
                continue
            for char, char_reading in zip(word, char_readings):
                # char
                if char not in chars:
                    chars[char] = set()
                chars[char].add(char_reading)
                # trie
                if char not in trie_pos:
                    trie_pos[char] = {}
                trie_pos = trie_pos[char]
            # set end of word
            trie_pos['EOW'] = True
        # add generated chars to dict
        for char in chars:
            if char not in self.dict:
                self.dict[char] = []
            if char not in self.trie:
                self.trie[char] = {}
                self.trie[char]['EOW'] = True
            for reading in chars[char]:
                if reading not in self.dict[char]:
                    self.dict[char].append(reading)

def main():
    canto_parser = CantoParser('sorted_words_expanded.txt')
    print(canto_parser.parse_text(' '.join(sys.argv[1:])))

if __name__ == '__main__':
    main()
