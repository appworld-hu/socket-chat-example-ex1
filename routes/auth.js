module.exports = {
    get: function(app){
        app.get("/login", (req, res) => {
            res.render("login.ejs", { errors: req.flash('errors') });
          });
    },
    post: function(app, body, validationResult, User, bcrypt){
        app.post(
            "/login",
            body("email")
              .notEmpty()
              .withMessage("Az e-mail kötelező!")
              .isEmail()
              .withMessage("Az e-mail invalid formátumú!"),
            body("password").notEmpty().withMessage("A jelszó kötelező!"),
            async (req, res) => {
              const validation = validationResult(req)
              if(validation.isEmpty()) {
        
                  const userdoc = await User.findOne({email: req.body.email});
                  bcrypt.compare(req.body.password, userdoc.password)
                  .then( result => {
                    if( result ) {
                      req.session.user = userdoc
                      res.redirect('/')
                    } else {
                      req.flash('errors', [{msg: 'Hibás adatok!'}])
                      res.redirect('back')
                    }
                  } )
                  .catch( err => {
                    res.send( err.message )
                  } )
        
              } else {
             
                req.flash('errors', validation.errors)
                res.redirect('back')
              }
            }
          );
    }
}



  