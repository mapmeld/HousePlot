// street.js
// Street model logic.

var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase(process.env.NEO4J_URL || 'http://localhost:7474');

// constants:

var INDEX_NAME = 'nodes';
var INDEX_KEY = 'type';
var INDEX_VAL = 'street';

var FOLLOWS_REL = 'connectsto';

// private constructor:

var Street = module.exports = function Street(_node) {
    // all we'll really store is the node; the rest of our properties will be
    // derivable or just pass-through properties (see below).
    this._node = _node;
}

// pass-through node properties:

function proxyProperty(prop, isData) {
    Object.defineProperty(Street.prototype, prop, {
        get: function () {
            if (isData) {
                return this._node.data[prop];
            } else {
                return this._node[prop];
            }
        },
        set: function (value) {
            if (isData) {
                this._node.data[prop] = value;
            } else {
                this._node[prop] = value;
            }
        }
    });
}

proxyProperty('id');
proxyProperty('exists');

proxyProperty('name', true);
proxyProperty('hasfoodmarket', true); // food network map

// private instance methods:

Street.prototype._getFollowingRel = function (other, callback) {
    var query = [
        'START street=node({streetId}), other=node({otherId})',
        'MATCH (street) -[rel?:FOLLOWS_REL]-> (other)',
        'RETURN rel'
    ].join('\n')
        .replace('FOLLOWS_REL', FOLLOWS_REL);

    var params = {
        streetId: this.id,
        otherId: other.id,
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var rel = results[0] && results[0]['rel'];
        callback(null, rel);
    });
};

// public instance methods:

Street.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

Street.prototype.del = function (callback) {
    this._node.del(function (err) {
        callback(err);
    }, true);   // true = yes, force it (delete all relationships)
};

Street.prototype.follow = function (other, latlng, callback) {
    this._node.createRelationshipTo(other._node, 'connectsto', {}, function (err, rel) {
        callback(err);
        /*rel.data["latlng"] = latlng;
        rel.save(function(err){
          if(err){
            console.log(banana);
          }
        });*/
    });
};

Street.prototype.unfollow = function (other, callback) {
    this._getFollowingRel(other, function (err, rel) {
        if (err) return callback(err);
        if (!rel) return callback(null);
        rel.del(function (err) {
            callback(err);
        });
    });
};

Street.prototype.addMarket = function () {
	this._node.setProperty("hasfoodmarket", "true", function(err, node){
		callback(err);
	});
};
Street.prototype.calcdistance = function(callback){
    var query = [
/*START d=node(1), e=node(2)
MATCH p = shortestPath( d-[*..15]->e )
RETURN p*/
        'START street=node({streetId}), other=node:INDEX_NAME(INDEX_KEY="INDEX_VAL")',
        'MATCH p = shortestPath( (street) -[*..15]-> (other) )',
        'WHERE other.hasfoodmarket! = "true"',
        'RETURN p'  // COUNT(rel) is a hack for 1 or 0
    ].join('\n')
        .replace('INDEX_NAME', INDEX_NAME)
        .replace('INDEX_KEY', INDEX_KEY)
        .replace('INDEX_VAL', INDEX_VAL)
        .replace('FOLLOWS_REL', FOLLOWS_REL);

    var params = {
        streetId: this.id,
    };

    var street = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        
        results.sort(function(a, b){
          return a.p.length - b.p.length;
        });
        
        callback({ linkcount: results[0].p.length, name: street.name });
    });
};

// calls callback w/ (err, following, others) where following is an array of
// users this user follows, and others is all other users minus him/herself.
Street.prototype.getFollowingAndOthers = function (callback) {
    // query all users and whether we follow each one or not:
    var query = [
        'START street=node({streetId}), other=node:INDEX_NAME(INDEX_KEY="INDEX_VAL")',
        'MATCH (street) -[rel?:FOLLOWS_REL]-> (other)',
        'RETURN other, COUNT(rel)'  // COUNT(rel) is a hack for 1 or 0
    ].join('\n')
        .replace('INDEX_NAME', INDEX_NAME)
        .replace('INDEX_KEY', INDEX_KEY)
        .replace('INDEX_VAL', INDEX_VAL)
        .replace('FOLLOWS_REL', FOLLOWS_REL);

    var params = {
        streetId: this.id,
    };

    var street = this;
    db.query(query, params, function (err, results) {
        if (err) return callback(err);

        var following = [];
        var others = [];

        for (var i = 0; i < results.length; i++) {
            var other = new Street(results[i]['other']);
            var follows = results[i]['COUNT(rel)'];
                // XXX neo4j bug: returned names are always lowercase!
                // TODO FIXME when updating to the next version of neo4j.

            if (street.id === other.id) {
                continue;
            } else if (follows) {
                following.push(other);
            } else {
                others.push(other);
            }
        }

        callback(null, following, others);
    });
};

// static methods:

Street.get = function (id, callback) {
    db.getNodeById(id, function (err, node) {
        if (err) return callback(err);
        callback(null, new Street(node));
    });
};

Street.getByName = function(name, callback) {
    var query = [
        'START street=node:nodes(type="street")',
        'WHERE street.name = {streetName}',
        'RETURN street'
    ].join('\n');
    var params = {
        streetName: name,
    };
    db.query(query, params, function(err, streets) {
        if (err) return callback(err);
        if(streets.length == 0){
          callback(null, { id: "-1" });
        }
        else{
          callback(null, { id: streets[0].street._data.self.substring( streets[0].street._data.self.lastIndexOf("/") + 1 ) });
        }
    });
};

Street.getAll = function (callback) {
    db.getIndexedNodes(INDEX_NAME, INDEX_KEY, INDEX_VAL, function (err, nodes) {
        // if (err) return callback(err);
        // XXX FIXME the index might not exist in the beginning, so special-case
        // this error detection. warning: this is super brittle!!
        if (err) return callback(null, []);
        // maximum of 50 nodes returned
        nodes = nodes.slice(0, 50);
        var streets = nodes.map(function (node) {
            return new Street(node);
        });
        callback(null, streets);
    });
};

// creates the user and persists (saves) it to the db, incl. indexing it:
Street.create = function (data, callback) {
    var node = db.createNode(data);
    var street = new Street(node);
    node.save(function (err) {
        if (err) return callback(err);
        node.index(INDEX_NAME, INDEX_KEY, INDEX_VAL, function (err) {
            if (err) return callback(err);
            callback(null, street);
        });
    });
};
