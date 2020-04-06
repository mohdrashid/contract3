const Contract = require("./contracts");

module.exports = class contract3 {
  /**
   * Takes in web3 instance
   * @param {*} web3 : web3 instance
   * @param {*} solc : Solc instance (Optional if compiling is needed)
   */
  constructor(web3, solc) {
    this.solc = solc;
    this.web3 = web3;
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
   * @param {*} from : Sender address
   * @param {*} options : Other options like privateFor, value, gas, gasPrice, etc
   */
  deploy(abi, code, args, from, options) {
    const contract = new Contract(this.web3, abi, code);
    return new Promise(function (resolve, reject) {
      contract
        .deployContract(args, from, options)
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
   * @param {*} privateKey : Private key
   * @param {*} nonceFetchFlag : Set this flag to automatically fetch the current nonce value
   * @param {*} address : If nonceFetchFlag is set, this ethereum address will be used
   */
  deploySinged(abi, code, args, privateKey, options, nonceFetchFlag, address) {
    const contract = new Contract(this.web3, abi, code);
    return new Promise(function (resolve, reject) {
      contract
        .signedTxDeployContract(args, options, privateKey, nonceFetchFlag, address)
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
   * Returns the instances constructed from the source code provided
   * @param {*} source
   * Source must be in the format
   * {"contract1.sol":"contract contract1{....}",
   * "contract2.sol": "contact contract2{..}"
   * }
   */
  getInstances(source) {
    const compiled = this.compile(source)["contracts"];
    const Web3 = this.web3;
    let compiledInstances = {};
    for (let i in compiled) {
      const name = i.split(":")[1];
      const bytecode = compiled[i]["bytecode"];
      const abi = JSON.parse(compiled[i]["interface"]);
      compiledInstances[name] = function () {
        return new Contract(Web3, abi, bytecode);
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
    let c = new Contract(this.web3, abi, "");
    c.setAddress(address);
    return c;
  }

};
