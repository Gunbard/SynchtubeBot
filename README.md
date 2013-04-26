SynchtubeBot
============

Bot for (now defunct) Synchtube using PhantomJS and suitable for running on a Raspberry Pi. While other bots
required some kind of integration with Synchtube servers, this bot was fully client-side
and required no server interaction. And now it's worthless since Synchtube is dead ;_;7 
This repo was set up in the unlikely event that the site or some clone comes back.

It basically sat in a room and accepted commands such as setting up games (one game -- a turn based battle game),
translating some text, or some other useless things. It could also check the playlist for dead videos. 
Planned features included mod powers, more games, shell execution, stat tracking, and other fun stuff.

Most of the usage details are in the info block of STbot.js, but you needed to install PhantomJS or PyPhantomJS
to run the script. Also, the daemons need to be running in the background to access those features.


On a Raspberry Pi, you would install PyPhantomJS since there's an available (albeit old) package in the Raspian
package repo:
  sudo apt-get install python-pyphantomjs
  
I never figured out how to get the real PhantomJS to compile on a Raspberry Pi.

To run headless via SSH without X running, you needed to install xvfb and run with:
  sudo apt-get install xvfb
  
And to actually run the bot, you would have needed to use the command:
  xvfb-run pyphantomjs STbot.js [name of room]
  
*nix only: To use the external features like translation and dead video checking, you would have needed to 
run the daemons since PhantomJS is somewhat limited and sandboxed:
  (./daemon) &
