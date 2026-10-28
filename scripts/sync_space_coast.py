"""Import SWITCH's public schedule without embedding a third-party page."""
import json
import re
import time
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import Request, urlopen

SOURCE = 'https://www.spacecoastlive.com/embed/bands/00000cb1-0000-0000-0000-000000000000/schedule?theme=dark'
OUTPUT = Path(__file__).resolve().parents[1] / 'space-coast-dates.json'


class ScheduleParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.events = []
        self.event = None
        self.band = ''
        self.widget = False
        self.empty = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get('class', '').split()
        self.widget |= 'schedule-widget' in classes
        self.empty |= 'schedule-empty' in classes
        field = None
        if tag == 'article' and 'schedule-event' in classes:
            self.event = {'date': '', 'venue': '', 'time': '', 'description': ''}
        if self.event is not None:
            if tag == 'time' and 'datetime' in attrs:
                self.event['date'] = attrs['datetime'][:10]
            if tag == 'h2':
                field = 'venue'
            elif 'event-time' in classes:
                field = 'time'
            elif 'event-description' in classes:
                field = 'description'
        if tag == 'h1':
            field = 'band'
        if tag not in {'meta', 'link', 'br', 'img', 'input', 'hr', 'source'}:
            self.stack.append((tag, field))

    def handle_data(self, data):
        field = next((field for _, field in reversed(self.stack) if field), None)
        if field == 'band':
            self.band += data
        elif self.event is not None and field:
            self.event[field] += data

    def handle_endtag(self, tag):
        if tag == 'article' and self.event is not None:
            event = {key: re.sub(r'\s+', ' ', value).strip() for key, value in self.event.items()}
            datetime.strptime(event['date'], '%Y-%m-%d')
            if not event['venue'] or not event['time']:
                raise ValueError('Incomplete schedule event; keeping the previous schedule')
            self.events.append(event)
            self.event = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


def parse_schedule(html):
    parser = ScheduleParser()
    parser.feed(html)
    if not parser.widget or parser.band.strip().casefold() != 'switch ft. ana':
        raise ValueError('Unexpected schedule page; keeping the previous schedule')
    if not parser.events and not parser.empty:
        raise ValueError('Unrecognized schedule markup; keeping the previous schedule')
    unique = {(e['date'], e['venue'].casefold(), e['time']): e for e in parser.events}
    return sorted(unique.values(), key=lambda e: (e['date'], e['time'], e['venue']))


def main():
    for attempt in range(3):
        try:
            request = Request(SOURCE, headers={'User-Agent': 'SWITCH-website-schedule-sync/1.0'})
            with urlopen(request, timeout=30) as response:
                events = parse_schedule(response.read().decode('utf-8'))
            break
        except Exception:
            if attempt == 2:
                raise
            time.sleep(2 ** attempt)
    OUTPUT.write_text(json.dumps({'source': SOURCE, 'events': events}, ensure_ascii=False, indent=2) + '\n')
    print(f'Imported {len(events)} SWITCH shows')


if __name__ == '__main__':
    main()
