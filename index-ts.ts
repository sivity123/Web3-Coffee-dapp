import {
  createWalletClient, 
  custom, 
  createPublicClient,
  defineChain,
  parseEther,
  formatEther,
  type WalletClient,
  type PublicClient
} from "viem";
import "viem/window";
import { contractAddress, abi } from "./constants-ts";

const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountElement = document.getElementById("ethAmount") as HTMLInputElement;
const balanceButton = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdrawButton") as HTMLButtonElement;

let walletClient: WalletClient | undefined;
let publicClient: PublicClient | undefined;

async function connect(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {        
    walletClient = createWalletClient({            
      transport: custom(window.ethereum)
    });
    try {
      await walletClient.requestAddresses();
      connectButton.innerText = "Connected!";
    } catch (error) {
      connectButton.innerText = String(error);
    }
  } else {
    connectButton.innerText = "Please install Metamask";
  }
}

async function fund(): Promise<void> {
  const ethAmount: string = ethAmountElement.value;
   
  if (typeof window.ethereum !== "undefined") {        
    walletClient = createWalletClient({            
      transport: custom(window.ethereum)
    });
    const [connectedAddress] = await walletClient.requestAddresses();
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    console.log(`Funding with ${ethAmount} ETH from ${connectedAddress}`);
    console.log(parseEther(ethAmount));
    const currentChain = await getCurrentChain(walletClient);
    
    const {request} = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "fund",
      account: connectedAddress,
      chain: currentChain,
      value: parseEther(ethAmount)
    });
    console.log(request);
    const hash = await walletClient.writeContract(request);
    console.log(`Transaction hash is ${hash}`);
  } else {
    connectButton.innerText = "Please install Metamask";
  }
}

async function getBalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {        
    publicClient = createPublicClient({            
      transport: custom(window.ethereum),
    });
   
    const balance = await publicClient.getBalance({
      address: contractAddress,
    });
    console.log(`Contract Balance in eth ${formatEther(balance)}`);
    balanceButton.innerText = `Balance: ${formatEther(balance)} ETH`;
  }
}

async function withdraw(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({
      transport: custom(window.ethereum),
    });
    const [connectedAddress] = await walletClient.requestAddresses();
    publicClient = createPublicClient({
      transport: custom(window.ethereum),
    });
    const currentChain = await getCurrentChain(walletClient);
    const {request} = await publicClient.simulateContract({
      address: contractAddress,
      abi,
      functionName: "withdraw",
      account: connectedAddress,
      chain: currentChain,
    });
    console.log(request);
    const hash = await walletClient.writeContract(request);
    console.log(`Transaction hash is ${hash}`);
  } else {
    connectButton.innerText = "Please install Metamask or any Web3 wallet";
  }
}

async function getCurrentChain(client: WalletClient) {
  const chainId = await client.getChainId();
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
  });
  return currentChain;
}

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
