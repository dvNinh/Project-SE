class AuthController {
    getLogin(req, res) {
        res.render('login');
    }

    postLogin(req, res) {

    }

    getRegister(req, res) {
        res.render('register');
    }

    postRegister(req, res) {
        
    }
}

module.exports = new AuthController;