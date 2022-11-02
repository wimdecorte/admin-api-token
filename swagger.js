const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = ['./routes/keys.js']

swaggerAutogen(outputFile, endpointsFiles)