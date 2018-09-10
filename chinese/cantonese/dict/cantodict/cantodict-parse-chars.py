#!/usr/bin/env python3

import os
import sys

import bs4

def parse_page(soup):
    table = soup.find('td', string='jyutping').parent.parent
    for row in table.find_all('tr')[1:]:
        raw_data = row.find_all('td')

        parsed_data = (raw_data[0].text.split('/')[0].strip(),)
        parsed_data += tuple(d.text.strip() for d in raw_data[1:4])
        if 'DELETE' in parsed_data[3]:
            continue
        char_type = raw_data[4].find('span')
        if char_type:
            parsed_data += (char_type.text.strip(),)
        else:
            parsed_data += ('',)
        parsed_data += (raw_data[0].find('a')['href'].split('/')[5],)

        yield parsed_data

def parse_pages(path):
    for page in sorted(os.listdir(path)):
        print(page, file=sys.stderr)
        with open(os.path.join(path, page), encoding='utf-8', errors='ignore') as f:
            soup = bs4.BeautifulSoup(f.read(), 'html5lib')
        for entry in parse_page(soup):
            yield entry

def main():
    for page in sorted(parse_pages(sys.argv[1])):
        print('\t'.join(page))

if __name__ == '__main__':
    main()
