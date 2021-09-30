const API_URL = "https://api.web3wp.com/wapuus/"

export async function fetchAPI(path, method, data) {
  const headers = { 'Content-Type': 'application/json' }

  const res = await fetch(API_URL + path, {
    method: method,
    headers,
    body: JSON.stringify(data),
  })

  const json = await res.json()
  if (json.error) {
    console.error(json.error)
    throw new Error(json.error)
  }
  return json
}
