import Router from 'next/router';
import Web3 from "web3";
import { useState, useEffect } from 'react';
import { Header, Navigation, MintButton, ConnectButton } from '../components/components';

import {ADDRESS, ABI} from "../config.js"

export default function Mint() {

  // FOR WALLET
  const [signedIn, setSignedIn] = useState(false)

  const [walletAddress, setWalletAddress] = useState(null)

  // FOR MINTING
  const [how_many_wapuus, set_how_many_wapuus] = useState(1)

  const [wapuuContract, setWapuuContract] = useState(null)

  // INFO FROM SMART Contract

  const [totalSupply, setTotalSupply] = useState(0)

  const [saleStarted, setSaleStarted] = useState(false)

  const [wapuuPrice, setWapuuPrice] = useState(0)

  // UI
  const [contractError, setError] = useState(null)
  const [isMinting, setMinting] = useState(false)
  const [transactionHash, setTransactionHash] = useState(null)

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
    setMinting(false)
  }
  
  async function callContractData(wallet) {
    // let balance = await web3.eth.getBalance(wallet);
    // setWalletBalance(balance)
    const wapuuContract = new window.web3.eth.Contract(ABI, ADDRESS)
    setWapuuContract(wapuuContract)

    const salebool = await wapuuContract.methods.saleIsActive().call() 
    console.log("saleisActive" , salebool)
    setSaleStarted(salebool)

    const totalSupply = await wapuuContract.methods.totalSupply().call() 
    console.log("Total Supply" , totalSupply)
    setTotalSupply(totalSupply)

    const wapuuPrice = await wapuuContract.methods.wapuuPrice().call() 
    console.log("Price" , wapuuPrice)
    setWapuuPrice(wapuuPrice)
  }
  
  async function mintWapuu(how_many_wapuus) {
    setError(null)
    setMinting(false)
    if (wapuuContract) {
 
      const price = Number(wapuuPrice) * how_many_wapuus 
     
      var gasAmount = await wapuuContract.methods.mintWapuus(how_many_wapuus).estimateGas({from: walletAddress, value: price})
      gasAmount = Math.round(gasAmount * 1.2); //add some padding so users don't lose it in a dropped transaction (this is just limit)
      console.log("gas limit estimation = " + gasAmount + " units");
      console.log({from: walletAddress, value: price})

      wapuuContract.methods
        .mintWapuus(how_many_wapuus)
        .send({from: walletAddress, value: price, gas: String(gasAmount)})
        .on('error', function(error){
          setError(error.message)
          setMinting(false)
        })
        .on('transactionHash', function(transactionHash){ 
          setMinting(true)
          setTransactionHash(transactionHash)
          console.log("transactionHash", transactionHash)
          })
        .then(function(newContractInstance){
            console.log(newContractInstance) // instance with the new contract address
            callContractData(walletAddress)
            Router.push('/success')
            //setMinting(false)
        });
          
    } else {
        console.log("Wallet not connected")
    }
    
  };

  return (
    <>
    <Header />

    <Navigation />
    <div id="bodyy" className="flex flex-col items-center justify-center min-h-screen py-2">

    <div className="flex flex-col items-center justify-center min-w-full">

      <div >
        {!isMinting ?
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

        {isMinting ?
          <div className="flex flex-col items-center">
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-white"></div>
              </div>
              <div className="text-center text-6xl Poppitandfinchsans text-white bg-grey-lighter my-4 ml-3">
                  Minting {how_many_wapuus} Wapuu!
              </div>
              <div className="text-center text-4xl Poppitandfinchsans text-white bg-grey-lighter my-4 ml-3">
                  Please be patient, the Ethereum network can be slow. You can also track the <a className="inline underline text-white hover:text-gray-200" href={"https://etherscan.io/tx/" + transactionHash} target="_blank">status of your transaction on Etherscan</a>.
              </div>
          </div> 
          :
          <div className="flex flex-col items-center">
          <img src="/wapuu-app/images/wapuus.gif" width="250" className="rounded-xl"></img>
          <span className="Poppitandfinchsans text-5xl text-white text-center my-4">TOTAL WAPUUS MINTED: <span className="ml-2 text-blau text-6xl">{!signedIn ?  <>-</>  :  <>{totalSupply}</> }/2,222</span></span>

          <div id="mint" className="flex justify-around  mt-8 mx-6">
            <span className="flex Poppitandfinchsans text-3xl text-white items-center bg-grey-lighter rounded rounded-r-none px-3 font-bold">I want</span>
            
            <input 
                type="number" 
                min="1"
                max="40"
                value={how_many_wapuus}
                onChange={ e => set_how_many_wapuus(e.target.value) }
                name="" 
                className="Poppitandfinchsans text-4xl inline bg-grey-lighter pl-2 py-0 font-normal text-center rounded text-black font-bold"
            />
            
            <span className="flex Poppitandfinchsans text-3xl text-white items-center bg-grey-lighter rounded rounded-r-none px-3 font-bold">Wapuu!</span>

          </div>
          <div className="flex justify-around my-3">
            <span className="flex Poppitandfinchsans text-2xl text-center text-white">
            Tip: Minting multiple Wapuus at a time will save you a bundle in gas fees!
            </span>
          </div>

          <MintButton onClick={() => mintWapuu(how_many_wapuus)} saleStarted={saleStarted} wapuus={how_many_wapuus} signedIn={signedIn} wapuuPrice={wapuuPrice} />

          <div className="flex justify-around mt-20">
            <a href="https://opensea.io/collection/wapuus" title="Browse on OpenSea" target="_blank"><img style={{width:"150px", borderRadius:"5px", boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)"}} src="https://storage.googleapis.com/opensea-static/Logomark/Badge%20-%20Available%20On%20-%20Light.png" alt="View on OpenSea" /></a>
          </div>
          
      </div> 
      }

      </div>
      </div>  
      </div> 
    </div>  
    </>
    )
  }