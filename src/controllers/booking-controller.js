const { StatusCodes } = require("http-status-codes");
const {BookingService} = require("../services")
const {SuccessResponse, ErrorResponse} = require("../utils/common")

const inMemoryDB = {}

async function createBooking(req, res) {
    try {
        const response = await BookingService.createBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });
        SuccessResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

async function makePayment(req, res) {
    try {
        const idempotencyKey = req.headers["x-idempotency-key"];
        if(!idempotencyKey){
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({message : "Idempotency key is required"});
        }
        if(inMemoryDB[idempotencyKey]){
            return res
                .status(StatusCodes.CONFLICT)
                .json({message : "Cannot retry on a successful payment"});
        }
        const response = await BookingService.makePayment({
            bookingId: req.body.bookingId,
            userId: req.body.userId,
            totalCost: req.body.totalCost
        });
        inMemoryDB[idempotencyKey] = idempotencyKey
        SuccessResponse.data = response;
        return res
                .status(StatusCodes.OK)
                .json(SuccessResponse);
    } catch(error) {
        ErrorResponse.error = error;
        return res
                .status(StatusCodes.INTERNAL_SERVER_ERROR)
                .json(ErrorResponse);
    }
}

module.exports = {
    createBooking,
    makePayment
}