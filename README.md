NodeJS Express microserivce to generate the private/public key pair and the JWT token to access the FMS Admin API
(new feature in FMS 19.6)

Required input:

1) the number of days you want this token to be valid for (will default to 365 if omitted)
2) the name of the token, you'll need to use this name in the FMS admin console, it's embedded in the JWT token
3) the password for the private key, can be null

Example:
{
	"days": 7,
	"name": "soliant04",
	"password": "ets"
}

Provided output (keys shortened for readability):

{
  "privKey": "-----BEGIN ENCRYPTED PRIVATE KEY-----\nMIIJrTBXBgkqVSy0Hgc\n-----END ENCRYPTED PRIVATE KEY-----\n",
  "pubKey": "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiGglsCAwEAAQ==\n-----END PUBLIC KEY-----\n",
  "JWT": "eyJhbGciOiJSUzI1NiIsIndnwRbFXDREKh_BkFuFKqlTnjJBa4Ibwe7xLeLES5VvAfb7luSekkPwkC6EGmpjtUg1MXCJUiyrnVSqDJo",
  "days": 7,
  "JWT_name": "soliant04",
  "instructions": "don't forget to add the public key to FMS and name the entry exactly like JWT_name!",
  "pubKeyClean": "-----BEGIN PUBLIC KEY-----MIICIjANBgkqhkiG9w0iNYdJ904oAgoglsCAwEAAQ==-----END PUBLIC KEY-----"
}

Paste pubKey into the FMS admin console and name the entry to what it says for JWT_name.
Use JWT when calling the Admin API.
Use pubKeyClean when using the Admin API to add this keypair programatically, for some reason the Admin API does not like the public key with line endings.
