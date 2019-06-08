import { parse } from "semver";

// Parse Server: Populating your parse backend with sample data
Parse.initialize("myAppId");
Parse.serverURL = 'http://localhost:1337/parse';

var TEAMS_JSON_URL = "https://gist.githubusercontent.com/jawache/0be7f073eb27762d97cac34972ea3468/raw/e8b4f92e7ca677da38700e43e506971d9d592a2a/premier_teams.json";

var PLAYERS_JSON_URL = "https://gist.githubusercontent.com/jawache/e281399ba5d63dc10bd170dd2b0f707f/raw/9821e89146b13dc42abcf8fb7e69939c55ee5886/premier_football_players.json";

var COFFEE_JSON_URL = "https://gist.githubusercontent.com/jawache/2a11d6fb31e79dcf827e2d42d1326e4b/raw/403a967604107e9b9f24df23ce6ba5cb6c7fc5d0/coffee_shops_east_london.json";

var Team = Parse.Object.extend("Team");
var Player = Parse.Object.extend("Player");
var Place = Parse.Object.extend("Place");

var TEAMS_MAP = {};

function deletePlaces() {
    var promise = new Parse.Promise();
    var q = new Parse.Query("Place");
    q.limit(1000);
    q.find().then(function (places) {
        Parse.Object.destroyAll(places).then(function () {
            console.log("Places deleted... ");
            promise.resolve();
        });
    });
    return promise;
}

function deleteTeams() {
    var promise = new Parse.Promise();
    var q = new Parse.Query("Team");
    q.limit(1000);
    q.find().then(function (teams) {
        Parse.Object.destroyAll(teams).then(function () {
            console.log("Teams deleted... ");
            promise.resolve();
        });
    });
    return promise;
}


function deletePlayers() {
    var promise = new Parse.Promise();
    var q = new Parse.Query("Player");
    q.limit(1000);
    q.find().then(function (players) {
        Parse.Object.destroyAll(players).then(function () {
            console.log("Players deleted... ");
            promise.resolve();
        });
    });
    return promise;
}

function createTeams() {
    var promise = new Parse.Promise();
    console.log("Creating teams...");
    var promises = [];
    $.getJSON(TEAMS_JSON_URL, function (data) {
        data.forEach(function (item, index) {
            console.log("Saving team " + item.name);
            if (item.squadMarketValue) {
                item.squadMarketValue = parseFloat(item.squadMarketValue.slice(0, -1).replace(',', ''));
            }
            var team = new Team();
            promises.push(team.save(item));
            TEAMS_MAP[item.code] = team;
        });
    });

    Parse.Promise.when(promises).then(function () {
        console.log("All teams created");
        promise.resolve();
    }, function error(err) {
        console.error(err);
    });
    return promise;
}


function createPlayers() {
    var promise = new Parse.Promise();
    console.log("Creating players...");
    var promises = [];
    $.getJSON(PLAYERS_JSON_URL, function (data) {
        console.log("Got data ", data);
        //noprotect
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            console.log("Saving player " + item.name);
            if (item.marketValue) {
                item.marketValue = parseFloat(item.marketValue.slice(0, -1).replace(',', ''));
            }
            if (item.dateOfBirth) {
                item.dateOfBirth = new Date(item.dateOfBirth);
            }
            if (item.contractUntil) {
                item.contractUnitl = new Date(item.contractUntil);
            }
            if (item.teamCode) {
                item.team = TEAMS_MAP[item.teamCode];
            }
            var player = new Player();
            promises.push(player.save(item));
        }

        Parse.Promise.when(promises).then(function () {
            console.log("All players created");
            promise.resolve();
        }, function error(err) {
            console.error(err);
        });

    });
    return promise;
}


function createPlaces() {
    var promise = new Parse.Promise();
    console.log("Creating places...");
    var promises = [];
    $.getJSON(COFFEE_JSON_URL, function (data) {
        data.forEach(function (item, index) {
            console.log("Saving place " + item.name);
            delete item['id'];
            delete item['distance'];
            if (item.location) {

                var lat = item.location.coordinate.latitude;
                var lon = item.location.coordinate.longitude;
                var point = new Parse.GeoPoint({ latitude: lat, longitude: lon });
                item.geo = point;
            }
            var place = new Place();
            promises.push(place.save(item));
        });
    });

    Parse.Promise.when(promises).then(function () {
        console.log("All places created");
        promise.resolve();
    }, function error(err) {
        console.error(err);
    });
    return promise;
}


deleteTeams()
    .then(createTeams)
    .then(deletePlayers)
    .then(createPlayers)
    .then(deletePlaces)
    .then(createPlaces);
