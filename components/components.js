import React, { Component, useState, useEffect } from 'react';
//import ReactMarkdown from 'react-markdown'
import Head from 'next/head'
import Link from 'next/link'
import Web3 from "web3";
import { fetchAPI } from '../lib/api'
import {ADDRESS, ABI} from "../config.js"
import { Share } from 'react-twitter-widgets'

export class Header extends Component {
    render() {
    return <Head>
    <title>The Wapuu NFT Collection</title>
    <link rel="icon" href="/wapuu-app/images/white-trans.png" />
  
    <meta property="og:title" content="The Wapuu NFT Collection" key="ogtitle" />
    <meta property="og:description" content="2,222 one-of-a-kind Wapuus NFTs that can be minted, collected, and traded by the WordPress community." key="ogdesc" />
    <meta property="og:type" content="website" key="ogtype" />
    <meta property="og:url" content="https://web3wp.com/wapuus/" key="ogurl"/>
    <meta property="og:image" content="https://web3wp.infiniteuploads.cloud/2021/09/wapuu-designs-tw.png" key="ogimage"/>
    <meta property="og:site_name" content="Web3 WP" key="ogsitename" />
  
    <meta name="twitter:card" content="summary_large_image" key="twcard"/>
    <meta property="twitter:domain" content="web3wp.com" key="twdomain" />
    <meta property="twitter:url" content="https://web3wp.com/wapuus/" key="twurl" />
    <meta name="twitter:title" content="The Wapuu NFT Collection" key="twtitle" />
    <meta name="twitter:description" content="2,222 one-of-a-kind Wapuus NFTs that can be minted, collected, and traded by the WordPress community." key="twdesc" />
    <meta name="twitter:image" content="https://web3wp.infiniteuploads.cloud/2021/09/wapuu-designs-tw.png" key="twimage" />
  </Head>
    }
  }

export class Navigation extends Component {
  render() {
    return <div className="flex items-center justify-between w-full px-6 pb-4">
    <a href="https://web3wp.com/" className="" title="Web3 WP Home"><img src="/wapuu-app/images/white-trans.png" width="75" alt="Web3 WP Logo" className="logo-image" /></a>
    <nav className="flex flex-wrap flex-row justify-around Poppitandfinchsans text-2xl md:text-4xl text-white hover:text-gray">
      <Link href="/">
        <a className="m-1 sm:m-3 md:m-6">Mint</a>
      </Link>
      <Link href="/specials">
        <a className="m-1 sm:m-3 md:m-6">Specials</a>
      </Link>
      <Link href="/og-collector">
        <a className="m-1 sm:m-3 md:m-6">Pin</a>
      </Link>
      <a href="https://web3wp.com/wapuus/" className="m-1 sm:m-3 md:m-6">About</a>
    </nav>
  </div>
  }
}

export function MintButton(props) {
 
  if (props.signedIn) { 
    if (props.saleStarted) {
      return (
        <>
        <button onClick={props.onClick} className="Poppitandfinchsans mt-4 rounded text-4xl border-6 bg-blau  text-white hover:text-gray p-2 px-4">Mint {props.wapuus} Wapuu for {(props.wapuuPrice * props.wapuus) / (10 ** 18)} ETH + Gas</button>        
        <div className="montserrat text-center text-sm text-white mt-2">
          <Link href="https://web3wp.com/blog/how-to-mint-nft-wapuu/">
            <a className="underline">Confused? Watch our video walkthrough...</a>
          </Link>
        </div>
        </>
      )
    } else {
      return (
        <button disabled className="Poppitandfinchsans mt-4 rounded text-3xl border-6 bg-gray-400 rounded text-black p-2 px-4">Sale Has Not Started</button>        
      )
    }
  } else {
    return (
      <button disabled className="Poppitandfinchsans mt-4 rounded text-3xl border-6 bg-gray-400 rounded text-black p-2 px-4">CONNECT WALLET</button>        
    )
  }
}

export function ConnectButton(props) {
 
  if (props.signedIn) {
    return (
      <button onClick={props.signOut} className="rounded montserrat inline-block border-2 border-white border-opacity-50 no-underline text-white hover:text-gray py-2 px-4 mx-4 shadow-lg hover:bg-gray-500 hover:text-gray-100">Wallet Connected: {props.walletAddress.substring(0,6)}...{props.walletAddress.substring(38)}</button>
      )
  } else {
    return (
      <>
      <button onClick={props.signIn} className="rounded montserrat inline-block border-2 border-black bg-white border-opacity-100 no-underline hover:text-gray py-2 px-4 mx-4 shadow-lg bg-blue-500 hover:text-gray-100">Connect Wallet with Metamask</button>
      <div className="montserrat text-sm text-center text-white mt-1">
        <Link href="https://web3wp.com/blog/how-to-setup-blockchain-digital-wallet/">
          <a className="underline">Need help setting up your wallet?</a>
        </Link>
      </div>
      </>
    )
  }
}


