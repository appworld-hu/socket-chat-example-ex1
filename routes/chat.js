module.exports = {
    get: function(app, mustLogin){
        app.get("/", mustLogin, (req, res) => {
            res.render("index.ejs",{sender_id: req.session.user._id});
          });
    }
}