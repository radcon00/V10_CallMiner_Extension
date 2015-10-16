console.log("this is a test")
var catNameID = {};
var catNames = [];
setTimeout(getCategoryNamesID, 4000);

function getCategoryNamesID(){
	//this pulls all of the name and id information for the categories
	$('span').filter(".SSC_Editable").each(function(){
			var catID = $(this).attr("categoryid");
			var catName = $(this).attr("title");			
			catName = catName.split(":")[1].split("Description")[0];
			catName = catName.trim();
			catNameID[catName] = catID;
			catNames.push(catName);
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
	var selectBox = "<select class='category_selector'></select>";
	$('.Master_SearchBoxDiv').append(selectBox);
	var categorySelector = $('.category_selector');
	
	for (var index = 0; index < catNames.length; index++) {
		var name = catNames[index];
		var option = "<option value=" + catNameID[name]+">"+name + "</option>";
		categorySelector.append(option);
	}
	
		
}	


	