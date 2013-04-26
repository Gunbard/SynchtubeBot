/**
	Author: WAHPOMF/Gunbard
	Date: Around 2/22/2013
	Contact: gunbard@gmail.com -- I'm usually in the GameCenter CX room at some point 
	(http://www.synchtube.com/r/vidyagaemz)
	Synchtube bot for pyPhantomJS. Bot will sit in room, parsing the
	chat for commands. Tested/developed on a headless Raspberry Pi via SSH only.

	Requires xvfb (to "render" pages) if not using X and pyPhantomJS
	Usage: xvfb-run pyphantomjs [name of this script] [name of room]
	Run in background with dvtm or screen or something.

	TODO: Fix unregistered bot since unnameds were returned, overload testing (e.g. spam), 
    save blacklist, save user stats

	Customization:
	Update all variables named "botName" first.
	Logging in -- Update the values where it says ENTER LOGIN INFO HERE

	Command list:
	@echo [some text] - output some text
	@commands - outputs list of commands
	@block [username] - block someone from using the bot
	@unblock [username] - unblock someone
	@games - outputs list of games
	@game [game to play] - will only be accepted if players are set
	@p1 [username] - set player 1
	@p2 [username] - set player 2
	@jptranslate [text to translate] - translate some text (no romaji), slow and requires custom daemon
	@mode - outputs current mode [global]
	@about - outputs info about bot
	@exit - return to normal mode

	Modes:
	normal - just listens to commands
	game - ignores non-game commands

	Games:
	Battle
		Each player begins with 1000 HP and 40 SP. First attacker chosen randomly.
		@attack - normal attack
		@special - more powerful attack, but has a higher chance of missing
		@defend - halves damage for next turn and restores some SP
		

	Daemons (run in background with "(./daemon) &":
		STbotTranslateDameon - Required to be running for translation to work. Uses translateJPtoEN.js.
 */
  

  
//var page = require('webpage').create(), roomname;
var page = new WebPage();
var fs = require('fs');
var wd = "/etc/pyphantomjs/";

if (phantom.args.length < 1)
{
    console.log("Usage: STbot.js [room name]");
    phantom.exit();
}

var url = "http://synchtube.com/";
var roomUrl = "http://synchtube.com/r/" + String(phantom.args[0]);
var callbackFlag = 0;
var loadInProgress = false;
var loginStep = 0;

// CUSTOMIZE
var botName = "POMFbot";
var registered = true;

page.onLoadStarted = function() {
	loadInProgress = true;
	console.log("Page started loading");
};
 
page.onLoadFinished = function() {
	loadInProgress = false;
	console.log("Page finished loading");
};

page.onConsoleMessage = function (msg) {
	console.log(msg);
};

// https://gist.github.com/dariusk/4072489
var loginProcedure = [
	// Open main page
	function () {
		console.log("Opening main page...");
		page.open(url);
	},
	// Enter login info
	function () {
		console.log("Entering info...");
		page.evaluate(function () {
			// ENTER LOGIN INFO HERE!!!!!!!!!
			// Username/email
            $('input#login-email').val('POMFbot');
			// Password
            $('input#login-password').val('deliciouscake');
		});
	},
	// Click login
	function () {
		console.log("Logging in...");
		page.evaluate(function() {
			$('input.btn').click();
		});
	},
	// Go to room
	function () {
		console.log("Attemping to enter room...");
		page.open(roomUrl);
	},
    // Switch to thumbnail mode
    /*function () {
        console.log("Switching to thumbnail mode...");
		page.evaluate(function (){
			//$('div.thumbview').click();
		});
    },*/
	// Begin main program
	function () {
		console.log("Beginning execution...");
        main();
	}
];


var nonLoginProcedure = [
	function () {
		console.log("Opening home...");
        page.open(url);
	},
    function () {
        console.log("Taking snap");
        page.render("what.png");
    },
    function () {
        console.log("Entering room");
        page.evaluate(function () {
            window.location = "http://synchtube.com/r/WAHPOMF";
        });
    },
    function () {
        console.log("Reloading");
        page.evaluate(function () {
            location.reload();
        });
    },
    function () {
        console.log("taking snap");
        page.render("what2.png");
    }
    
    /*,
	// Enter chat
	function () {
		page.render("aa.png");
		console.log("Entering chat...");
		page.evaluate(function () {
			//$('input[tabindex=14]').val('POMFbot');
			//$('button[tabindex=15]').click();
		});
	},
	// Begin main program
	function () {
		page.render("df.png");
		console.log("Beginning execution...");
		main();
	}*/
];


