const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const { StatusCodes } = require("http-status-codes");

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    async createBooking(data, transaction) {
        const response = await Booking.create(data, { transaction: transaction });
        return response;
    }

    async get(data, transaction) {
        const response = await Booking.findByPk(data, { transaction: transaction });
        return response;
    }

    async update(id, data, transaction) {
        const response = await Booking.update(data, {
            where:{
                id: id 
            }
        }, { transaction: transaction });
        return response;
    }
}

module.exports = BookingRepository;