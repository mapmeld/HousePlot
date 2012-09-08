# About HousePlot

<a href="http://houseplot.herokuapp.com">HousePlot</a> uses a node.js server and a neo4j graph database to build a street network from OpenStreetMap data.

Visiting <a href="http://houseplot.herokuapp.com/streets/3208">a street's page</a> shows you all named streets which are connected to it. <a href="http://www.openstreetmap.org/?lat=32.75212&lon=-83.871&zoom=15&layers=M">Look at the map</a> to see the actual street network.

HousePlot stores houses as Points and links them to Streets. This allows us to search for all houses demolished on a street and all its connecting streets:

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

Collecting statistics on a neighborhood level for every point in a large dataset becomes much easier using this type of database.

## Building the street network
<ul>
<li>Download a .OSM file from <a href="http://metro.teczno.com/">metro.teczno.com</a></li>
<li>Edit and run the storeosm.py script</li>
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

# Uploading to heroku

Both the template app and HousePlot support deploying to Heroku.

# Create the app and add a neo4j 1.8 addon

    heroku create APP_NAME
    heroku addons:add neo4j --neo4j-version 1.8
    git push heroku master

## Usage

```bash
# Start the local Neo4j instance
neo4j-community-1.8/bin/neo4j start

# Run the app!
npm start
```

The app will now be accessible at [http://localhost:3000/](http://localhost:3000/).

## Miscellany

- MIT license.

[Neo4j]: http://www.neo4j.org/
[node-neo4j]: https://github.com/thingdom/node-neo4j

[coffeescript]: http://www.coffeescript.org/
[streamline]: https://github.com/Sage/streamlinejs
