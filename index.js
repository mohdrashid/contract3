const solc = require('solc');
const Contract = require('./contract');

module.exports = class Easy_Web3{

    /**
     * Takes in web3 instance
     * @param {*} web3 
     */
    constructor(web3){
        this.web3 = web3;
    }

    /**
     * Compiles the smart contracts and returns the compiled code
     * @param {*} source 
     */
    compile(source) {
        return solc.compile(
            {sources: source}, 1
        );
    }
    
    /**
     * Returns the instances constructed from the source code provided
     * @param {*} source 
     * Source must be in the format
     * {"contract1.sol":"contract contract1{....}",
     * "contract2.sol": "contact contract2{..}"
     * }
     */
    getInstances (source) {
        const compiled = this.compile(this.web3, source)['contracts'];
        let compiledInstances = {};
        for(var i in compiled){
            const name = i.split(':')[1];
            const abi = JSON.parse(compiled[i]['interface']);

            compiledInstances[name] = new Contract(
                web3,
                abi,
                compiled[i]['bytecode']
            )
        };    
        return compiledInstances;
    }
};


    