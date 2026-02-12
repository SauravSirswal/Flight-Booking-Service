const dotenv = require('dotenv');

dotenv.config()

module.exports = {
    PORT : process.env.PORT || 4000,
    FLIGHT_SERVICE_URL : process.env.FLIGHT_SERVICE_URL || "http://localhost:3000"
}