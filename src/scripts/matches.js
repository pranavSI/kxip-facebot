//Code for Players

//Load all required files
var defMessages = require('../../config/defaultMessages.json');
var buttons = require('../variables/buttons.js');
var templates = require('../variables/templates.js');
var sendMessage = require('./sendMessage.js');

const
    config = require('config'),
    request = require('request');

const
    BASE_DOMAIN = (process.env.BASE_DOMAIN) ?
    (process.env.BASE_DOMAIN) :
    config.get('base_domain');

const
    CRICKET_MATCHES = (process.env.CRICKET_MATCHES) ?
    (process.env.CRICKET_MATCHES) :
    config.get('cricket_matches');

var matches = function (senderID, matchType, matches_callback, locale) {
    var feedURL = BASE_DOMAIN + CRICKET_MATCHES.replace('{locale}', locale);
    request({
        uri: feedURL,
        method: 'GET',
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var arrayOfMatches = JSON.parse(body).matches;

            if (arrayOfMatches == null) {
                console.error("No information available.", response.statusCode, response.statusMessage, body.error);
                matches_callback("No information available.", null);
            }

            switch (matchType) {
                case 'LIVE_MATCH_' + locale:
                    console.log('Searching for a Live Match');
                    var allMatchesArr = [];
                    var typeOfMatch = 'L';

                    //Filter for Live Matches
                    for (i = 0; i < arrayOfMatches.length; i++) {
                        if (arrayOfMatches[i].event_state == "L")
                            allMatches(arrayOfMatches[i]);
                    }
                    matches_callback(error, allMatchesArr, typeOfMatch);
                    break;

                case 'RECENT_MATCH_' + locale:
                    console.log('Searching for a Recent Match');
                    var allMatchesArr = [];
                    var typeOfMatch = 'R';

                    //Filter for Live Matches
                    for (i = 0; i < arrayOfMatches.length; i++) {
                        if (arrayOfMatches[i].event_state == "R")
                            allMatches(arrayOfMatches[i]);
                    }
                    matches_callback(error, allMatchesArr, typeOfMatch);
                    break;

                case 'UPCOMING_MATCH_' + locale:
                    console.log('Searching for a Upcoming Match');
                    var allMatchesArr = [];
                    var typeOfMatch = 'U';

                    //Filter for Live Matches
                    for (i = 0; i < arrayOfMatches.length; i++) {
                        if (arrayOfMatches[i].event_state == "U")
                            allMatches(arrayOfMatches[i]);
                    }
                    matches_callback(error, allMatchesArr, typeOfMatch);
                    break;
            }

            function allMatches(arr) {
                //console.log(arr.game_id);
                var gameID = arr.game_id;
                var matchNumber = arr.event_name;
                var homeFullName = arr.participants[0].name;
                var homeShortName = arr.participants[0].short_name;
                var homeScore = arr.participants[0].value ? arr.participants[0].value : '';
                var awayFullName = arr.participants[1].name;
                var awayShortName = arr.participants[1].short_name;
                var awayScore = arr.participants[1].value ? arr.participants[1].value : '';
                var venueName = arr.venue_name;
                var subStatus = arr.event_sub_status;
                var status = arr.event_status;
                var currScore = homeScore;
                // var matchImg = BASE_DOMAIN + "/static-assets/images/matches/11/" + gameID + ".jpg";
                // if (locale != "en") {
                //     matchImg = BASE_DOMAIN + "/static-assets/images/matches/" + locale.toLowerCase() + "/11/" + gameID + ".jpg";
                // }
                if (arr.participants[1].now) {
                    currScore = awayScore;
                }
                var objTitle = matchNumber + ", " + homeFullName + " vs " + awayFullName;
                if (arr.event_state == "R") {
                    objTitle = subStatus;
                } else if (arr.event_state == "L") {
                    objTitle = matchNumber + ", " + homeShortName + " vs " + awayShortName + " - " + currScore + "\n" + status;
                }
                var objSubTitle = venueName;
                if (arr.event_state == "R" || arr.event_state == "L") {
                    objSubTitle = homeShortName + ": " + homeScore + "\n" + awayShortName + ": " + awayScore;
                }
                var objScoreLink = BASE_DOMAIN + "/scores/" + homeShortName.toLowerCase().split(' ').join('-') + "-vs-" + awayShortName.toLowerCase().split(' ').join('-') + "-" + gameID;
                if (locale.toLowerCase() != 'en') {
                    objScoreLink = BASE_DOMAIN + "/" + locale.toLowerCase() + "/scores/" + homeShortName.toLowerCase().split(' ').join('-') + "-vs-" + awayShortName.toLowerCase().split(' ').join('-') + "-" + gameID;
                }
                //console.log(objScoreLink);
                if (arr.event_state == "U") {
                    var obj = {
                        title: objTitle,
                        subtitle: objSubTitle
                    }
                    allMatchesArr.push(obj);
                } else if (arr.event_state == "L" || arr.event_state == "R") {
                    var btnTitle = defMessages.liveMatch['viewBtn_' + locale];
                    var obj = {
                        title: objTitle,
                        subtitle: objSubTitle,
                        buttons: [{
                            "type": "web_url",
                            "url": objScoreLink + "?utm_source=facebook&utm_medium=chatbot&utm_campaign=fb_messenger",
                            "title": btnTitle,
                            "webview_height_ratio": "tall",
                            "webview_share_button": "show"
                        }]
                    }
                    allMatchesArr.push(obj);
                }
            }

        } else {
            console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
        }
    });
    return ("Success");


}

module.exports = matches;