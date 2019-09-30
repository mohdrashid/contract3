# Contract 3
Ethereum / Quorum compatible library that makes smart contract compilation, deployment and interaction easy

## Installation

Go to the project directory and type

`npm install --save contract3`

## Requirements

Tested with Node 8.0 and web3 version 1.0

## Class functions

### constructor(web3)
Constructor takes web3 object as argument
```javascript
const contract3 = new Contract3(web3)
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

### deploy(abi, code, args, from, value, options)
Deploys a existing compiled smart contract. Returns promise containing the instance, the receipt and transaction hash of deployed smart contract
```javascript
    contract3.deploy([...], '0x45..', ['1'], '0x12d..', 0, {
        gas:4712388,
        privateFor: []
    })
```

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


### deployContract(args, from, value, options)
Deploys the contract and creates an instances using args passed as array. From is address of the deployer. Value is the ether value to send to if the constructor is payable. Options are options related to gas and gasPrce.
```javascript
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. }';
    let input = {
        'Administered.sol': Administered,
        'Asset.sol': Asset
    }
    const contractInstances = await contract3.getInstances(input);
    const AssetInstance = contractInstances['Asset']();
    try{
        const ContractObject = await AssetInstance.deployContract(
            //args to constuctor
            ["computerSystem",defaultAccount,100],
            //deployer
            '0x12323....', 
            //Ether to send
            0, 
            //Other Parameters
            {
                gas:4712388
            });
        console.log('Contract Address: ',ContractObject.options.address)
    }
    catch (err) {
        console.log(err)
    }
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

### set(functionName,args,from, value, options)
A setter function that should be called when modifications in blockchain. Issues a send to function represented by functionName by passing the arguments given in array format. From is address of the deployer. Value is the ether value to send along if the function is payable.
```javascript
    const result2 = await contracts.set(ContractObject,'set', [134],'0x12323....', 0,{gas: 100000});
    if (result2) {
        const result = await contracts.get(ContractObject,'get',[],'0x12323....');
        console.log(result)
    }
```

Returns transaction reciept

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