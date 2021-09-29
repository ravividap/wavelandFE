import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/wavePortal.json';
export default function App() {
   const [currentAccount, setCurrentAccount] = React.useState("");

   const [allWaves, setAllWaves]= React.useState([]);
   const [message, setMessage] = React.useState("");

   async function getAllWaves(){
     const provider = new ethers.providers.Web3Provider(window.ethereum);
     const signer = provider.getSigner();
     const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer);

     let waves = await wavePortalContract.getAllWaves();
     let wavesCleaned = [];
     waves.forEach(wave=>{
        wavesCleaned.push({
          address:wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
     });
     setAllWaves(wavesCleaned);
     console.log(wavesCleaned);

     wavePortalContract.on("NewWave", (from,timestamp,message)=>{
       console.log("New wave ", from, timestamp, message);
       setAllWaves(oldArray=>[...oldArray,{
         address:from,
         timestamp: new Date(timestamp*1000),
         message:message
       }]);
     });
   }
const contractAddress = "0xF967109232Ba1b5B38D3CA16896FE36a0093a84e";
const contractABI = abi.abi;
  const checkIfWalletConnected = () => {

   
    const {ethereum} = window;

    if(!ethereum){
      console.log("Make sure you have metamask.");
    }
    else{
      console.log("ehterum object", ethereum);
    }

    ethereum.request({method: 'eth_accounts' })
      .then(accounts =>{
          if(accounts.lenth!==0){
            const account = accounts[0];
            console.log("Found authorized account", account);
            setCurrentAccount(account);
            getAllWaves();
          }
          else{
            console.log("No authrorized accuont found");
          }
      });
  }


  React.useEffect(()=>{
    checkIfWalletConnected();
  },[]);

  const wave = async (evt) => {
    evt.preventDefault();
    console.log("clicked ", message);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const wavePortalContract = new ethers.Contract(contractAddress,contractABI,signer);

    let count = await wavePortalContract.getTotalWaves();
    console.log("Retrieve wave count:", count.toNumber());

    const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
    console.log("mining...", waveTxn.hash);
    await waveTxn.wait();
    console.log("mined", waveTxn.hash);

    count = await wavePortalContract.getTotalWaves();
    console.log("Retrieve wave count:", count.toNumber());
  }

  const connectWallet = () => {
     const {ethereum} = window;

    if(!ethereum){
      console.log("Make sure you have metamask.");
    }

    ethereum.request({method:'eth_requestAccounts'})
      .then(accounts =>{
        console.log("Connected:", accounts[0]);
        setCurrentAccount(accounts[0]);
      });
  }
  
  return (
    <div className="mainContainer">
 <form onSubmit={wave}>
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Vish. I am a web3 dev. Connect your Ethereum wallet and wave at me!
        </div>
      
        <textarea type="text" value={message} onChange={e => setMessage(e.target.value)}></textarea>
        <input type="submit" className="waveButton"  value="Wave at Me"/>
         <button className="waveButton" onClick={connectWallet}>
          Connect wallet
        </button>
        {
          allWaves.map((wave, index) => {
            return(
              <div style={{backGroundColor:"OldLace"}}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            )
          })
          }
      </div>
      </form>
    </div>
  );
}
