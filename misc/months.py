import random
from random import randint
import sys
from subprocess import Popen, DEVNULL

months_en = [(mo, mo[0:3]) for mo in [
        'january',
        'february',
        'march',
        'april',
        'may',
        'june',
        'july',
        'august',
        'september',
        'october',
        'november',
        'december',
    ]]
 
months_fi = [(mo, mo[:-3]) for mo in [
        'tammikuu',
        'helmikuu',
        'maaliskuu',
        'huhtikuu',
        'toukokuu',
        'kesäkuu',
        'heinäkuu',
        'elokuu',
        'syyskuu',
        'lokakuu',
        'marraskuu',
        'joulukuu',
    ]]

class Question(object):
    def __init__(self, monthlist, question_type=None, offset=None):
        self.months = monthlist
        self.q = question_type
        if not self.q:
            self.q = random.choice([
                'order_num',
                #'name',
                'abbreviation',
                ])
        self.index = random.randint(0, 11)
        self.offset = offset
        if self.offset == None:
            max_offset = 2
            r = list(range(-max_offset, max_offset+1))
            if self.index > 11 - max_offset:
                r = r[:9 - self.index]
            elif self.index < max_offset:
                r = r[2 - self.index:]
            self.offset = random.choice(r + [0]*5)

    def ask(self):

        if self.q == 'order_num':
            question = 'No. of {}'.format(self.months[self.index][0])
            if self.offset != 0:
                question += '{:+d}'.format(self.offset)
            question += '? '
            q = lambda: self._correct_order_num(input(question))

        elif self.q == 'name':
            if self.offset == 0:
                question = 'Name of the month no. {}? '.format(self.index + 1)
            else:
                question = 'Name of the month {}{:+d}? '.format(self.months[self.index][0], self.offset)
            q = lambda: self._correct_name(input(question))

        elif self.q == 'abbreviation':
            if self.offset == 0:
                question = 'Abbr of mo no. {}? '.format(self.index + 1)
            else:
                question = 'Abbr of {}{:+d}? '.format(self.months[self.index][1], self.offset)
            q = lambda: self._correct_abbreviation(input(question))

        while True:
            if q():
                break
            else:
                print('WRONG')
                Popen('ffplay -autoexit -nodisp -f lavfi -i "sine=frequency=1000:duration=0.2"',
                        shell=True, stdout=DEVNULL, stderr=DEVNULL)

    def _correct_order_num(self, answer):
        try:
            answer = int(answer)
        except ValueError:
            pass
        return self.index + 1 + self.offset == answer
    
    def _correct_name(self, answer):
        return self.months[self.index + self.offset][0] == answer

    def _correct_abbreviation(self, answer):
        return self.months[self.index + self.offset][1] == answer

def main():
    if sys.argv[1] == 'fi':
        l = months_fi
    elif sys.argv[1] == 'en':
        l = months_en
    while True:
        Question(l).ask()

if __name__ == '__main__':
    main()
