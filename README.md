# Installation

Go to the project directory and type

`npm install --save easy-web3`

# Requirements

Tested with Node 8.0 and web3 version 1.0

# APIs

# compile(source file)


# Example
`
var Web3 = require('web3');

const config = {
    host: 'localhost',
    port: 8545
};

var web3 = new Web3(new Web3.providers.HttpProvider('http://'+config.host+":"+config.port));

var web3 = require('./web3_client');
var Contract3 = require('contract3');
var contract3 = new Contract3(web3);



async function deploy(){
    let Administered = 'contract Administered { .. }';
    let Asset = 'contract Asset { .. };

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
`