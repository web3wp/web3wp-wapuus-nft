import Link from 'next/link'
import { Header, LatestNFT, Navigation } from '../components/components';

export default function Success() {

  return (
    <>
    <Header />

    <Navigation />
    <div id="bodyy" className="flex flex-col items-center justify-center min-h-screen py-2">

    <div className="flex flex-col items-center justify-center min-w-full">

      <div className="md:w-2/3 w-4/5">
      
        <div className="mt-8 py-6">

          <div className="flex flex-col items-center">
            <div className="Poppitandfinchsans text-6xl text-white text-center bg-grey-lighter rounded rounded-r-none my-4">
              Successfully Minted!
            </div>
            <div className="montserrat text-center text-white mb-10">
              Thank you for becoming a partner of the Web3 WP project. 
              As a Wapuu NFT owner, we invite you to <a className="underline" href="https://discord.com/invite/xgvY6sw6fA" target="_blank">join our community Discord server</a> where we discuss all things Web3 & Wapuu NFT.
            </div>

            <LatestNFT />

            <div className="Poppitandfinchsans text-3xl text-white text-center bg-grey-lighter rounded rounded-r-none mt-8 mb-2">
              Then view or list on OpenSea:
            </div>
            <div className="flex justify-around mt-2 mb-5">
              <a href="https://opensea.io/account" title="Browse on OpenSea" target="_blank"><img style={{width:"150px", borderRadius:"5px", boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.25)"}} src="https://storage.googleapis.com/opensea-static/Logomark/Badge%20-%20Available%20On%20-%20Light.png" alt="View on OpenSea" /></a>
            </div>

            <div className="montserrat text-center text-white mb-10">
              Note you may need to click "refresh metadata" on OpenSea to reveal your Wapuu.
            </div>
            
            <div className="flex justify-around mt-10">
              <span className="Poppitandfinchsans text-3xl text-center text-white">
              <Link href="/">
                <a className="underline">Or Mint another Wapuu!</a>
              </Link>
              </span>
            </div>
          </div> 

        </div>
      </div>
      </div> 
    </div>  
    </>
    )
  }