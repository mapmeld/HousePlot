// points.js
// Routes to CRUD points.

var Point = require('../models/point');
var Street = require('../models/street');

// GET /points
exports.list = function (req, res, next) {
    Point.getAll(function (err, points) {
        if (err) return next(err);
        res.render('points', {
            points: points
        });
    });
};

// GET /demolished/:streetid
exports.getDemolished = function(req, res, next) {
    Point.getDemolished(req.params.streetid, function (err, points) {
        if (err) return next(err);
        res.render('points', {
            points: points
        });
    });
};

// GET /numbers/:streetid
exports.getNumbers = function(req, res, next) {
    Point.getNumbers(req.params.streetid, function (err, points) {
        if (err) return next(err);
        res.render('points', {
            points: points
        });
    });
};

// POST /points
exports.create = function (req, res, next) {
    Point.create({
        number: req.body['number'],
        closedate: 1 * req.body['closedate'],
        opendate: 1 * req.body['opendate'],
        action: req.body['action']
    }, function (err, point) {
        if (err) return next(err);
        res.redirect('/points/' + point.id);
    });
};

// GET /points/:id
exports.show = function (req, res, next) {
    Point.get(req.params.id, function (err, point) {
        if (err) return next(err);
        // TODO also fetch and show followers?
        point.getFollowingAndOthers(function (err, following, others) {
            if (err) return next(err);
            res.render('point', {
                point: point,
                following: following,
                others: others
            });
        });
    });
};

// POST /points/:id
exports.edit = function (req, res, next) {
    Point.get(req.params.id, function (err, point) {
        if (err) return next(err);
        point.name = req.body['name'];
        point.save(function (err) {
            if (err) return next(err);
            res.redirect('/points/' + point.id);
        });
    });
};

// DELETE /points/:id
exports.del = function (req, res, next) {
    Point.get(req.params.id, function (err, point) {
        if (err) return next(err);
        point.del(function (err) {
            if (err) return next(err);
            res.redirect('/points');
        });
    });
};

// POST /points/:id/follow
exports.follow = function (req, res, next) {
    Point.get(req.params.id, function (err, point) {
        if (err) return next(err);
        Street.get((req.body.streetid || req.body.street.id), function (err, other) {
            if (err) return next(err);
            point.follow(other, function (err) {
                if (err) return next(err);
                res.redirect('/points/' + point.id);
            });
        });
    });
};

// POST /points/:id/unfollow
exports.unfollow = function (req, res, next) {
    Point.get(req.params.id, function (err, point) {
        if (err) return next(err);
        Point.get(req.body.point.id, function (err, other) {
            if (err) return next(err);
            point.unfollow(other, function (err) {
                if (err) return next(err);
                res.redirect('/points/' + point.id);
            });
        });
    });
};
