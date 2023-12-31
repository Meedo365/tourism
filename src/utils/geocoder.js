const NodeGeocoder = require("node-geocoder")

const options = {
    provider:process.env.GEOCODER_PROVIDER,
    apiKey:process.env.GEOCODER_API_KEY,
}

const geocoder = NodeGeocoder(options)

module.exports = geocoder