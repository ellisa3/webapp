/**
 * species_classification.js
 * Angela Ellis & Marc Donnelly
 * 22 November 2020
 *
 */

var classification_type = '';
var classification_value = '';

window.onload = initializePage;

function initializePage() {
    loadCategoryList()
    var element = document.getElementById('search_button');
    if (element) {
        element.onclick = onSearchButtonClick;
    }
}

/**
 * Returns the base URL of the API, onto which endpoint components can be appended.
 */
function getAPIBaseURL() {
    var baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}



/**
 * Populates unordered list items of the category values.
 * When clicked, list items trigger creation of list for corresponding orders.
 */
function loadCategoryList() {
    var firstList = document.getElementById('categories_list');
    if (firstList) {
        var url = getAPIBaseURL() + '/classifications/categories';
    
        fetch(url, {method: 'get'})

        .then((response) => response.json())
    
        .then(function(categories) {
            var listBody = '';
            for (var k=0; k < categories.length; k++) {
                listBody += '<li>' + categories[k] + '</li>\n';
            }
            firstList.innerHTML = listBody;            
            for (var k=0; k < firstList.children.length; k++) {
                var child = firstList.children[k];
                child.onclick = function(e) {
                    updateSelection(firstList, this); 
                    loadOrderListFor(this.innerHTML);
                    clearList(document.getElementById('families_list'));
                    clearList(document.getElementById('genera_list'));
                    clearList(document.getElementById('species_list'));
                    classification_value = this.innerText;
                    classification_type = 'categories';
                }
            }
        })
        .catch(function(error){
            console.log(error);
        })
    }
}



/**
 * Populates unordered list items of the order values.
 * When clicked, list items trigger creation of list for corresponding families.
 */
function loadOrderListFor(categoryListSelection) {
    var secondList = document.getElementById('orders_list');
    if (secondList) {
        if (categoryListSelection.includes('/')) {
            var underscoredCategoryListSelection = categoryListSelection.replaceAll('/', '_');
            var url = getAPIBaseURL() + '/children/category/' + underscoredCategoryListSelection;
        } else {
            var url = getAPIBaseURL() + '/children/category/' + categoryListSelection;
        }
        fetch(url, {method: 'get'})

        .then((response) => response.json())
    
        .then(function(orders) {
            var listBody = '';
            for (var k=0; k < orders.length; k++) {
                listBody += '<li>' + orders[k] + '</li>\n';
            }
            secondList.innerHTML = listBody;  
            for (var k=0; k < secondList.children.length; k++) {
                var child = secondList.children[k];
                child.onclick = function(e) {
                    updateSelection(secondList, this);
                    loadFamilyListFor(this.innerText);
                    clearList(document.getElementById('genera_list'));
                    clearList(document.getElementById('species_list'));
                    classification_value = this.innerText;
                    classification_type = 'orders';
                }
            }
        })
        .catch(function(error){
            console.log(error);
        })
    }
}



/**
 * Populates unordered list items of the family values.
 * When clicked, list items trigger creation of list for corresponding genera.
 */
function loadFamilyListFor(orderListSelection) {
    var thirdList = document.getElementById('families_list');
    if (thirdList) { 
        var url = getAPIBaseURL() + '/children/order/' + orderListSelection;
    
        fetch(url, {method: 'get'})

        .then((response) => response.json())
    
        .then(function(families) {
            var listBody = '';
            for (var k=0; k < families.length; k++) {
                listBody += '<li>' + families[k] + '</li>\n';
            }
            thirdList.innerHTML = listBody;  
            for (var k=0; k < thirdList.children.length; k++) {
                var child = thirdList.children[k];
                child.onclick = function(e) {
                    updateSelection(thirdList, this);
                    loadGenusListFor(this.innerText);
                    clearList(document.getElementById('species_list'));
                    classification_value = this.innerText;
                    classification_type = 'families';
                }
            }
        })
        .catch(function(error){
            console.log(error);
        })
    }
}



