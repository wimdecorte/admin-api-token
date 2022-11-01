var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
require('dotenv').config()
var crypto = require('crypto');
var util = require('util');
const generateKeyPairAsync = util.promisify(crypto.generateKeyPair);


// =================================================================================================
router.post('/generate', async function (req, res, next) {

  // check if body is json
  if (!req.is('application/json')) {
    res.status(400).send('Bad Request');
    return;
  }
  let days = process.env.DAYS || 1;
  // check if json body contains the required fields
  if (req.body.hasOwnProperty('days')) {
    days = parseInt(req.body.days);
  }

  let privKey = undefined;
  let pubKey = undefined;

  let iss_name = req.body.name;
  let password = req.body.password || undefined; // false and undefined will convert to an empty pw
  let size = 4096; // default is 2048

  // function to generate Json Web Token using the private key
  function generateJWT() {
    let payload_data = {
      "iss": iss_name,
      "aud": "fmsadminapi",
      "exp": Math.floor(Date.now() / 1000) + (days * 86400) // 86400 seconds in a day
    };
    let signWith = { key: privKey, passphrase: password };
    let token = jwt.sign(payload_data, signWith, { algorithm: 'RS256' });

    // create the json envelope
    let result = {
      "privKey": privKey,
      "pubKey": pubKey,
      "JWT": token,
      "days": days,
      "JWT_name": iss_name,
      "instructions": "don't forget to add the public key to FMS and name the entry exactly like JWT_name!"
    };
    return result;
  }

  // generate the keys through crypto
  async function generateSshKeys() {
    console.log('inside crypto function - password: ' + password);
    const keys = await generateKeyPairAsync('rsa', {
      modulusLength: size,
      privateKeyEncoding: {
        cipher: 'aes256',
        format: 'pem',
        passphrase: password,
        type: 'pkcs8',
      },
      publicKeyEncoding: {
        format: 'pem',
        type: 'spki', //type: 'pkcs1',
      },
    });
    return keys;
  }

  // execute 
  try {
    //console.log('Generating keys with crypto');
    await generateSshKeys().then(
      (keys) => {
        //console.log('Keys created - before JWT');
        privKey = keys.privateKey;
        pubKey = keys.publicKey;
        // for sending through the FMS admin API we need a version with no line endings
        let pubKeyClean = pubKey.replace(/\r?\n|\r/g, "");
        //console.log('private key: ' + privKey);
        //  now generate the JWT with that private key
        let result = generateJWT(privKey);
        result.pubKeyClean = pubKeyClean;
        //console.log('after JWT');
        return res.status(200).json(result);
      });
  }
  catch (error) {
    return res.status(500).json(error);
  }



});

// =================================================================================================

router.post('/jwt/decode', function (req, res, next) {
  // check if body is json
  if (!req.is('application/json')) {
    res.status(400).send('Bad Request');
    return;
  }
  let token = req.body.jwt;
  var decoded = jwt.decode(token);
  let utcSeconds = decoded.exp;
  var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
  d.setUTCSeconds(utcSeconds);
  decoded.expDate = d;
  return res.status(200).json(decoded);
});



// =================================================================================================

module.exports = router;
