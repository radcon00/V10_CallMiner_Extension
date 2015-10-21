console.log("this is a test")
var catNameID = {};
var catNames = [];
var categoryList={};
setTimeout(getCategoryNamesID, 4000);

function getCategoryNamesID(){
	
	//assign the getCategoryNameID function to the click event of the search tab click event 
	$('#Master_Nav_Search').click(launchOnSearch);
	//execute only if the tab selected is the search tab	
	if ($('.Master_NavOneButton_Selected').attr("id")==="Master_Nav_Search") {
		
		//this pulls all of the name and id information for the categories
	$('span').filter(".SSC_Editable").each(function(){
			var catID = $(this).attr("categoryid");
			var catName = $(this).attr("title");			
			catName = catName.split(":")[1].split("Description")[0];
			catName = catName.trim();
			catNameID[catName] = catID;
			catNames.push(catName);
			categoryList[catName+catID]=$(this);
		})
	if(catNames.length===0){
		var categories = document.getElementsByClassName("SSC_Editable");
		for (var index = 0; index < categories.length; index++) {
			var catID = categories[index].getAttribute("categoryid");
			var catName = categories[index].getAttribute("title").split(":")[1].split("Description")[0].trim();
			catNameID[catName] = catID;
			catNames.push(catName);
			
		}		
		
	}
	console.log("The first at name is " + catNames[0]);	
	//create the select box and populate the options val=categoryID name=category name
	//the empty options tag is used as a placeholder
	var selectBox = "<select class='category_selector'><option></option></select>";
	$('#Master_Footer_StatusBar').append(selectBox);
	var categorySelector = $('.category_selector');
	
	for (var index = 0; index < catNames.length; index++) {
		var name = catNames[index];
		var option = "<option value=" + catNameID[name]+">"+name + "</option>";
		categorySelector.append(option);
	}
	//create div to hold the select box and the infobox div that provides options based on the selection
	var usgeContainer = "<div id='usgeContainer'></div>";
	var infoBox = "<div id='usgeInfoBox'></div>"
	var leftprop = (($("#Master_Footer_StatusBar").width() - 330)+2) + "px";
	var topprop = "-" + ($("#Master_Footer_StatusBar").height() + 6) + "px";
	var positionprop = "relative";
	var widthprop = "330px";
	var props = {
		left: leftprop,
		top: topprop,
		position: positionprop,
		width: widthprop
	}
	//get images for the buttons
	var imagePlus = chrome.extension.getURL("images/plus.png");
	var imageMinus = chrome.extension.getURL("images/minus.png");
	
	var divusgeCatCount = "<div id='usgeCatCount'><span class='SB_Adv_Header rowFormat'>Category Call Count</span><div class='usgeCountContainer'><span id='usge_Count'>0</span></div></div>";
	var divusgeCatView = "<div id='usgeCatView'><span class='SB_Adv_Header rowFormat'>View Category</span><div style='margin-top: 12px;' ><button id='usge_button' type='button' class='usgeButton' >Select Category</button></div></div>";
	var divusgeCatSelecter = "<div id='usgeCatSelector'><span class='SB_Adv_Header rowFormat'>Filter by Category</span>"
	                        +"<div><div class='usgeContainerPlusorMinus'> <button id='usge_button_plus' type='button' class='usgeButton positionInclude'>Include</button></div>" +
							"<div class='usgeContainerPlusorMinus'> <button id='usge_button_minus' type='button' class='usgeButton positionExclude' >Exclude</button></div> </div>" 
							 + "</div>";
	
	var divstyle = {
		height: "33.3%"
		
	};
	
	
	
	$('#Master_Footer_StatusBar').append(usgeContainer);
	$('#usgeContainer').css(props);
	//create the select2 combo box
	$('head').append("<script src='//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js'></script>");
	$('.category_selector').select2({
		placeholder: "Category Quick Select",
		allowClear:true
	});
	//format it and also build the infoBox above the select box
	//$('.select2').css("left","1303px");
	$('.select2').css("top",topprop);
	$('.select2').appendTo('#usgeContainer');
	$('.select2').css("position","absolute");
	$('.select2').css("width","330px");
	$('.select2-selection').css("border-color","#3b6e8f");	
	$(infoBox).appendTo('#usgeContainer');
	$('#usgeInfoBox').css({
		border: "1px solid #3b6e8f",
		width: "327px",
		height: "200px",
		position: "absolute",
		top: "-230px",
		"box-shadow": "-3px -3px 5px 2px #ccc",
		"border-bottom": "0px",
		visibility: "hidden"
	});
	$(divusgeCatCount).appendTo('#usgeInfoBox');
	$(divusgeCatView).appendTo('#usgeInfoBox');
	$(divusgeCatSelecter).appendTo('#usgeInfoBox');
	//apply css
	$('#usgeCatCount').css(divstyle);
	$('#usgeCatView').css(divstyle);
	$('#usgeCatSelector').css(divstyle);
	
	//add change event that will trigger the clicking of the category
	$('.category_selector').on("change",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		
		if (textSelected !== "") {
			var valSelected = $('.category_selector option:selected').val();
		//running the alternate function to avoid the error the occurs when a category is updated.	
			$('#usge_Count').text(getCallCount(valSelected));				
			toggleInfoBox();
			
		}
		
	});
	
	//add click event to usge_button to view the category
	$('#usge_button').on("click",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		
		if (textSelected !== "") {
			var valSelected = $('.category_selector option:selected').val();
		//running the alternate function to avoid the error the occurs when a category is updated.
			alternateCategorySelector(valSelected);		
			toggleInfoBox();
		}
		
	});
	//this will close the infobox if it is open when the select two drop down is opened
	$('.category_selector').on("select2:open",function (e){
		if ($('#usgeInfoBox').css("visibility")==="visible") {
			$('#usgeInfoBox').css("visibility","hidden");
		}
	});
	//event handler for the exclude and include buttons
	$('#usge_button_plus').on("click",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		
		if (textSelected !== "") {
			var valSelected = $('.category_selector option:selected').val(); 
			var plusElement = "#Search_CategoryFilterInclude" + valSelected
			$(plusElement).click();
		}
		
	});
	
	$('#usge_button_minus').on("click",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		
		if (textSelected !== "") {
			var valSelected = $('.category_selector option:selected').val();
			var minusElement = "#Search_CategoryFilterExclude" + valSelected
			$(minusElement).click();
		;		
			
		}
		
	});
	
	}
	
}	

//this is passed to the click event for search to create the options for the select2 box
function launchOnSearch(){
	if ($('.category_selector').children('option').length===0) {
		//we only initialize if it doesn't exist.
		setTimeout(getCategoryNamesID, 4000);
	}
	

}

//alternate method of clicking the category. Used as a backup to the primary method in the event of an update to the category list. eg..a save.
function alternateCategorySelector(catIDnumber){
	$('span').filter(".SSC_Editable").each(function(){
		
		if ($(this).attr("categoryid")===catIDnumber) {
			$(this).click();
			return false;
		}
	});
}

function toggleInfoBox(){
	$('#usgeInfoBox').css("visibility")==="hidden" ? $('#usgeInfoBox').css("visibility","visible") : $('#usgeInfoBox').css("visibility","hidden");
}

//get the number of calls returned from the query for the category.
function getCallCount(idnumber) {
	var searchCatID = "#Search_CategoryFilterExclude"+idnumber;
	var searchCatObject = $(searchCatID).next();
	var result = searchCatObject.text();
	return result;
}
	