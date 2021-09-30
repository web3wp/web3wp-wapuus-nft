import React, { Component, useState, useEffect } from 'react';
import Link from 'next/link'

export function Specials({nfts = []}) {
 
  if (!nfts.length) { 
    return (
    <>
    <h1 className="text-center text-5xl Poppitandfinchsans text-white bg-grey-lighter my-4 ml-3">No special edition Wapuus are owned by this wallet.</h1>
    <div className="flex justify-around mt-10">
      <span className="flex Poppitandfinchsans text-3xl text-center text-white">
      <Link href="/">
        <a className="underline mr-2">Mint another Wapuu</a>
      </Link> 
      <span>and you might just get lucky!</span>
      </span>
    </div>
    </>
   )
  }

  return (
    <div className="flex flex-col items-center">
        <div className="text-center text-4xl Poppitandfinchsans text-white bg-grey-lighter my-4 ml-3">
            This is the secret content for any special edition Wapuus you own:
        </div>
        <div className="flex justify-center">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
              {
                nfts.map((nft, i) => (
                  <div key={i} className="shadow bg-gray-50 text-black text-justify rounded-lg overflow-hidden">
                    <img src={nft.external_url} className="rounded-t-lg w-full" />
                    <div className="p-4 text-center">
                      <p className="text-3xl font-bold Poppitandfinchsans text-black">{nft.name}</p>
                    </div>
                    <div className="p-4">
                      {nft.secret_content}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
    </div> 
  )
}