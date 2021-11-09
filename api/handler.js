'use strict';
const Web3 = require('web3');
const config = require('./config-'+process.env.STAGE+'.json');
const safeCompare = require('safe-compare');

module.exports.getWapuu = async (event) => {
  console.log("Event", event)
  console.log("Stage", process.env.STAGE)

  const defaultDescription = "Wapuu is the lovable, open source, and (un)official mascot of WordPress. Wapuu swag has been created and collected at WordCamp conferences around the world. [Web3 WP](https://web3wp.com) has taken the next step by building a generative art project of 2,222 unique Wapuus that can be minted as an NFT, collected, and traded by the WordPress community.";
 
  // import the json containing all metadata. not recommended, try to fetch the database from a middleware if possible, I use MONGODB for example
  const traits = require('./all-traits.json')

  // SOME WEB3 STUFF TO CONNECT TO SMART CONTRACT
  const provider = new Web3.providers.HttpProvider(config.infuraAddress)
  const web3infura = new Web3(provider);
  const wapuuContract = new web3infura.eth.Contract(config.contractABI, config.contractAddress)

  // IF YOU ARE USING INSTA REVEAL MODEL, USE THIS TO GET HOW MANY NFTS ARE MINTED
  const totalSupply = await wapuuContract.methods.totalSupply().call();
  console.log("Total supply", totalSupply)

  // THE ID YOU ASKED IN THE URL
  let tokenId = event.pathParameters.id || "F423F"; //default to 404
  tokenId = parseInt(event.pathParameters.id, 16);

  // IF YOU ARE USING INSTA REVEAL MODEL, UNCOMMENT THIS AND COMMENT THE TWO LINES BELOW
  if (tokenId >= 2222) {
    return {
      statusCode: 404,
      body: JSON.stringify(
        {error: "The Wapuu you requested is out of range."},
      ),
    };
  } else if (tokenId < totalSupply) {
  //const totalWapuus = 1000;
  //if(tokenId < totalWapuus) {

    // IF YOU ARE NOT USING CUSTOM NAMES, JUST USE THIS
    //let tokenName= `Wapuu #${parseInt( tokenId )}`
    
    let {...metadata} = traits[tokenId];

    // CHECK OPENSEA METADATA STANDARD DOCUMENTATION https://docs.opensea.io/docs/metadata-standards

    // CALL CUSTOM TOKEN NAME IN THE CONTRACT, only if it's not a special edition
    if ( ! metadata.secret_content ) {
      const tokenNameCall = await wapuuContract.methods.viewWapuuName(tokenId).call();
      metadata.name = `Wapuu #${tokenId}${(tokenNameCall === '') ? "" : ` - ${tokenNameCall}`}`
      if ( tokenNameCall ) {
        if ( ! metadata.attributes.some(e => e.value === "Custom Name") ) {
          metadata.attributes.push({
            "value": "Custom Name"
          });
        }
      }
    }

    //not for the public
    delete metadata.secret_content;

    if ( ! metadata.description ) {
      metadata.description = defaultDescription;
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(
        metadata,
      ),
    };
  } else { //not yet detected minted
    var metadata = {
      "name": `Wapuu #${tokenId}`,
      "description": defaultDescription,
      "image": "https://wapuus-nft.s3.amazonaws.com/default.png",
      "external_url": "https://wapuus-nft.s3.amazonaws.com/default.png",
      "pending": true
    }
  
    return {
      statusCode: 200,
      body: JSON.stringify(
        metadata,
      ),
    };
  }

};

