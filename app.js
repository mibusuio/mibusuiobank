// requires
var fs = require ('fs');
var prompt = require('prompt');
var erisC = require('eris-contracts');
var nfc  = require('nfc').nfc
var util = require('util');
var version = nfc.version();
var devices = nfc.scan();

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

// // prompt the user to change the value of idi's contract
// function createAccount() {
//   prompt.message = "Crear cuenta:";
//   prompt.delimiter = "\t";
//   prompt.start();
//   prompt.get(['value'], function (error, result) {
//     if (error) { throw error }
//     registerNewAccount(result.value)
//   });
// }

// // using eris-contracts call the `set` function of idi's
// // contract using the value which was recieved from the
// // createAccount prompt
// function registerNewAccount(value) {
//   var valueHex = toHex(value);
//   idisContract.registerNewAccount(valueHex, function(error, result){
//     if (error) { throw error }
//     console.log("Create account:\t\t\t" + result.toNumber()); 
//     //endow(function(){});
//     getBalance(value);
//   });
// }

// function getBalance(user) {
//   var userHex = toHex(user);
//   idisContract.getBalance(userHex, function(error, result){
//     if (error) { throw error }
//     console.log("Balance for user\t\t\t" +  user  + " " + result.toNumber()); 
//     //endow(function(){});
//     //endow(user, 1000, "Prueba de endow");
//     payment(user, 100, "prueba de payment")
//   });
// }

// function endow(user, ammount, message) {
//   var userHex = toHex(user);
//   var messageHex = toHex(message);
//   idisContract.endow(userHex, ammount, messageHex, function(error, result){
//     if (error) { throw error }
//     console.log("endow for user\t\t\t" +  user  + " " + result.toNumber()); 
//     //endow(function(){});
//     getBalance(user);
    
//   });
// }

// function payment(user, ammount, message) {
//   var userHex = toHex(user);
//   var messageHex = toHex(message);
//   idisContract.payment(userHex, ammount, messageHex, function(error, result){
//     if (error) { throw error }
//     console.log("payment for user\t\t\t" +  user  + " " + result.toNumber()); 
//     if(result.toNumber() == 21 ){
//        endow(user, 1000, "Prueba de endow");
//     }
//     getBalance(user);
//   });
// }

// function toHex(str) {
//   var hex = '';
//   for(var i=0;i<str.length;i++) {
//     hex += ''+str.charCodeAt(i).toString(16);
//   }
//   return hex;
// }

// function hex2a(hex) {
//     var str = '';
//     for (var i = 0; i < hex.length; i += 2) {
//         var v = parseInt(hex.substr(i, 2), 16);
//         if (v) str += String.fromCharCode(v);
//     }
//     return str;
// } 

// idisContract.LogPaymentBusMade(startCallback, eventCallback);
 
// function startCallback(error, eventSub){
//     console.log("Se llama event 1")
//     if(error){ 
//         throw error;
//     }
//     addressSetSub = eventSub;
// }

// function eventCallback(error, event){
//     console.log("Se llama event 2");
//     console.log(event);
//     var cedula = hex2a(event.args.accountId);
//     console.log(cedula);
//     //console.log("El usuario " + event.args.accountId.toNumber + "hizo un pago de " + event.args.amount.toNumber + "a " + event.args.busId.toNumber); 
// }

// // run
// //getValue(createAccount);
// createAccount();


idisContract.LogPaymentBusMade(startCallback, eventCallback);
 
function startCallback(error, eventSub){
    console.log("Se llama event 1")
    if(error){ 
        throw error;
    }
    addressSetSub = eventSub;
}

function eventCallback(error, event){
    console.log("Se llama event 2");
    console.log(event);
    var cedula = hex2a(event.args.accountId);
    console.log(cedula);
    //console.log("El usuario " + event.args.accountId.toNumber + "hizo un pago de " + event.args.amount.toNumber + "a " + event.args.busId.toNumber); 
}

function payment(user, ammount, message) {
  console.log("call payment");
  var userHex = toHex(user);
  var messageHex = toHex(message);
  idisContract.payment(userHex, ammount, messageHex, function(error, result){
    if (error) { throw error }
    console.log("payment for user\t\t\t" +  user  + " " + result.toNumber()); 
  });
}


function toHex(str) {
  var hex = '';
  for(var i=0;i<str.length;i++) {
    hex += ''+str.charCodeAt(i).toString(16);
  }
  return hex;
}

function hex2a(hex) {
    var str = '';
    for (var i = 0; i < hex.length; i += 2) {
        var v = parseInt(hex.substr(i, 2), 16);
        if (v) str += String.fromCharCode(v);
    }
    return str;
} 


console.log('version: ' + util.inspect(version, { depth: null }));
console.log('devices: ' + util.inspect(devices, { depth: null }));

function read(deviceID) {
  console.log('');
  var nfcdev = new nfc.NFC();

  nfcdev.on('read', function(tag) {
    console.log(util.inspect(tag, { depth: null }));
    payment("1720439866", 21, "payment");
    if ((!!tag.data) && (!!tag.offset)) {
      console.log(util.inspect(nfc.parse(tag.data.slice(tag.offset)), { depth: null }));

    }
      
    //nfcdev.stop();
  });

  nfcdev.on('error', function(err) {
    console.log(util.inspect(err, { depth: null }));
  });

  nfcdev.on('stopped', function() {
    console.log('stopped');
  });

  console.log(nfcdev.start(deviceID));
}

for (var deviceID in devices) read(deviceID);

