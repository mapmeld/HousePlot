# OSM Points and Streets
# Build from nodes and ways

# For each node, add it to node-ids with lat and lng
# For each way, add them to Streets
## If Street has a node with a previous street, build a connectsto relation between the two

# 0) Opening the file
import urllib, urllib2
osmfile = open('macon.osm', 'r')

nodes = { }
inway = False
wayname = ""
waynodes = []
addedways = []
wayids = {}
isHighway = False
firstToAdd = None

for line in osmfile:

  # 1) Becoming aware of nodes
  if(line.find('<node id=') > -1):
    node_id = line[ line.find('id=') + 4 : len(line) ]
    node_id = node_id[ 0 : node_id.find('"') ]
    lat = line[ line.find('lat=') + 5 : len(line) ]
    lat = lat[ 0 : lat.find('"') ]
    lng = line[ line.find('lon=') + 5 : len(line) ]
    lng = lng[ 0 : lng.find('"') ]
    nodes[ node_id ] = lat + "," + lng

  # 2) Add Streets
  if(line.find('<way') > -1):
    inway = True

  elif(inway == True):
    if(line.find('<nd ref') > -1):
      # add this node id
      id = line[ line.find('ref="') + 5 : len(line) ]
      id = id[ 0 : id.find('"') ]
      waynodes.append( id )
    
    elif(line.find('k="highway"') > -1):
      isHighway = True
      
    elif(line.find('k="name"') > -1):
      # found the road name
      wayname = line[ line.find('v="') + 3 : len(line) ]
      wayname = wayname[ 0 : wayname.find('"') ]
      # use database's preferred parsing of street names
      wayname = wayname.lower().replace(' ','')

    elif(line.find('</way>') > -1):
      # only care about roads with names
      if(wayname != "" and isHighway == True):
        # check if way needs to be added to the database
        if(not (wayname in addedways)):
          print wayname
          addedways.append( wayname )
          values = {
            "name": wayname
          }
          data = urllib.urlencode(values)
          # store final url: /streets/ID
          if((firstToAdd == None) or (firstToAdd == wayname)):
            wayids[ wayname ] = urllib2.urlopen(urllib2.Request('http://houseplot.herokuapp.com/streets', data)).geturl().split('streets/')[1]
            print wayids[ wayname ]
            firstToAdd = None
          else:
            # retrieve this way ID by name
            wayids[ wayname ] = urllib2.urlopen('http://houseplot.herokuapp.com/streetname/' + wayname).read()           

        # now add relationships to nodes in the way
        for node in waynodes:
          if(nodes.has_key(node)):
            for streetid in nodes[node]:
              # bidirectional
              if(streetid == wayids[wayname]):
                continue
            
              if(firstToAdd is None):
                values = {
                  "streetid": wayids[wayname],
                  "latlng": nodes[node]
                }
                data = urllib.urlencode(values)
                urllib2.urlopen(urllib2.Request('http://houseplot.herokuapp.com/streets/' + streetid + '/follow', data)).read()
                values = {
                  "streetid": streetid,
                  "latlng": nodes[node]
                }
                data = urllib.urlencode(values)
                urllib2.urlopen(urllib2.Request('http://houseplot.herokuapp.com/streets/' + wayids[wayname] + '/follow', data)).read()
                print "connection made"
            
            nodes[node].append( wayids[ wayname ] )
          else:
            nodes[node] = [ wayids[wayname] ]
      # reset way defaults
      wayname = ""
      waynodes = []
      isHighway = False
