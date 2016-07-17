
var catNameID = {};
var catNames = [];
var catParent=[];
var categoryList={};
var caretPostion=null;
var template;
var imageLocation;
var selmanager = new sel2Manager();

var checkReady = function(){
	if($("body.erk-unselectable").length>0){
			console.log("i am hooked up");
			//set up select2 reference 
			$('head').append("<script src='//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js'></script>");
			
			$.get(chrome.extension.getURL('Templates/ExtensionUI2.html'),function(data){
				//get the html template data for insertion
				template = data;
			});
			//get the url of the image we want to use as an icon
			imageLocation = chrome.extension.getURL('images/buildingblocks.png');
			
			//this will set upl the events on the navbar to keep adding back the extension when the page changes 
			var uiMan = new uiManager();
			uiMan.setNavBarEvents();			

			//add extension on initiall app load
			uiMan.addExtension();	

			//We need to track when the url changes to manage the ajax requests effect on the dom.
			$(window).on('hashchange', function(e){

				if(window.location.hash.split("/")[1]==="AdvancedSearch" && window.location.hash.split("/").length ===2){
				//	uiMan.addExtension();
					uiMan.setCatBuilderSearchBoxEvents();	
				}

				if(window.location.hash.split("/")[1]==="Search" && window.location.hash.split("/").length==3){
				//	uiMan.addExtension();
					uiMan.setSearchBoxEvents();
				}
				
			});					
			
		}
	

};
$(checkReady);

