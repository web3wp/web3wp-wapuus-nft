import Head from 'next/head'
import Router from 'next/router';
import Web3 from "web3";
import { useState, useEffect } from 'react';
import { Header, Navigation, ConnectButton } from '../components/components';
import { Specials } from '../components/specials';
import { fetchAPI } from '../lib/api'

//import {ABI} from "../config.js"
import {ADDRESS, ABI} from "../config.js"

export default function Verify() {

  // FOR WALLET
  const [signedIn, setSignedIn] = useState(false)

  const [walletAddress, setWalletAddress] = useState(null)

  // FOR MINTING

  const [wapuuContract, setWapuuContract] = useState(null)

  // INFO FROM SMART Contract

  const [ownedWapuus, setOwnedWapuus] = useState([])
  const [nfts, setNfts] = useState([])

  // UI
  const [contractError, setError] = useState(null)
  const [isVerified, setIsVerified] = useState(false)

  useEffect( async() => { 
    signIn()
  }, [])

  async function clickSignIn() {
        if (typeof window.web3 === 'undefined') {
          alert("Please install MetaMask or another compatible Web3 wallet to connect.");
        } else {
          signIn()
        }
      }

  async function signIn() {
    if (typeof window.web3 !== 'undefined') {
      // Use existing gateway
      //window.web3 = new Web3(window.ethereum);
      window.web3 = new Web3(Web3.givenProvider);
      window.ethereum.enable()
        .then(function (accounts) {
          window.web3.eth.net.getNetworkType()
          // checks if connected network is mainnet (change this to rinkeby if you wanna test on testnet)
          .then((network) => {console.log(network);if(network != "main"){alert("You are on " + network+ " network. Change network to mainnet or you won't be able to do anything here")} });  
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

//

  async function signOut() {
    setSignedIn(false)
  }
  
  async function callContractData(wallet) {
    // let balance = await web3.eth.getBalance(wallet);
    // setWalletBalance(balance)
    const wapuuContract = new window.web3.eth.Contract(ABI, ADDRESS)
    setWapuuContract(wapuuContract)
  }
  
  async function verify() {
    setError(null)
    setIsVerified(false)

    window.web3.eth.personal.sign("Verify Wapuu NFT ownership", walletAddress, null, (error, signature) => {
      if (error) {
        // Handle error. Likely the user rejected the sign request
        console.error(error)
        setError(error.message)
      } else {
        fetchAPI("verify", 'POST', {address: walletAddress, signature: signature})
        .catch(function (error) {
          setError(error.message)
        })
        .then(function (data) {
          if (data && data.owned) {
            setNfts(data.owned)
            //setNfts([])
            setIsVerified(true)
          }
        });
      }
    });
    
  };

  return (
    <>
    <Header />

    <Navigation />
    <div id="bodyy" className="flex flex-col items-center justify-center min-h-screen py-2">

      <div className="flex flex-col items-center justify-center min-w-full">
        

        <div >
          {!isVerified ?
          <div className="auth my-4 font-bold justify-center text-center vw2">
            <ConnectButton signedIn={signedIn} signOut={signOut} signIn={clickSignIn} walletAddress={walletAddress} />
          </div>
          : ''}

          {contractError ? 
          <div className="flex auth my-8 font-bold justify-center items-center vw2">
            <span className="rounded montserrat inline-block border-2 border-red-500 bg-red-200 border-opacity-100 no-underline text-red-600 py-2 px-4 mx-4">{contractError}</span>
          </div>
          :''}
        </div>

        <div className="md:w-2/3 w-4/5">
          <div className="mt-1 py-6">

          {isVerified ?
            <Specials nfts={nfts} /> 
            :
            <div className="flex flex-col items-center">
              <div className="flex justify-around my-3">
                <span className="flex Poppitandfinchsans text-4xl text-center text-white">
                Verify your wallet to unlock the secret content or discounts for any special edition Wapuus you own!
                </span>
              </div>

              {signedIn ?
              <button onClick={() => verify()} className="Poppitandfinchsans mt-4 rounded text-4xl border-6 bg-blau  text-white hover:text-gray p-2 px-6">Verify</button>        
              : ''}
            </div> 
          }

          </div>
        </div>  
      </div> 
    </div>
    </>
    )
  }