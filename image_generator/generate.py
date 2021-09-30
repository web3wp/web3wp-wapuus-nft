#!/usr/bin/env python
# coding: utf-8

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont
import random
import json
import hashlib
import shutil

# Each image is made up a series of traits
# The weightings for each trait drive the rarity and add up to 100%

background = ["Blue", "Gradient", "Green", "Grey Wave", "Grey", "Off White", "Orange", "Pink", "Rainbow", "White", "Yellow"]
background_weights = [9, 4, 10, 3, 11, 15, 12, 11, 2, 12, 11]

body = ["Dark Brown", "Gradient", "Green", "Grey", "Light Brown", "Light", "Original", "Pink"]
body_weights = [13,2,8,5,15,14,35,8]

item = ["Balloon", "Basketball", "Black Guitar", "Blue Ball", "Bomb", "Bubbles", "Fire Tire", "Gold Coin", "Gradient CSS", "Gradient HTML", "Gradient JS", "Gradient", "Green Ball", "Green CSS", "Green JS", "Pink Ball", "Pink Guitar", "Record", "Rocket", "Sheriff Badge", "Silver Coin", "Snowball", "Speaker", "Target"]
item_weights = [4,6,1,7,4,3,2.25,4,6,6,6,7,7,5,5,6,0.75,3,2,3,4,3,2,3]

clothing = ["Clown", "Cowboy", "Emo", "Fancy", "Hip Hop", "Motorcycle", "Nerd", "None", "Pirate", "Punk", "Santa", "Sports", "Swim", "Tattoo", "Winter"]
clothing_weights = [5,6,4,7,3,6,9,21,4,2,4,9,5,6,9]

shoes = ["Basketball", "Clown", "Cowboy", "Emo", "Fancy", "Flippers", "Hightop", "Motorcycle", "Nerd", "None", "Pirate", "Punk", "Santa", "Winter"]
shoes_weights = [10, 6, 9, 4, 8, 3, 8, 4, 8, 19, 7, 5, 2, 7]

headgear = ["Blue Hat Orange Hair", "Blue Mohawk", "Clown Hat", "Cowboy Hat", "Emo Hair Black", "Emo Hair Blond", "Emo Hair Brown", "Emo Hair Pink", "Fancy Hair Brown", "Fancy Hair Pink", "Green Glasses", "Green Hat Pink hair", "Green Mohawk", "Green W Hat", "Grey Beanie", "Headphones", "Motorcycle Helmet", "Nerd Hair Black Glasses", "Nerd Hair Green Glasses", "Nerd Hair Purple Glasses", "Nerd Hair", "None", "Orange Beanie", "Pink W Hat", "Pirate Hat", "Rag Hat", "Red W Hat", "Rock Hair", "Santa Hat", "Snorkling Mask", "Winter Hat Blue", "Winter Hat Orange"]
headgear_weights = [5,.25,2,3,6,4,3,2,5,2,4,4,.5,3,2,1.25,3,3,3,2,12,4,5,1,2,3,2,1,2,3,3,4]

accessories = ["Fancy Earring Gold", "Fancy Earring Silver", "Gold Hoop Earring", "Green Earring", "None", "Silver Earring"]
accessories_weights = [2,11,5,9,60,13]


## Generate Traits

TOTAL_IMAGES = 2222 # Number of random unique images we want to generate

all_images = []

# A recursive function to generate unique image combinations
def create_new_image():

    new_image = {} #

    # For each trait category, select a random trait based on the weightings
    new_image ["Background"] = random.choices(background, background_weights)[0]
    new_image ["Body"] = random.choices(body, body_weights)[0]
    new_image ["Item"] = random.choices(item, item_weights)[0]
    new_image ["Clothing"] = random.choices(clothing, clothing_weights)[0]
    new_image ["Shoes"] = random.choices(shoes, shoes_weights)[0]
    new_image ["Headgear"] = random.choices(headgear, headgear_weights)[0]
    new_image ["Accessory"] = random.choices(accessories, accessories_weights)[0]

    if new_image in all_images:
        return create_new_image()
    else:
        return new_image


# Generate the unique combinations based on trait weightings
for i in range(TOTAL_IMAGES):

    new_trait_image = create_new_image()

    all_images.append(new_trait_image)


# Returns true if all images are unique
def all_images_unique(all_images):
    seen = list()
    return not any(i in seen or seen.append(i) for i in all_images)

print("Are all images unique?", all_images_unique(all_images))


# Add token Id to each image
i = 0
for item in all_images:
    item["tokenId"] = i
    i = i + 1

#we use this to generate url hashes so that people can't guess unminted image urls from cloud storage and ruin the surprise
IMAGE_HASH_SALT = "wapuusalt_jdyr8ma0d7d"

