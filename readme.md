# About HousePlot

<a href="http://houseplot.herokuapp.com">HousePlot</a> uses a node.js server and a neo4j graph database to build a street network from OpenStreetMap data.

Visiting <a href="http://houseplot.herokuapp.com/streets/709">a street's page</a> shows you all named streets which are connected to it.

Neo4j network view:<br/>
<img src="http://i.imgur.com/DhfvS.png"/>

## Using Neo4j, a graph database

Collecting statistics on a neighborhood level for every point in a large dataset becomes much simpler using a graph database.

HousePlot stores houses as Points and links them to Streets. Then Streets are linked to any connecting Streets. This allows us to collect information on a network / neighborhood level.

<a href="http://houseplot.herokuapp.com/demolished/709">/demolished</a> searches for demolished houses on a street:

    var params = {
        streetId: req.query['id'] * 1,
        status: "Demolished & Cleared"
    };
    var query = [
        'START points=node:nodes(type="point"), street=node({streetId})',
        'MATCH (points) -[:partof]-> (street)',
        'WHERE points.action = {status}',
        'RETURN points'
    ].join('\n');

<a href="http://houseplot.herokuapp.com/network/709">/network</a> returns the demolished houses on streets <b>connected to your street</b>:

    var params = {
        streetId: req.query['id'] * 1,
        status: "Demolished & Cleared"
    };
    var query = [
        'START points=node:nodes(type="point"), street=node({streetId})',
        'MATCH (points) -[:partof]-> (neighborstreet) -[:connectsto]-> (street)',
        'WHERE points.action = {status}',
        'RETURN points'
    ].join('\n');
    
Number of demolished houses in street networks monitored by code enforcement:

<img src="http://i.imgur.com/hyivE.png"/>

Number of demolished houses in demolished houses' networks:

<img src="http://i.imgur.com/0pO60.png"/>

This shows that at-risk neighborhoods have a distinctly different distribution of demolished houses.

<a href="http://houseplot.herokuapp.com/marketdistance/100">/marketdistance/:id</a> returns the shortest path from the given street to a supermarket

    var params = {
        streetId: this.id,
    };

    var query = [
        'START street=node({streetId}), other=node:nodes(type="street")',
        'MATCH p = shortestPath( (street) -[*..15]-> (other) )',
        'WHERE other.hasfoodmarket! = "true"',	// skip roads without a hasfoodmarket property
        'RETURN p'
    ].join('\n');

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        
        results.sort(function(a, b){
          return a.p.length - b.p.length;
        });
    });

A MapBox map representing network distance from supermarkets:<br/>
<img src="http://i.imgur.com/D72vK.png"/>

## Building the street network
<ul>
<li>Download a .OSM file from <a href="http://metro.teczno.com/">metro.teczno.com</a></li>
<li>Start your neo4j database:

    neo4j-community-1.8/bin/neo4j start

</li>
<li>Start the HousePlot server:

    npm start

</li>
<li>Edit and run the storeosm.py script (included in repo) to add and connect streets from the .osm file to your database. This can take a few hours.</li>
</ul>


## Adding houses
<ul>
<li>Put your houses or other point data into a CSV file</li>
<li>Run <a href="https://gist.github.com/3454788">HouseNet.py</a> or a similar script to import each case as a Point, and link it to a Street</li>
<li>Depending on stats you would like to collect, you may need to write some code to collect network stats. <a href="https://gist.github.com/3473604">NetworkStats.py</a> is a sample script.</li>
</ul>

## Adding supermarkets
<ul>
<li>Call /addmarket/streetname using the shortened name for each street with a supermarket. For example, /addmarket/mainst</li>
<li>Call /marketdistance/id using the numeric id of a street to return carto of that road name and supermarket distance</li>
</ul>

# About Node-Neo4j Template

<a href="https://github.com/aseemk/node-neo4j-template">Node-Neo4j Template from aseemk</a> the use of [Neo4j][] from Node.js. It uses the
[node-neo4j][] library, available on npm as `neo4j`.

The app is a simple social network manager: it lets you add and remove users
and "follows" relationships between them.

## Installation

```bash
# Install the required dependencies
npm install

# Install Neo4j 1.8 locally
curl "http://dist.neo4j.org/neo4j-community-1.8-unix.tar.gz" --O "db-unix.tar.gz"
tar -zxvf db-unix.tar.gz 2> /dev/null
rm db-unix.tar.gz
```

## Usage

```bash
# Start the local Neo4j instance
neo4j-community-1.8/bin/neo4j start

# Run the app!
npm start
```

The app will now be accessible at [http://localhost:3000/](http://localhost:3000/).

# Uploading to Heroku

Both node-neo4j template and HousePlot support deploying to Heroku.

## Create the app and add a neo4j 1.8 addon

    heroku create APP_NAME
    heroku addons:add neo4j --neo4j-version 1.8
    git push heroku master

## Miscellany

- MIT license.

[Neo4j]: http://www.neo4j.org/
[node-neo4j]: https://github.com/thingdom/node-neo4j

[coffeescript]: http://www.coffeescript.org/
[streamline]: https://github.com/Sage/streamlinejs
