const {Router} = require('express');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const User = require('../models/User');
const router = Router();

router.post(
    '/register',
    [
        check('email', 'Invalid email').isEmail(),
        check('password', 'Minimal length password is 6 symbol').isLength({min:6})
    ], 
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Invalid data from registration"
                })
            }
            const {email, password} = req.body;

            const candidate = await User.findOne({email})

            if(candidate) {
                return res.status(400).json({message: 'This user already exist'});
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({email, password: hashedPassword});
            await user.save();
            res.status(201).json({message: "User created"});

        } catch(err) {
            res.status(500).json({message: 'Something do wrong, try again'});
        }
});

router.post(
    '/login',
    [
        check('email', 'Enter correct email').normalizeEmail().isEmpty(),
        check('password', 'Enter password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if(!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: "Invalid data from enter"
                })
            }
            
            const {email, password} = req.body;

            const user = await User.findOne({email});

            if(!user) {
                return res.status(400).json({message: 'User not found'});
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if(!isMatch) {
                return res.status(400).json({message: "Incorrect data, try again"});
            }

            const token = jwt.sign(
                {userId: user.id},
                config.get('jwtSecet'),
                {expiresIn: '1h'}
            )

            res.json({token, userId: user,id});

        } catch(err) {
            res.status(500).json({message: 'Something do wrong, try again'});
        }

});


module.exports = router;