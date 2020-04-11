const Contract = require("./contracts");

module.exports = class contract3 {
  /**
   * Constructor initialization
   * @param {*} web3 : web3 instance
   * @param {*} address : Ethreum Address
   * @param {*} privateKey : Private Key (Needed only if using signed transactions)
   * @param {*} nonceFetchFlag : Set this flag to automatically fetch the current nonce value (Needed only if using signed transactions)
   * @param {*} chainConfig chain config for etherumjs-tx plugin  => eg. { chain: 'mainnet', hardfork: 'petersburg' } . ONly required if signed transactions are used
   */
  constructor(web3, address, privateKey, nonceFetchFlag, chainConfig) {
    this.web3 = web3;
    this.address = address;
    if (privateKey) {
      this.privateKey = new Buffer(privateKey, 'hex');
    }
    this.chainConfig = chainConfig
    this.nonceFetchFlag = nonceFetchFlag;
  }

  /**
   * Add solc for compiling
   * @param {*} solc : Solc instance (Optional if compiling is needed)
   */
  setSolc(solc) {
    this.solc = solc;
  }

  /**
   * Compiles the smart contracts and returns the compiled code
   * @param {*} source
   */
  compile(source) {
    return this.solc.compile({ sources: source }, 1);
  }

  /**
   *Deploys a contract and returns instance
   * @param {*} abi : Abi of the contract
   * @param {*} code : bytecode of the contract
   * @param {*} args : Constructor arguments of the smart contract
   * @param {*} options : Other options like privateFor, value, gas, gasPrice, etc
   */
  deploy(abi, code, args, options) {
    const contract = new Contract(this.web3, abi, code, this.address, this.privateKey, this.nonceFetchFlag, this.chainConfig);
    return new Promise(function (resolve, reject) {
      contract
        .deployContract(args, options)
        .then(function (data) {
          resolve({
            instance: contract,
            transactionHash: contract.getTransactionHash(),
            receipt: contract.getReceipt()
          }
          );
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  /**
   *Deploys a contract and returns instance
   * @param {*} abi : Abi of the contract
   * @param {*} code : bytecode of the contract
   * @param {*} args : Constructor arguments of the smart contract
   * @param {*} options : Other options like privateFor, value, gas, gasPrice, etc
   */
  deploySinged(abi, code, args, options) {
    if (this.privateKey === undefined) {
      throw new Error(JSON.stringify({
        code: 1,
        message: "Private key cannot be null for a signed transaction. Please initialize constructor with a proper private key"
      }))
    }
    const contract = new Contract(this.web3, abi, code, this.address, this.privateKey, this.nonceFetchFlag, this.chainConfig);
    return new Promise(function (resolve, reject) {
      contract
        .signedTxDeployContract(args, options)
        .then(function (data) {
          resolve({
            instance: contract,
            transactionHash: contract.getTransactionHash(),
            receipt: data
          }
          );
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }



  /**
   * Returns the instances constructed from the source code provided
   * @param {*} source
   * Source must be in the format
   * {"contract1.sol":"contract contract1{....}",
   * "contract2.sol": "contact contract2{..}"
   * }
   */
  getInstances(source) {
    const compiled = this.compile(source)["contracts"];
    let compiledInstances = {};
    for (let i in compiled) {
      const name = i.split(":")[1];
      const bytecode = compiled[i]["bytecode"];
      const abi = JSON.parse(compiled[i]["interface"]);
      compiledInstances[name] = () => {
        return new new Contract(this.web3, abi, bytecode, this.address, this.privateKey, this.nonceFetchFlag, this.chainConfig);
      };
    }
    return compiledInstances;
  }

  /**
   * 
   * @param {*} abi : ABI of the contract
   * @param {*} address : Address of any exitsting contract
   */
  getInstance(abi, address) {
    let c = new Contract(this.web3, abi, "", this.address, this.privateKey, this.nonceFetchFlag, this.chainConfig);
    c.setAddress(address);
    return c;
  }

};
