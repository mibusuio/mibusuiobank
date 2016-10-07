// requires
var fs = require ('fs');
var prompt = require('prompt');
var erisC = require('eris-contracts');

// NOTE. On Windows/OSX do not use localhost. find the
// url of your chain with:
// docker-machine ls
// and find the docker machine name you are using (usually default or eris).
// for example, if the URL returned by docker-machine is tcp://192.168.99.100:2376
// then your erisdbURL should be http://192.168.99.100:1337/rpc
var erisdbURL = "http://172.141.20.7:1337/rpc";

// get the abi and deployed data squared away
var contractData = require('./epm.json');
var idisContractAddress = contractData["Bank"];
var idisAbi = JSON.parse(fs.readFileSync("./abi/" + idisContractAddress));

// properly instantiate the contract objects manager using the erisdb URL
// and the account data (which is a temporary hack)
var accountData = require('./accounts.json');
var contractsManager = erisC.newContractManagerDev(erisdbURL, accountData.mibuspaychain_full_000);

// properly instantiate the contract objects using the abi and address
var idisContract = contractsManager.newContractFactory(idisAbi).at(idisContractAddress);

// display the current value of idi's contract by calling
// the `get` function of idi's contract
// function endow(callback) {
//   idisContract.endow(function(error, result){
//     if (error) { throw error }
//     console.log("Idi's number is:\t\t\t" + result.toNumber());
//     callback();
//   });
// }

// prompt the user to change the value of idi's contract
function createAccount() {
  prompt.message = "Crear cuenta:";
  prompt.delimiter = "\t";
  prompt.start();
  prompt.get(['value'], function (error, result) {
    if (error) { throw error }
    registerNewAccount(result.value.toString)
  });
}

// using eris-contracts call the `set` function of idi's
// contract using the value which was recieved from the
// createAccount prompt
function registerNewAccount(value) {
  idisContract.registerNewAccount(value, function(error, result){
    if (error) { throw error }
    //endow(function(){});
  });
}

// run
//getValue(createAccount);
createAccount();

