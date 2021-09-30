import requests
import time

# change the address here to be your desired NFT
url = "https://api.opensea.io/asset/0xd5e793c08ce6e4bc225b64f19496629a81873c22/"
#url = "https://testnets-api.opensea.io/asset/0xe2e489d6e0fb45c206fe6ed3b1dc36887f2aab4c/"
update_flag = "/?force_update=true"

ids = [ i for i in range(0, 2222)]

for i in ids:
  req_url = url + str(i) + update_flag
  r = requests.get(req_url)
  print(i, r.status_code)
  time.sleep(1.1)
