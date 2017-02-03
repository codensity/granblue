#!/usr/bin/env python3

import json
from lxml import html
from lxml.cssselect import CSSSelector
import requests

html_filename = 'character_weapons.html'
html_content = None
try:
    with open(html_filename, 'r') as f:
        html_content = f.read()
except IOError as e:
    response = requests.get('https://gbf.wiki/Module:Sandbox/Botanist/CharacterWeapons/doc')
    html_content = response.content
    with open(html_filename, 'wb') as f:
        f.write(html_content)

tree = html.fromstring(html_content)
def extract_row(row):
    name = row[5].text
    if name.startswith('Sandbox/'):
        name = row[4][0].text
    return {
        'name': name,
        'rarity': row[6].text,
        'element': row[7].text,
        'type': row[8].text,
        'race': row[9].text,
        'join_weapon': row[10].text
    }
def keep_row(row):
    join_weapon = row['join_weapon']
    name = row['name']
    return join_weapon != '???' and \
           join_weapon != '' and \
           name != 'name'
data = list(filter(keep_row, map(extract_row, CSSSelector('table tr')(tree))))
data.sort(key=lambda row: row['name'])
print(json.dumps({'characters': data}, indent=4, sort_keys=True))
