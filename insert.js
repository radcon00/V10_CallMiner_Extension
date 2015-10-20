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
	
	//create the select2 combo box
	$('head').append("<script src='//cdnjs.cloudflare.com/ajax/libs/select2/4.0.0/js/select2.min.js'></script>");
	$('.category_selector').select2({
		placeholder: "Category Quick Select",
		allowClear:true
	});
	//format it
	$('.select2').css("left","1303px");
	$('.select2').css("top","-30px");
	$('.select2').css("position","absolute");
	$('.select2').css("width","330px");
	$('.select2-selection').css("border-color","#3b6e8f");	
	
	//add change event that will trigger the clicking of the category
	$('.category_selector').on("change",function (e) {
		var textSelected = $('.category_selector option:selected').text();
		var valSelected = $('.category_selector option:selected').val();
		//running the alternate function to avoid the error the occurs when a category is updated.
		alternateCategorySelector(valSelected);
		//try {
			//if this fails we will go go with the alternate method of looping through the list of categories and selecting the correct one by category id.
			//categoryList[textSelected+valSelected].click();
		//} catch (error) {
			//alternateCategorySelector(valSelected);
		//}
		
	})
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


	