import {createWalletClient, custom, createPublicClient,defineChain,parseEther,formatEther} from "https://esm.sh/viem";
import {contractAddress,coffeeAbi} from "./constants-js.js"
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const ethAmountElement = document.getElementById("ethAmount");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton  =document.getElementById("withdrawButton");
const contributionButton = document.getElementById("contributionButton");
const funderAddressElement = document.getElementById("funderAddress");
let walletClient;
let publicClient ;

async function connect(){   


if (typeof (window.ethereum) !== "undefined"){        
    walletClient = createWalletClient({            
        transport: custom(window.ethereum)
    })
    try{
   await walletClient.requestAddresses();
    connectButton.innerText = "Connected!";}
    catch (error){connectButton.outerText = String(error);};
}
else{
    connectButton.innerText = "Please install Metamask";
}
}

async function fund(){
   const ethAmount = ethAmountElement.value;
   
if (typeof (window.ethereum) !== "undefined"){        
    walletClient = createWalletClient({            
        transport: custom(window.ethereum)
    })
    const [connectedAddress]  = await walletClient.requestAddresses();
    publicClient = createPublicClient({
        transport: custom(window.ethereum),
    })
    console.log(`Funding with ${ethAmount} ETH from ${connectedAddress}`);
    console.log(parseEther(ethAmount));
    const currentChain = await getCurrentChain(walletClient);
    
    const {request} = await publicClient.simulateContract({
        address: contractAddress,
        abi:coffeeAbi,
        functionName:"fund",
        account:connectedAddress,
        chain: currentChain,
        value: parseEther(ethAmount)
        
    })
    console.log(request);
    const hash  = await walletClient.writeContract(request);
    console.log(`Transaction hash is ${hash}`);

    
}
else{
    connectButton.innerText = "Please install Metamask";


}


}


async function  getBalance(){
if (typeof (window.ethereum) !== "undefined"){        
    publicClient = createPublicClient({            
        transport: custom(window.ethereum),
    })
   
   const balance = await publicClient.getBalance({
      address: contractAddress,
    })
    console.log(`Contract Balance in eth ${formatEther(balance)}`);
    balanceButton.innerText = `Balance: ${formatEther(balance)} ETH`;

}
}

async function withdraw(){
  if (typeof(window.ethereum) !== "undefined"){
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    })
    const [connectedAddress] = await walletClient.requestAddresses();
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    })
    const currentChain = await getCurrentChain(walletClient);
    const{request} = await publicClient.simulateContract({
      address:contractAddress,
      abi: coffeeAbi,
      functionName: "withdraw",
      account: connectedAddress,
      chain: currentChain,
    })
    console.log(request);
    const hash = await walletClient.writeContract(request);
    console.log(`Transaction hash is ${hash}`);
    
  }
else{
  connectButton.innerText = "Please install Metamask or any Web3 wallet";
}
}
async function funderContribution(){
  walletClient = createWalletClient({
    transport: custom(window.ethereum),
  })
  const[connectedAddress] = await walletClient.requestAddresses();
  publicClient = createPublicClient({
    transport: custom(window.ethereum),
  })

  const currentChain = await getCurrentChain(walletClient);
  
  const funderContribution = await publicClient.readContract({
    address: contractAddress,
    abi: coffeeAbi,
    functionName: "getAddressToAmountFunded",
    account: connectedAddress,
    chain: currentChain,
    args: [funderAddressElement.value],
  });
  if (funderContribution==0){
    console.log("This address has not funded the contract yet");
    return;
  }
  console.log(`Funder Contribution in eth is : ${formatEther(funderContribution)}`);
  console.log(`The Funder address is : ${funderAddressElement.value}`);
  



}

async function getCurrentChain(client) {
  const chainId = await client.getChainId()
  const currentChain = defineChain({
    id: chainId,
    name: "Anvil Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"],
      },
    },
  })
  return currentChain
}

connectButton.onclick = connect;
fundButton.onclick =  fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
contributionButton.onclick = funderContribution;