/**
 * Populates unordered list items of the genus values.
 * When clicked, list items trigger creation of list for corresponding species.
 */
function loadGenusListFor(familyListSelection) {
    var fourthList = document.getElementById('genera_list');
    if (fourthList) { 
        var url = getAPIBaseURL() + '/children/family/' + familyListSelection;
    
        fetch(url, {method: 'get'})

        .then((response) => response.json())
    
        .then(function(genera) {
            var listBody = '';
            for (var k=0; k < genera.length; k++) {
                listBody += '<li>' + genera[k] + '</li>\n';
            }
            fourthList.innerHTML = listBody;  
            for (var k=0; k < fourthList.children.length; k++) {
                var child = fourthList.children[k];
                child.onclick = function(e) {
                    updateSelection(fourthList, this);
                    onSearchButtonClick(this.innerText);
                    classification_value = this.innerText;
                    classification_type = 'genera';
                }
            }
        })
        .catch(function(error){
            console.log(error);
        })
    }
}




/**
 * When clicked, populates unordered list items of the scientific names 
 * that correspond to the previously slecected classification value.
 */
function onSearchButtonClick() {
    var element = document.getElementById('species_list');
    if (element) {
        var url = getAPIBaseURL() + '/species/' + classification_type + '/' + classification_value; 

        fetch(url, {method: 'get'})

        .then((response) => response.json())
        
        .then(function(species) {
            var listBody = '';
            for (var k=0; k < species.length; k++) {
                listBody += '<li>' + species[k] + '</li>\n';
            }
            element.innerHTML = listBody;  
            for (var k=0; k < element.children.length; k++) {
                var child = element.children[k];
                child.onclick = function(e) {
                    updateSelection(element, this);
                    loadIndSpeciesCharacteristics(this.innerText);
                }
            }
        })
        .catch(function(error){
            console.log(error);
        })
    }
}



/**
 * Populates paragraph tag items with the characteristics of the selected scientific name.
 */
function loadIndSpeciesCharacteristics(scientific_name) {
    var individual_species_info = document.getElementById('individual_species_characteristics');
    
    var url = getAPIBaseURL() + '/individual_species/' + scientific_name; 

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(individual_species) {
        var listBody = '';
        listBody += '<p> <h2>Scientific Name: ' + individual_species['Scientific Name'] + '</h2></p>\n'
                  + '<p> <h4>Common Name:</h4> ' + individual_species['Common Name'] + '</p>\n'
                  + '<p> <h4>Park:</h4> ' + individual_species['Park'] + '</p>\n'
                  + '<p> <h4>Category:</h4> ' + individual_species['Category'] + '</p>\n'
                  + '<p> <h4>Order:</h4> ' + individual_species['Order'] + '</p>\n'
                  + '<p> <h4>Family:</h4> ' + individual_species['Family'] + '</p>\n'
                  + '<p> <h4>Genus:</h4> ' + individual_species['Genus'] + '</p>\n'
                  + '<p> <h4>Abundance:</h4> ' + individual_species['Abundance'] + '</p>\n'
                  + '<p> <h4>Nativeness:</h4> ' + individual_species['Nativeness'] + '</p>\n'
                  + '<p> <h4>Occurrence:</h4> ' + individual_species['Occurrence'] + '</p>\n'
                  + '<p> <h4>Seasonality:</h4> ' + individual_species['Seasonality'] + '</p>\n'
                  + '<p> <h4>Conservation Status:</h4> ' + individual_species['Conservation Status'] + '</p>\n';
        individual_species_info.innerHTML = listBody;
    })
    .catch(function(error) {
        console.log(error);
    });
}



//////////////////UTILITY FUNCTIONS//////////////////



function clearList(listElement) {
    listElement.innerHTML = '';
}



/**
 *  Marks selected unordered list item with class = 'selected'
 */
function updateSelection(listElement, listItemToSelect) {
    for (var k=0; k < listElement.children.length; k++) {
        listElement.children[k].classList.remove('selected');
    }
    listItemToSelect.classList.add('selected');
}


