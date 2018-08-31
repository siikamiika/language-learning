#!/usr/bin/env python3
import os
import json
from os.path import dirname, realpath
import tornado.ioloop
import tornado.web

os.chdir(dirname(realpath(__file__)))


class CantoDict(object):
    def __init__(self, dict_path):
        self.dict_path = dict_path
        self.dict = {}
        self._read_dict()

    def query(self, word):
        return self.dict.get(word) or []

    def _read_dict(self):
        with open(self.dict_path) as f:
            words = [w.split('\t') for w in f.read().splitlines()]
        for word in words:
            key = word[0]
            if key not in self.dict:
                self.dict[key] = []
            self.dict[key].append(word[1:])


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
            return None

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


class SynonymDict(object):
    def __init__(self, dict_path):
        self.dict_path = dict_path
        self.dict = {}
        self._read_dict()

    def query(self, word):
        return self.dict.get(word) or []

    def _read_dict(self):
        with open(self.dict_path) as f:
            for word, *synonyms in [l.split('\t') for l in f.read().splitlines()]:
                self.dict[word] = synonyms


class ParseHandler(tornado.web.RequestHandler):
    def initialize(self, parser):
        self.parser = parser

    def post(self):
        self.set_header('Content-Type', 'application/json')
        input_data = json.loads(self.request.body.decode('utf-8'))
        result = [self.parser.parse_text(l) for l in input_data['text'].splitlines()]
        self.write(json.dumps(result, ensure_ascii=False))


class DictHandler(tornado.web.RequestHandler):
    def initialize(self, dictionary):
        self.dictionary = dictionary

    def get(self):
        self.set_header('Cache-Control', 'max-age=3600')
        self.set_header('Content-Type', 'application/json')
        query = self.get_query_argument('query').strip()
        result = self.dictionary.query(query)
        self.write(json.dumps(result, ensure_ascii=False))


class SynonymDictHandler(tornado.web.RequestHandler):
    def initialize(self, dictionary):
        self.dictionary = dictionary

    def get(self):
        self.set_header('Cache-Control', 'max-age=3600')
        self.set_header('Content-Type', 'application/json')
        query = self.get_query_argument('query').strip()
        result = self.dictionary.query(query)
        self.write(json.dumps(result, ensure_ascii=False))


def get_app(parser, dictionary, synonym_dictionary):
    return tornado.web.Application([
        (r'/parse', ParseHandler, dict(parser=parser)),
        (r'/dict', DictHandler, dict(dictionary=dictionary)),
        (r'/synonym_dict', SynonymDictHandler, dict(dictionary=synonym_dictionary)),
        (r'/(.*)', tornado.web.StaticFileHandler,
         {'path': 'static', 'default_filename': 'index.html'}),
    ])


def main():
    canto_parser = CantoParser('sorted_words_expanded.txt')
    canto_dict = CantoDict('canto_dict_combined.txt')
    synonym_dictionary = SynonymDict('hk_synonyms.tsv')
    address, port = '', 9899
    app = get_app(canto_parser, canto_dict, synonym_dictionary)
    app.listen(port, address=address)
    main_loop = tornado.ioloop.IOLoop.instance()
    main_loop.start()

if __name__ == '__main__':
    main()
