const User = require("../../models/userSchema");
const ErrorResponse = require("../../utils/errorResponse");
const bcrypt = require("bcrypt");

let routes = (app) => {

    app.post('/register', async (req, res) => {
        let { name, email, password, role } = req.body

        if (!name || !email || !password)
            return res.status(400).json({ msg: "Please fill in all fields, one or more fileds are empty!" })

        // const findUser = await User.findOne({ email })

        // if (findUser) return next(new ErrorResponse(`The email ${email} already exist`, 404))

        password = await bcrypt.hash(password, 12)

        // const user = await User.create({ name, email, password, role, status: "active" })
        const newUser = new User({
            name, email, password, role, status: "active"
        })

        await newUser.save()

        res.json({ msg: "Account has been created!" })

    });

    app.get('/users', async (req, res) => {
        try {
            let user = await User.find()
            res.json(user)
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.get('/user/:id', async (req, res) => {
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

    app.put('/user/:id', async (req, res) => {
        try {
            const id = req.params.id

            const { name, email } = req.body

            const field = { name, email }

            const user = await User.findByIdAndUpdate(id, field, { new: true })

            if (!user) return next(new ErrorResponse(`no user with id ${id}`, 404))

            res.status(200).json({ success: true, data: user })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

    app.delete('/user/:id', async (req, res) => {
        try {
            let id = req.params.id
            await User.deleteOne({ _id: id })
            res.json({ msg: "User Deleted" })
        }
        catch (err) {
            res.status(500).send(err)
        }
    });

};

module.exports = routes;