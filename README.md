# Installation

Go to the project directory and type

`npm install --save contract3`

# Requirements

Tested with Node 8.0 and web3 version 1.0

# Class functions

## constructor(web3)
Constructor takes web3 object as argument
```javascript
var contract3 = new Contract3(web3)
```

## compile(source)
Compiles and returns bytes code and other details as produced by solc
```javascript
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. }';
    let input = {
        'Administered.sol': Administered,
        'Asset.sol': Asset
    }
    contract3.compile(input)
```

## getInstances(source)
Compiles and returns instances of the the contracts
```javascript
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. }';
    let input = {
        'Administered.sol': Administered,
        'Asset.sol': Asset
    }
    const contractInstances = await contract3.getInstances(input);
```

# Contract Instance methods

## constructor(web3, abi, code)
Constructor takes in web3 instance, abi interface and code as parameter. Automatically taken care of when deploying 
```javascript

```
## deployContract(args, from, value, options)
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

## get(functionName,args,from) 
A getter function that issue a call to function represented by functionName by passing the arguments given in array format. From is address of the deployer.
```javascript
    const result = await AssetInstance.get('getValue',[],'0x12323....');
    console.log(result)
```

## set(functionName,args,from, value)
A setter function that should be called when modifications in blockchain. Issues a send to function represented by functionName by passing the arguments given in array format. From is address of the deployer. Value is the ether value to send along if the function is payable.
```javascript
    const result2 = await contracts.set(ContractObject,'set', [134],'0x12323....', 0);
    if (result2) {
        const result = await contracts.get(ContractObject,'get',[],'0x12323....');
        console.log(result)
    }
```

# Example
```javascript
var Web3 = require('web3');

const config = {
    host: 'localhost',
    port: 8545
};

var web3 = new Web3(new Web3.providers.HttpProvider('http://'+config.host+":"+config.port));

var Contract3 = require('contract3');
var contract3 = new Contract3(web3);

async function deploy(){
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. }';
    let input = {
        'Administered.sol': Administered,
        'Asset.sol': Asset
    }

    const defaultAccount = await web3.eth.getCoinbase();
    const contractInstances = await contract3.getInstances(input);
    const AssetInstance = contractInstances['Asset'];

    try{
        const ContractObject = await AssetInstance.deployContract(
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
        console.log('Contract Address: ',ContractObject.options.address)
        const result = await AssetInstance.get('getValue',[],defaultAccount);
        console.log(result)
        const result2 = await contracts.set(ContractObject,'set', [134],defaultAccount);
        if (result2) {
            const result = await contracts.get(ContractObject,'get',[],defaultAccount);
            console.log(result)
        }
    } catch(e){
        console.log(e)
    }
}
deploy();
```