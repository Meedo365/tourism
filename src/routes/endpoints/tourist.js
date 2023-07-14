const ErrorResponse = require("../../utils/errorResponse");
const Tourist = require("../../models/touristcenterschema")
const geocoder = require("../../utils/geocoder")

let routes = (app) => {

    app.post('/create-center', async (req, res) => {
        // only admin and publisher can create tourist center
        if (req.user.role != "admin" && req.user.role != "publisher") return next(new ErrorResponse("you cant accesss this route", 403))

        // use node-geocoder to get formatted address
        const loc = await geocoder.geocode(req.body.address)
        let location = {
            type: "Point",
            coordinates: [loc[0].longitude, loc[0].latitude],
            formattedAddress: loc[0].formattedAddress,
            street: loc[0].streetName,
            city: loc[0].city,
            state: loc[0].stateCode,
            zipcode: loc[0].zipcode,
            country: loc[0].countryCode
        }

        req.body.location = location
        const owner = req.user.id
        req.body.owner = owner

        const tourist = new Tourist(req.body)

        await tourist.save()

        res.json({ msg: "Tourist Center has been created!" })

    });

    app.get('/centers', async (req, res) => {
        try {
            let user = await Tourist.find(querystring).populate({ path: "owner", select: "name email" })
            res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/center/:id', async (req, res) => {
        try {
            let id = req.params.id
            let user = await User.findOne({ _id: id })
            if (!user) return next(new ErrorResponse(`no user with id ${id}`, 404))
            res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.put('/center/:id', async (req, res) => {
        try {
            const id = req.params.id
            let tourist = await Tourist.findById(req.params.id);
            // another user cannot delete what he did not create
            if (tourist.user !== req.user.id && req.user.role !== "admin") return next(new ErrorResponse(`Not authorize to update`, 401))
            // const { name, email } = req.body

            // const field = { name, email }

            // const user = await User.findByIdAndUpdate(id, field, { new: true })
            // update tourist center   
            tourist = await Tourist.findOneAndUpdate(req.params.id, req.body, { new: true })
            // if no tourist
            if (!tourist) return next(new ErrorResponse("No tourist center found", 404))
            res.status(200).json({ success: true, data: tourist })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/center/:id', async (req, res) => {
        try {
            let id = req.params.id
            await Tourist.deleteOne({ _id: id })
            res.json({ msg: "Tourist Center Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
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