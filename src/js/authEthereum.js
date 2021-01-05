import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3 from 'web3'

import { checkStatuses as checkTransferStatuses } from './transfers'
import render from './render'
import { find, onClick } from './domHelpers'

// SWAP IN YOUR OWN INFURA_ID FROM https://infura.io/dashboard/ethereum
const INFURA_ID = '9c91979e95cb4ef8a61eb029b4217a1a'

/*
  Web3 modal helps us "connect" external wallets:
*/
window.web3Modal = new Web3Modal({
  network: process.env.ethNetwork, // optional
  cacheProvider: true, // optional
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: INFURA_ID
      }
    }
  }
})

async function login (provider) {
  window.web3 = new Web3(provider)
  window.ethUserAddress = (await window.web3.eth.getAccounts())[0]

  window.nearOnEthClient = new window.web3.eth.Contract(
    JSON.parse(process.env.ethNearOnEthClientAbiText),
    process.env.ethClientAddress,
    { from: window.ethUserAddress }
  )

  window.ethProver = new window.web3.eth.Contract(
    JSON.parse(process.env.ethProverAbiText),
    process.env.ethProverAddress,
    { from: window.ethUserAddress }
  )

  window.ethTokenLocker = new window.web3.eth.Contract(
    JSON.parse(process.env.ethLockerAbiText),
    process.env.ethLockerAddress,
    { from: window.ethUserAddress }
  )

  window.ethInitialized = true

  const span = document.createElement('span')
  span.innerHTML = `<span class="connected-account" title="${window.ethUserAddress}">${window.ethUserAddress}<span>`
  find('authEthereum').replaceWith(span)
  render()

  if (window.nearInitialized) checkTransferStatuses()
}

async function loadWeb3Modal () {
  const provider = await window.web3Modal.connect()

  provider.on('accountsChanged', () => {
    login(provider)
  })

  login(provider)
}

onClick('authEthereum', loadWeb3Modal)

// on page load, check if user has already signed in via MetaMask
if (window.web3Modal.cachedProvider) {
  loadWeb3Modal()
}