module.exports.postVerify = async (event) => {

  // import the json containing all metadata. For a large collection use a DB probably.
  const traits = require('./all-traits.json')

  const requestBody = JSON.parse(event.body);
  const address = requestBody.address;
  const signature = requestBody.signature;

  if (typeof address !== 'string' || typeof signature !== 'string') {
    console.error('Validation Failed');
    return {
      statusCode: 400,
      body: JSON.stringify(
        {error: "The signature or address parameters is invalid or missing."},
      ),
    };
  }

  // SOME WEB3 STUFF TO CONNECT TO SMART CONTRACT
  const provider = new Web3.providers.HttpProvider(config.infuraAddress);
  const web3infura = new Web3(provider);
  web3infura.eth.handleRevert = true;


  let signer = await web3infura.eth.accounts.recover("Verify Wapuu NFT ownership", signature);
  console.log(signer,address,signature);
  if ( ! safeCompare(signer.toLowerCase(), address.toLowerCase()) ) {
    return {
      statusCode: 403,
      body: JSON.stringify(
        {error: "Invalid signature."},
      ),
    };
  }

  const wapuuContract = new web3infura.eth.Contract(config.contractABI, config.contractAddress);
  console.log("ABI loaded");

  var output = [];
  var addresses = []
  //this is based off the generated metadata. Any Wapuu with secret content is special
  var specials = []
  traits.forEach((wapuu, key) => {
    if ( wapuu.secret_content ) {
      specials.push(key);
    }
  });
  console.log("Specials",specials);
  
  for (let i = 0; i < specials.length; i++) {
    addresses.push(address);
  }
  //look up ownership of all special tokens for this address in batch.
  //This is a workaround because my custom tokensOfOwner() method had a bug in the version deployed to mainnet
  const ownedWapuus = await wapuuContract.methods.balanceOfBatch(addresses,specials).call() 
  console.log("Owned Wapuus",ownedWapuus);

  ownedWapuus.forEach((owned, key) => {
    if ( parseInt(owned) ) {
      let meta = traits[parseInt(specials[key])]
      if ( meta.secret_content ) {
        output.push(meta);
      }
    }
  });

  console.log("Output", output);

  return {
    statusCode: 200,
    body: JSON.stringify(
      {owned: output},
    ),
  };
};


module.exports.postOGVerify = async (event) => {

  // import the json containing all metadata.
  const ogs = require('./og-collectors.json')

  const requestBody = JSON.parse(event.body);
  const address = requestBody.address;
  const signature = requestBody.signature;

  if (typeof address !== 'string' || typeof signature !== 'string') {
    console.error('Validation Failed');
    return {
      statusCode: 400,
      body: JSON.stringify(
        {error: "The signature or address parameters is invalid or missing."},
      ),
    };
  }

  // SOME WEB3 STUFF TO CONNECT TO SMART CONTRACT
  const provider = new Web3.providers.HttpProvider(config.infuraAddress);
  const web3infura = new Web3(provider);
  web3infura.eth.handleRevert = true;


  let signer = await web3infura.eth.accounts.recover("Verify Wapuu NFT ownership", signature);
  console.log(signer,address,signature);
  if ( ! safeCompare(signer.toLowerCase(), address.toLowerCase()) ) {
    return {
      statusCode: 403,
      body: JSON.stringify(
        {error: "Invalid signature."},
      ),
    };
  }

  const wapuuContract = new web3infura.eth.Contract(config.contractABI, config.contractAddress);
  console.log("ABI loaded");

  var output = {};

  if ( ogs[address] !== undefined ) {
    output.url = ogs[address];
  } else {
    output.url = false;
  }

  console.log("Output", output);

  return {
    statusCode: 200,
    body: JSON.stringify(
      output,
    ),
  };
};

