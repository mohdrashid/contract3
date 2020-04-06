const Tx = require('ethereumjs-tx').Transaction;
module.exports = class Contract {

    /**
     * Constructor
     * @param {*} web3 : An instance of web3
     * @param {*} abi : ABI of the contract
     * @param {*} code : Byte code of the contract
     * @param {*} isQuorum : Check if it ethereum mainpnet or quorum implementation
     */
    constructor(web3, abi, code) {
        this.web3 = web3;
        this.instance = new this.web3.eth.Contract(abi);
        this.code = '0x' + code;
        this.receipt = undefined;
        this.transactionHash = undefined;
    }

    /**
     * Returns the bytecode
     */
    getCode() {
        return this.code;
    }

    /**
     * Retutns the instance
     */
    getInstance() {
        return this.instance;
    }

    /**
     * Returns deployment transaction receipt
     */
    getReceipt() {
        return this.receipt;
    }

    /**
     * Returns the transaction hash during the deployment of contract
     */
    getTransactionHash() {
        return this.transactionHash;
    }

    /**
     * Deploys a contract from the instance
     * @param {*} args : Any arguments to pass to the constructor
     * @param {*} from : The initiator of contract
     * @param {*} options : Any other options related to values, gas or gasPrice
     */
    deployContract(args, from, options) {
        let sendParmas = {
            from: from
        }

        for (let key in options) {
            sendParmas[key] = options[key];
        }

        return new Promise((resolve, reject) => {

            this.instance.deploy({
                data: this.code,
                arguments: args
            }).send(sendParmas, (error, transactionHash) => {
                if (error) {
                    reject(error)
                }
                this.transactionHash = transactionHash;
            })
                .on('error', (error) => reject)
                .on('confirmation', (confirmationNumber, receipt) => {
                    this.receipt = receipt;
                    this.instance.options.address = receipt.contractAddress;
                    resolve(this.instance);
                });


        });
    }

    /**
     * Interface to get encoded transaction data for contact deployment
     * @param {*} args : Any arguments to pass to the constructor
     */
    deployContractEncoded(args) {
        return this.instance.deploy({
            data: this.code,
            arguments: args
        }).encodeABI();

    }

    /**
     * This function deploys contract using signed transaction method
     * @param {*} functionName : Name of the function to call
     * @param {*} args : Arguments to pass to function
     * @param {*} options : Any options like gas price, gas, value, etc
     * @param {*} privateKey : Private key
     * @param {*} nonceFetchFlag : Set this flag to automatically fetch the current nonce value
     * @param {*} address : If nonceFetchFlag is set, this ethereum address will be used
     */
    signedTxDeployContract(args, options, privateKey, nonceFetchFlag, address) {
        return new Promise(async (resolve, reject) => {
            try {
                if (nonceFetchFlag) {
                    options['nonce'] = await this.web3.eth.getTransactionCount(address, 'pending');
                }
                const encoded = this.deployContractEncoded();
                options['data'] = encoded;
                const tx = new Tx(options);
                const pKey = new Buffer(privateKey, 'hex')
                tx.sign(pKey);
                const serializedTx = tx.serialize();
                this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                    .on('confirmation', (confirmationNumber, receipt) => {
                        this.setAddress(receipt.contractAddress);
                        this.transactionHash = receipt.transactionHash;
                        this.receipt = receipt;
                        resolve(receipt);
                    })
                    .on('error', reject)
            } catch (err) {
                reject(err);
            }
        })
    }

    /**
     * A setter function to set address of an already deployed contract
     * @param {*} address : Address of the deployed contract
     */
    setAddress(address) {
        this.instance.options.address = address;
    }

    /**
     * A setter function to be used if the contract ABI is available
     * @param {*} abi : ABI of the contract
     */
    setAbi(abi) {
        this.instance = new this.web3.eth.Contract(abi);
    }

    /**
     * A getter interface for contract functions/public variables
     * @param {*} functionName : The name of the function or variable name
     * @param {*} args : Arguments to pass to function if any
     * @param {*} from : Caller address
     * @param {*} value : Ether to send if the function is payable
     */
    get(functionName, args, from) {
        let sendParmas = {
            from: from
        }
        return this.instance.methods[functionName].apply(null, args).call(sendParmas);
    }

    /**
     * A setter interface for calling contract functions
     * @param {*} functionName : The name of the function
     * @param {*} args : Arguments to pass to function if any
     * @param {*} from : Caller address
     * @param {*} value : Ether to send if the function is payable
     */
    set(functionName, args, from, options) {
        let sendParmas = {
            from: from
        }

        for (let key in options) {
            sendParmas[key] = options[key];
        }

        return new Promise((resolve, reject) => {

            this.instance.methods[functionName].apply(null, args).send(sendParmas, (error, transactionHash) => {
                if (error) {
                    reject(error)
                }
            })
                .on('confirmation', (confirmationNumber, receipt) => {
                    resolve(receipt);
                })
                .on('error', reject)

        })
    }


    /**
    * Returns encoded value for a function to use for sending signed transaction
    * @param {*} functionName : The name of the function
    * @param {*} args : Arguments to pass to function if any
    */
    getFunctionEncoded(functionName, args) {
        return this.instance.methods[functionName].apply(null, args).encodeABI();
    }

    /**
     * This function call posts signed transaction
     * @param {*} functionName : Name of the function to call
     * @param {*} args : Arguments to pass to function
     * @param {*} options : Any options like gas price, gas, value, etc
     * @param {*} privateKey : Private key
     * @param {*} nonceFetchFlag : Set this flag to automatically fetch the current nonce value
     * @param {*} address : If nonceFetchFlag is set, this ethereum address will be used
     */
    signedTxFunctionCall(functionName, args, options, privateKey, nonceFetchFlag, address) {
        return new Promise(async (resolve, reject) => {
            try {
                if (nonceFetchFlag) {
                    options['nonce'] = await this.web3.eth.getTransactionCount(address, 'pending');
                }
                const encoded = this.getFunctionEncoded(functionName, args);
                options['data'] = encoded;
                const tx = new Tx(options);
                const pKey = new Buffer(privateKey, 'hex')
                tx.sign(pKey);
                const serializedTx = tx.serialize();
                this.web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                    .on('confirmation', (confirmationNumber, receipt) => {
                        resolve(receipt);
                    })
                    .on('error', reject)
            } catch (err) {
                reject(err);
            }
        })
    }
}