export function LatestNFT() {

  // FOR WALLET
  const [signedIn, setSignedIn] = useState(false)
  const [walletAddress, setWalletAddress] = useState(null)
  const [wapuuContract, setWapuuContract] = useState(null)
  const [latestWapuu, setLatestWapuu] = useState(false)

  useEffect( async() => { 
    signIn()
  }, [])

  async function signIn() {
    if (typeof window.web3 !== 'undefined') {
      // Use existing gateway
      //window.web3 = new Web3(window.ethereum);
      window.web3 = new Web3(Web3.givenProvider);
      window.ethereum.enable()
        .then(function (accounts) {
          window.web3.eth.net.getNetworkType()
          // checks if connected network is mainnet (change this to rinkeby if you wanna test on testnet)
          .then((network) => {console.log(network);if(network != "main"){alert("You are on " + network+ " network. Change network to Mainnet or you won't be able to do anything here")} });  
          let wallet = accounts[0]
          setWalletAddress(wallet)
          setSignedIn(true)
          callContractData(wallet)

      })
      .catch(function (error) {
      // Handle error. Likely the user rejected the login
        console.error(error)
      })

    }

  }
  
  async function callContractData(wallet) {
    const wapuuContract = new window.web3.eth.Contract(ABI, ADDRESS)
    setWapuuContract(wapuuContract)

    if (walletAddress) {
      var specials = []
      for (let i = 0; i < 2222; i++) {
        specials.push(i);
      }
      var addresses = []
      for (let i = 0; i < specials.length; i++) {
        addresses.push(walletAddress);
      }
      var myOwned = [];
      const ownedWapuus = await wapuuContract.methods.balanceOfBatch(addresses,specials).call()
      console.log("Owned" , ownedWapuus)
      ownedWapuus.forEach((owned, key) => {
        if ( parseInt(owned) ) {
          myOwned.push(parseInt(specials[key]));
        }
      });

      const items = [...myOwned];
      items.reverse();
      console.log("Owned" , items)

      fetchAPI(parseInt(items[0]).toString(16), 'GET') //convert to hex for api
        .catch(function (error) {
          setError(error.message)
        })
        .then(function (data) {
          if (data && data.name) {
            data.token = items[0];
            data.additional = items.length;
            setLatestWapuu(data)
          }
        });
      
    }
  }

  if (latestWapuu && latestWapuu.pending !== undefined) { 
    return (
      <>
      <div className="Poppitandfinchsans text-xl text-white text-center mb-4">
      Whoops, our API hasn't confirmed the finalized transaction yet, give it a bit and try again.
      </div>
      <button onClick={() => signIn()} className="Poppitandfinchsans mt-4 rounded text-4xl border-6 bg-blau text-white hover:text-gray p-2 px-6 mb-8">Reveal Again...</button>                
      </>
    )
  }

  if (!latestWapuu && walletAddress) { 
    return (
      <button onClick={() => signIn()} className="Poppitandfinchsans mt-4 rounded text-4xl border-6 bg-blau text-white hover:text-gray p-2 px-6 mb-8">Reveal Now...</button>                
    )
  }

  return (
    <div className="mb-6 flex flex-col items-center">
    <div className="flex flex-col items-center mb-2">
      <div className="flex justify-center">
        <div className="shadow rounded-lg overflow-hidden max-w-md">
          <a title="View on OpenSea" target="_blank" href={"https://opensea.io/assets/"+ADDRESS+"/"+latestWapuu.token+"/"}>
            <img src={latestWapuu.external_url} className="rounded-t-lg w-full" />
            <div className="p-2 bg-gray-50 text-center">
              <p className="text-3xl font-bold Poppitandfinchsans text-black">{latestWapuu.name}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
    {latestWapuu.additional > 1 ?
    <div className="flex Poppitandfinchsans text-xl text-white items-center bg-grey-lighter rounded rounded-r-none mb-4">
    And {latestWapuu.additional-1} more...
    </div>
    : <></>
    }
    <div className="Poppitandfinchsans text-4xl text-white text-center bg-grey-lighter rounded rounded-r-none mb-4">
    Show off your new Wapuu!
    </div><Share
      url={"https://opensea.io/assets/"+ADDRESS+"/"+latestWapuu.token+"/"} 
      options={{
        text: "Checkout the "+latestWapuu.name+" #NFT I just minted on Web3 WP! You can mint your own at web3wp.com/wapuus/",
        hashtags: "Wapuu,WordPress,NFTdrop",
        via: "web3wp",
        size: "large",
        dnt: true
      }}
    />
    
    </div>
  )
}