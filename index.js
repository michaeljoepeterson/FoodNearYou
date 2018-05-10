const endUrl = "https://developers.zomato.com/api/v2.1/";
const zomatoKey = "a0f05595eda479ba1030417f5224deca";
let infoWindowArray = [];
let markerArray = [];
let mapObj;
//checks input for illegal characters
function checkInput(strToCheck){
  const legalChars = /^[a-zA-z0-9.,?!;\s']*$/;
  return legalChars.test(strToCheck)
}
//used to remove map markers
function setMapOnAll(map) {
  console.log(markerArray);
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(map);
  }
}
//various error functions that will display alerts 
function apiError(){
  const msg = "An error occured no results to display"
  alert(msg);
  $(".loader").css("display","none");
  setMapOnAll(null);
}

function errorHandleEmpty(){
  const msg = "Please fill in all fields";
  $(".loader").css("display","none");
  alert(msg);
}

function errorHandleChar(){
  const msg = "Illegal character, please check your input";
  $(".loader").css("display","none");
  alert(msg);
}
//displays info windows for a selected marker
function displayInfo(index){
  const map = infoWindowArray[index].getMap();
    if (map !== null && typeof map !== "undefined"){
      infoWindowArray[index].close();
    }
    else{
      infoWindowArray[index].open(mapObj,markerArray[index]);
    }
    mapObj.setZoom(15);
    mapObj.panTo(markerArray[index].position);
}
//handles when a user clicks on a list item 
function resultClicked(){
  $(".jsList").on("click",".jsItem", function(event){
    event.stopImmediatePropagation();
    const itemIndex = $(this).attr("data-item-index");
    displayInfo(itemIndex);
    const offset = 5;
    $('html, body').animate({
        scrollTop: $("#map").offset().top + offset
    }, 300);
  });
}

function renderResult(name,rating,text,votes,cost,index){
  const htmlString = `
    <li class="resultItem jsItem" data-item-index="${index}">
      <h3 class="listItemName">${name}</h3>
      <p class="listItemText">Rating: ${rating} "${text}"</p>
      <p class="listItemText">Votes: ${votes}</p>
      <p class="listItemText">Average Cost For Two: $${cost}</p>
    </li>
    `;
  $(".jsList").append(htmlString); 
}
//function that handles the data from the zomato search api
function handlZomatoSearch(data){
  if (data.restaurants.length === 0){
      apiError();
    }
  else{
    $(".loader").css("display","none");
    markerArray = [];
    infoWindowArray = [];
    console.log(data);
    const initialName = data.restaurants[0].restaurant.name;
    const initialRating = data.restaurants[0].restaurant.user_rating.aggregate_rating;
    const initialText = data.restaurants[0].restaurant.user_rating.rating_text;
    const initialVotes = data.restaurants[0].restaurant.user_rating.votes;
    const initialLat = parseFloat(data.restaurants[0].restaurant.location.latitude);
    const initialLong = parseFloat(data.restaurants[0].restaurant.location.longitude);
    const costForTwo = parseInt(data.restaurants[0].restaurant.average_cost_for_two);
    let map1 = initMap(initialLat, initialLong,initialName,initialRating,initialText, initialVotes,costForTwo);
    renderResult(initialName,initialRating,initialText,initialVotes,costForTwo,0);
    for(i = 1; i < data.restaurants.length; i++){
      
      const name = data.restaurants[i].restaurant.name;
      const rating = data.restaurants[i].restaurant.user_rating.aggregate_rating;
      const text = data.restaurants[i].restaurant.user_rating.rating_text;
      const votes = data.restaurants[i].restaurant.user_rating.votes;
      const lat = parseFloat(data.restaurants[i].restaurant.location.latitude);
      const long = parseFloat(data.restaurants[i].restaurant.location.longitude);
      const cost = parseInt(data.restaurants[i].restaurant.average_cost_for_two);
      addMarker(lat,long,map1,name,rating,text,votes,cost,i);
      renderResult(name,rating,text,votes,cost,i);
    }
  }
}

