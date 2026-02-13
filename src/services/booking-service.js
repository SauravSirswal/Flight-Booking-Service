const axios = require('axios');
const { BookingRepository } = require("../repository")
const { StatusCodes } = require('http-status-codes');
const db = require("../models")
const { serverConfig } = require("../config");
const AppError = require('../utils/errors/app-error');
const bookingRepository = new BookingRepository();
const { Enums } = require("../utils/common")
const { BOOKED, CANCELLED } = Enums.BookingStatus

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try {
        const flight = await axios.get(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}`)
        const flightData = flight.data.data
        if(data.noOfSeats > flightData.totalSeats){
            throw new AppError("No of seats exceeds available seats", StatusCodes.BAD_REQUEST);
        }
        const totalBillingAmount = data.noOfSeats * flightData.price
        const BookingPayload = {...data, totalCost: totalBillingAmount}
        const booking = await bookingRepository.createBooking(BookingPayload, transaction)
        await axios.patch(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${data.flightId}/seats`, {seats : data.noOfSeats})
        await transaction.commit()
        return booking
    } catch (error) {
        await transaction.rollback();
        throw error
    }
}

async function makePayment(data){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction)
        if(bookingDetails.status == CANCELLED){
            throw new AppError("the booking is cancelled", StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt)
        const currentTime = new Date()
        if(currentTime - bookingTime > 300000){
            await cancelBooking(data.bookingId)
            throw new AppError("the booking is expired", StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError("the amount of the payment doesn't match", StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId != data.userId){
            throw new AppError("the user corresponding to the booking doesn't match", StatusCodes.BAD_REQUEST);
        }

        //assumed the payment is successful
        const response = await bookingRepository.update(data.bookingId, {status: BOOKED}, transaction)
        await transaction.commit()
        return response
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function cancelBooking(bookingId){
    const transaction = await db.sequelize.transaction();
    try {
        const bookingDetails = await bookingRepository.get(bookingId, transaction)
        if(bookingDetails.status == CANCELLED){
            await transaction.commit()
            return true
        }
        await axios.patch(`${serverConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${bookingDetails.flightId}/seats`, {seats : bookingDetails.noOfSeats, dec: 0}) 
        await bookingRepository.update(bookingId, {status: CANCELLED}, transaction)
        await transaction.commit()
        return true
    } catch (error) {
        await transaction.rollback()
        throw error
    }
}

async function cancelOldBookings() {
    try {
        const time = new Date( Date.now() - 1000 * 300 ); // time 5 mins ago
        const response = await bookingRepository.cancelOldBookings(time);
        return response;
    } catch(error) {
        console.log(error);
    }
}
module.exports = {
    createBooking,
    makePayment,
    cancelOldBookings
}