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


var addressSetSub;

// prompt the user to change the value of idi's contract
function createAccount() {
  prompt.message = "Crear cuenta:";
  prompt.delimiter = "\t";
  prompt.start();
  prompt.get(['value'], function (error, result) {
    if (error) { throw error }
    registerNewAccount(result.value)
  });
}

// using eris-contracts call the `set` function of idi's
// contract using the value which was recieved from the
// createAccount prompt
function registerNewAccount(value) {
  var valueHex = toHex(value);
  idisContract.registerNewAccount(valueHex, function(error, result){
    if (error) { throw error }
    console.log("Create account:\t\t\t" + result.toNumber()); 
    //endow(function(){});
    getBalance(value);
  });
}

function getBalance(user) {
  var userHex = toHex(user);
  idisContract.getBalance(userHex, function(error, result){
    if (error) { throw error }
    console.log("Balance for user\t\t\t" +  user  + " " + result.toNumber()); 
    //endow(function(){});
    //endow(user, 1000, "Prueba de endow");
    payment(user, 100, "prueba de payment")
  });
}

function endow(user, ammount, message) {
  var userHex = toHex(user);
  var messageHex = toHex(message);
  idisContract.endow(userHex, ammount, messageHex, function(error, result){
    if (error) { throw error }
    console.log("endow for user\t\t\t" +  user  + " " + result.toNumber()); 
    //endow(function(){});
    getBalance(user);
    //payment(user, 500, "prueba de payment")
  });
}

function payment(user, ammount, message) {
  var userHex = toHex(user);
  var messageHex = toHex(message);
  idisContract.payment(userHex, ammount, messageHex, function(error, result){
    if (error) { throw error }
    console.log("payment for user\t\t\t" +  user  + " " + result.toNumber()); 
    //endow(function(){});
    getBalance(user);
  });
}

function toHex(str) {
  var hex = '';
  for(var i=0;i<str.length;i++) {
    hex += ''+str.charCodeAt(i).toString(16);
  }
  return hex;
}

idisContract.LogPaymentBusMade(startCallback, eventCallback);
 
    function startCallback(error, eventSub){
        if(error){ 
            throw error;
        }
        addressSetSub = eventSub;
    }
 
    function eventCallback(error, event){
        console.log("Se llama event")
        console.log(event); 
    }

// run
//getValue(createAccount);
createAccount();

