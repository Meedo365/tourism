const Booking = require("../../models/bookings")

let routes = (app) => {

    // create booking
    app.post('/booking', async (req, res) => {
        const booking = new Booking(req.body)
        await booking.save()
        res.json({ msg: "Booking Center has been created!" });
    });

    // get all bookings
    app.get('/bookings', async (req, res) => {
        try {
            let booking = await Booking.find()
                .populate("owner", "name email")
                .populate("reservation.touristCenter", "touristCenter location.formattedAddress")
            res.json(booking)
        }
        catch (err) {
            res.status(500).send({ msg: "Error getting all bookings" })
        }
    });

    // get bookings by a particular owner
    app.get('/owner-booking/:id', async (req, res) => {
        try {
            let id = req.params.id
            let booking = await Booking.find({ owner: id })
            if (!booking) return res.status(404).send({ msg: "This user has no existing booking" })
            res.json(booking)
        }
        catch (err) {
            res.status(500).send({ msg: "Error getting all of this owner bookings" })
        }
    });

    // get details of a booking
    app.get('/booking/:id', async (req, res) => {
        try {
            let id = req.params.id
            let booking = await Booking.findOne({ _id: id })
            if (!booking) return res.status(404).send({ msg: "Center does not exist" })
            res.json(booking)
        }
        catch (err) {
            res.status(500).send({ msg: "Error getting booking" })
        }
    });

    // edit booking
    app.put('/booking/:id', async (req, res) => {
        try {
            const id = req.params.id
            let booking = await Booking.findById(id);
            booking = await Booking.findOneAndUpdate(req.params.id, req.body, { new: true })
            if (!booking) return res.status(404).send({ msg: "Center does not exist" })
            res.status(200).json({ success: true, data: booking })
        }
        catch (err) {
            res.status(500).send({ msg: "Error editting booking" })
        }
    });

    // delete booking
    app.delete('/booking/:id', async (req, res) => {
        try {
            let id = req.params.id
            await Booking.deleteOne({ _id: id })
            res.json({ msg: "Booking Center Deleted" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error deleting booking" })
        }
    });

};

module.exports = routes;