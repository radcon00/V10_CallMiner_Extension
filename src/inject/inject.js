chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);
		var catNameID = {};
		var catNames = [];
		// ----------------------------------------------------------
		// This part of the script triggers when page is done loading
		console.log("Hello. This message was sent from scripts/inject.js");
		// ----------------------------------------------------------
		$('span').filter(".SSC_Editable").each(function(){
			var catID = $(this).attr("categoryid");
			var catName = $(this).attr("title");
			catName = catName.split(":")[1];
			catName = catName.trim();
			catNameID[catName] = catID;
			catNames.push(catName);
		})
	}
	}, 10);
});