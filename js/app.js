// Instantiate a global variable application. App is defined much lower.
var app = new App();

/* Helper data structures
 *
 * This structure is a hash that is used to look up a region to its platform.
 */
var platform = {
  na: 'NA1',
  eune: 'EUN1',
  euw: 'EUW1',
  br: 'BR1',
  lan: 'LA1',
  las: 'LA2',
  oce: 'OC1',
  ru: 'RU',
  tr: 'TR1',
  kr: 'KR'
}

/********     Helper Methods     ********
 *
 * These methods are either used by the app or the graph.
 */

/* post
 *
 * Params:
 * [string]   URL: The Riot API endpoint to hit.
 * [function] successCallback: What to do when it's sucessful.
 *
 * As for the error, it would mean there's something wrong at the PHP wrapper level,
 * not necessarily Riot's API.
 */
function post(url, successCallback) {
  $.ajax({
    type: 'POST',
    url: 'wrapper.php',
    dataType: 'json',
    data: { 'url': url },
    success: successCallback,
    error: app.handlePHPError
  });
}

/* getChampionImg
 *
 * Params:
 * [int] championID: Gets the specific champion's image from the champion ID using a data object returned from Riot's Static API.
 *
 * Is dependent on the version, which is stored in the app as app.version. This is to ensure we have the latest images.
 */
function getChampionImg(championID) {
  return "<img class=\"champ\"src=http://ddragon.leagueoflegends.com/cdn/"+app.version+"/img/champion/"+app.champions[championID].image.full+" />";
}

/* getChampions
 *
 * Make a post to the champion data API and get it by ID. Set the app's version and champion variable to the result.
 */
function getChampions() {
  post(
    'https://global.api.pvp.net/api/lol/static-data/na/v1.2/champion?champData=image&dataById=true&',
    function(data) {
      if(data['response'] == 200) {
        app.version = data['version'];
        app.champions = data['data'];
      } else {
        app.handleError('champion', 'NA', data['response']);
      }
    });
}

/* submitOnEnter
 *
 * Checks the event's keyCode, if it's enter, then start the win check process.
 */
function submitOnEnter(e) {
  if(e.keyCode === 13) {
    app.win();
  }
}

// http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
/* getURLParameter
 *
 * Params:
 * [string] name: The name of the parameter you want to get from the URL.
 *
 * This is primarily used to check whether a username / region has been passed in already.
 * Starts the process if both are already present and valid.
 */
function getURLParameter(name) {
  return (decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20')) || null);
}

/* validName
 *
 * Params:
 * [string] name: The name of the summoner name to look up.
 */
function validName(name) {
  return (name.length >= 2 && name.length <= 16 && name.match(/^[A-Za-z0-9 ]+$/i) !== null);
}

/* validRegion
 *
 * Params:
 * [string] region: The name of the region to query against.
 */
function validRegion(region) {
  return (['na', 'eune', 'euw', 'br', 'lan', 'las', 'oce', 'ru', 'tr', 'kr'].indexOf(region) > -1);
}

// https://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter/6021027#6021027
/* updateQueryStringParameter
 *
 * Params:
 * [string] uri: The uri to modify or use to create a new uri.
 * [string] key: The name of the region to query against.
 * [string] value: The name of the region to query against.
 *
 * This function just takes a URI, tries to find the key and updates the value to 'value'.
 * If it doesn't exist, it just creates it.
 */
function updateQueryStringParameter(uri, key, value) {
  var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  var separator = uri.indexOf('?') !== -1 ? "&" : "?";
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');
  }
  else {
    return uri + separator + key + "=" + value;
  }
}

$( document ).ready(function() {
  // As soon as the DOM is ready.. get the champions and load the defeat / victory sounds.
  getChampions();
  app.defeat = document.getElementById("defeat");
  app.victory = document.getElementById("victory");

  // Hide everything by default, because we want everything to be NOCTURNE DARKNESSSSSS in the beginning.
  $('.loading, .error, .chart').hide();

  // If they have a region in mind
  var region = getURLParameter('r');
  if(region != null && validRegion(region)) {
    $('ul.region-selection li').removeClass('selected');
    $('li[value='+region+']').addClass('selected');
  }
  window.history.pushState('', '', updateQueryStringParameter(window.location.href, 'r', $('.selected').attr('value')));

  // If they have a summoner name in mind. Valid? Cool, kick off the win process. If no region was supplied, use NA. ;)
  var summonerName = getURLParameter('u');
  if(summonerName != null) {
    $('#summonerName').val(summonerName);
    app.win();
  }

  // Region click handler
  $('ul.region-selection li').click(function(e) {
    $('.selected').removeClass('selected');
    $(this).addClass('selected');
    window.history.pushState('', '', updateQueryStringParameter(window.location.href, 'r', $(this).attr('value')));
  });
});

