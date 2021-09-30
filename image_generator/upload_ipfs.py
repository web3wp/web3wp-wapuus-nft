#!/usr/bin/env python
# coding: utf-8

import json
import hashlib
import requests

#### Overwrite Metadata for each Image
data = []

#we use this to generate url hashes so that people can't guess unminted image urls from cloud storage and ruin the surprise
IMAGE_HASH_SALT = "wapuusalt_jdyr8ma0d7d"

f = open('../api/all-traits.json','r')
source = json.load(f)
f.close()

key = 0
for i in source:
    token = i
    token_id = i['tokenId']
    salt = str(token_id) + IMAGE_HASH_SALT
    file_name = hashlib.md5(salt.encode()).hexdigest() + '.png'

    files = {
        'file': open("./images/" + file_name, 'rb')
    }
    # Create IPFS credentials for this via infura.io for using their api to upload and pin the files.
    response = requests.post('https://ipfs.infura.io:5001/api/v0/add', files=files, auth=("xxxxxxxx","xxxxxxxxx"))
    p = response.json()
    token["image"] = "ipfs://" + p["Hash"]

    data.insert(token_id, token)

#### Save Metadata for all Traits
METADATA_FILE_NAME = '../api/all-traits.json';
with open(METADATA_FILE_NAME, 'w') as outfile:
    json.dump(data, outfile, indent=4)
f.close()





