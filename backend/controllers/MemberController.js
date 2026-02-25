const jwt = require("jsonwebtoken");
const { validationResult } = require('express-validator');

const {Web3} = require('web3');

const { Op } = require('sequelize');

const Moralis = require('moralis').default;
const { EvmChain } = require('@moralisweb3/common-evm-utils');

const { JWT_SECRET_KEY } = require("../config/server.config");

const Model = require("../models/Model");

const bets = Model.bets;
const users = Model.users;
const transactions = Model.transactions;

const ResponseData = require("../utils/ResponseData");
const { jwtsign, checkPassword, encryptPassword, ResponseUserModel } = require("./AuthController");

// get user balance
const amount = async (req, res) => {
    const validResult = validationResult(req);
    if (!validResult.isEmpty) {
        return ResponseData.warning(res, validResult.array()[0].msg);
    }
    try {
        const user = req.user;
        if (user == null) {
            return ResponseData.error(res, 'Not registered token & user',);
        }

        jwt.verify(user.token, JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                const newToken = jwtsign({ id: user.id, email: user.email });
                user.token = newToken;
                user.save();

                return ResponseData.ok(res, 'Token expired and get new token', { token: newToken, amount: user.balance });
            }
            else {
                // console.log(decoded);
                return ResponseData.ok(res, 'Token valid', { token, amount: user.balance });
            }
        })

    }
    catch (err) {
        // console.log(err);
        return ResponseData.error(res, "", err);
    }
}

const setProfile = async (req, res) => {
    if (req.file) {
        var result = validationResult(req);
        if (!result.isEmpty()) {
            fs.unlink(path.resolve(req.file.path), (err) => { });
            return ResponseData.error(res, result.array()[0].msg);
        }

    }
    try {
        let user = await users.findByPk(req.user.id);


        user.fullName = req.body.fullName;

        if (!await checkPassword(req.body.currentPassword, user.password)) {
            return ResponseData.warning(res, "Wrong password, check again");
        }

        if (req.file) {
            user.avatar = req.file.path;

        }
        if (req.body.password != '')
            user.password = await encryptPassword(req.body.password);
        await user.save();

        ResponseData.ok(res, "Profile was changed", ResponseUserModel(user));
    } catch (error) {
        // console.log(error);
        ResponseData.error(res, "Not saved", error);
    }

}

const withdraw = async (req, res) => {
    try {
        const amount = req.body.amount;
        const user = req.user;
        // const address = user.address;
        const receiverAddress = req.body.account;
    
        const providerUrl = "https://endpoints.omniatech.io/v1/bsc/testnet/public";
        const contractAddress = "0x337610d27c682e347c9cd60bd4b3b107c9d34ddd";
        const jsonInterface = require('../utils/bep20.json');
    
        const web3 = new Web3(providerUrl);
        const contract = new web3.eth.Contract(jsonInterface , contractAddress);
    
        const privateKey = "9097299eb616d5f86babee81f5bedbffb804f7a2c974bbf8a89786e9c54b13a6";
        const senderAddress = process.env.WalletAddress;
        // const receiverAddress = "0x0f0d9c70be271318d09D39d58EB0833DE1d8D215";
    
        let value = web3.utils.toWei(amount, 'ether');
        // let value = 1;
    
        const query = contract.methods.transfer(receiverAddress, value);
        const encodedABI = query.encodeABI();
    
        let signedTxn = await web3.eth.accounts.signTransaction({
            nonce: await web3.eth.getTransactionCount(senderAddress),
            to: contractAddress,
            data: encodedABI,
            gasPrice: await web3.eth.getGasPrice(),
            gas: 2000000,
        }, privateKey);
    
        web3.eth.sendSignedTransaction(signedTxn.rawTransaction).then((receipt) => {
            // console.log(receipt);
        })

        user.balance -= amount;
        await user.save()

        const transaction = await transactions.create({
            user_id: user.id,
            type: 2,
            amount: amount,
            balance: user.balance
        });
    
        return ResponseData.ok(res, 'OK', {value: value}); 
    } catch (err) {
        // console.log('withdraw', err);
        return ResponseData.error(res, "", err);
    }
}

const deposit = async (req, res) => {
    try {
    // await Moralis.start({
        //     apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjNmZjA2OTdkLWQwNzItNGQyNC1hNmYxLTcxMjM4NTA4NmM5ZCIsIm9yZ0lkIjoiMzgzNTg5IiwidXNlcklkIjoiMzk0MTQ5IiwidHlwZUlkIjoiYWE1ODE4N2QtMmU5Ni00ZTJhLTkwZTYtM2U3ZDJmNzY2NGMyIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MTA4MzgwOTAsImV4cCI6NDg2NjU5ODA5MH0.JHygvkeND_-BFR5Hh0k_zWi8q80F8A94SBTZzXAB18M",
        //     // ...and any other configuration
        //   });

        // const sendAddress = req.body;

        // const receiverAddress = process.env.WalletAddress;

        // const chain = EvmChain.BSC_TESTNET;

        // const response = await Moralis.EvmApi.token.getWalletTokenTransfers({
        //     address: receiverAddress,
        //     chain,
        // });

        // const data = response.toJSON();
        // console.log(data);

        const amount = req.body.amount;
        const user = req.user;

        user.balance += amount;
        await user.save();

        const transaction = await transactions.create({
            user_id: user.id,
            type: 1,
            amount: amount,
            balance:  user.balance
        });

        return ResponseData.ok(res, 'OK', {transaction});
    } catch (err) {
        // console.log(err);
        return ResponseData.error(res, "", err);
    }
}

const getWithdraw = async (req, res) => {
    const withdraws = await transactions.findAll({
        where: {
            user_id: req.user.id,
            type: 2
        }
    });

    return ResponseData.ok(res, 'OK', {data: withdraws}); 
}

const getDeposit = async (req, res) => {
    const deposit = await transactions.findAll({
        where: {
            user_id: req.user.id,
            type: 1
        }
    });

    return ResponseData.ok(res, 'OK', {data: deposit}); 
}

module.exports = {
    amount,
    setProfile,
    withdraw,
    deposit,
    getWithdraw,
    getDeposit
}