function uiManager() {
	this.setNavBarEvents = function(){
		var self = this;
		var intervalHandleNav;
			intervalHandleNav = setInterval(function(){
				if($('span[language-text="Search"]').length>0){
				//set the click events for the search tab and the Category creation tab
				$('span[language-text="Search"]').on('click',function(e){
					if(window.location.hash.split("/")[1]==="Search" && $('.menu-selected').filter('span[language-text="Search"]').length>0){
						//this makes sure that the click handler only reponds to a user navigating away from the tab.
						return;
					}
					
					//self.addExtension();
					self.setSearchBoxEvents();
				});

				$('span[language-text="AdvancedSearch"]').on('click',function(e){
					if(window.location.hash.split("/")[1]==="AdvancedSearch" && $('.menu-selected').filter('span[language-text="AdvancedSearch"]').length>0){return;}
					
					
					
					//self.addExtension();
					self.setCatBuilderSearchBoxEvents();
				});
				clearInterval(intervalHandleNav);

				//load syntax short cuts if the searchbar is present and we are on the Search page
				if($('.menu-selected').filter('span[language-text="Search"]').length>0){
					self.setSearchBoxEvents();
				}

				//load syntax short cuts if the searchbar is present and we are on the Category builder page
				if($('.menu-selected').filter('span[language-text="AdvancedSearch"]').length>0){
					self.setCatBuilderSearchBoxEvents();
				}

			}
			},500);
	};

	this.addExtension = function () {
		//only add if it is not present. if it is return.
		//if( $("span[title='Chrome Extensions']").length>0){
		//	return
		//}
		var intervalHandleCats;
		var self = this;
			intervalHandleCats = setInterval(function(){

				if($('ul.main-menu.nav').length>0){
				var $navMenu = $('ul.main-menu.nav');
				console.log("adding the extension");
				$navMenu.append(template);
				self.addEventsforplus_minus();
				self.setCssCatBB();		
				self.setClickEventCatBB();		
				self.setUpSelect2();	
				self.setExtensionUIEvents();

				//set up the additional select boxes for the other folder groups
				var dimensions = new folderGroup("Dimensions","extNavDimensions");
				var acoustics = new folderGroup("Acoustics","extNavAcoustics");
				var attributes = new folderGroup("Attributes", "extNavAttributes");
				var measures = new folderGroup("Measures", "extNavMeasures");

				dimensions.initOnClick("DIMENSIONS QUICK SELECT");
				acoustics.initOnClick("ACOUSTICS QUICK SELELCT");
				attributes.initOnClick("ATTRIBUTES QUICK SELECT");
				measures.initOnClick("MEASURES QUICK SELECT");
				measures.cssSelect2();
				var navsetup = new navManager();
				clearInterval(intervalHandleCats);

			}},500);
	};

	this.setExtensionUIEvents = function(){
		var $el = $("span[title='Chrome Extensions']").parent();
		var $elContainer = $("span[title='Chrome Extensions']").parents("a");
		var self = this;
		
		//controls if the container for the extension is visible or not
		$elContainer.on('click',function(e){
			if($el.parents('a').find('span.fa-caret-right').length>0){
				$el.parents('a').find('span.fa').removeClass("fa-caret-right").addClass("fa-caret-down");
				$el.parents(".tree-node").next().removeClass("hidden");
			}
			else{
				$el.parents('a').find('span.fa').removeClass("fa-caret-down").addClass("fa-caret-right");
				$el.parents(".tree-node").next().addClass("hidden");
			}
			
		});

		//this will load the select2 with category names when it opens first
		$('#extNavBox').on("select2:opening",function(e) {
		if ($('#extNavBox').children('option').length<2) {
			self.setCategoryinSelect2();
		}
		});

	};
	this.setUpSelect2 = function(){
		$('#extNavBox').select2({
		placeholder: "CATEGORY QUICK SELECT",
		allowClear:true
		});
	var instance = $('span:contains('+"CATEGORY QUICK SELECT"+')').first();
	selmanager.add(instance);	
	var self = this;	
	//set the events for the select2 box
	//add change event that will trigger the clicking of the category
	$('#extNavBox').on("change",function (e) {
		var textSelected = $('#extNavBox option:selected').text();
		
		if (textSelected !== "") {
			var $cats = self.getAllCategories();
			$cats.filter('div[title="' + textSelected +'"]').click()
			self.setCallCount(textSelected);
			$('#extNavDetails').removeClass("hidden");
			$('#ci_plusMinusContainer').removeClass('hidden');
			
		}
		
	});

	//add the unselect event to hide the call count and include and exclude section of the select2 box is cleared
	$('#extNavBox').on("select2:unselect",function (e) {
			
			$('#extNavDetails').addClass('hidden');
			$('#ci_plusMinusContainer').addClass('hidden');
			
		
	});

	//format select2 a bit it needs to be longer;
	$('.select2').css("width","100%");
	$('.select2-selection').css("background","rgba(0, 0, 0,0.1)");	
	$('.select2-selection').css('border','none');
	};

	this.getAllCategories = function(){
		var cats = $('a').find("span[title='Categories']").parents("li").find("div .value-item");
		return cats;
	};

	this.setCategoryinSelect2 = function(){
		var $cats = this.getAllCategories();
		var $sel2 = $('#extNavBox');
		


		$cats.each(function(i,e){
			var catName = $(e).html();
			var folderGroup = $(e).parents('div.row:not(#sidebar)').prev().find('span[title]').html();
			var groupParent = "Categories";

			var optionGroup = "<optgroup label='"+folderGroup+"' id='"+groupParent+"-"+folderGroup+"'></optgroup>";
			var option = "<option value='" + folderGroup +"'>"+catName + "</option>"; 
			if($sel2.find('optgroup[id="'+groupParent+"-"+folderGroup+'"]').length===0){

				//if the option group already exists add the option to it.
				$sel2.append(optionGroup);
				$('optgroup[id="'+groupParent+"-"+folderGroup+'"]').append(option);
			}
			else{

				$('optgroup[id="'+groupParent+"-"+folderGroup+'"]').append(option);
			}

		});
	};

	this.addEventsforplus_minus = function(){
       //this adds or removes the category from the search filters
	   	var self = this;
		$('#ci_plusContainer').on('click',function(e){	
			self.selectedCatClick();
			var $elBubble = $('.ballon-container:not(.ng-hide)').find('.fa-plus-circle');
			if($elBubble.length===1){
				$('.ballon-container:not(.ng-hide)').find('.fa-plus-circle').click()
			}
			//chose the second item in the list it will be the plus element.
			$('ul.ballon-container[ng-show="item.showIncludeExclude"]').not('.ng-hide').find('.fa-plus-circle').eq(1).click()
		});

		$('#ci_minusContainer').on('click',function(e){
			self.selectedCatClick();
			var $elBubble = $('ul.ballon-container[ng-show="item.showIncludeExclude"]').not('.ng-hide').find('.fa-minus-circle');
			if($elBubble.length ===1){
				$('.ballon-container:not(.ng-hide)').find('.fa-minus-circle').click();
			}
			$('ul.ballon-container[ng-show="item.showIncludeExclude"]').not('.ng-hide').find('.fa-minus-circle').eq(1).click();
		});
	};

	//set the call count for the selected category
	this.setCallCount = function(catText){
		var $catEl = this.getAllCategories();

		//this find the cat the looks at its parent container then looks for the span for call count

		var count = $catEl.filter('div[title="' + catText +'"]').parent().find('span[ng-show="::item.ItemCount >= 0"]').html(); 
		$('#ci_catCount').html("Call Count: "+ count);
	};
	
	//helper function that click the selected category only if the ballon element is hidden
	this.selectedCatClick = function(){

		var textSelected = $('.select2:not(.hidden)').find('.select2-selection__rendered').attr('title');	

		
		if (textSelected !== "" && $('.ballon-container:not(.ng-hide)').length===0) {

			var folder = $('.select2:not(.hidden)').find('.select2-selection__rendered').attr('id').split('ext')[1].split('-')[0];//this will spit out the folder name from the id of the element
			if(folder==="NavBox"){
				
				folder="Categories";
				var $cats = folderGroup.prototype.getCurrentCategories(folder);
				$cats.filter('div[title="' + textSelected +'"]').click();
			}
			else{
				folder = folder.split('Nav')[1];
				var $cats = folderGroup.prototype.getCurrentCategories(folder);
				$cats.filter('div[title="' + textSelected +'"]').click();
			}
			
			
		//running the alternate function to avoid the error the occurs when a category is updated.	
			//$('#usge_Count').text(getCallCount(valSelected));				
			//toggleInfoBox();
			
		}	
	};

	this.setSearchBoxEvents = function(){

		var setintHandle = setInterval(function(){

			if($('#searchBox').length===0){return;}
			
			clearInterval(setintHandle);
			//event handler for the search box key up event. We are going to add shortcut syntax to the text box
			$('#searchBox').keyup(function name() {
				
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
			$('#searchBox').focusout(function name() {
				
				caretPostion = $(this).prop('selectionStart');
			});
			
		},500);
		
	};

	//the addition of this event to the search box is different on this page becuase the element is frequently built then destroyed.
	this.setCatBuilderSearchBoxEvents = function(){

		var setintHandle = setInterval(function(){
			console.log('in cat builder')
			if($('button[ng-click="addComponent();"]').length===0){return;}
			console.log('getting ready to set up')
			clearInterval(setintHandle);
			//monitor this element for additions to it's dom. We are looking for the addition of a textarea element.
			$('#advancedSearchContainer').arrive("textarea.search-box",function(e){
				$('.search-box').keyup(function name() {
							
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
						$('.search-box').focusout(function name() {
							
							caretPostion = $(this).prop('selectionStart');
						});
			});

			
			
		},500);
	};

	this.setCssCatBB= function(){
		$('.BBIcon').attr('src',imageLocation);
	};

	this.setClickEventCatBB = function (){
		$('.BBIcon').on('click',function(e){

			var textSelected = $('#extNavBox option:selected').text();
			var folderGroup = $('#extNavBox option:selected').val();
		
			if (textSelected !== ""){
				
				//create the category search syntax then append it to the search box.
				var catSyntax = "CAT:["+ folderGroup +"."+textSelected +"]";
				var currentVal = $('#searchBox').val();
					
			
				$('#searchBox').focus();
				if (caretPostion) {
					var newTxt = currentVal.slice(0,caretPostion) + catSyntax + currentVal.slice(caretPostion,currentVal.length); //set the position of the catSyntax within existing text
					$('#searchBox').val(newTxt); 
					$('#searchBox').setCursorPosition(caretPostion + catSyntax.length);//adjust the curser position by adjusting by the amount of the inserted text
					return;
				}			
				$('#searchBox').val(currentVal.length>0 ? currentVal + " " + catSyntax : catSyntax ); //check if the text box is blank so you can position the new text correctly.
			}

		});
	};

	
}

//create a class to represent the different select2 objects we wil use to represent the folder groups
function folderGroup(group,identifier){
	this.f_group = group;
	this.selectElement = identifier;
	this.$sel2Instance;
	this.setFolderMembers = function(){

		var $members = this.getFolderGroupMembers(this.f_group);
		var $sel2 = $('#'+ this.selectElement);
		var self = this;
		$members.each(function(i,e){
			var catName = $(e).html();
			var folderGroup = $(e).parents('div.row:not(#sidebar)').prev().find('span[title]').html();
			var optionGroup = "<optgroup label='"+folderGroup+"' id='"+self.f_group+"-"+folderGroup+"'></optgroup>";
			var option = "<option value='" + folderGroup +"'>"+catName + "</option>"; 
			if($sel2.find('optgroup[id="'+self.f_group+"-"+folderGroup+'"]').length===0){

				//if the option group already exists add the option to it.
				$sel2.append(optionGroup);
				$('optgroup[id="'+self.f_group+"-"+folderGroup+'"]').append(option);
			}
			else{

				$('optgroup[id="'+self.f_group+"-"+folderGroup+'"]').append(option);
			}
			
		});
		this.setEventsSel2();
	};

	this.getFolderGroupMembers= function(folder){

		var members = $('a').find("span[title='"+ folder +"']").parents("li").find("div .value-item");
		return members;
	};

	this.cssSelect2 = function(){

		//format select2 a bit it needs to be longer;
		$('.select2').css("width","100%");
		$('.select2-selection').css("background","rgba(0, 0, 0,0.1)");	
		$('.select2-selection').css('border','none');
	};
	
	this.setEventsSel2 = function()
	{
		//set the events for the select2 box
		//add change event that will trigger the clicking of the category
		var elId = '#'+ this.selectElement;
		var self = this;
		$(elId).on("change",function (e) {
			var textSelected = $(elId +' option:selected').text();
			
			if (textSelected !== "") {
				var $cats = self.getFolderGroupMembers(self.f_group);
				$cats.filter('div[title="' + textSelected +'"]').click()
				self.setCallCount(textSelected,$cats);
				$('#extNavDetails').removeClass("hidden");
				$('#ci_plusMinusContainer').removeClass('hidden');
				
			}
			
		});
	
		//add the unselect event to hide the call count and include and exclude section of the select2 box is cleared
		$(elId).on("select2:unselect",function (e) {
				
				$('#extNavDetails').addClass('hidden');
				$('#ci_plusMinusContainer').addClass('hidden');
				
			
		});
	};

	this.initOnClick = function(placeholdertxt){
		var self = this;

		$('#'+ self.selectElement).select2({
		placeholder: placeholdertxt,
		allowClear:true
		});

		this.$sel2Instance = $('span:contains('+placeholdertxt+')').first();
		this.$sel2Instance.addClass('hidden');
		selmanager.add(this.$sel2Instance);
		//this will load the select2 with memberinfo when it opens first
		$('#'+ self.selectElement).on("select2:opening",function(e) {
		if ($('#'+ self.selectElement).children('option').length<2) {
			self.setFolderMembers();
		}
		});
	};
	
	this.setCallCount = function(catText,cats){
		var $catEl = cats;

		//this find the cat the looks at its parent container then looks for the span for call count	
		var elID = navManager.prototype.getCallCountUIElement();		
		var count = $catEl.filter('div[title="' + catText +'"]').parent().find('span[ng-show="::item.ItemCount >= 0"]').html(); 
		$(elID).html("Call Count: "+ count);
	};
	
	
}

folderGroup.prototype.getCurrentCategories = function(folder){

		var members = $('a').find("span[title='"+ folder +"']").parents("li").find("div .value-item");
		return members;
	};

//this class manages the selectboxes so we know which one is currently visible
function sel2Manager()
{
	this.sel2boxes = [];
	this.currentNumber = 0;
	this.add = function (item){
		this.sel2boxes.push(item);
	};

	this.getNext = function(){
		if(this.currentNumber+1 > this.sel2boxes.length-1){
			this.currentNumber = 0;
		}
		else{
			this.currentNumber = this.currentNumber+1 ;
		}
	};

	this.getPrev = function(){
		
		if(this.currentNumber-1 <0){
			this.currentNumber = this.sel2boxes.length-1;
		}
		else{
			this.currentNumber = this.currentNumber-1 ;
		}
	};

	this.getNextSelBox = function (){
		return this.sel2boxes[this.currentNumber];
	};
	this.getCurrentSelBox = function(){
		return this.sel2boxes[this.currentNumber];
	};
};

//sets the events for the right and left icons used to navigate the folder groups.
function navManager()
{
	this.left = $('#ci_back');
	this.rigth = $('#ci_forward');

	this.rigth.on('click',function(){
		selmanager.getCurrentSelBox().animate({width:'0%'},function(){

			var folderGroupCountElementID =  navManager.prototype.getCallCountUIElement();
			$(folderGroupCountElementID).addClass('hidden');
			selmanager.getCurrentSelBox().addClass('hidden');
			selmanager.getNext();
			selmanager.getNextSelBox().removeClass('hidden');
			selmanager.getNextSelBox().animate({width:'100%'});
			var newfolderGroupCountElementID = navManager.prototype.getCallCountUIElement();
			$(newfolderGroupCountElementID).removeClass('hidden');

			//check if the plus and minus signs should be visable
			var selBoxID = navManager.prototype.getSelectElementID();
			var textSelected = $(selBoxID +' option:selected').text();
			if(textSelected ===""){
				$('#extNavDetails').addClass('hidden');
				$('#ci_plusMinusContainer').addClass('hidden');
			}

			else{
				$('#extNavDetails').removeClass("hidden");
				$('#ci_plusMinusContainer').removeClass('hidden');
			}

			//check if the current select2 box is for categories if yes make the building block visible.
			if(navManager.prototype.isCategoryBox()){
				$('#ci_cataddIconContainer').removeClass('hidden');
			}
			else{
				$('#ci_cataddIconContainer').addClass('hidden');
			}
		});
		
	});

	this.left.on('click',function(){
		selmanager.getCurrentSelBox().animate({width:'0%'},function(){
			
			var folderGroupCountElementID =  navManager.prototype.getCallCountUIElement();
			$(folderGroupCountElementID).addClass('hidden');
			selmanager.getCurrentSelBox().addClass('hidden');
			selmanager.getPrev();
			selmanager.getNextSelBox().removeClass('hidden');
			selmanager.getNextSelBox().animate({width:'100%'});
			var newfolderGroupCountElementID = navManager.prototype.getCallCountUIElement();
			$(newfolderGroupCountElementID).removeClass('hidden');
			var selBoxID = navManager.prototype.getSelectElementID();

			//check if the plus and minus signs should be visable
			var textSelected = $(selBoxID +' option:selected').text();
			if(textSelected ===""){
				$('#extNavDetails').addClass('hidden');
				$('#ci_plusMinusContainer').addClass('hidden');
			}

			else{
				$('#extNavDetails').removeClass("hidden");
				$('#ci_plusMinusContainer').removeClass('hidden');
			}

			//check if the current select2 box is for categories if yes make the building block visible.
			if(navManager.prototype.isCategoryBox()){
				$('#ci_cataddIconContainer').removeClass('hidden');
			}
			else{
				$('#ci_cataddIconContainer').addClass('hidden');
			}
		});
		
	});
};

navManager.prototype.isCategoryBox = function()
{
	var folder = $('.select2:not(.hidden)').find('.select2-selection__rendered').attr('id').split('ext')[1].split('-')[0];
	return folder === "NavBox";
};

navManager.prototype.getCallCountUIElement = function(){

	var folder = $('.select2:not(.hidden)').find('.select2-selection__rendered').attr('id').split('ext')[1].split('-')[0];//this will spit out the folder name from the id of the element
			if(folder==="NavBox"){
				folder="#ci_catCount";
				return folder;
			}
			folder = folder.split('Nav')[1];
			var elementID = "#"+ folder + "_Count";
			//return the element id of the call count span that needs to be populated.
			return elementID;;
			
		
			
			
};

navManager.prototype.getSelectElementID = function(){
	return "#"+$('.select2:not(.hidden)').find('.select2-selection__rendered').attr('id').split('-')[1];
};


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
	
	//pretty element addition. This is the html for the elements
	
	var prettyBtn = "<div class='prettyPrint'><button id='prettyBtn' class='Master_Button_Dark' type='button'>Pretty Print</button></div>";
	var prettyTextContainer = "<div class='prettyContainer'><div class='prettyContent'></div></div>";
	
	//append the pretty elements to the DOM
	$('.SB_SearchTimeArea').append(prettyBtn);
	$('.SB_FilterListAreaWrapper').append(prettyTextContainer);
	
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
	
	
	
	//pretty printing click event
	$('#prettyBtn').on('click',function(e){
		$('.prettyContainer').toggle();
	});
	
	//pretty print text addition trigger on hover
	$('#SearchActionString').mouseenter(function(e){
		var prettyText = getPrettyText();
		$(".prettyContent").empty();
		$(".prettyContent").append(prettyText);
	});
	
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

//creates pretty text, formats the search syntax
function getPrettyText(){
	var txt = $('#SearchActionString').val();
	var matches = txt.match(/(\s[A-T]{3}\s[A-T]{4,6}:?\.?\d*\s)|([A-T]{4,6}:?\.?\d*\s)| OR /g);
	if(matches===null){
		return txt;
	}
	matches = Array.from(new Set(matches));
	matches.forEach(function(entry){
		var replace = "<br><br><span class='cuteSpan'>" +entry+ "</span><br><br>";
		txt = txt.split(entry).join(replace);		
	});
	return txt;
	//txt = txt.split(" OR ").join("<br><br><span='.cuteSpan'>OR</span><br><br>");
	//txt = txt.split(" OR ").join("<br><br><span='.cuteSpan'>OR</span><br><br>");
}
	