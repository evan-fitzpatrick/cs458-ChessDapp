
// contract abi and address
const contract_abi = fetch("./chess_contract_abi.json").then(response => response.json()).then(json_data => { return json_data });
const contract_address = "";

// connect to metamask
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const userAddress = signer.getAddress();

// connect to contract
const chess_contract = new ethers.Contract(contract_address, contract_abi, signer);

export { chess_contract, provider, signer, userAddress };