// Attempt login -- need to do synchronous steps since Javascript is asynchronus
if (registered == true)
{
	loginInterval = setInterval(function() {
		if (loginStep < loginProcedure.length)
		{
			if (!loadInProgress && typeof loginProcedure[loginStep] == "function") 
			{
				loginProcedure[loginStep]();
				loginStep++;
			}
		}
		else
		{
			clearInterval(loginInterval);
		}
	}, 2000);
}
else
{
	nonLoginInterval = setInterval(function() {
		if (loginStep < nonLoginProcedure.length)
		{
			if (!loadInProgress && typeof nonLoginProcedure[loginStep] == "function") 
			{
				nonLoginProcedure[loginStep]();
				loginStep++;
			}
		}
		else
		{
			clearInterval(nonLoginInterval);
		}
	}, 2000);	
}

function main() {
	var transResponse = "";
	var commandResponse = "";
    var deadVidResponse = "";
    
	// Prevent multiple callbacks
	if (callbackFlag == 0)
	{
		callbackFlag = 1;
		
		try 
		{
            var rootPath = wd + botName + "/";
            if (!fs.exists(rootPath))
            {
                fs.makeDirectory(rootPath);
            }

            var path = wd + botName + "/test.txt";
			var f = fs.open(path, "w");
			f.writeLine("Hullo");
			f.close();
		} 
		catch (e) 
		{
			console.log(e);
		}
	}
	else
	{
		return;
	}
	
	function timestamp()
	{
		var dateObj 	= new Date();
		var day 		= dateObj.getDate();
		var month 		= dateObj.getMonth() + 1;
		var year 		= dateObj.getFullYear();
		var hours		= dateObj.getHours();
		var minutes		= dateObj.getMinutes();
		var seconds		= dateObj.getSeconds();
		var suffix		= "AM";
		
		if (minutes < 10)
		{
			minutes = "0" + minutes;
		}
		
		if (seconds < 10)
		{
			seconds = "0" + seconds;
		}
		
		if (hours >= 12)
		{
			suffix = "PM";
			hours = hours - 12;
		}
		
		if (hours == 0)
		{
			hours = 12;
		}
		
		var str = "[" + month + "/" + day + "/" + year + " " + hours + ":" + minutes + ":" + seconds + " " + suffix + "] ";
		
		return str;
	}
	
	
	// http://me.dt.in.th/page/phantomjsPageEvaluate
	function setGlobal(page, name, data) 
	{
		var json = JSON.stringify(data);
		var fn = 'return window[' + JSON.stringify(name) + ']=' + json + ';';
		return page.evaluate(new Function(fn));
	}
	
	setGlobal(page, 'translationResponse', transResponse);
	setGlobal(page, 'deadVideoResponse', deadVidResponse);
    setGlobal(page, 'inputCommand', commandResponse);
	
	function checkTranslationResponse()
	{
		var translationFilePath = "/etc/pyphantomjs/translation/translation.txt";
		if (fs.exists(translationFilePath))
		{
			var f = fs.open(translationFilePath, "r");
			var t = f.readLine();
			if (t != "")
			{
				transResponse = t;
			}
			f.close();
		}
		else
		{
			transResponse = "";
		}
		setGlobal(page, 'translationResponse', transResponse);
	}
	
    function checkDeadVideoResponse()
	{
		var deadVideoFilePath = "/etc/pyphantomjs/deadVideoCheck/ded.txt";
		if (fs.exists(deadVideoFilePath))
		{
			var f = fs.open(deadVideoFilePath, "r");
			var t = f.readLine();
			if (t != "")
			{
				deadVidResponse = t;
			}
			f.close();
		}
		else
		{
			deadVidResponse = "";
		}
		setGlobal(page, 'deadVideoResponse', deadVidResponse);
	}

	page.onConsoleMessage = function (msg) {
		var time = timestamp();
		console.log(time + msg);
        
        var f = fs.open(wd + botName + "/log.txt", "a");
        f.writeLine(time + msg);
        f.close();

        // This just might be the only way to access the internal DOM of the page
        var transReq = msg.match("<req_trans>");
        if (transReq)
        {
			// Remove previous translations, if any
			if (fs.exists("/etc/pyphantomjs/translation/translation.txt"))
			{
				fs.remove("/etc/pyphantomjs/translation/translation.txt");
			}
			
            // Send out a translation request. The translation daemon should pick it up.
            var trans = msg.replace("<req_trans>", "");
            var f = fs.open("/etc/pyphantomjs/translation/translationRequest.txt", "w");
            f.writeLine(trans);
            f.close();
        }
		
		var deadVidCheckReq = msg.match("<req_deadvid_check>");
		if (deadVidCheckReq)
		{
			// Remove previous playlist file
			if (fs.exists("/etc/pyphantomjs/deadVideoCheck/playlist.txt"))
			{
				fs.remove("/etc/pyphantomjs/deadVideoCheck/playlist.txt");
			}
			
            // Output the innerHTML for the playlist with thumbnails. The video checker daemon will pick it up.
            var ded = msg.replace("<req_deadvid_check>", "");
            var f = fs.open("/etc/pyphantomjs/deadVideoCheck/playlist.txt", "w");
            f.writeLine(ded);
            f.close();
		}
		
		var transReqCheck = msg.match("<req_trans_check>");
		if (transReqCheck)
		{
			checkTranslationResponse();
		}

        var deadVidReqCheck = msg.match("<req_deadvid_check_check>");
        if (deadVidReqCheck)
        {
            checkDeadVideoResponse();
        }
	};
	

	// Note: page.evaluate is OUTSIDE of current context. Cannot pass anything into it.
	page.evaluate(function () {
		
		// Initialization
		botName                 = "POMFbot";
        userList                = [];
		userBlacklist           = [];
		chatQueue               = [];
		prevText                = "";
		newText                 = "";
		updatedText             = "";
		currentName             = "";
		currentText             = "";
		currentCommand          = "";
		updateSpeed             = 2000;
		updatedTextThreshold    = 2000;
		spamTimeout             = 10000;
		mode                    = "";
		spamDetected            = false;
		game                    = "";
		player1                 = "";
		player2                 = "";
		currentTurn             = "";
		requestingTranslation   = false;
		prevTranslationResponse = "";
		requestingDeadVidCheck  = false; 
        prevDeadVidResponse     = "";

		// Battle game -- could use class, but 2 player limit anyway
		player1HP               = 600;
		player1HPmax            = 600;
		player2HP               = 600;
		player2HPmax            = 600;
		player1SP               = 30;
		player1SPmax            = 30;
		player2SP               = 30;
		player2SPmax            = 30;
		player1Defending        = 0;
		player2Defending        = 0;
		
		$('div.thumbview').click();
		
		// This should be available, too
		function timestamp()
		{
			var dateObj 	= new Date();
			var day 		= dateObj.getDate();
			var month 		= dateObj.getMonth() + 1;
			var year 		= dateObj.getFullYear();
			var hours		= dateObj.getHours();
			var minutes		= dateObj.getMinutes();
			var seconds		= dateObj.getSeconds();
			var suffix		= "AM";
			
			if (minutes < 10)
			{
				minutes = "0" + minutes;
			}
			
			if (seconds < 10)
			{
				seconds = "0" + seconds;
			}
			
			if (hours >= 12)
			{
				suffix = "PM";
				hours = hours - 12;
			}
			
			if (hours == 0)
			{
				hours = 12;
			}
			
			var str = "[" + month + "/" + day + "/" + year + " " + hours + ":" + minutes + ":" + seconds + " " + suffix + "] ";
			
			return str;
		}
		
		function say(text)
		{
			socket.send_cmd("<", text);
			socket.send_cmd("nick", botName);
		}
	
		say("/me is now available. Use @commands for a list of commands =3");
	
        // Listen for commands by parsing the chat's div's innerHTML
		function listenForCommands()
		{
			// Prevent parsing when first entering room
			if (prevText == "")
			{
				prevText = document.getElementById("chat_list").innerHTML;
			}
			else
			{
				// Get current state of chat
                newText = document.getElementById("chat_list").innerHTML;
				
                // Get only updated text by removing previous state of chat from current
                updatedText = newText.replace(prevText, "");
				
                if (updatedText && updatedText != "")
				{					
					// Prevent spamming by ignoring the chat for a set amount of time if spam detected
                    if (updatedText.length < updatedTextThreshold)
					{
						var matches = parseNewText(updatedText);
						chatQueue = chatQueue.concat(matches);
					}
					else
					{
						console.log("Chat activity exceeding threshold. Spam mode enabled.");
						spamDetected = true;
						setTimeout("spamDetected = false; console.log(\"Spam mode OFF.\")", spamTimeout);
					}
				}
				
				prevText = newText;
			}
			
			if (spamDetected == false && chatQueue.length > 0)
			{
				parseQueue(chatQueue);
			}
		}
		
		// Get list of users from the user list div's innerHTML
		function getUsers()
		{
			var userListStr = document.getElementById("chat_users").innerHTML;
			var matches = userListStr.match(/<span>(?!unnamed)(.*?)<\/span>/g);
			return matches;
		}
	    
        // Block a user from using this bot
        function blockUser(user)
        {
            if (userBlacklist.indexOf(user) > -1)
            {
                say(user + " is already blocked.");
            }
            else
            {
                userBlacklist.push(user);
                say(user + " is now blocked");
                console.log(user + " is now blocked");
            }
        }

        // Unblock a user from using this bot
        function unblockUser(user)
        {
            var index = userBlacklist.indexOf(user);
            if (index > -1)
            {
                userBlacklist.splice(index, 1);
                say(user + " is no longer blocked");
                console.log(user + "is no longer blocked");
            }
			else
			{
				say(user + " isn't blocked");
			}
        }
		
        // Parse for new text by stripping tags and capturing with remaining SPANs
		function parseNewText(newText)
		{
			// Strip start div
			var noDiv = newText.replace(/<div .*?>/g, "");
			// Strip end div
			noDiv = noDiv.replace(/<\/div>/g, "");
			
			// All that's left are SPAN tags,
			var matches = noDiv.match(/<span class=".*?">(.*?)<\/span>/g);
			return matches;
		}


        // Pop from queue until it finds a command (only one to prevent bot from spamming)
		function parseQueue(queue)
		{
			// Reverse the array so we can just pop stuff
			queue = queue.reverse();
			
			var queueItem;
			var nameCheck;
			var matches;
			
			while (queue.length > 0)
			{
				queueItem = queue.pop();

				if (queueItem && queueItem != "")
				{
					nameCheck = queueItem.match(/<span class="(.*?)">(.*?)<\/span>/);
					if (nameCheck && nameCheck[1] == "cun c1m r" || nameCheck[1] == "cun c1m")
					{
						// Found a name
						currentName = nameCheck[2].replace(/(\s|:)/g, "");
						if (currentName == botName || userBlacklist.indexOf(currentName) > -1 ||                            currentName == "unnamed")
						{
							// Ignore mine and blacklisted user(s) text
							queue.pop();
						}
					}
					else if (nameCheck && nameCheck[1] == "cm" && currentName != "")
					{
						// Process command if found
						matches = nameCheck[2].match("@");
						if (matches && matches[1] != "")
						{
							currentText = nameCheck[2].replace(/\s{2}/g, "");
							parseCommand(currentText);
							
							// Can only process one command per update
							return true;
						}
					}
				}
			}
			
			return false;
		}

        // Parses a detected command
		function parseCommand(text)
		{
			// Will only accept one argument
			var matches = text.match(/@(\w*).?(.*)/);
			if (matches)
			{
				if (!matches[2])
				{
					matches[2] = "";
				}
				/* NORMAL COMMANDS */
				if (mode == "" || mode == "none")
				{
					switch (matches[1])
					{
						case "echo":
							say(matches[2]);
							break;
						case "commands":
							say("Command list: echo, hiacchan, pomf, commands, games, jptranslate, about");
							break;
						case "hiacchan":
							say("Acchan: \"Hi " + currentName + "!!! =3\"");
							break;
                        case "block":
                            if (matches[2] != "")
                            {
                                blockUser(matches[2]);
                            }
                            break;
                        case "unblock":
                            if (matches[2] != "")
                            {
                                unblockUser(matches[2]);
                            }
                            break;
                        case "jptranslate":
                            if (matches[2] != "")
                            {
                                if (requestingTranslation == false)
                                {
                                    console.log("<req_trans>" + matches[2]);
									say("Translation request received...");
                                    requestingTranslation = true;
                                }
                            }
                            break;
						case "dedvids":
							if (requestingDeadVidCheck == false)
							{
								say("Checking for dead videos on current playlist. Please wait...");
								
								// Get innerHTML of playlist (in thumbnail mode. Used in detecting dead vids
								var playlist = document.getElementById('playlist_items').innerHTML;
								console.log("<req_deadvid_check>" + playlist);
		
								requestingDeadVidCheck = true;
							}
							break;
                        case "games":
							say("Select game with \"@game <name of game>\" Games: battle");
							break;
						case "p1":
							if (matches[2] != "")
							{
								player1 = matches[2];
								say("Player 1 set to \"" + player1 + "\"");
								console.log("Player 1 set to \"" + player1 + "\"");
							}
							else
							{
								say("Player 1 is currently " + player1);
							}
							break;
						case "p2":
							if (matches[2] != "")
							{
								player2 = matches[2];
								say("Player 2 set to \"" + player2 + "\"");
								console.log("Player 2 set to \"" + player2 + "\"");
							}
							else
							{
								say("Player 2 is currently " + player2);
							}
							break;
						case "game":
							if (player1 == "" && player2 == "")
							{
								say("Please set both players using \"p1\" and \"p2\"");
								return false;
							}
						
							switch (matches[2])
							{
								case "battle":
									// Initialize battle game
									mode = "game";
									game = "battle";
									player1HP = player1HPmax;
									player2HP = player2HPmax;
									player1SP = player1SPmax;
									player2SP = player2SPmax;
									if (chance(0.5))
									{
										currentTurn = player1;
									}
									else
									{
										currentTurn = player2;
									}
									say("Starting battle game between " + player1 + " and " + player2 + "..." + currentTurn + " gets pre-emptive strike! Command [attack, defend, special]");
									console.log("Starting battle game between " + player1 + " and " + player2 + "...");
									console.log("Current turn is " + currentTurn);
									break;
								default:
									say("Wait, which game did you want to play?");
									break;
							}
							break;
						case "about":
							say("Written by WAHPOMF. Tested, developed, and currently running on a headless Raspberry Pi. Server time is " + timestamp() + " =3");
							break;
						case "pomf":
							say("Acchan: \"=3\"");
							break;
						default:
							return false;
							break;
					}
				}
				/* GAME COMMANDS */
				else if (mode == "game")
				{
					if (matches[1] == "exit")
					{
						if (currentName == player1 || currentName == player2)
						{
							mode = "";
							game = "";
							say("Game cancelled, returning to normal mode...");
							console.log("Game cancelled, returning to normal mode...");
						}
					}
					// Commands for battle game
					else if (game == "battle" && currentTurn == currentName)
					{
						switch (matches[1])
						{
							case "attack":
								if (chance(0.1))
								{
									if (currentTurn == player1)
									{
										currentTurn = player2;
										say(player1 + " missed! Command for " + currentTurn + " [attack, defend, special]");
									}
									else if (currentTurn == player2)
									{
										currentTurn = player1;
										say(player2 + " missed! Command for " + currentTurn + " [attack, defend, special]");	
									}
									
									return false;
								}
								
								if (currentTurn == player1)
								{
									performAttack(player1, player2);
								}
								else if (currentTurn == player2)
								{
									performAttack(player2, player1);
								}
								break;
							case "defend":
								performDefend();
								break;
							case "special":
								if (chance(0.2))
								{
									if (currentTurn == player1)
									{
										player1SP = 0;
										currentTurn = player2;
										say(player1 + " missed! Command for " + currentTurn + " [attack, defend, special]");
									}
									else if (currentTurn == player2)
									{
										player2SP = 0;
										currentTurn = player1;
										say(player2 + " missed! Command for " + currentTurn + " [attack, defend, special]");	
									}
									
									return false;
								}
								
								if (currentTurn == player1)
								{
									if (player1SP == player1SPmax)
									{
										performSpecial(player1, player2);
									}
									else
									{
										say("Not enough SP!");
									}
								}
								else if (currentTurn == player2)
								{
									if (player2SP == player2SPmax)
									{
										performSpecial(player2, player1);
									}
									else
									{
										say("Not enough SP!");
									}
								}
								break;
							default:
								say("Battle command \"" + matches[1] + "\" not recognized.");
								break;
						}
					}
					else
					{
						return false;
					}
				}
				else
				{
					return false;
				}
				
				console.log(currentName + " issued command \"" + matches[1] + "\"");
			}
			else 
			{
				return false;
			}
			
			return true;
		}
		
		/* GAME METHODS */
		// General //

        // Random chance generator
		function chance(percent)
		{
			var randomNum = Math.random();
			if (randomNum <= percent)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		
		// Battle game //

        // Generates health output
		function generateHealthBars()
		{
			var p1HPbar = "";
			var p2HPbar = "";
			
			/* Use actual bars
			var p1HPticks = Math.ceil(player1HP / 100);
			var p2HPticks = Math.ceil(player2HP / 100);
			var maxHPticks = 10;
			var p1HPremainingTicks = maxHPticks - p1HPticks;
			var p2HPremainingTicks = maxHPticks - p2HPticks;
			
			// Player 1
			p1HPbar = player1 + " HP: [ ";
			for (var i = 0; i < p1HPticks; i++)
			{
				p1HPbar += "| ";
			}
			
			for (var r = 0; r < p1HPremainingTicks; r++)
			{
				p1HPbar += "- ";
			}
			
			p1HPbar += "]  ";
			
			// Player 2
			p2HPbar = player2 + " HP: [ ";
			for (var i = 0; i < p2HPticks; i++)
			{
				p2HPbar += "| ";
			}
			
			for (var r = 0; r < p2HPremainingTicks; r++)
			{
				p2HPbar += "- ";
			}
			
			p2HPbar += "]";
			*/
			
			p1HPbar = player1 + " HP: " + player1HP + "/" + player1HPmax;
			p1SPbar = " SP: " + player1SP + "/" + player1SPmax;
			p2HPbar = player2 + " HP: " + player2HP + "/" + player2HPmax;
			p2SPbar = " SP: " + player2SP + "/" + player2SPmax;
			
			return p1HPbar + p1SPbar + ", " + p2HPbar + p2SPbar + ". ";
		}
		
		// Attack routine
		function performAttack(self, target)
		{
			var ATK = Math.floor((Math.random() * 100) + 100);

			if (player1Defending == 1 || player2Defending == 1)
			{
				ATK = Math.floor(ATK / 2);
			}
			
			var endString = "";
			var battleOver = 0;
			
			if (target == player2)
			{
				if (player2HP > 0)
				{
					player2HP -= ATK;
				}
				
				currentTurn = player2;
				console.log("Player 2 HP: " + player2HP);
				console.log("Player 2 SP: " + player2SP);
			}
			else if (target == player1)
			{
				if (player1HP > 0)
				{
					if (player1Defending == 0)
					{
						player1HP -= ATK;
					}
					else
					{
						player1HP -= Math.floor(ATK / 2);
					}
				}
				
				currentTurn = player1;
				console.log("Player 1 HP: " + player1HP);
				console.log("Player 1 SP: " + player1SP);
			}

			if (player1HP <= 0)
			{
				player1HP = 0;
				battleOver = 1;
				endString = player1 + " was defeated! Battle complete.";
			}
			else if (player2HP <= 0)
			{
				player2HP = 0;
				battleOver = 1;
				endString = player2 + " was defeated! Battle complete.";
			}
			else
			{
				endString = "Command for " + currentTurn + " [attack, defend, special]";
			}
			
			player1Defending = 0;
			player2Defending = 0;
			
			var healthBars = generateHealthBars();
			say(self + " attacked " + target + " for " + ATK + " damage! " + healthBars + " " + endString);
			console.log(self + " attacked " + target + " for " + ATK + " damage!");
			console.log("Current turn: " + currentTurn);
			
			if (battleOver == 1)
			{
				mode = "";
				game = "";
				console.log("Battle completed.");	
			}
		}
		
		
		// Routine for special attack
		function performSpecial(self, target)
		{
			var SPEC = Math.floor((Math.random() * 100) + 200); 
			
			if (player1Defending == 1 || player2Defending == 1)
			{
				SPEC = Math.floor(SPEC / 2);
			}
			
			var endString = "";
			var battleOver = 0;
			
			if (target == player2)
			{
				if (player2HP > 0)
				{
					player2HP -= SPEC;
				}

				player1SP = 0;
				currentTurn = player2;
				console.log("Player 2 HP: " + player2HP);
				console.log("Player 2 SP: " + player2SP);
			}
			else if (target == player1)
			{
				if (player1HP > 0)
				{
					player1HP -= SPEC;
				}
				
				player2SP = 0;
				currentTurn = player1;
				console.log("Player 1 HP: " + player1HP);
				console.log("Player 1 SP: " + player1SP);
			}
			
			if (player1HP <= 0)
			{
				player1HP = 0;
				battleOver = 1;
				endString = player1 + " was defeated! Battle complete.";
			}
			else if (player2HP <= 0)
			{
				player2HP = 0;
				battleOve = 1;
				endString = player2 + " was defeated! Battle complete.";
			}
			else
			{
				endString = "Command for " + currentTurn + " [attack, defend, special]";
			}
					
			player1Defending = 0;
			player2Defending = 0;
					
			var healthBars = generateHealthBars();
			say(self + " performed a specal attack against " + target + "! " + SPEC + " damage! " + healthBars + " " + endString);
			console.log(self + " attacked " + target + " for " + SPEC + " damage!");
			console.log("Current turn: " + currentTurn);
			
			if (battleOver == 1)
			{
				mode = "";
				game = "";
				console.log("BATTLE FINISHED!");	
			}
		}
		
		
	    // Defend routine	
		function performDefend()
		{ 
			var endString = "";
			var defender = currentTurn;
			
			if (currentTurn == player1)
			{
				player1Defending = 1;
				currentTurn = player2;
				
				if (player1SP < player1SPmax)
				{
					player1SP += 10;
				}
			}
			else if (currentTurn == player2)
			{
				player2Defending = 1;
				currentTurn = player1;
			
				if (player2SP < player2SPmax)
				{
					player2SP += 10;
				}
			}
			
			endString = "Command for " + currentTurn + " [attack, defend, special]";
						
			var healthBars = generateHealthBars();
			say(defender + " is defending! " + healthBars + " " + endString);
			console.log(defender + " is defending!");
			console.log("Current turn: " + currentTurn);	
		}
		
		/* TRANSLATION */
        function checkForTranslation()
        {
			if (translationResponse != prevTranslationResponse)
			{
				say("Japanese translation: " + translationResponse);
				translationResponse = "";
				requestingTranslation = false;
			}
			else
			{
				console.log("<req_trans_check>Still waiting on translation...");
			}
			
			prevTranslationReponse = translationResponse;
        }

        /* DEAD VIDEO CHECK */
        function checkForDeadVideoResponse()
        {
			if (deadVideoResponse != prevDeadVidResponse)
			{
				say("Dead videos: " + deadVideoResponse);
				deadVideoResponse = "";
				requestingDeadVidCheck = false;
			}
			else
			{
				console.log("<req_deadvid_check_check>Still checking for dead videos...");
			}
			
			prevDeadVidReponse = deadVideoResponse;
        }



		// Main update looper thing
		function update()
		{		
			userList = getUsers();
			listenForCommands();
			
            if (requestingTranslation == true)
            {
                checkForTranslation();
            }
			
			if (requestingDeadVidCheck == true)
            {
                checkForDeadVideoResponse();
            }
            
            setTimeout(update, updateSpeed);
		}
		
		update();
	});
}


