const CrudRepository = require("./crud-repository");
const { Booking } = require("../models");
const { Enums } = require("../utils/common");
const { Op } = require("sequelize");
const { CANCELLED, BOOKED } = Enums.BookingStatus

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

    async cancelOldBookings(timeStamp){
        const response = await Booking.update({status : CANCELLED},{
            where : {
                [Op.and]: [
                    {
                        createdAt : {
                            [Op.lte] : timeStamp
                        }
                    },
                    {
                        status : {
                            [Op.ne] : BOOKED
                        }
                    },
                    {
                        status : {
                            [Op.ne] : CANCELLED
                        }
                    }
                ]
            }
        })
        return response
    }
}

module.exports = BookingRepository;