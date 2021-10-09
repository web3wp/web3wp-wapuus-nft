import Web3 from "web3";
import { useState, useEffect } from 'react';
import { Header, Navigation, ConnectButton, RenameNFT } from '../components/components';

export default function Rename() {

  return (
    <>
    <Header />

    <Navigation />
    <div id="bodyy" className="flex flex-col items-center justify-center min-h-screen py-2">

      <div className="flex flex-col items-center justify-center min-w-full">

        <div className="w-4/5">
          <div className="mt-1 py-6">
            <RenameNFT /> 
          </div>
        </div>  
      </div> 
    </div>
    </>
    )
  }