var page = new WebPage();
var fs = require('fs');

if (phantom.args.length < 1)
{
    console.log("Usage: translate.js [text to translate using quotes]");
    phantom.exit();
}

var loadInProgress = false;
var translateStep = 0;
var url = "http://translate.google.com/#ja/en/" + String(phantom.args[0]);

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
	
	var matches = msg.match("Translation: ");
	if (matches)
	{
		var trans = msg.replace("Translation: ", "");
		
		// Write translation to file
		var path = "/etc/pyphantomjs/translation/translation.txt";
		var f = fs.open(path, "w");
		f.writeLine(trans);
		f.close();
	}
};


var translateProcedure = [
	// Open page
	function () {
		console.log("Opening " + url + "...");
		page.open(url);
	},
	// Get translation
	function () {
		console.log("Getting translation...");
		page.evaluate(function () {
			var result = document.getElementById("result_box").innerHTML;
			var translation = result.replace(/<span .*?>|<\/span>/g, "");
			console.log("Translation: " + translation);
		});
	}
];


translateInterval = setInterval(function() {
	if (translateStep < translateProcedure.length)
	{
		if (!loadInProgress && typeof translateProcedure[translateStep] == "function") 
		{
			translateProcedure[translateStep]();
			translateStep++;
		}
	}
	else
	{
		console.log("Done");
        clearInterval(translateInterval);
		phantom.exit();
	}
}, 2000);