#### Generate Images
for item in all_images:

  im1 = Image.open(f'./trait-layers/backgrounds/{item["Background"].lower().replace(" ", "-")}.png').convert('RGBA')
  im2 = Image.open(f'./trait-layers/bodies/{item["Body"].lower().replace(" ", "-")}.png').convert('RGBA')
  im3 = Image.open(f'./trait-layers/items/{item["Item"].lower().replace(" ", "-")}.png').convert('RGBA')
  im4 = Image.open(f'./trait-layers/clothing/{item["Clothing"].lower().replace(" ", "-")}.png').convert('RGBA')
  im5 = Image.open(f'./trait-layers/shoes/{item["Shoes"].lower().replace(" ", "-")}.png').convert('RGBA')
  im6 = Image.open(f'./trait-layers/headgear/{item["Headgear"].lower().replace(" ", "-")}.png').convert('RGBA')
  im7 = Image.open(f'./trait-layers/accessories/{item["Accessory"].lower().replace(" ", "-")}.png').convert('RGBA')

  #Merge the layers
  comp = Image.alpha_composite(Image.alpha_composite(Image.alpha_composite(Image.alpha_composite(Image.alpha_composite(Image.alpha_composite(im1, im2), im3), im4), im5), im6), im7)

  #Convert to RGB
  rgb_im = comp.convert('RGB')

  #newsize = (500, 500)
  #rgb_im = rgb_im.resize(newsize)
  '''font = ImageFont.truetype('Handlee-Regular.ttf', 300)
  ImageDraw.Draw(
    rgb_im  # Image
    ).text(
        (50, 850),  # Coordinates
        'SAMPLE NFT',  # Text
        (255,0,0),
        font=font
    )
  '''
  salt = str(item["tokenId"]) + IMAGE_HASH_SALT
  file_name = hashlib.md5(salt.encode()).hexdigest() + ".png"
  rgb_im.save("./images/" + file_name,optimize=True)

#### Generate Metadata for each Image
data = []

IMAGES_BASE_URI = "https://web3wp.infiniteuploads.cloud/wapuus/"
PROJECT_NAME = "Wapuu"

def getAttribute(key, value):
    return {
        "trait_type": key,
        "value": value
    }

#special editions
f = open('./metadata/special-wapuus.json','r')
specials = json.load(f)
random.shuffle(specials)

#creates an array of random numbers that don't repeat for each special in the range. Start at 50 so the team reserve doesn't get any
random_tokens = random.sample(range(50, TOTAL_IMAGES), len(specials))

key = 0
for i in all_images:
    token_id = i['tokenId']
    salt = str(token_id) + IMAGE_HASH_SALT
    file_name = hashlib.md5(salt.encode()).hexdigest() + '.png'

    if token_id not in random_tokens:
        token = {
            "image": IMAGES_BASE_URI + file_name,
            "external_url": IMAGES_BASE_URI + file_name,
            "tokenId": token_id,
            "name": PROJECT_NAME + ' #' + str(token_id),
            "attributes": []
        }
        
        token["attributes"].append(getAttribute("Background", i["Background"]))
        token["attributes"].append(getAttribute("Body", i["Body"]))
        token["attributes"].append(getAttribute("Item", i["Item"]))
        token["attributes"].append(getAttribute("Clothing", i["Clothing"]))
        token["attributes"].append(getAttribute("Shoes", i["Shoes"]))
        token["attributes"].append(getAttribute("Headgear", i["Headgear"]))
        token["attributes"].append(getAttribute("Accessory", i["Accessory"]))
    else:
        shutil.copy("./trait-layers/complete/"+specials[key]["file"], "./images/" + file_name)
        #demo processing
        rgb_im = Image.open(f"./images/" + file_name).convert('RGB')
        #newsize = (500, 500)
        #rgb_im = rgb_im.resize(newsize)
        '''ImageDraw.Draw(rgb_im).text(
            (50, 850),  # Coordinates
            'SAMPLE NFT',  # Text
            (255,0,0),
            font=font
        )
        '''
        rgb_im.save("./images/" + file_name,optimize=True)

        token = {
            "image": IMAGES_BASE_URI + file_name,
            "external_url": IMAGES_BASE_URI + file_name,
            "tokenId": token_id,
            "name": PROJECT_NAME + ' #' + str(token_id) + " - " + specials[key]["name"],
            "description": specials[key]["description"],
            "secret_content": specials[key]["secret_content"],
            "attributes": [{
                "value": "Special Edition"
            }]
        }
        if (specials[key]["secret_content"]):
            token["attributes"].append({"value": "Secret Content"})
        key += 1

    data.insert(token_id, token)


#### Save Metadata for all Traits
METADATA_FILE_NAME = '../api/all-traits.json';
with open(METADATA_FILE_NAME, 'w') as outfile:
    json.dump(data, outfile, indent=4)







