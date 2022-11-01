var express = require('express');
var router = express.Router();
// https://www.npmjs.com/package/ssh-keygen
var keygen = require('ssh-keygen');
// var fs = require('fs');
var jwt = require('jsonwebtoken');
require('dotenv').config()
var crypto = require('crypto');
const generateKeyPairAsync = util.promisify(crypto.generateKeyPair);

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

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
  let location = __dirname + '/foo_rsa';
  let comment = req.body.comment || '';
  let password = req.body.password || ''; // false and undefined will convert to an empty pw
  let method = req.body.method || 'crypto';

  let format = 'PEM'; // default is RFC4716
  let size = 4096; // default is 2048

  let options = {
    location: location,
    comment: comment,
    password: password,
    read: true,
    format: format,
    size: size,
    destroy: process.env.DESTROY || true // default to deleting generated keys
  }

  // function to generate Json Web Token using the private key
  function generateJWT() {
    let payload_data = {
      "iss": iss_name,
      "aud": "fmsadminapi",
      "exp": Math.floor(Date.now() / 1000) + (days * 86400) // 86400 seconds in a day
    };
    let token = jwt.sign(payload_data, privKey, { algorithm: 'RS256' });

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
  async function generateSshKeys(passphrase) {
    const keys = await generateKeyPairAsync('rsa', {
      modulusLength: size,
      privateKeyEncoding: {
        cipher: 'aes256',
        format: 'pem',
        passphrase,
        type: 'pkcs1',
      },
      publicKeyEncoding: {
        format: 'pem',
        type: 'pkcs1',
      },
    });
    return keys;
  }

  // callback function for ssh-keygen
  var callback = function (err, out) {
    if (err) {
      return res.status(500).json(err);
    }
    else {
      console.log('Keys created!');
      privKey = out.key;
      pubKey = out.pubKey;
      //console.log('private key: ' + out.key);
      //console.log('public key: ' + out.pubKey);

      //  now generate the JWT with that private key
      let result = generateJWT(privKey);
      return res.status(200).json(result);
    }
  }



  // execute 
  try {
    switch (method) {
      case 'crypto':
        await generateSshKeys(password).then(
          (keys) => {
            privKey = keys.privateKey;
            //  now generate the JWT with that private key
            let result = generateJWT(privKey);
            return res.status(200).json(result);
          });
        break;
      case 'keygen':
        keygen(options, callback);
        break;
      default:

        break;
    }

  } catch (error) {
    return res.status(500).json(error);
  }



});

// =================================================================================================

module.exports = router;
