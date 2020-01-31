const {Router} = require('express');
const router = Router();

router.post('/register', async (req, res) => {
    try {
        const {email, password} = req.body;

    } catch(err) {
        res.status(500).json({message: 'Something do wrong, try again'});
    }
});

router.post('/login', async (req, res) => {

});


module.exports = router;