class ShopController {
    getHome(req, res) {
        res.render('home');
    }
}

module.exports = new ShopController;