function callZomatoSearch(cityId, searchWord, numResults,callback){
  const newEndPoint = endUrl + "search";
  const settings = {
    url: newEndPoint,
    headers:{
      "user-key": zomatoKey
    },
    data:{
      entity_id:cityId,
      entity_type: "city",
      q: searchWord,
      count: numResults,
      sort:"rating",
      order: "desc"
    },
    dataType: 'json',
    type: "GET",
    success: callback,
  };
  $.ajax(settings);  
}
//checks if a state/province is in the results from the zomato api
function checkState(arr,stateStr){
  for(i = 0; i < arr.length;i++){
    let checkState = arr[i].state_name.toLowerCase();
    if(checkState.includes(stateStr)){
      return i;
    }
  }
  return false;
}
//handle data from the first call to the zomato api city portion
function handleZomatoCity(data){
  if (data.location_suggestions.length === 0){
    apiError();
  }else{
    const userState = $(".jsState").val().toLowerCase();
    let index = checkState(data.location_suggestions, userState);
    if (index === false){
      apiError();
      return 0;
    }
    const cityId = data.location_suggestions[index].id;
    const cuisineType = $(".jsFoodType").val();
    const cuisineDropDown = $(".jsCuisineSelect").val();
    const num = $(".jsResults").val();
    const checkChar = checkInput(cuisineType);
    if (cuisineType === "" && cuisineDropDown == 0){
      errorHandleEmpty();
    }
    else if(cuisineType === "" && cuisineDropDown != 0){
      callZomatoSearch(cityId,cuisineDropDown,num,handlZomatoSearch);
    }
    else if (checkChar === false){
      errorHandleChar();
    }
    else{
      $(".jsCuisineSelect").val("0");
      callZomatoSearch(cityId,cuisineType,num,handlZomatoSearch);
    }
  }
}

function callZomatoCity(city, callback){
  const newEndPoint = endUrl + "cities";
  const settings = {
    url: newEndPoint,
    headers:{
      "user-key": zomatoKey
    },
    data:{
      q: city
    },
    dataType: 'json',
    type: "GET",
    success: callback,
  };
  $.ajax(settings);
}
//initialize google maps with the first marker from the restaurants returned by the zomato api
function initMap(latitude,longitude,name,rating,text,votes,cost) {
  let uluru = {lat: latitude, lng: longitude};
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: uluru
  });
  let marker = new google.maps.Marker({
    position: uluru,
    map: map,
    label: "1"
  });

  let infowindow = new google.maps.InfoWindow({
    content: `<h2 class="markerHeading">${name}</h2>
    <p>Rating: ${rating} "${text}"</p>
    <p>Votes: ${votes}</p>
    <p>Average Cost For Two: $${cost}</p>
    `
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
  infoWindowArray.push(infowindow);
  markerArray.push(marker);
  mapObj = map;
  return map
}
//add the next markers from the restaurants returned by the zomato api
function addMarker(latitude,longitude,map,name,rating,text,votes,cost,index){
  let labelNum = index + 1;
  labelNum = labelNum.toString();
  const uluru = {lat: latitude, lng: longitude};
  let marker = new google.maps.Marker({
    position: uluru,
    map: map,
    label: labelNum
  });  
  var infowindow = new google.maps.InfoWindow({
    content: `<h2 class="markerHeading">${name}</h2>
    <p>Rating: ${rating} "${text}"</p>
    <p>Votes: ${votes}</p>
    <p>Average Cost For Two: $${cost}</p>
    `
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
  infoWindowArray.push(infowindow);
  markerArray.push(marker);
}
//handle the submit button click
function submitClicked(){
  $(".submitForm").submit(function(event){
    $(".loader").css("display","initial");
    event.preventDefault();
    const userCity = $(".jsCity").val();
    const charCheck = checkInput(userCity);
    const cuisineType = $(".jsFoodType").val();
    const checkCharCuisine = checkInput(cuisineType);
    const checkCharState = checkInput($(".jsState").val());
    const cuisineDropDown = $(".jsCuisineSelect").val();
    if ((userCity === "" || cuisineType === "") && cuisineDropDown == 0){
      errorHandleEmpty();
    }
    else if (charCheck === false || checkCharCuisine === false || checkCharState === false){
      errorHandleChar();
    }
    else{
      $(".jsList").empty();
      //clearError();
      callZomatoCity(userCity,handleZomatoCity);
    }
    //console.log(infoWindowArray);
    //console.log(markerArray);
    resultClicked();
    /*
    let map1 = initMap(53.46927239999999, -113.63656679999997);
    addMarker(53.5176707,-113.4995439,map1)
    addMarker(53.552364,-113.4961727,map1)
    addMarker(53.518218,-113.5007353,map1)
    console.log($(".jsResults").val());
    */
  });
}
$(submitClicked)
