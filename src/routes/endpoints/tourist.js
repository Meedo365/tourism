const ErrorResponse = require("../../utils/errorResponse");
const Tourist = require("../../models/touristcenterschema")
const geocoder = require("../../utils/geocoder")

let routes = (app) => {

    // create center
    app.post('/create-center', async (req, res) => {
        // only admin and publisher can create tourist center
        // if (req.center.role != "admin" && req.center.role != "publisher") return next(new ErrorResponse("you cant accesss this route", 403))

        // use node-geocoder to get formatted address
        const loc = await geocoder.geocode(req.body.address)
        let location = {
            type: "Point",
            coordinates: [loc[0].longitude, loc[0].latitude],
            formattedAddress: loc[0].formattedAddress,
            street: loc[0].streetName,
            city: loc[0].city,
            state: loc[0].state,
            zipcode: loc[0].zipcode,
            country: loc[0].countryCode
        }

        req.body.location = location
        // const owner = req.center.id
        // req.body.owner = owner

        const tourist = new Tourist(req.body)
        await tourist.save()
        res.json({ msg: "Tourist Center has been created!" });
    });

    // get all centers
    app.get('/centers', async (req, res) => {
        try {
            let center = await Tourist.find()
                .populate("owner", "name email")
            res.json(center)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get centers by a particular owner
    app.get('/owner/:id', async (req, res) => {
        try {
            let id = req.params.id
            let center = await Tourist.find({ owner: id })
            if (!center) return next(new ErrorResponse(`no center with id ${id}`, 404))
            res.json(center)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    // get details of a center
    app.get('/center/:id', async (req, res) => {
        try {
            let id = req.params.id
            let center = await Tourist.findOne({ _id: id })
            if (!center) return res.status(404).send({ msg: "Center does not exist" })
            res.json(center)
        }
        catch (err) {
            res.status(500).send({ msg: "Error getting center" })
        }
    });

    // edit center
    app.put('/center/:id', async (req, res) => {
        try {
            const id = req.params.id
            let center = await Tourist.findById(req.params.id);
            // another center cannot delete what he did not create
            // if (tourist.center !== req.center.id && req.center.role !== "admin") return next(new ErrorResponse(`Not authorize to update`, 401))
            // const { name, email } = req.body

            // const field = { name, email }

            // const center = await Tourist.findByIdAndUpdate(id, field, { new: true })
            // update tourist center   
            center = await Tourist.findOneAndUpdate(req.params.id, req.body, { new: true })
            // if no tourist
            if (!center) return res.status(404).send({ msg: "Center does not exist" })
            res.status(200).json({ success: true, data: center })
        }
        catch (err) {
            res.status(500).send({ msg: "Error editting center" })
        }
    });

    // delete center
    app.delete('/center/:id', async (req, res) => {
        try {
            let id = req.params.id
            await Tourist.deleteOne({ _id: id })
            res.json({ msg: "Tourist Center Deleted" })
        }
        catch (err) {
            res.status(500).send({ msg: "Error deleting center" })
        }
    });

    app.get('/centers-by-distance/:zipcode/:distance/:unit', async (req, res) => {
        try {
            //    use geo-code to get latitude and longitude
            const { zipcode, distance, unit } = req.params
            const loc = await geocoder.geocode(zipcode)
            const lat = loc[0].latitude
            const lng = loc[0].longitude
            let radius;

            //    divide distance by the radius of earth to get the radius either in km/mi
            if (unit == "km") {
                radius = distance / 6378
            } if (unit == "mi") {
                radius = distance / 3963
            }

            //   find tourist center within location
            const tourist = await Tourist.find({
                location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
            })

            res.status(200).json({ success: true, Number: tourist.length, data: tourist })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/centers-by-query', async (req, res) => {
        try {
            let query;

            //   make a copy of req.query
            const reqQuery = { ...req.query }

            const remove = ["select", "sort", "page", "limit"]

            remove.forEach(params => delete reqQuery[params])

            let querystring = JSON.stringify(reqQuery)

            querystring = querystring.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

            querystring = JSON.parse(querystring)

            query = Tourist.find(querystring).populate({ path: "owner", select: "name email" })

            if (req.query.select) {
                const variables = req.query.select.split(",").join(" ")
                query = query.select(variables)
            }

            if (req.query.sort) {
                const variables = req.query.sort.split(",").join(" ")
                query = query.sort(variables)
            } else {
                query = query.sort("-createdAt")
            }

            const page = parseInt(req.query.page, 10) || 1

            const limit = parseInt(req.query.limit, 10) || 50

            const startIndex = (page - 1) * limit

            const endIndex = page * limit

            const total = await Tourist.countDocuments()

            query = query.skip(startIndex).limit(limit)

            const tourist = await query

            const pagination = {}
            if (endIndex < total) {
                pagination.next = {
                    page: page + 1,
                    limit
                }
            }
            if (startIndex > 0) {
                pagination.previous = {
                    page: page - 1,
                    limit
                }
            }

            // if no tourist
            if (!tourist) return next(new ErrorResponse("No tourist center found", 404))

            res.status(200).json({ success: true, Total: tourist.length, pagination, data: tourist })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;