#!/usr/bin/env python3

import os
import sys
import re

import bs4

CLEANUP = [
    (re.compile("^[\u200b\s]*"), ""),
    (re.compile("[\u200b\s]+"), " "),
]

CLEANUP_PINYIN = [
    # remove single TW pinyin that occurs before a PRC pinyin
    #                [tw pinyin]   [TW annotation        ][maybe /][PRC lookahead    ]
    (re.compile(r"\s?[a-z]+[1-6]\s*[\(\[](Taiwan|TW)[\)\]]\s*/?\s*(?=[a-z]+[1-6]\s*[\(\[])"), ""),
    # same but in reverse
    (re.compile(r"(?<=[\)\]])\s*/?\s*[a-z]+[1-6]\s*[\(\[](Taiwan|TW)[\)\]]"), ""),

    # remove entire TW pinyin blocks
    (re.compile(r"^.+?[\(\[](Taiwan|TW)[\)\]][,;]? "), ""),
    (re.compile(r"(?<=[\)\]])[,;]? .+?[\(\[](Taiwan|TW)[\)\]]"), ""),

    # normalize
    (re.compile("\s*;\s*"), "/"),
]

def parse_page(soup):
    table = soup.find('td', string='jyutping').parent.parent
    for row in table.find_all('tr')[1:-1]:
        data = row.find_all('td')
        cleaned_data = []
        for i, d in enumerate(data[:5]):
            d = d.text.strip().replace('\t', ' ')
            for patt, repl in CLEANUP:
                d = patt.sub(repl, d)
            if i in [1, 2]:
                for patt, repl in CLEANUP_PINYIN:
                    d = patt.sub(repl, d)
            cleaned_data.append(d)
        yield tuple(cleaned_data) + ((data[0].find('a') or {'href': '/////'})['href'].split('/')[5],)

def parse_pages(path):
    for page in sorted(os.listdir(path)):
        print(page, file=sys.stderr)
        with open(os.path.join(path, page)) as f:
            soup = bs4.BeautifulSoup(f.read(), 'html5lib')
        for entry in parse_page(soup):
            yield entry

def main():
    for page in sorted(parse_pages(sys.argv[1])):
        print('\t'.join(page))

if __name__ == '__main__':
    main()
