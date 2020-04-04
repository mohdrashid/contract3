# Contract 3
Ethereum / Quorum compatible library that makes smart contract compilation, deployment and interaction easy

## Installation

Go to the project directory and type

`npm install --save contract3`

## Requirements

Tested with Node 8.0 and web3 version 1.0

## Class functions

### constructor(web, solc)
Constructor takes web3 object as argument. Optionally solc is also taken to support with compilation
```javascript
/*Pre Requisite*/
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(YOUR_URL);
const web3 = new Web3(provider);
const solc = require('solc');
/*Pre-requistie End*/

const contract3 = new Contract3(web3, solc)
```

### compile(source)
Compiles and returns bytes code and other details as produced by solc
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

### deploy(abi, code, args, from, options)
Deploys a existing compiled smart contract. Returns promise containing the instance, the receipt and transaction hash of deployed smart contract
```javascript
    contract3.deploy([...], '0x45..', ['1'], '0x12d..', 0, {
        gas:4712388,
        //privateFor: [], /*This is for Quorum*/
        //value:<Any Ether to send>
    })
```

### Deploy contract as a signed Transaction
Deploys a existing compiled smart contract. Returns promise containing the instance, the receipt and transaction hash of deployed smart contract
```javascript
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    contractInstance.signedTxDeployContract(["arg1",true],
        {
            gas: 4712388,
            value: '0x00'
        },
        "dfae4457ef0fd39416597da2fab6739..........."/*Private_Key*/, true/*Automatically fetch current nonce flag*/, "0x4E5feB13de0e29BC4aeA01........"/*Ethereum_Address*/)
```
For calling contract methods as signed tx refer to "Contract Instance methods" section

### getInstances(source)
Compiles and returns instances of the the contracts
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
```javascript
    const abi ={..};
    const address='0xad12313...';
    const contractInstance = await contract3.getInstance(abi,address);

```
## Contract Instance methods

### constructor(web3, abi, code)
Constructor takes in web3 instance, abi interface and code as parameter. Automatically taken care of when deploying 


### deployContract(args, from, options)
Deploys the contract and creates an instances using args passed as array. From is address of the deployer. Value is the ether value to send to if the constructor is payable. Options are options related to gas and gasPrce.
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
            //deployer
            '0x12323....', 
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

### signedTxDeployContract(args, options, privateKey, nonceFetchFlag, address) 
Deploys the contract as a singed transaction. 
1. `args` are arguments to be passed to constructor
2. `options` contains standard web3 options like gas, value, etc. 
3. `privateKey` is the private key to be used for signing transaction. 
4. `nonceFetchKey` is an optional flag to automatically fetch latest transaction count of the account
5. `address` is the ethereum account address. This is mandatory when nonceFetchKey flag is set

```javascript
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    contractInstance.signedTxDeployContract(["arg1",true],
        {
            gas: 4712388,
            value: '0x00'
        },
        "dfae4457ef0fd39416597da2fab6739..........."/*Private_Key*/, true/*Automatically fetch current nonce flag*/, "0x4E5feB13de0e29BC4aeA01........"/*Ethereum_Address*/)
```

### setAddress(address)
A setter function that sets the address of the instance to call functions of an already deployed contracts
```javascript
    const AssetInstance = contractInstances['Asset'];
    AssetInstance.setAddress('0x234924...');
```

### get(functionName,args,from) 
A getter function that issue a call to function represented by functionName by passing the arguments given in array format. From is address of the deployer.
```javascript
    const result = await AssetInstance.get('getValue',[],'0x12323....');
    console.log(result)
```

### set(functionName,args,from,options)
A setter function that should be called when modifications in blockchain. Issues a send to function represented by functionName by passing the arguments given in array format. From is address of the deployer. Value is the ether value to send along if the function is payable.

Returns transaction reciept

```javascript
    const result2 = await contracts.set(ContractObject,'set', [134],'0x12323....', 0,{gas: 100000});
    if (result2) {
        const result = await contracts.get(ContractObject,'get',[],'0x12323....');
        console.log(result)
    }
```



### signedTxFunctionCall(functionName, args, options, privateKey, nonceFetchFlag, address) 
Deploys the contract as a singed transaction.
1. `functionName` Smart contract function name
2. `args` are arguments to be passed to constructor
3. `options` contains standard web3 options like gas, value, etc. 
4. `privateKey` is the private key to be used for signing transaction. 
5. `nonceFetchKey` is an optional flag to automatically fetch latest transaction count of the account
6. `address` is the ethereum account address. This is mandatory when nonceFetchKey flag is set

Returns transaction reciept

```javascript
    const abi ={..};
    const contractInstance = await contract3.getInstance(abi);
    contractInstance.signedTxDeployContract(["arg1",true],
        {
            gas: 4712388,
            value: '0x00'
        },
        "dfae4457ef0fd39416597da2fab6739..........."/*Private_Key*/, true/*Automatically fetch current nonce flag*/, "0x4E5feB13de0e29BC4aeA01........"/*Ethereum_Address*/)
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


### getReceipt()
Returns transaction receipt assosciated with contract deployment

### getCode()
Returns bytecode of the contract

### getInstance()
Returns web3 contract instance of the instance

## Example
```javascript
const Web3 = require('web3');

const config = {
    host: 'localhost',
    port: 8545
};

const web3 = new Web3(new Web3.providers.HttpProvider('http://'+config.host+":"+config.port));

const Contract3 = require('contract3');
let contract3 = new Contract3(web3);

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
            //deployer
            defaultAccount, 
            //Ether to send
            0, 
            //Other Parameters
            {
                gas:4712388
            });
            console.log('Contract Address:',ContractDeploymentResponse.options.address)
            const result = await AssetInstance.get('getValue',[],defaultAccount);
            console.log('Value of Asset:', result)
            console.log('Changing Asset Value')
            const result2 = await AssetInstance.set('changeValue', [134],defaultAccount);
            if (result2) {
                const result = await AssetInstance.get('getValue',[],defaultAccount);
                console.log('New Asset Value:', result)
            }
    } catch(e){
        console.log(e)
    }
}
deploy();
```

## Full example
To see a full example visit [link](https://github.com/mohdrashid/ethereum_asset_exchange_example)