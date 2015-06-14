from bs4 import BeautifulSoup as BS
import html5lib
import os

def soup(path):
    with open(path, encoding='utf-8') as f:
        raw = f.read()
    return BS(raw, 'html5lib')

def fix(page):
    # google analytics
    for script in page('script'):
        script.extract()
    # local css
    css = page.find('link', {'type': 'text/css'})
    css['href'] = '../../kana.css'


def main():
    for root, subdirs, files in os.walk('.'):
        for fn in files:
            if fn == 'index.html':
                filename = os.path.join(root, fn)
                s = soup(filename)
                fix(s)
                print('writing {}...'.format(filename))
                with open(filename, 'wb') as f:
                    f.write(s.prettify('utf-8'))

if __name__ == '__main__':
    main()
