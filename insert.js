
var catNameID = {};
var catNames = [];
var catParent=[];
var categoryList={};
var caretPostion=null;
var template;
var playbookTemp;
var playbookImage;
var imageLocation;
var selmanager = new sel2Manager();
var bucketAndIdentifierKeyValuePairs = {}; //use to get the folder name when the plus/minus button is pressed
//these global variables are used to create the id for the filter buttons.
var globalFolder;
var globalText;
var globalBucket;
var includeFilterText = "_includeFilterBtn";
var excludeFilterText = "_excludeFilterBtn";
var globalBucketMap ={
	"extNavBox":"Categories"
};


var extension  = function(){
	if($("#main-content").length>0){
			
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

		$.get(chrome.extension.getURL('Templates/playbook.html'),function(data){
			//get the html playbook template data for insertion
			playbookTemp = data;
		});
			//get the url of the image we want to use as an icon
		imageLocation = chrome.extension.getURL('images/buildingblocks.png');
		playbookImage = chrome.extension.getURL('images/cbp.jpg')
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

V10dom.prototype.syntaxSelectionAI = function(event){
	//This function will create a search string based on the users selection from the auto-suggestions
	var $suggestions = $("completion-item div[selected]");
	if($suggestions.length>0){
		//checking here if the data tag got placed on the dive or the span
		 if($("completion-item div span[selected]").parent().length>0){
			var $selected = $("completion-item div span[selected]").parent();
		}
		else{
			var $selected = $("completion-item div[selected]");
		}
			
		var typed = $selected.toArray().map(function(x){
			var result = $(x).find("span.typed.ng-binding").toArray().map(function(y){
				return $(y).text();
			}); 
			return result;
		})[0]; //this will return the first portion of the word that the user typed
		var completionPhrase = $selected.toArray().map(function(x){
			var result = $(x).find("span.completion-phrase").toArray().map(function(y){
				return typed+$(y).text();
			}); 
			return result;
		}); //this will return the suggested text that was selected

		//determine if this is a one word selection only exmple help|heal|hall
		var oneWordOrs = completionPhrase.filter(function(x){
			var index = x[0].indexOf(" ");
			return index ===-1;
		}).map(function(x){
			return x;
		});

		//filter the strings to only return two word phrases
		var threeWordPhrase = completionPhrase.filter(function(x){
			return x[0].split(" ").length > 2;
		});

		var twoWordPhrases = completionPhrase.filter(function(x){
			return x[0].split(" ").length > 1;
		});

		var firstWord = twoWordPhrases.map(function(x){
			return x[0].split(" ")[0];
		}).unique();

		//merge first words together to create a valid search string
		if(firstWord.length>1){
			var firstWordSyntax = firstWord.join("|");
		}
		else{
			var firstWordSyntax = firstWord[0];
		}

		var secondWord = twoWordPhrases.map(function(x){
			return x[0].split(" ")[1];
		});
		

		//merge first words together to create a valid search string
		if(secondWord.length>1){
			var secondWordSyntax = secondWord.unique().join("|");
		}
		else{
			var secondWordSyntax = secondWord[0];
		}

		//three word phase creation
		var thirdWordSyntax = "";
		if(threeWordPhrase.length> 0){
			var two_three_portion = threeWordPhrase.map(function(x){
				return x[0].split(" ").splice(1,2);
			});
			var just2 = two_three_portion.map(function(x){return x[0];});
			var just3 = two_three_portion.map(function(x){return x[1];});

			if(just2.length>1){
				var twoSyntax = just2.unique().join("|");
			}
			else{
				var twoSyntax = just2[0];
			}
			
			if(just3.length>1){
				var threeSyntax = just3.unique().join("|");
			}
			else{
				var threeSyntax = just3[0];
			}

			thirdWordSyntax = " OR " + '"'+ firstWordSyntax+ " " + twoSyntax + " "+ threeSyntax + '"';

		}

		//combine the syntax together to represent the search string
		//but first you need to identify if there is text in the search box this needs to be added to or if you need to replace it
		var typedText = $("span.typed").first().text();
		//var currentSearchText = $("#searchBox").val();
		var currentSearchText = $(event.target).val();

		if(currentSearchText.length - typedText===1){//replace logic
			$(event.target).val('"'+ firstWordSyntax + " "+ secondWordSyntax + '"' + thirdWordSyntax );
			
		}
		else{//add to existing search string logic
			var newSearchString = currentSearchText.slice(0,-typedText.length);
			if(firstWordSyntax||secondWordSyntax){//make sure that there is a value for the first or the second word-means search phrases were selected

				//add the one word ORs if the user specifies it
				if(oneWordOrs.length>0){
					var searchSuggestionSyntaxplusOnWord = "(" + oneWordOrs.join("|")+ ")";
					var searchSuggestionSyntax = newSearchString +'"'+ firstWordSyntax + " "+ secondWordSyntax + '"' + thirdWordSyntax + " OR "+ searchSuggestionSyntaxplusOnWord;
					$(event.target).val(searchSuggestionSyntax.replace('""','"'));
				}else{//no one words present
					var searchSuggestionSyntax = newSearchString +'"'+ firstWordSyntax + " "+ secondWordSyntax + '"' + thirdWordSyntax ;
					$(event.target).val(searchSuggestionSyntax.replace('""','"'));
				}
				
			}
			else{
				if (oneWordOrs.length>1){
					var searchSuggestionSyntax = "("+ newSearchString + oneWordOrs.join("|") + ")";
					$(event.target).val(searchSuggestionSyntax);
				}
			}
			
			
		}

		

		//inject the code to fire the change event on the search box
		if ($(event.target).attr("id")==="searchBox") {
			var injectCode = '$("#searchBox").trigger("change");';
		} else {
			var injectCode = '$("textarea.search-box").trigger("change");';
		}
						
		var script = document.createElement('script');
		script.textContent = injectCode;
		(document.head||document.documentElement).appendChild(script);
		script.remove();
		
	};
};

V10dom.prototype.autoCompleteManager = function(target){
	//this function handles all of the autocomplete updater logic
	$(target).click(function(event){										
		
		//elimanate adding the checkmark to the span instead of the div.
		if(event.target.nodeName==="SPAN"){
			//now test if the check mark is there if it is remove it else add it
			if($(event.target).parent().attr("selected") ==="selected"){
				$(event.target).parent().find("div.checker").remove();
				$(event.target).parent().removeAttr("selected");
			}
			else{
				$(event.target).parent().attr("selected","yes");
				$(event.target).parent().append("<div class='checker' style='float: right;'><span>✔</span></div>");
			}
			
		}
		else{
			//now test if the check mark is there if it is remove it else add it
			if($(event.target).attr("selected")==="selected"){
				$(event.target).find("div.checker").remove();
				$(event.target).removeAttr("selected");
			}
			else{
				$(event.target).attr("selected","yes");
				$(event.target).append("<div class='checker' style='float: right;'><span>✔</span></div>");
			}
			
		}
		
	});
};

//Quick array extension to return unique values
Array.prototype.unique = function() {
	return this.filter(function (value, index, self) { 
	  return self.indexOf(value) === index;
	});
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
					clearInterval(intervalHandleCats);
					var $navMenu = $('ul.main-menu.nav');
					//console.log("adding the extension");
					$navMenu.append(template);
					self.addEventsforplus_minus();
					self.setCssCatBB();		
					self.setClickEventCatBB();
					self.addEventForResponsiveElement();	
					self.monitorWindowSize(); //this checks the window size and adjustes the css according to the current css properties.
					//self.addPlaybookBtn() //adds the button to use as the chardinjs trigger.	

					


					//set up the initial select2 box based on the categories folder because we no it's name wont change. This element will trigger the creation of the others.
					var categories = new folderGroup("Categories","extNavBox");
					categories.initOnClick("CATEGORY QUICK SELECT");		
					categories.cssSelect2();

					//initialize the right and left navigation icons and adds their events.
					var navsetup = new navManager();
				

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
			var categoryFilterId = globalBucketMap[globalBucket]+"_"+globalFolder+"_"+globalText+includeFilterText;
			$("i[id='"+categoryFilterId+"']").click();
		});

		$('#ci_minusContainer').on('click',function(e){
			var categoryFilterId = globalBucketMap[globalBucket]+"_"+globalFolder+"_"+globalText+excludeFilterText;
			$("i[id='"+categoryFilterId+"']").click();
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

			//monitor the creation of auto complete elements to disable their click event
			$('auto-complete').arrive("completion-item div",function(){
				
				//remove the click event to allow multi selection using script injection
				var injectCode = '$("completion-item div").off("click");'				
				var script = document.createElement('script');
				script.textContent = injectCode;
				(document.head||document.documentElement).appendChild(script);
				script.remove();
				
				V10dom.prototype.autoCompleteManager(this);
				//add an attribute when clicked
				/*$(this).click(function(event){										
					
					//elimanate adding the checkmark to the span instead of the div.
					if(event.target.nodeName==="SPAN"){
						//now test if the check mark is there if it is remove it else add it
						if($(event.target).parent().attr("selected") ==="selected"){
							$(event.target).parent().find("div.checker").remove();
							$(event.target).parent().removeAttr("selected");
						}
						else{
							$(event.target).parent().attr("selected","yes");
							$(event.target).parent().append("<div class='checker' style='float: right;'><span>✔</span></div>");
						}
						
					}
					else{
						//now test if the check mark is there if it is remove it else add it
						if($(event.target).attr("selected")==="selected"){
							$(event.target).find("div.checker").remove();
							$(event.target).removeAttr("selected");
						}
						else{
							$(event.target).attr("selected","yes");
							$(event.target).append("<div class='checker' style='float: right;'><span>✔</span></div>");
						}
						
					}
					
				});*/
			});
			
			$("#searchBox").click(V10dom.prototype.syntaxSelectionAI);
			
		},500);
		
	};

	//the addition of this event to the search box is different on this page becuase the element is frequently built then destroyed.
	this.setCatBuilderSearchBoxEvents = function()
	{

		var setintHandle = setInterval(function()
		{
			
			if($('button[data-ng-click="addComponent()"]').length===0){return;}
			
			clearInterval(setintHandle);
			//monitor this element for additions to it's dom. We are looking for the addition of a textarea element.
			$('#advancedSearchContainer').arrive("textarea.search-box",function(e){
				$('.search-box').keyup(V10dom.prototype.syntaxShortCuts);
				$(".search-box").click(V10dom.prototype.syntaxSelectionAI);
				//event handler for the search box focus out event. It will set the caretposition variable used in the function that adds the category syntax to the search box.
				$('.search-box').focusout(function name() {
					
					caretPostion = $(this).prop('selectionStart');
				});
			
			});

			
			
			//monitor the creation of auto complete elements to disable their click event
			$('#advancedSearchContainer').arrive("completion-item div",function(){
				
				//remove the click event to allow multi selection using script injection
				var injectCode = '$("completion-item div").off("click");'				
				var script = document.createElement('script');
				script.textContent = injectCode;
				(document.head||document.documentElement).appendChild(script);
				script.remove();
				
				V10dom.prototype.autoCompleteManager(this);
				
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

uiManager.prototype.addPlaybookBtn = function()
{
	var p = $("li a[data-ng-click='nav.goToMyEureka()']").parent()
	$(playbookTemp).insertAfter(p)
	$("#playbook").attr('src',playbookImage)
	//set the click event
	$("#playbook").click(function(){
		
		//test introJs
		//check if the element is visable
		if ($("div[title='Longest Contacts']").is(":visible")===true){
			$("div[title='Longest Contacts']").attr("data-intro","Set Longest Contact Category as a filter");
			$("div[title='Longest Contacts']").attr("data-step","3");
			$(".search-button").attr("data-intro","Click the search button");
			$(".search-button").attr("data-step","4");

			$("div[title='Excessive Silence Block']").first().attr("data-intro","Does this category make up a large percentage of the returned calls? If yes, review the behavior categories for trending categories.");
			$("div[title='Excessive Silence Block']").first().attr("data-step","5");
		}			
		
		//check if the element is visable
		if ($("span[title='Outliers']").is(":visible")===true){
			$("span[title='Outliers']").attr("data-intro","Navigate to Longest Contact Category");
			$("span[title='Outliers']").attr("data-step","2");
		}

		$("span[title='Categories']").attr("data-intro","Navigate to the outliers folder");
		$("span[title='Categories']").attr("data-step","1");
				
		
		//run introJs
		introJs().start();
	});

	

};

uiManager.prototype.getBucketNamesAndIdentifier = function(){
		var bucketNames = [];
		$("span.truncate.panel-heading-label").each(function(e){
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
	globalBucketMap[identifier]=group;
	this.setFolderMembers = function(){

		var $members = this.getFolderGroupMembers(this.f_group); //this is the parent bucket
		var $sel2 = $('#'+ this.selectElement); //this is the select 2 box that represents it
		var self = this;
		$members.each(function(i,e){
			var catName = $(e).html();
			var folderGroup = $(e).parent().parent().parent().parent().prev().find("span.ng-binding").first().html();
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

		var members = $("span[title='"+ folder +"']").parent().next().find("td.truncate.ng-binding");
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
			var parentFolder = $(elId +' option:selected').val(); //this is needed to specify what folder group it belongs to
			globalFolder = parentFolder;
			globalText = textSelected;
			globalBucket = elId.split("#")[1]; 
			var $parentBucketelement =  $("span[data-ng-bind='::summaryContainer.uiDisplayName']:contains('"+ parentFolder+"')").filter(function(){return $(this).html()===parentFolder}) //use this to locate the category call count in the next line 
			if (textSelected !== "") {
				//var $cats = self.getFolderGroupMembers(self.f_group);
				//$cats.filter('div[title="' + textSelected +'"]').click()
				self.setCallCount(textSelected,$parentBucketelement);
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
	
	this.setCallCount = function(catText,$folder){
		
		//this find the cat the looks at its parent container then looks for the span for call count	
		var elID = navManager.prototype.getCallCountUIElement();		
		var count = $folder.parent().parent().next().find("td.truncate.ng-binding[title='"+catText+"']").next().html()
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