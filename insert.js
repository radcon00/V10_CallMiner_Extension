
var catNameID = {};
var catNames = [];
var catParent=[];
var categoryList={};
var caretPostion=null;

setTimeout(getCategoryNamesID, 4000);


//customer filter used to search text without case-sensitivity
$.expr[":"].containsNoCase = function(el, i, m) {
    var search = m[3];
    if (!search) return false;
    return new RegExp(search, "i").test($(el).text());
};

//function used to set the cursor position of an element to a specific character
$.fn.setCursorPosition = function(pos) {
  this.each(function(index, elem) {
    if (elem.setSelectionRange) {
      elem.setSelectionRange(pos, pos);
    } else if (elem.createTextRange) {
      var range = elem.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  });
  return this;
};

function getCategoryNamesID(){
	if ($('#SearchActionString').length<1 && $("a[id='Master_Nav_Discover']").length<1) {
		return;
	}
	//assign the getCategoryNameID function to the click event of the search tab click event 
	$('#Master_Nav_Search').click(launchOnSearch);
	//execute only if the tab selected is the search tab	
	if ($('.Master_NavOneButton_Selected').attr("id")==="Master_Nav_Search") {
		
		//this pulls all of the name and id information for the categories
	$( "span[categoryID]" ).each(function(){
			var catID = $(this).attr("categoryid");
			var catName = $(this).attr("title");			
			catName = catName.split(":")[1].split("Description")[0];
			catName = catName.trim();
			catNameID[catName] = catID;
			catNames.push(catName);
			categoryList[catName+catID]=$(this);
			catParent.push(getCatParent($(this)));
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
	//console.log("The first at name is " + catNames[0]);	
	//create the select box and populate the options val=categoryID name=category name
	//the empty options tag is used as a placeholder
	var selectBox = "<select class='category_selector'><option></option></select>";
	$('#Master_Footer_StatusBar').append(selectBox);
	var categorySelector = $('.category_selector');
	
	for (var index = 0; index < catNames.length; index++) {
		var name = catNames[index];
		var folder_Name = "Folder: " + catParent[index];
		var option = "<option value='" + catNameID[name]+"' title='"+ folder_Name + "'>"+name + "</option>";
		categorySelector.append(option);
	}
	//create div to hold the select box and the infobox div that provides options based on the selection
	var usgeContainer = "<div id='usgeContainer'></div>";
	var infoBox = "<div id='usgeInfoBox' style='background-color: white;'></div>"	
	var topprop = "-" + ($("#Master_Footer_StatusBar").height() + 6) + "px";
	var positionprop = "relative";
	var widthprop = "330px";
	var props = {		
		position: positionprop,
		width: widthprop,
		float: "right"
	}
	//get images for the buttons
	//var imagePlus = chrome.extension.getURL("images/plus.png");
	//var imageMinus = chrome.extension.getURL("images/minus.png");
	
	var divusgeCatCount = "<div id='usgeCatCount'><span class='SB_Adv_Header rowFormat'>Category Call Count</span><div class='usgeCountContainer'><span id='usge_Count'>0</span></div></div>";
	var divusgeCatView = "<div id='usgeCatView'><span class='SB_Adv_Header rowFormat'>View Category or Add to Search</span><div style='margin-top: 6px;' ><div style='float: left; width: 50%; position: relative;'><button id='usge_button' type='button' class='usgeButton' >Select Category</button></div><div style='float: right; width: 50%; position: relative;'><button id='usge_button_add' type='button' class='usgeButton2' >Use in Search</button></div></div></div>";
	var divusgeCatSelecter = "<div id='usgeCatSelector'><span class='SB_Adv_Header rowFormat'>Filter by Category</span>"
	                        +"<div><div class='usgeContainerPlusorMinus'> <button id='usge_button_plus' type='button' class='usgeButton positionInclude'>Include</button></div>" +
							"<div class='usgeContainerPlusorMinus'> <button id='usge_button_minus' type='button' class='usgeButton positionExclude' >Exclude</button></div> </div>" 
							 + "</div>";
	var divusgeFilterAttr = "<div id='divusgeFilterAttr'><span class='SB_Adv_Header rowFormat'>Filter Attribute</span><input id='usge_attrFilter' class='usge_attr' type='search' results='5' name='s'></div>";							 
	
	var divstyle = {
		height: "25%"
		
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
	
	//this if elimanates the duplicate infobox entries bug. It only alows the info box info to be loaded once.
	if($('.usgeCatCount').length===0){$(divusgeCatCount).appendTo('#usgeInfoBox');
	$(divusgeCatView).appendTo('#usgeInfoBox');
	$(divusgeCatSelecter).appendTo('#usgeInfoBox');
	$(divusgeFilterAttr).appendTo('#usgeInfoBox')
	//apply css
	$('#usgeCatCount').css(divstyle);
	$('#usgeCatView').css(divstyle);
	$('#usgeCatSelector').css(divstyle);
	$('#divusgeFilterAttr').css(divstyle);
	
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
	//event handlers for the exclude and include buttons
	$('#usge_button_plus').on("click",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		
		if (textSelected !== "") {
			var valSelected = $('.category_selector option:selected').val(); 
			//chose the include button based on the selected tab. Use search filter if on search tab and score filter if you are on score tab
			var plusElement = $('.Master_NavOneButton_Selected').attr("id")==="Master_Nav_Search" ? "#Search_CategoryFilterInclude" + valSelected : "#Score_CategoryFilterInclude" + valSelected;
			$(plusElement).click();
		}
		
	});
	
	$('#usge_button_minus').on("click",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		
		if (textSelected !== "") {
			var valSelected = $('.category_selector option:selected').val();
			//chose the exclude button based on the selected tab. Use search filter if on search tab and score filter if you are on score tab
			var minusElement = $('.Master_NavOneButton_Selected').attr("id")==="Master_Nav_Search" ? "#Search_CategoryFilterExclude" + valSelected :"#Score_CategoryFilterExclude" + valSelected ;
			$(minusElement).click();
		;		
			
		}
		
	});
	//event handler for attribute filter button
	$('#usge_attrFilter').keyup(function name() {
		
		var search = $(this).val();
		$(".A_Attribute_Test").show();
		if(search) $(".A_Attribute_Test").not(":containsNoCase("+ search +")").hide();
	});
	
	//event handler for attribute filter button that will respond to the click event that clears the data
	$('#usge_attrFilter').click(function name() {
		
		var search = $(this).val();
		$(".A_Attribute_Test").show();
		if(search) $(".A_Attribute_Test").not(":containsNoCase("+ search +")").hide();
	});
	
	//event handler for discover button to hide the category select2 box if clicked
	$('#Master_Nav_Discover').click(function () {
		toggleVisiblity();
		if($('#usgeInfoBox').css("visibility")!=="hidden") $('#usgeInfoBox').css("visibility","hidden");
	});
	
	//event handler for the reports tab to hide the category select2 box
	$('#Master_Nav_Report').click(function () {
		toggleVisiblity();
		if($('#usgeInfoBox').css("visibility")!=="hidden") $('#usgeInfoBox').css("visibility","hidden");
	});
	
	//event handler for the "use in search" button. It will be used to add category syntax to the text box
	$('#usge_button_add').on("click",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		
		if (textSelected !== "") {
			var categoryGroup = getCategoryGroup();
		//create the category search syntax then append it to the search box.
			var catSyntax = "CAT:["+ categoryGroup +"."+textSelected +"]";
			var currentVal = $('#SearchActionString').val();
				
			toggleInfoBox();
			$('#SearchActionString').focus();
			if (caretPostion) {
				var newTxt = currentVal.slice(0,caretPostion) + catSyntax + currentVal.slice(caretPostion,currentVal.length); //set the position of the catSyntax within existing text
				$('#SearchActionString').val(newTxt); 
				$('#SearchActionString').setCursorPosition(caretPostion + catSyntax.length);//adjust the curser position by adjusting by the amount of the inserted text
				return;
			}			
			$('#SearchActionString').val(currentVal.length>0 ? currentVal + " " + catSyntax : catSyntax ); //check if the text box is blank so you can position the new text correctly.
			//$('#SearchActionString').trigger('change');
		}
		
	});
	
	}
	
	
	//event handler for the search box key up event. We are going to add shortcut syntax to the text box
	$('#SearchActionString').keyup(function name() {
		
		var searchText = $(this).val();
		var operators = ["NOT BEFORE","NOT AFTER","NOT NEAR","BEFORE","AFTER","NEAR","OR"];
		var shortcuts = ["!>","!<","!=",">","<","=","^"];
		var tempPosition = $(this).prop('selectionStart');
		for (var i = 0; i < shortcuts.length; i++) {
			var shortcut = shortcuts[i];
			//var re = new RegExp(shortcut,'g');
			if (searchText.indexOf(shortcut) > -1) {
				searchText = searchText.replace(shortcut,operators[i])
				$(this).val(searchText);
				tempPosition +=  (operators[i].length - shortcut.length)
				$(this).setCursorPosition(tempPosition);
				break;
			}
			
		}
	});
	
	//event handler for the search box focus out event. It will set the caretposition variable used in the function that adds the category syntax to the search box.
	$('#SearchActionString').focusout(function name() {
		
		caretPostion = $(this).prop('selectionStart');
	});
	
	//event handler for the select2 drop down to reload the category options if we try to open select2 and there are none.
	$('.category_selector').on("select2:opening",function(e) {
		if ($('.category_selector').children('option').length<2) {
			refreshOptions();
		}
	});
  }
	
}	

//use this function to execute the addition of the categories to the select box if it was not added when the screen loaded
function refreshOptions() {
	
	//loop through the DOM and collect the category data.
	$( "span[categoryID]" ).each(function(){
			var catID = $(this).attr("categoryid");
			var catName = $(this).attr("title");			
			catName = catName.split(":")[1].split("Description")[0];
			catName = catName.trim();
			catNameID[catName] = catID;
			catNames.push(catName);
			categoryList[catName+catID]=$(this);
			catParent.push(getCatParent($(this)));
		});
	//push the data collected in the collection	
	if(catNames.length===0){
		var categories = document.getElementsByClassName("SSC_Editable");
		for (var index = 0; index < categories.length; index++) {
			var catID = categories[index].getAttribute("categoryid");
			var catName = categories[index].getAttribute("title").split(":")[1].split("Description")[0].trim();
			catNameID[catName] = catID;
			catNames.push(catName);
			
		}		
		
	};
	//append the options to the select box
	var categorySelector = $('.category_selector');
	
	for (var index = 0; index < catNames.length; index++) {
		var name = catNames[index];
		var folder_Name = "Folder:" + catParent[index];
		var option = "<option value='" + catNameID[name]+"' title='"+ folder_Name + "'>"+name + "</option>";
		categorySelector.append(option);
	};
	
}
//this is passed to the click event for search to create the options for the select2 box
function launchOnSearch(){
	if ($('.category_selector').children('option').length===0) {
		//we only initialize if it doesn't exist.
		setTimeout(getCategoryNamesID, 4000);
	}
	else{
		$('.select2').show();
	}

}

//alternate method of clicking the category. Used as a backup to the primary method in the event of an update to the category list. eg..a save.
function alternateCategorySelector(catIDnumber){
	$( "span[categoryID]" ).each(function(){
		
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

//toogle the visiblity of the select2 box
function toggleVisiblity() {
	if($('.select2').length===1 && $('.select2').css("visibility")==="visible")  $('.select2').hide();
	
}

//returns the category group that the category belongs to
function getCategoryGroup(){
	var valSelected = $('.category_selector option:selected').val();
	var plusElementToSearchWith = "#Search_CategoryFilterInclude" + valSelected ;
	var item = $(plusElementToSearchWith); 
	var txt = item.parent().parent().parent().prev().text().trim(); //this will navigate to the correct column header in the sidebar and pull its text
	var arr = txt.split(" "); //split the text into a string array
	arr.pop(); //discard the final item in the array it is normally the number of calls for that section
	var result = arr.join(" ").trim(); //this will discard the unnecessary white space and completes the process.
	
	return result;
}

function getCatParent($el) {
	var childName = $el.parent().parent().attr('class').split(" ")[0];
	var tempName = childName.split("-");
	var f_Name = tempName[2]+"-"+tempName[3];
	
	return $("#"+f_Name).find('span[title]').text();
}

	