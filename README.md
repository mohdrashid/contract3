# Contract 3
Ethereum / Quorum compatible library that makes smart contract compilation, deployment and interaction easy (both standard and as signed transactions)

## Installation

Go to the project directory and type

`npm install --save contract3`

## Requirements

Tested with Node 8.0+ and web3 version 1.2.6

## Examples
Below are example of using this library to interact with Smart Contracts

### Standard Smart Contract Interaction
```javascript
    const Web3 = require('web3');
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    const Contract3 = require('contract3');
    let contract3 = new Contract3(web3);
    contract3.setSolc(require('solc'));

    async function deploy(){
        let Administered = 'contract Administered { .. }';
        let Asset = 'contract Asset { .. }';
        let input = {
            'Administered.sol': {
                content: Administered
            },
            'Asset.sol': {
                content: Asset
            }
        }

        const defaultAccount = await web3.eth.getCoinbase();
        const contractInstances = await contract3.getInstances(input);
        //Getting instance of the contract, by Contract name
        const AssetInstance = contractInstances['Asset']();

        try{

            const ContractDeploymentResponse = await AssetInstance.deployContract(
                //args to constuctor
                ["computerSystem",defaultAccount,100],
                //Options
                {
                    gas:4712388
                });
                console.log('Contract Address:',ContractDeploymentResponse.options.address)
                const result = await AssetInstance.get('getValue',[]);
                console.log('Value of Asset:', result)
                console.log('Changing Asset Value')
                const result2 = await AssetInstance.set('changeValue', [134],{gas:40000});
                if (result2) {
                    const result = await AssetInstance.get('getValue',[]);
                    console.log('New Asset Value:', result)
                }
        } catch(e){
            console.log(e)
        }
    }
    deploy();
```

### Interacting with Smart Contract as Singed Transaction
This method is useful for consuming apis of services like infura to interact with ethereum blockchain
```javascript
    const Web3 = require('web3');
    const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    const Contract3 = require('contract3');
    let contract3 = new Contract3(web3, "0x4E5feB13de0e29BC4aeA01........"/*Ethereum_Address*/, "dfae4457ef0fd39416597da2fab6739..........."/*Private_Key*/, true/*Automatically fetch current nonce flag*/);
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    //Deploying contrcat
    contractInstance.signedTxDeployContract(["arg1",true],
        {
            gas: 4712388,
            value: '0x00'
        })

    //Calling a contract function 
    const data = await instance.signedTxFunctionCall('storeSellerInvoice', ["0xfa3a43c04170d3b35bae1a8d8e7c83bc5add4ed8a36f7e0586814344d1bef229"],
        {
            gas: 4712388,
            value: '0x00'
        });
```
For calling contract methods as signed tx refer to "Contract Instance methods" section

## Class functions

### constructor(web3, address, privateKey, nonceFetchFlag)
Constructor takes web3 object as argument. 
1. `web3` a intialized web3 instance
2. `address` is the ethereum account address 
3. `privateKey` is the private key to be used for signing transaction. 
4. `nonceFetchKey` is an optional flag to automatically fetch latest transaction count of the account

```javascript
/*Pre Requisite*/
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(YOUR_URL);
const web3 = new Web3(provider);
/*Pre-requistie End*/
//For signed
const contract3 = new Contract3(web3, "0xe3424234...","4de223424324324....", true);
//For non-singed tx
const contract3 = new Contract3(web3, "0xe3424234...");
```

### setSolc(solc)
Constructor takes web3 object as argument. 
1. `solc` is Solc instance if compiling is needed
```javascript
const solc = require('solc');
...
contract3.setSolc(solc);
```


### compile(source)
Compiles and returns bytes code and other details as produced by solc
1. `source` is JSON object with Contract file name as key and Contract content as value

```javascript
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. }';
    let input = {
        'Administered.sol': {
            content: Administered},
        'Asset.sol': {contenet: Asset}
    }
    contract3.compile(input)
```

### deploy(abi, code, args, options)
Deploys a existing compiled smart contract. Returns promise containing the instance, the receipt and transaction hash of deployed smart contract
1. `abi` is the ABI of the smart contract
2. `code` is the bytecode of the smart contract
3. `args` are the constuctor arguments for initializing the contract
4. `options` contains standard web3 options like gas, value, etc. 

```javascript
    contract3.deploy([...], '0x45..', ['1'], {
        gas:4712388,
        //privateFor: [], /*This is for Quorum*/
        //value:<Any Ether to send>
    })
```



### getInstances(source)
Compiles and returns instances of the the contracts
1. `source` is JSON object with Contract file name as key and Contract content as value

```javascript
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. }';
    let input = {
        'Administered.sol': Administered,
        'Asset.sol': Asset
    }
    const contractInstances = await contract3.getInstances(input);
    //Getting a contract instance by name of the smart contract
    const Asset = contractInstances['Asset'];
```

