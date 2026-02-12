const express = require("express")
const BookingRoutes = require("./booking-routes")

const router = express.Router()

router.use("/bookings", BookingRoutes)
module.exports = router