#!/usr/bin/env python3

import os
import sys

import bs4

def parse_page(soup):
    table = soup.find('td', string='jyutping').parent.parent
    for row in table.find_all('tr')[1:-1]:
        data = row.find_all('td')
        yield tuple(d.text.strip().replace('\t', ' ') for d in data[:5]) + ((data[0].find('a') or {'href': '/////'})['href'].split('/')[5],)

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
