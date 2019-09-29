const solc = require("solc");
const Contract = require("./contracts");

module.exports = class contract3 {
  /**
   * Takes in web3 instance
   * @param {*} web3 : web3 instance
   * @param {*} isQuorum : Checks if it a quorum implementation
   */
  constructor(web3) {
    this.web3 = web3;
  }

  /**
   * Compiles the smart contracts and returns the compiled code
   * @param {*} source
   */
  compile(source) {
    const input = {
      language: 'Solidity',
      sources: source,
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    }

    return JSON.parse(solc.compile(JSON.stringify(input)))
    //return solc.compile({ sources: source }, 1);
  }

  /**
   *
   * @param {*} abi : Abi of the contract
   * @param {*} code : bytecode of the contract
   * @param {*} args : Constructor arguments of the smart contract
   * @param {*} from : Sender address
   * @param {*} value : Ether to be send along with if any
   * @param {*} options : Other options like privateFor, gas, gasPrice, etc
   */
  deploy(abi, code, args, from, value, options) {
    const contract = new Contract(this.web3, abi, code);
    return new Promise(function (resolve, reject) {
      contract
        .deployContract(args, from, value, options)
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
    const compileResults = this.compile(source);
    if (compileResults.errors) {
      throw compileResults.errors;
    }
    const compiled = compileResults["contracts"];
    const Web3 = this.web3;
    const IsQuorum = this.isQuorum;

    let compiledInstances = {};
    for (let i in compiled) {
      const name = i.split(".")[0];
      const bytecode = compiled[i][name]["evm"]["bytecode"]["object"];
      const abi = compiled[i][name]["abi"];
      compiledInstances[name] = function () {
        return new Contract(Web3, abi, bytecode, IsQuorum);
      };
    }
    return compiledInstances;
  }

  getInstance(abi, address) {
    let c = new Contract(this.web3, abi, "");
    c.setAddress(address);
    return c;
  }
};
