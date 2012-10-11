// streets.js
// Routes to CRUD streets.

var Street = require('../models/street');

// GET /streets
exports.list = function (req, res, next) {
    Street.getAll(function (err, streets) {
        if (err) return next(err);
        res.render('streets', {
            streets: streets
        });
    });
};

// POST /streets
exports.create = function (req, res, next) {
    Street.create({
        name: req.body['name']
    }, function (err, street) {
        if (err) return next(err);
        res.redirect('/streets/' + street.id);
    });
};

// GET /streets/:id
exports.show = function (req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        // TODO also fetch and show followers?
        street.getFollowingAndOthers(function (err, following, others) {
            if (err) return next(err);
            res.render('street', {
                street: street,
                following: following,
                others: others
            });
        });
    });
};

// GET /streetlist/:id
exports.streetlist = function (req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        // TODO also fetch and show followers?
        street.getFollowingAndOthers(function (err, following, others) {
            if (err) return next(err);
            res.render('streetlist', {
                following: following
            });
        });
    });
};

exports.streetidlist = function (req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        // TODO also fetch and show followers?
        street.getFollowingAndOthers(function (err, following, others) {
            if (err) return next(err);
            res.render('streetidlist', {
                following: following
            });
        });
    });
};

exports.byname = function(req, res, next) {
    Street.getByName(req.params.name, function(err, street) {
      if (err) return next(err);
      res.send(street.id);
    });
};


// GET /addmarket/:streetname
exports.marketbyname = function(req, res, next) {
    Street.getByName(req.params.name, function(err, street) {
      Street.get(street.id, function (err, street) {
        if (err) return next(err);
        street.hasfoodmarket = "true";
        street.save(function (err) {
            if (err) return next(err);
            res.send("success");
        });
      });
    });
};

// GET /marketdistance/:streetid
exports.marketdistance = function(req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        street.calcdistance(function(nameanddist, err){
            if (err) return next(err);
			var nameOfNumber = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen"];
            res.send("#macongaslugstreets[name='" + nameanddist.name.replace("&apos;","") + "']{ line-color: @" + nameOfNumber[nameanddist.linkcount] + "; }");
        });
    });
};

// POST /streets/:id
exports.edit = function (req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        street.name = req.body['name'];
        street.save(function (err) {
            if (err) return next(err);
            res.redirect('/streets/' + street.id);
        });
    });
};

// DELETE /streets/:id
exports.del = function (req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        street.del(function (err) {
            if (err) return next(err);
            res.redirect('/streets');
        });
    });
};

// POST /streets/:id/follow
exports.follow = function (req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        Street.get((req.body.streetid || req.body.street.id), function (err, other) {
            if (err) return next(err);
            street.follow(other, req.body.latlng, function (err) {
                if (err) return next(err);
                res.redirect('/streets/' + street.id);
            });
        });
    });
};

// POST /streets/:id/unfollow
exports.unfollow = function (req, res, next) {
    Street.get(req.params.id, function (err, street) {
        if (err) return next(err);
        Street.get(req.body.street.id, function (err, other) {
            if (err) return next(err);
            street.unfollow(other, function (err) {
                if (err) return next(err);
                res.redirect('/streets/' + street.id);
            });
        });
    });
};
