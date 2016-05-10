# Will I Win?

You can find a working version at [my site](http://rickzhang.cool/win).

Original design was for [WotD App](http://rickzhang.cool/). Salvaged most of the design and logic to get the summonerID.

## Getting Started - Usability.
* User types in summoner name and selects a region. Region defaults to na.
* Optionally, the user can hit the site with a 'u' and 'r' (username and region respectively) in the query string to start the query upon page load instead of having to press enter.
* Once it completes, the user will see a graph of all players' mastery points with the champion icon displayed at the x-axis along with their summoner name.
* They can then use this information to determine who to watch out for, who to take advantage of, and how to strategize their plays.
* The y-axis is calculated compared to the highest mastery.
* The entered summoner name is underlined in green.
* Blue is ally, red is enemy, gold line denotes the level 5 mastery line, if the highest mastery points is greater than 21.6k.
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

## Technologies
* JavaScript - Jquery. I chose jQuery because of the scope of the project. I had a late start (April 27th was the first commit in original repo) so I wanted to stick to the basics and things I already knew. I knew how to modify, animate, and make AJAX posts using jQuery and that was enough for the project itself. Unfortunately, jQuery is very heavy and I want to avoid using it in the future, so as a refactor I would write essentially what magic lies underneath jQuery to replace jQuery. Additionally, making the application responsive is really a huge step in improving the experience, perhaps even making an iPhone app, but given the amount of time, it just isn't enough. Though I will strongly consider this even after the contest. That's one nice thing about jQuery. Everything works for the latest version of browsers.
* PHP. I needed a way to hide the production API Key, and there was no way to do that client side that I could think of. So every time I make an AJAX post, it simply posts to a wrapper and attaches the API key to the end of the query string to make requests, and then dumps the result for me to work with in JavaScript again. It's not extremely secure, but I read that on the forums somewhere and found that it would suffice.
* CSS. All the styles are found in style.css, I didn't use SASS or SCSS because I felt it wasn't necessary. I wanted to keep things simple and while shiny things that look good are always refreshing, this app is meant to be productive and useful. As long as users can scout their opponents and allies, how well it presented the data doesn't matter too much to me.

## Design
* Why the black background? To be honest, if Facebook and all their sites came up with inverted colour schemes, I would instantly love them. Reason is, I am a night owl and staring at white screens even with Flux active kills my eyes. I prefer darkness. That's why I main Nocturne.
* Textbox being boxy and button being pretty big. I wanted the site to be intuitive, they're at the top because it's the first thing you do. You can also press enter to submit, and originally I didn't even have a button because I wanted it to be intuitive but then a friend of mine asked me how to submit and use it. So I added a button. I made it green on hover because this is in line with what your summoner name is highlighted by when the results come back.
* Ally / Enemy colours. Why blue and red instead of blue / purple? I liked blue and red because I felt colour blind mode was always more effective. It's gotten a lot of usage in a sense that, it helps the user find out which side they're on. Blue and red is characteristically friend and foe in most game designs. Blue and purple signify the side of the map, but this application doesn't care too much about that.
* Region Selectors. They're green and on hover, given green borders because I've pretty much designated everything green to have something to do with the user. They enter in their summoner name, they select their own region. They are highlighted in the results. It was a careful, calculated decision.
* Rank 5 Mastery. It's gold because it's prestigious. Getting to that bar is Riot's way of saying you're great with this champion at this point, and I wanted to reflect that by painting it a nice, badass colour.
* Win area. Blue / red backgrounds with black text. I was originally going to make the text a different colour, but my love for darkness decided to leave it that way.
* Sounds? Yes, I think it's never been done before but sometimes when I play I need to be in-game. I'll look myself up and generally get a glimpse of how to strategize. Occasionally, I don't have the time to glance at a graph. Knowing if I will win or lose was good enough for me, since it gave me perspective. I like audio cues, it saves the multitasking user like myself the time to look at the graph.

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
* ~~Tool tips for the champion name.~~
* ~~Tool tips for summoner name.~~
* To factor in the win rates of these players on that champion would be cool. That way 500k points doesn't mean much if your win rate is 30%. You have simply just played a lot. Or got carried.