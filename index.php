<!DOCTYPE html>
<!--
Name: Rick Zhang
-->
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="author" content="rick">
    <meta name="description" content="win">
    <meta name="keywords" content="lol,league of legends,win">
    <script src="js/jquery.min.js"></script>
    <script src="js/app.js"></script>
    <script src="js/jquery-ui.min.js"></script>
    <link rel="stylesheet" type="text/css" href="style.css">
    <link rel="shortcut icon" href="/img/favicon.ico" type="image/x-icon" />
    <title>Will I Win?</title>
  </head>

  <body>
    <audio id="defeat">
      <source src="assets/defeat_compressed.mp3" type="audio/mpeg">
    </audio>

    <audio id="victory">
      <source src="assets/victory_compressed.mp3" type="audio/mpeg">
      Your browser does not support the audio element.
    </audio>

    <div class="container">
      <div class="username-selection">
        <input type="text" maxlength="16" id="summonerName" name="summonerName" onkeypress="submitOnEnter(event)" onfocus="if (this.value == 'Summoner Name') this.value = ''" value="Summoner Name">
        <input type="button" id="lookup" value="Will I Win?" onClick="app.win();") />
      </div>

      <ul class="region-selection">
        <li class="selected" value="na"><a>NA</a></li>
        <li value="eune"><a>EU.NE</a></li>
        <li value="euw"><a>EU.W</a></li>
        <li value="br"><a>BR</a></li>
        <li value="lan"><a>LAN</a></li>
        <li value="las"><a>LAS</a></li>
        <li value="oce"><a>OCE</a></li>
        <li value="ru"><a>RUS</a></li>
        <li value="tr"><a>TUR</a></li>
        <li value="kr"><a>KR</a></li>
      </ul>

      <div class="usability gray">Who will need help on your team? Who should you shut down on theirs? Will you win..?</div>

      <div class="result">
        <div class="loading">
          <img src="img/loader.gif"/>
        </div>

        <div class="error">
          <img src="img/error.png"/>
          <div id="message"></div>
        </div>
      </div>

      <div id="wrapper">
        <div class="chart">
          <h3>The Mastery Points of the Players in your Game</h3>
        </div>
      </div>

      <div id="win">
        <div id="left"></div>
        <div id="right"></div>
      </div>

      <div id="footer">
        The Win Application at rickzhang.cool/win isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.
      </div>
    </div>
  </body>
</html>