/********     The Good Stuff     ********
 *
 * This is the stuff that makes up most of the app. I've separated the graph and the app because I felt
 * they are simply two different things that make up a front end / back end kind of composition.
 */

/* Graph
 *
 * The graph pretty much creates elements and populates it using the data collected by the application.
 * There are a bunch of helper functions in the class itself that will do different steps in the process of generating the graph.
 */
function Graph() {
  // https://www.smashingmagazine.com/2011/09/create-an-animated-bar-graph-with-html-css-and-jquery/
  var bars = [];
  var figureContainer = $('<div class="figure"></div>');
  var graphContainer = $('<div class="graph"></div>');
  var barContainer = $('<div class="bars"></div>');
  var container = $('.chart');
  var chartData;
  var chartYMax;
  var playerList = app.blue.concat(app.purple);

  // Timer variables
  var barTimer;
  var graphTimer;

  // The table data usually takes in the playerList data and outputs various useful things like bars, max, etc.
  var tableData = {
    // We only have Ally and Enemy, but we could support more if we need to. 3 Team game mode some day?!
    chartLegend: function() {
      return ['Ally', 'Enemy'];
    },
    // Finds the player with the maximum mastery points.
    findMax: function(list) {
      var max = 0;
      for(var i in list) {
        if (list[i].points > max) {
          max = list[i].points;
        }
      }
      return max;
    },
    // The Y max of the chart should be the ceiling of the nearest thousand of the highest mastery points
    chartYMax: function() {
      var max = this.findMax(playerList);
      var chartYMax = Math.ceil(max / 1000) * 1000;
      return chartYMax;
    },
    // The Y Axis should be labelled and divi'd up into 5 markings, which looks aesthetically pleasing.
    // Perhaps this should change depending on the max!
    yAxis: function() {
      var chartYMax = this.chartYMax();
      var yLegend = [];
      var yAxisMarkings = 5;
      for (var i = 0; i < yAxisMarkings; i++) {
        yLegend.unshift(((chartYMax * i) / (yAxisMarkings - 1)));
      }
      return yLegend;
    },
    // The X Axis are the champions.
    xAxis: function() {
      var champions = new Array();
      for (var i in playerList) {
        champions.push(playerList[i].championID);
      }
      return champions;
    },
    // The column groups are the bars representing specific players. There are 10.
    columnGroups: function() {
      var players = new Array();
      for (var i in playerList) {
        players.push(playerList[i].points);
      }
      return players;
    }
  };

  // Calculate the Ymax and get the columns.
  chartYMax = tableData.chartYMax();
  columnGroups = tableData.columnGroups();

  // For every column, create a bar object that contains the mastery points, and the height of the bar.
  var j;
  for (j = 0; j < columnGroups.length; j++) {
    var barGroup = $('<div class="bar-group"></div>');
    var barObj = {};
    barObj.label = columnGroups[j];
    barObj.height = Math.floor(barObj.label / chartYMax * 100) + '%';

    // We want to label the bar and style it depending on which side of the map the requester is on.
    // The difference is ally enemy.
    if (app.blueSide) {
      if(j < 5)
        barObj.bar = $('<div class="bar ally"><span>' + barObj.label + '</span></div>').appendTo(barGroup);
      else {
        barObj.bar = $('<div class="bar enemy"><span>' + barObj.label + '</span></div>').appendTo(barGroup);
      }
    } else {
      if(j < 5) {
        barObj.bar = $('<div class="bar enemy"><span>' + barObj.label + '</span></div>').appendTo(barGroup);
      } else {
        barObj.bar = $('<div class="bar ally"><span>' + barObj.label + '</span></div>').appendTo(barGroup);
      }
    }

    // Add it to the bars array, and the bar container.
    bars.push(barObj);
    barGroup.appendTo(barContainer);
  }

  // Add legend to graph
  var chartLegend	= tableData.chartLegend();
  var legendList	= $('<ul class="legend"></ul>');
  $.each(chartLegend, function(i) {
    var listItem = $('<li><span class="'+ this.toLowerCase() + '"></span>' + this + '</li>').appendTo(legendList);
  });

  /* If the graph is higher than the possible mastery, then we can show it.
   * Do that by setting the percentage, and displaying it from top.
   * Add it to the legend as well.
   */
  if (chartYMax > 21600) {
    var fullMasteryHeight = 21600 / chartYMax;
    var pos = (1 - fullMasteryHeight) * 252;
    var fullMastery = $('<div class="mastery"></div>');
    fullMastery.css('top', pos);
    fullMastery.appendTo(graphContainer);
    $('<li><span class="masteryLegend"></span>Level 5 Mastery (21 600)</li>').appendTo(legendList);
  }

  legendList.appendTo(figureContainer);

  /* For both x axis and y axis, create a literal that contains the label of each,
   * and append it to the axis list, then append the axis list to the graph container.
   */
  var yAxis = tableData.yAxis();
  var yAxisList = $('<ul class="y-axis"></ul>');
  $.each(yAxis, function(i) {
    var listItem = $('<li><span>' + this + '</span></li>').appendTo(yAxisList);
  });
  yAxisList.appendTo(graphContainer);

  var xAxis = tableData.xAxis();
  var xAxisList = $('<ul class="x-axis"></ul>');
  $.each(xAxis, function(i) {
    var listItem = $('<li><span>'+getChampionImg(this)+'</span><span class="playerName">'+playerList[i].summonerName+'</span></li>').appendTo(xAxisList);
    if(playerList[i].requester) {
      listItem.addClass('requester');
    }
  });
  xAxisList.appendTo(graphContainer);

  barContainer.appendTo(graphContainer);
  graphContainer.appendTo(figureContainer);
  figureContainer.appendTo(container);

  /* The series of appends creates a structure like this:
   * container
   *   figure container
   *     legend
   *     graph container
   *       bar container
   *       x axis
   *       y axis
   */

  /* displayGraph
   *
   * Params:
   * [array[bars]] bars: The bars that have been constructed using the column groups
   * [int]         i: Just an index to recursively display the bars from left to right. Creates a nice flow.
   */
  function displayGraph(bars, i) {
    if (i < bars.length) {
      $(bars[i].bar).animate({
        height: bars[i].height
      }, 800);

      barTimer = setTimeout(function() {
        i++;
        displayGraph(bars, i);
      }, 100);
    }
  }

  /* show
   *
   * Clears the timeout for the timers on the graph, and then displays the graph starting at bar 0.
   */
  function show() {
    clearTimeout(barTimer);
    clearTimeout(graphTimer);

    graphTimer = setTimeout(function() {
      displayGraph(bars, 0);
    }, 200);
  }

  // Once it's all done, actually display the graph
  show();
};