//Parse Server: How to define classes and create objects?
var Post = Parse.Object.extend("Post");
var post = new Post();
post.set("body", "this is the body");
post.set("tag", "welcome");
post.set("numComments", 0);
post.save(null, {
    succes: function (obj) {
        console.log("succesfully saved" + obj.id);
        //Parse Server: How to link objects from two classes together?
        var Comment = Parse.Object.extend("Comment");
        var comment = new Comment();
        comment.set("message", "This is a comment");
        comment.set("parent", post);
        comment.save(null, {
            succes: function (obj) {
                console.log("Created comment" + obj.id);
                var comments = post.relation(comments);
                comments.add(comment);
                post.save();
            },
            error: function (err) {
                console.log(err);
            }
        })
        //Updating object post
        var q = Parse.Query("Post");
        q.get(post.id, {
            success: function (obj) {
                console.log("succesfully got" + obj.id);
                obj.set("body", "body updated");
                obj.set("tag", "tag updated");
                obj.increment("numComments");
                obj.save(null, {
                    succes: function (obj) {
                        console.log("succesfully updated" + obj.id);
                        //Deleting object post
                        obj.destroy(null, {
                            succes: function (obj) {
                                console.log("succesfully deleted" + obj.id);
                            },
                            error: function (err) {
                                console.log(err);
                            }
                        })
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            },
            error: function (err) {
                console.log(err);
            }
        })
    },
    error: function (err) {
        console.log(err);
    }
});
//Parse Server: Promises in Practice

var Post = Parse.Object.extend("Post");
var post = new Post();
post.set("body", "this is the body");
post.set("tag", "welcome");
post.set("numComments", 0);
post.save().then(function success(obj) {
    console.log("succesfully saved" + post.id);
    var q = new Parse.Query("Post");
    return q.get(post.id);
},
    function error(obj, err) {
        console.log(err);
    }).then(function success(obj) {
        console.log("succesfully got" + post.id);
        post.set("body", "this is an update of body");
        post.set("tag", "uodated tag");
        post.increment("numComments");
        return post.save();

    }, function error(err) {
        console.log(err);
    }).then(function success(obj) {
        console.log("succesfully edited" + post.id);

        return post.save();

    }, function error(err) {
        console.log(err);
    });

//Parse Server: Performing a basic query
var Team = Parse.Object.extend("Team");
var Player = Parse.Object.extend("Player");
var Place = Parse.Object.extend("Place");
var q = Parse.Query("Team");
q.equalTo("code","MUFC");
q.find.then(function(result){
    console.log(result);
})

// Parse Server: Sortable data types & multiple constraints
var q = Parse.Query("Player");
q.lessThan("marketValue",150)
q.find().then(function success(Players){
    for(var i=0;i<players.length;i++)
    var player = players[i];
    console.log(player.get("name")+" has a value market of"+player.get("marketValue") );
})
//Parse Server: Paging through results with limit and skip
var q = Parse.Query("Player");
q.limit(150);
q.skip(10);
q.find().then(function success(Players){
    for(var i=0;i<players.length;i++)
    console.log(players[0].id );
})
//Parse Server: Performing counts and contained queries
var q = Parse.Query("Player");
q.notContainedIn("position",["center back","midfielder",])
q.count().then(function success(count){
    console.log(count );
})
//Parse Server: Returning a subset of fields for each object
var q = Parse.Query("Player");
q.selecg("name");
q.find().then(function success(result){
    console.log("position of the first player" );
    console.log(result[0].get("name") );
    console.log(result[0].attributes)
    results[0].fetch(function(){
        onsole.log(result[0].get("name") );
        onsole.log(result[0].attributes );
    })
})

//Parse Server: Running queries across multiple classes
var expensiveTeamQuery = new Parse.Query("Team");
expensiveTeamQuery.greaterThan("squadMarketValue",100000);
expensiveTeamQuery.find().then(function(result){
    var q = Parse.Query("Player");
    q.matchesKeyInQuery("teamCode","code",matchesKeyInQuery);
    q.count().then(function success(count){
        console.log(count );
    })
});
//Parse Server: Compound queries and queries spanning relationships
var expensiveTeamQuery = new Parse.Query("Team");
expensiveTeamQuery.greaterThan("squadMarketValue",100000);
expensiveTeamQuery.find().then(function(result){
    var q = Parse.Query("Player");
    q.matchesQuery("teamCode","code",matchesKeyInQuery);
    q.count().then(function success(count){
        console.log(count );
    })
});