### getInstance(abi,address)
Use this method to get instance of pre-compiled smart contract (Does not work if you want to deploy smart contract)
1. `abi` is the ABI of the smart contract
2. `address` is the ethereum smart contract address
```javascript
    const abi ={..};
    const address='0xad12313...';
    const contractInstance = await contract3.getInstance(abi,address);

```
## Contract Instance methods

### deployContract(args, options, isTxHashOnly)
Deploys the contract as a singed transaction. Deploys the contract and creates an instances using args passed as array. 
1. `args` are arguments to be passed to constructor
2. `options` contains standard web3 options like gas, value, etc. 
3. `isTxHashOnly` Optional Flag to resolve once txHash is available instead of waiting till transaction is confirmed and receipts available

Returns transaction reciept if isTxHashOnly is false or undefined else gives back transaction hash

```javascript
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. }';
    let input = {
        'Administered.sol': Administered,
        'Asset.sol': Asset
    }
    const contractInstances = await contract3.getInstances(input);
    const AssetInstance = contractInstances['Asset'];
    try{
        const ContractObject = await AssetInstance.deployContract(
            //args to constuctor
            ["computerSystem",defaultAccount,100],
            //Other Parameters
            {
                value: 0,
                gas:4712388
            });
        console.log('Contract Address: ',ContractObject.options.address)
    }
    catch (err) {
        console.log(err)
    }
```

### deployContractEncoded(args) 
Interface to get encoded transaction data for contact deployment
1. `args` are arguments to be passed to constructor 

```javascript
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    console.log(contractInstance.deployContractEncoded([]));
```

### signedTxDeployContract(args, options, isTxHashOnly) 
Deploys the contract as a singed transaction. 
1. `args` are arguments to be passed to constructor
2. `options` contains standard web3 options like gas, value, etc. 
3. `isTxHashOnly` Optional Flag to resolve once txHash is available instead of waiting till transaction is confirmed and receipts available

Returns transaction reciept if isTxHashOnly is false or undefined else gives back transaction hash

```javascript
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    const txData = await contractInstance.signedTxDeployContract(["arg1",true],
        {
            gas: 4712388,
            value: '0x00'
        });
```

### setAddress(address)
A setter function that sets the address of the instance to call functions of an already deployed contracts
1. `address` Etherum address of the deployed contract
```javascript
    const AssetInstance = contractInstances['Asset'];
    AssetInstance.setAddress('0x234924...');
```

### get(functionName,args) 
A getter function that issue a call to function represented by functionName by passing the arguments given in array format. 
1. `functionName` Smart contract function name
2. `args` are arguments to be passed to constructor. Its a array so multiple arguments can be passed dynamically

```javascript
    const result = await AssetInstance.get('getValue',[]);
    console.log(result)
```

### set(functionName,args,options, isTxHashOnly)
Set is used to perform send transactions on functions of a deployed smart contract. 
1. `functionName` Smart contract function name
2. `args` are arguments to be passed to constructor. Its a array so multiple arguments can be passed dynamically
3. `options` contains standard web3 options like gas, value, etc. 
3. `isTxHashOnly` Optional Flag to resolve once txHash is available instead of waiting till transaction is confirmed and receipts available

Returns transaction reciept if isTxHashOnly is false or undefined else gives back transaction hash

```javascript
    const result2 = await contracts.set(ContractObject,'set', [134],{gas: 100000});
    if (result2) {
        const result = await contracts.get(ContractObject,'get',[]);
        console.log(result)
    }
```



### signedTxFunctionCall(functionName, args, options, isTxHashOnly) 
Deploys the contract as a singed transaction.
1. `functionName` Smart contract function name
2. `args` are arguments to be passed to constructor
3. `options` contains standard web3 options like gas, value, etc. 
3. `isTxHashOnly` Optional Flag to resolve once txHash is available instead of waiting till transaction is confirmed and receipts available

Returns transaction reciept if isTxHashOnly is false or undefined else gives back transaction hash

```javascript
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    const data = await contractInstance.signedTxFunctionCall('storeSellerInvoice', ["0xfa3a43c04170d3b35bae1a8d8e7c83bc5add4ed8a36f7e0586814344d1bef229"],
        {
            gas: 4712388,
            value: '0x00'
        });
```
### getFunctionEncoded(functionName, args)
Returns encoded value for a function to use for sending signed transaction
1. `functionName` Smart contract function name
2. `args` are arguments to be passed to constructor 

```javascript
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    console.log(contractInstance.getFunctionEncoded("get",[]));
```

### getTranactionReceipt()
Returns transaction receipt assosciated with contract deployment

### getCode()
Returns bytecode of the contract

### getInstance()
Returns web3 contract instance of the instance

### getReceipt(hash)
1. `hash` Transaction Hash

Returns receipt with decoded transaction log


### getReceipt(hash)
1. `hash` Transaction Hash

Returns receipt with decoded transaction log


### getTransaction(hash)
1. `hash` Transaction Hash

Returns transaction data with decoded input