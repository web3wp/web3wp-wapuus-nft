
#!/usr/bin/env python
# coding: utf-8

import json
import hashlib
import requests

#### Overwrite Metadata for each Image
data = []

f = open('../api/all-traits.json','r')
source = json.load(f)
f.close()

key = 0
for i in source:
    token = i
    token_id = i['tokenId']
    if ( 'secret_content' in i ):
        data.insert(token_id, i['name'])

#### Save Metadata for all Traits
#METADATA_FILE_NAME = '../api/all-traits.json';
#with open(METADATA_FILE_NAME, 'w') as outfile:
#    json.dump(data, outfile, indent=4)
#f.close()

print(json.dumps(data, indent=4))