/* App
 *
 * The actual application that makes the big plays and makes all the API calls.
 */
function App() {
  this.disabled = false;
  this.running = false;
  this.blue = new Array();
  this.purple = new Array();
  this.blueSide = null;
  this.champions = null;
  this.version = null;
  this.victory = null;
  this.defeat = null;

  /* resetResults
   *
   * This gets ran every time someone enters a new summoner name to lookup.
   * Clears everything visually.
   * Resets what should be null to null.
   */
  this.resetResults = function() {
    this.blue = new Array();
    this.purple = new Array();
    this.blueSide = null;
    $('.error, .loading, #win').hide();
    $('.figure').remove();
    $('#left, #right').text('');
  };

  /* error
   *
   * Params:
   * [string] message: The message to display when an error occurs.
   *
   * If a user or developer runs into an error, this is how it works
   * Set the app's running flag to false so another query can be made
   * Show the bugsplat, shake, shake, shake, shake it off to demonstrate my love for TSwizzle,
   * And set the message to the message.
   */
  this.error = function(message) {
    this.running = false;
    $('.error').show();
    $('.error').effect('shake');
    $('#message').text(message);
  };

  /* win (AKA the process)
   *
   * If it's running already, do nothing. We don't want users to spam the enter key.
   * Reset the results to clear the way for the new results.
   * If it's disabled, urge the user to refresh. This is due to API limits, so waiting is the best way.
   *
   * Get the summoner name and region, update the query strings from what's selected and entered,
   * Check for validity and if it checks out, show the loading gif, set the app's running flag to true
   * and get the summoner ID of the name.
   */
  this.win = function() {
    if(this.running) {
      return;
    }

    this.resetResults();

    if(this.disabled) {
      this.error("Submissions are disabled because of API errors! Refresh the page after a while!");
      return;
    }

    var summonerName = $('#summonerName').val();
    var region = $('.selected').attr('value');
    window.history.pushState('', '', updateQueryStringParameter(window.location.href, 'u', summonerName));
    window.history.pushState('', '', updateQueryStringParameter(window.location.href, 'r', region));
    if (validName(summonerName)) {
      if (validRegion(region)) {
        $('.loading').show();
        this.running = true;
        this.getSummonerID(summonerName, region);
      } else {
        this.error('You need a valid region! Choose any of: ' + 'na' + ' eune' + ' euw' + ' br' + ' lan' + ' las' + ' oce' + ' ru' + ' tu' + ' kr');
      }
    } else {
      this.error('The summoner name you entered is not valid! (character length, letters, numbers, and spaces only.)');
    }
  };

  /* getSummonerID
   *
   * Params:
   * [string] summonerName: The summoner name to query against the Riot Games API to get an ID.
   * [string] region: Which region the summoner name is in.
   *
   * Make a post to the API to get the summoner name. When successful, use the ID to get the current game.
   */
  this.getSummonerID = function(summonerName, region) {
    post('https://'+region+'.api.pvp.net/api/lol/'+region+'/v1.4/summoner/by-name/'+encodeURIComponent(summonerName)+'?',
        function(data){
          if(data['response'] == 200) {
            // The data that comes back has to be accessed at the summoner name with no spaces
            var hashSummonerName = summonerName.toLowerCase().replace(/\s+/g, '');
            var id = data[hashSummonerName].id;
            app.getCurrentGame(summonerName, id, region);
          } else {
            app.handleError(summonerName, region, data['response']);
          }
        });
  };

  /* getCurrentGame
   *
   * Params:
   * [string] summonerName: The summoner name to query against the Riot Games API to get an ID.
   * [int]    summonerID: The ID of the summoner name.
   * [string] region: Which region the summoner name is in.
   *
   * Post to the API to get the current game that the summoner is in. If successful, analyze the game.
   */
  this.getCurrentGame = function(summonerName, summonerID, region) {
    post('https://'+region+'.api.pvp.net/observer-mode/rest/consumer/getSpectatorGameInfo/'+platform[region]+'/'+summonerID+'?',
        function(data) {
          if(data['response'] == 200) {
            app.analyzeGame(data, summonerID, region);
          } else {
            app.handleError(summonerName, region, data['response']);
          }
        });
  };

  /* analyzeGame
   *
   * Params:
   * [JSON]   currentGame: The JSON blob containing the current game data.
   * [int]    requester: The ID of the summoner name that was looked up earlier. We'll call them the requester.
   * [string] region: Which region the summoner name is in.
   *
   * Post to the API to get the current game that the summoner is in. If successful, analyze the game.
   */
  this.analyzeGame = function(currentGame, requester, region) {
    if(currentGame['gameType'] != 'MATCHED_GAME') {
      this.error('Right now I am only doing matched games, to shorten the scope and streamline development');
    }
    var requests = 10;

    // http://stackoverflow.com/questions/3895478/does-javascript-have-a-method-like-range-to-generate-an-array-based-on-suppl
    $([0,1,2,3,4,5,6,7,8,9]).each(function() {
      // For all 10 summoners, get their ID, name, and the champion ID.
      var index = this;
      var sumID = currentGame['participants'][index]['summonerId'];
      var sumName = currentGame['participants'][index]['summonerName'];
      var championID = currentGame['participants'][index]['championId'];

      // Make a post to the mastery API
      post('https://'+region+'.api.pvp.net/championmastery/location/'+platform[region]+'/player/'+sumID+'/champion/'+championID+'?',
          function(data) {
            if(data['response'] == 200 || data['response'] == 204) {
              // If it comes back successfully, get the points or default to 0 if 204 since that means they've never played the champ.
              var points = (data['championPoints'] || 0);
              var summonerBlob = { 'summonerID':sumID, 'summonerName':sumName, 'championID':championID, 'points':points };

              // Check if the summoner ID matches the requester.
              // This is to determine which side the requester is on so we can properly style the page based on ally / enemy
              // We do that by setting the app's blueSide boolean.
              if(sumID == requester) {
                ( currentGame['participants'][index]['teamId'] == 100 ) ? app.blueSide = true : app.blueSide = false;
                summonerBlob.requester = true;
              }

              // Assuming it always goes blue side then purple side, we push to whichever one matches the index.
              (index < 5) ? app.blue.push(summonerBlob) : app.purple.push(summonerBlob);
              requests--;

              if(requests == 0) {
                // If we got all 10 responses back, we can now construct the graph, calculate the winner, then show everything.
                var g = new Graph();
                app.calculateWinner();
                $('.loading').hide();
                $('.chart, #win').show();
                app.running = false;
              }
            } else {
              app.handleError(summonerName, region, data['response']);
            }
          });
    });
  };

  /* calculateWinner
   *
   * This adds up the total of the blue and purple players' mastery points,
   * And plays a victory or defeat sound based on the blueSide boolean and which team has more points.
   */
  this.calculateWinner = function() {
    var blueTotal = this.blue.reduce(function (sum, blob) {
      return sum + blob.points;
    }, 0);

    var purpleTotal = this.purple.reduce(function (sum, blob) {
      return sum + blob.points;
    }, 0);

    $('#left').text(blueTotal);
    $('#right').text(purpleTotal);

    if (app.blueSide) {
      $('#left').addClass('ally')
      $('#right').addClass('enemy');
    } else {
      $('#left').addClass('enemy')
      $('#right').addClass('ally');
    }

    var blueGreater = blueTotal > purpleTotal;
    if (this.blueSide === blueGreater) {
      this.victory.play();
    } else {
      this.defeat.play();
    }
  };

  /* handlePHPError
   *
   * Params:
   * [string] responseCode: The response code sent back from PHP Wrapper.
   *
   * Show an error if the PHP wrapper cannot be posted to.
   */
  this.handlePHPError = function(responseCode) {
    this.resetResults();
    this.error("Rick must've done goofed somewhere in the PHP, hold on! ;3 Response code: "+responseCode);
  };

  /* notify
   *
   * Params:
   * [string] summonerName: The summoner name that was attempted to be queried.
   * [string] region: Which region the user was trying to query against.
   * [string] statusCode: The status code returned by Riot API.
   *
   * Hooks up with Mailgun and shoots me an email when something goes wrong.
   */
  this.notify = function(summonerName, region, statusCode) {
    console.log('Admin is being notified');
    $.ajax({
      type: 'POST',
      url: 'notify.php',
      dataType: 'text',
      data:
      {
        'summoner_name' : summonerName,
        'region' : region,
        'status_code' : statusCode
      },
      success: function(data) {
        console.log('Successfully notified!');
      },
      error: function(xhr, responseText, thrownError) {
        console.log('Failed to notify admin.');
      }
    });
  };

  /* handleError
   *
   * Params:
   * [string] summonerName: The summoner name that was attempted to be queried.
   * [string] region: Which region the user was trying to query against.
   * [string] statusCode: The status code returned by Riot API.
   *
   * Resets the results, makes the app runable again, then checks the status code.
   * The message changes for most of the errors, but 429 disables the application to prevent more spam / heavy traffic.
   * Finally, regardless, notify Rick.
   */
  this.handleError = function(summonerName, region, statusCode) {
    this.resetResults();
    this.running = false;
    switch(statusCode) {
      case 400:
        this.error('Okay, so you may have found an edge case that messes up the request, or I dun goofed.');
        break;
      case 401:
        this.error('Something is messed up with the API Key, let me take a look at it soontime.');
        break;
      case 404:
        this.error('This user is currently not in a game right now or you misspelled the name.');
        return;
      case 415:
        this.error('I dunno what you did but I am curious..');
        break;
      case 429:
        // ANTI SPAM MECHANISMS and RATE LIMIT IMPLEMENTATIONS
        this.disabled = true;
        this.error('API limit reached! Disabling!');
        break;
      case 500:
        this.error('Alright, Rito did something that is messing up on their server side');
        break;
      case 503:
        this.error('Riot is unable to handle the request for some reason. Try again later, maybe.');
        break;
      default:
        this.error('I have no idea what Riot sent me. Hold up.');
    }
    this.notify(summonerName, region, statusCode);
  };
}
