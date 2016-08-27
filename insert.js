
var catNameID = {};
var catNames = [];
var catParent=[];
var categoryList={};
var caretPostion=null;
var template;
var imageLocation;
var selmanager = new sel2Manager();
var bucketAndIdentifierKeyValuePairs = {}; //use to get the folder name when the plus/minus button is pressed

var extension  = function(){
	if($("body.erk-unselectable").length>0){
			
			var VTenDom = new V10dom();
			
			//set select2 cdn dependency
			VTenDom.extCDNDependencies();

			//get and set resource data in the extension
			VTenDom.getInjectedResources();
			
			//this sets the nav bar events for the search bar syntax shortcuts.
			var uiMan = new uiManager();
			uiMan.setNavBarEvents();			

			//add extension on initiall app load
			uiMan.addExtension();	

			//track page navigation
			var VTenDom = new V10dom();
			VTenDom.setWindowEvents(uiMan);
			
		}
	

};
$(extension);

var V10dom = function(){
	this.setWindowEvents = function(UIManager){
		
		//We need to track when the url changes to manage the ajax requests effect on the dom.
			var uiMan = UIManager;
			$(window).on('hashchange', function(e){

				if(window.location.hash.split("/")[1]==="AdvancedSearch" && window.location.hash.split("/").length ===2){

					caretPostion = 0; //reset caret position everytime you navigate to a new tab since the previous tabs data is gone
					uiMan.setCatBuilderSearchBoxEvents();	
				}

				if(window.location.hash.split("/")[1]==="Search" && window.location.hash.split("/").length==3){

					caretPostion = 0; //reset caret position everytime you navigate to a new tab since the previous tabs data is gone
					uiMan.setSearchBoxEvents();
				}
				
			});					
	};

	this.getInjectedResources = function(){

		$.get(chrome.extension.getURL('Templates/ExtensionUI2.html'),function(data){
				//get the html template data for insertion
				template = data;
			});
			//get the url of the image we want to use as an icon
		imageLocation = chrome.extension.getURL('images/buildingblocks.png');
	};

	this.extCDNDependencies = function(){
			//set up select2 reference 
			$('head').append("<script src='//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js'></script>");	
	};
};

V10dom.prototype.syntaxShortCuts= function name() 
{
							
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
						
						

};


		

			
			
		

function uiManager() {
	this.setNavBarEvents = function(){
		//this function makes sure that the search box events that provide syntax shortcuts are set.
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
					
					
					self.setSearchBoxEvents();
				});

				$('span[language-text="AdvancedSearch"]').on('click',function(e){
					if(window.location.hash.split("/")[1]==="AdvancedSearch" && $('.menu-selected').filter('span[language-text="AdvancedSearch"]').length>0){return;}
					
					
					
					
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
		
		var intervalHandleCats;
		var self = this;
			intervalHandleCats = setInterval(function(){

				if($('ul.main-menu.nav').length>0){
				var $navMenu = $('ul.main-menu.nav');
				//console.log("adding the extension");
				$navMenu.append(template);
				self.addEventsforplus_minus();
				self.setCssCatBB();		
				self.setClickEventCatBB();
				self.addEventForResponsiveElement();	
				self.monitorWindowSize(); //this checks the window size and adjustes the css according to the current css properties.	

				//set up the additional select boxes for the other folder groups
				var categories = new folderGroup("Categories","extNavBox");
				categories.initOnClick("CATEGORY QUICK SELECT");

				/*var dimensions = new folderGroup("Dimensions","extNavDimensions");
				var acoustics = new folderGroup("Acoustics","extNavAcoustics");
				var attributes = new folderGroup("Attributes", "extNavAttributes");
				var measures = new folderGroup("Measures", "extNavMeasures");

				categories.initOnClick("CATEGORY QUICK SELECT");
				dimensions.initOnClick("DIMENSIONS QUICK SELECT");
				acoustics.initOnClick("ACOUSTICS QUICK SELELCT");
				attributes.initOnClick("ATTRIBUTES QUICK SELECT");
				measures.initOnClick("MEASURES QUICK SELECT");*/

				categories.cssSelect2();

				//initialize the right and left navigation icons and adds their events.
				var navsetup = new navManager();
				clearInterval(intervalHandleCats);

			}},500);
	};	

	

	this.addEventForResponsiveElement = function(){
		//this will set the click event for the more button to display the hidden extension components
		$("#ci_More").on("click",function(e){
			var $catWrapper = $("#ci_catWrapper");
			if($catWrapper.css("display")==="none")
			{
				$catWrapper.css("display","flex");
			}
			else{
				$catWrapper.css("display","none");
			}
			
			
			
		});
	};

	this.monitorWindowSize = function(){
		$(window).resize(function(){
			if ($("#ci_More").css("display")==="none")   {
				var $catWrapper = $("#ci_catWrapper");
				$catWrapper.css("display","flex");
			}
		});
	}

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
				//folder = folder.split('Nav')[1];
				folder = bucketAndIdentifierKeyValuePairs[folder]
				var $cats = folderGroup.prototype.getCurrentCategories(folder);
				$cats.filter('div[title="' + textSelected +'"]').click();
			}	
		
		
			
		}	
	};

	this.setSearchBoxEvents = function(){

		var setintHandle = setInterval(function(){

			if($('#searchBox').length===0){return;}
			
			clearInterval(setintHandle);
			//event handler for the search box key up event. We are going to add shortcut syntax to the text box
			$('#searchBox').keyup(V10dom.prototype.syntaxShortCuts);
			
			//event handler for the search box focus out event. It will set the caretposition variable used in the function that adds the category syntax to the search box.
			$('#searchBox').focusout(function name() {
				
				caretPostion = $(this).prop('selectionStart');
			});
			
		},500);
		
	};

	//the addition of this event to the search box is different on this page becuase the element is frequently built then destroyed.
	this.setCatBuilderSearchBoxEvents = function()
	{

		var setintHandle = setInterval(function()
		{
			
			if($('button[ng-click="addComponent();"]').length===0){return;}
			
			clearInterval(setintHandle);
			//monitor this element for additions to it's dom. We are looking for the addition of a textarea element.
			$('#advancedSearchContainer').arrive("textarea.search-box",function(e){
				$('.search-box').keyup(V10dom.prototype.syntaxShortCuts);});

			//event handler for the search box focus out event. It will set the caretposition variable used in the function that adds the category syntax to the search box.
			$('.searchBox').focusout(function name() {
				
				caretPostion = $(this).prop('selectionStart');
			});

		},500);
	};

	this.setCssCatBB= function(){
		$('.BBIcon').attr('src',imageLocation);
	};

	this.setClickEventCatBB = function (){
		$('.BBIcon').on('click',function(e){
			var $searchBox;
			if($('#searchBox').length>0)
			{
				$searchBox = $('#searchBox');
			}
			else
			{
				$searchBox = $('.search-box');
			}
			
			var textSelected = $('#extNavBox option:selected').text();
			var folderGroup = $('#extNavBox option:selected').val();
		
			if (textSelected !== ""){
				
				//create the category search syntax then append it to the search box.
				var catSyntax = "CAT:["+ folderGroup +"."+textSelected +"]";
				var currentVal = $searchBox.val()||""; //if the searchbox is empty use empty string.
					
			
				$searchBox.focus();
				if (caretPostion) {
					var newTxt = currentVal.slice(0,caretPostion) + catSyntax + currentVal.slice(caretPostion,currentVal.length); //set the position of the catSyntax within existing text
					$searchBox.val(newTxt); 
					$searchBox.setCursorPosition(caretPostion + catSyntax.length);//adjust the curser position by adjusting by the amount of the inserted text
					return;
				}			
				$searchBox.val(currentVal.length>0 ? currentVal + " " + catSyntax : catSyntax ); //check if the text box is blank so you can position the new text correctly.
			}

		});
	};

	
}

