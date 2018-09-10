#!/usr/bin/env python3

import os
import time
import urllib.parse

import requests

USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64; rv:61.0) Gecko/20100101 Firefox/61.0'

PROTO = 'http'
DOMAIN = 'www.cantonese.sheik.co.uk'
RESOURCE = '/scripts/wordlist.htm'
QUERY = dict(
    action='',
    wordtype='0',
    level='-1',
    page=None,
)
PAGE_COUNT = 3025
# QUERY = '?action=&wordtype=0&level=-1&page=3023'
# QUERY = '?action=&wordtype=0&level=-1&page=0'


def http_get(url, **headers):
    if 'user-agent' not in [k.lower() for k in headers]:
        headers['User-Agent'] = USER_AGENT
    return requests.get(url, headers=headers)


def download_page(page_ord):
    query = dict(QUERY)
    query['page'] = page_ord
    url = urllib.parse.urlunparse([
        PROTO, DOMAIN, RESOURCE, None, urllib.parse.urlencode(query), ''])

    with open(os.path.join('pages', f'{page_ord:04d}.html'), 'wb') as f:
        f.write(http_get(url).content)
    print(page_ord)


def main():
    os.makedirs('pages', exist_ok=True)
    downloaded = {int(p.split('.')[0]) for p in os.listdir('pages')}
    for page_ord in range(PAGE_COUNT):
        if page_ord not in downloaded:
            download_page(page_ord)
            time.sleep(0.1)

if __name__ == '__main__':
    main()