//Handle verifying wallet ownership to return owned renamable Wapuus
module.exports.postOwned = async (event) => {

  // import the json containing all metadata. For a large collection use a DB probably.
  const traits = require('./all-traits.json')

  // import the json containing all metadata.
  const ogs = require('./og-collectors.json')

  const requestBody = JSON.parse(event.body);
  const address = requestBody.address;
  const signature = requestBody.signature;

  if (typeof address !== 'string' || typeof signature !== 'string') {
    console.error('Validation Failed');
    return {
      statusCode: 400,
      body: JSON.stringify(
        {error: "The signature or address parameters is invalid or missing."},
      ),
    };
  }

  // SOME WEB3 STUFF TO CONNECT TO SMART CONTRACT
  const provider = new Web3.providers.HttpProvider(config.infuraAddress);
  const web3infura = new Web3(provider);
  web3infura.eth.handleRevert = true;

  let signer = await web3infura.eth.accounts.recover("Verify Wapuu NFT ownership", signature);
  console.log(signer,address,signature);
  if ( ! safeCompare(signer.toLowerCase(), address.toLowerCase()) ) {
    return {
      statusCode: 403,
      body: JSON.stringify(
        {error: "Invalid signature."},
      ),
    };
  }

  if ( ogs[address] === undefined ) {
    return {
      statusCode: 403,
      body: JSON.stringify(
        {error: "Sorry, only OG POAP collectors can name right now."},
      ),
    };
  }

  const wapuuContract = new web3infura.eth.Contract(config.contractABI, config.contractAddress);
  console.log("ABI loaded");

  const totalSupply = await wapuuContract.methods.totalSupply().call();
  console.log("Total supply", totalSupply)

  var output = [];
  var addresses = []
  //this is based off the generated metadata. Any Wapuu with secret content is special
  
  var tokens = []
  for (let i = 0; i < totalSupply; i++) {
    tokens.push(i);
  }
  var addresses = []
  for (let i = 0; i < tokens.length; i++) {
    addresses.push(address);
  }
      
  //look up ownership of all special tokens for this address in batch.
  //This is a workaround because my custom tokensOfOwner() method had a bug in the version deployed to mainnet
  const ownedWapuus = await wapuuContract.methods.balanceOfBatch(addresses,tokens).call() 
  //console.log("Owned Wapuus",ownedWapuus);

  output = await Promise.all(tokens.map(async (tokenId) => {
    if ( parseInt( ownedWapuus[tokenId] ) ) {
      let meta = traits[tokenId]
      if ( meta.secret_content ) { //skip special editions
        return null;
      }
      const tokenNameCall = await wapuuContract.methods.viewWapuuName(tokenId).call();
      meta.name = `Wapuu #${tokenId}${(tokenNameCall === '') ? "" : ` - ${tokenNameCall}`}`
      return meta;
    } else {
      return null;
    }
  }));

  output = output.filter(e => e != null);

  console.log("Output", output);
  
  return {
    statusCode: 200,
    body: JSON.stringify(
      {owned: output},
    ),
  };
};

//get list of renamable owned wapuus for a given address
module.exports.getOwned = async (event) => {

  // import the json containing all metadata. For a large collection use a DB probably.
  const traits = require('./all-traits.json')

  const walletAddress = event.pathParameters.wallet || false; //default to 404

  if (typeof walletAddress !== 'string') {
    console.error('Validation Failed');
    return {
      statusCode: 400,
      body: JSON.stringify(
        {error: "The address parameter is invalid or missing."},
      ),
    };
  }

  // SOME WEB3 STUFF TO CONNECT TO SMART CONTRACT
  const provider = new Web3.providers.HttpProvider(config.infuraAddress);
  const web3infura = new Web3(provider);
  web3infura.eth.handleRevert = true;

  const wapuuContract = new web3infura.eth.Contract(config.contractABI, config.contractAddress);
  console.log("ABI loaded");

  const totalSupply = await wapuuContract.methods.totalSupply().call();
  console.log("Total supply", totalSupply)

  var output = [];
  var addresses = []
  
  var tokens = []
  for (let i = 0; i < totalSupply; i++) {
    tokens.push(i);
  }
  var addresses = []
  for (let i = 0; i < tokens.length; i++) {
    addresses.push(walletAddress);
  }
      
  //look up ownership of all special tokens for this address in batch.
  //This is a workaround because my custom tokensOfOwner() method had a bug in the version deployed to mainnet
  const ownedWapuus = await wapuuContract.methods.balanceOfBatch(addresses,tokens).call() 
  //console.log("Owned Wapuus",ownedWapuus);

  output = await Promise.all(tokens.map(async (tokenId) => {
    if ( parseInt( ownedWapuus[tokenId] ) ) {
      let meta = traits[tokenId]
      if ( meta.secret_content ) { //skip special editions
        return null;
      }
      const tokenNameCall = await wapuuContract.methods.viewWapuuName(tokenId).call();
      meta.name = `Wapuu #${tokenId}${(tokenNameCall === '') ? "" : ` - ${tokenNameCall}`}`
      return meta;
    } else {
      return null;
    }
  }));

  output = output.filter(e => e != null);

  console.log("Output", output);
  
  return {
    statusCode: 200,
    body: JSON.stringify(
      {owned: output},
    ),
  };
};