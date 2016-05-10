# Will I Win?

You can find a working version at [my site](http://rickzhang.cool/win)

Original design was for [WotD App](http://rickzhang.cool/). Salvaged most of the design and logic to get the summonerID.

## Getting Started
* User types in summoner name and selects a region. Region defaults to na.
* Optionally, the user can hit the site with a 'u' and 'r' (username and region respectively) in the query string to start the query upon page load instead of having to press enter.
* Once it completes, the user will see a graph of all players' mastery points with the champion icon displayed at the x-axis along with their summoner name.
* They can then use this information to determine who to watch out for, who to take advantage of, and how to strategize their plays.
* The y-axis is calculated compared to the highest mastery.
* The requester's username is underlined in green.
* A bottom bar shows the total of the teams' points, whichever is higher will denote which sound gets played. Victory or defeat.
* Users can then switch the region or re-enter a summoner name to continue looking up.

## Tech talk - Summation of what the application does at a high level.
* When the DOM is ready: load the champion data, set the sound variables.
* Check if there's a valid summoner name or region in the URL query string or textbox.
* If it does, get the summoner ID of that summoner name.
* Get the current game using that summoner ID.
* Get the champion and summoner ID of all participants in that game using a loop.
* When a request comes back, check the response code, and their initial index inside the current game API response. If it's less than 5, then they are blue team, if not, then purple team.
* If we get the summoner ID that is equal to the requester, then this is the "ally" team and the other team is the "enemy" team. We do this by setting the blueSide boolean.
* Store the summoner ID, mastery points, and champion ID as a JSON blob inside the blue and purple arrays.
* Once all requests are finished, display the graph.
* Calculate the winner, display the totals with the proper styling and play the victory / defeat sound.
* Allow reset states to bring back the application to a point where the user can repeat the process all over again to scout later.

## Improvements
* ~~The code could definitely use some revamping. I'll be doing my best to make it as legible and straight forward as possible.~~
* In terms of performance, the API calls may be a little slow, but there's really no way around it. I need to post to the wrapper.php file in order to hide the production API key so that it doesn't get exposed, but this adds time to the response.
* A couple of things architecturally could be done. I really don't like using jQuery but it seemed necessary because of time and as long as something's working, I can always refactor it later.
* In the end, I want to remove all jQuery dependency because it is a lot to load up, and it's prolly more than I need.
* ~~I think it might be better to straight up make a function that does the ajax calls, that way I don't repeat myself.~~
* Convert the functions to classes. They really are classes and groups of functions, instead of a function itself.

## Add-ons - things I don't think are necessary in v1, but would be nice to have.
* ~~Summoner names appearing below the champion icon. This would give further clarity on who is playing what. This will also require more API calls, if I remember correctly, so that's something to incentivize the ajax function I spoke about above.~~
* ~~CSS / styling for denoting who YOUR champion is, that is, making sure the requester is able to differentiate between their own champion and another champion besides the ally / enemy colours on the bars.~~
* ~~A nofication / section that the requester's team will win / lose based on the summation of all mastery points on either side and then diff'd.~~
* A link to perhaps watch the stream of the game that is currently going on.
* A facebook / social media sharing device inviting friends to watch the game / share the graph.
* A way to keep the most recently searched summoner names on that host to be queried. The URL should be saved inside browsers but for those who don't know about it, being able to click a summoner that was recently searched would be cool.
* Perhaps specific information about that champions summoners / runes would also be useful, but we also want to avoid becoming like lolnexus and stuff, let's not reinvent the wheel.
* ~~Comment the code for increased readability, though if done well, it should speak for itself.~~
* ~~Some people have a LOT of mastery points, we should mark the 25k points as level 5 mastery if the highest is above that, just for a landmark to be able to deduce the relative skill levels of players. This will just be a golden yellow line across the 21.6k y-axis point, signifying level 5 mastery emote unlocked. ;3~~
* Tool tips for the champion name and the full summoner name.
* To factor in the win rates of these players on that champion would be cool. That way 500k points doesn't mean much if your win rate is 40%. You have simply just played a lot.