uiManager.prototype.getBucketNamesAndIdentifier = function(){
		var bucketNames = [];
		$("li.angular-ui-tree-node.ng-scope").find("a[ng-click] div.tree-label span.ng-binding").each(function(e){
			var bucket = $(this).attr("title");
			if(bucket!=="Categories" && bucket!=="Tags"){
				bucketNames.push(bucket);
			}
			
		});
		
		var identifiers = ["extNavDimensions","extNavAcoustics","extNavAttributes","extNavMeasures"];
		var bucketsAndIdentifiers = {
			buckets:bucketNames,
			"identifiers":identifiers
		}
		return bucketsAndIdentifiers;
	};

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
		if(self.f_group!=="Categories")
		{	//We need to have at least one select2 box visible at the start of the application.
			this.$sel2Instance.addClass('hidden');
		}
	
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
		$(elID).html(count);
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

		if(!navManager.prototype.allBucketsLoaded()){//check if the buckests are loaded if not load them
			var bucketsAndIdentifiers = uiManager.prototype.getBucketNamesAndIdentifier();
			bucketsAndIdentifiers.buckets.forEach(function(e,i,a){

				var bucket = new folderGroup(e,bucketsAndIdentifiers.identifiers[i]);
				bucket.initOnClick(e.toUpperCase()+" QUICK SELECT");
				bucket.cssSelect2();

				//set the identifier-key and bucket-value pair for use later when we need to look up what folder the ballon is in
				//split off the extension portion of the element ids so the keys will match the format of the variable in another part of the code
				var key = bucketsAndIdentifiers.identifiers[i].split("ext")[1];
				bucketAndIdentifierKeyValuePairs[key]=e;
			});

		}
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

		if(!navManager.prototype.allBucketsLoaded()){//check if the buckests are loaded if not load them
			var bucketsAndIdentifiers = uiManager.prototype.getBucketNamesAndIdentifier();
			bucketsAndIdentifiers.buckets.forEach(function(e,i,a){

				var bucket = new folderGroup(e,bucketsAndIdentifiers.identifiers[i]);
				bucket.initOnClick(e.toUpperCase()+" QUICK SELECT");
				bucket.cssSelect2();

				//set the identifier-key and bucket-value pair for use later when we need to look up what folder the ballon is in
				//split off the extension portion of the element ids so the keys will match the format of the variable in another part of the code
				var key = bucketsAndIdentifiers.identifiers[i].split("ext")[1];
				bucketAndIdentifierKeyValuePairs[key]=e;
			});

		}

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

navManager.prototype.allBucketsLoaded = function(){
	return $(".select2.select2-container").length >1;
}




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


	
/*	
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
	*/ 