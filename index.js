const endUrl = "https://developers.zomato.com/api/v2.1/";
const zomatoKey = "a0f05595eda479ba1030417f5224deca";
let infoWindowArray = [];
let markerArray = [];
let addressArray = [];
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

function addressError(){
  const msg = "No address available";
  alert(msg);
}

//various error functions that will display alerts 
function apiError(){
  const msg = "No results to display";
  alert(msg);
  $(".citySelectLabel").css("display","initial");
  $(".citySelect").css("display","initial");
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

function checkBrowser(address){
  if((navigator.platform.indexOf("iPhone") != -1)||(navigator.platform.indexOf("iPad") != -1)||(navigator.platform.indexOf("iPod") != -1)){
        return `maps://maps.google.com/maps?daddr=${address}>&amp;ll=`;
    }
    else{
      return `https://maps.google.com/maps?daddr=${address}&amp;ll=`;
    }
}

function mapSelector(){
  $(".jsList").on("click",".jsGoogleLink",function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      const index = $(this).attr("data-item-index");
      const address = addressArray[index];
      if(addressArray[index] === ""){
        addressError();
        return 0;
      }
      if((navigator.platform.indexOf("iPhone") != -1)||(navigator.platform.indexOf("iPad") != -1)||(navigator.platform.indexOf("iPod") != -1)){
        window.open(`maps://maps.google.com/maps?daddr=${address}>&amp;ll=`);
    }
    else{
      window.open(`https://maps.google.com/maps?daddr=${address}&amp;ll=`);
    }
  });
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

function foodInputClick(){
  $(".jsFoodType").click(function(event){
    $(".jsCuisineSelect").val("0");  
  });
}

function foodInputSelect(){
  $(".jsCuisineSelect").click(function(event){
    $(".jsFoodType").val("");  
  });
}

function cityInputClick(){
  $(".jsCity").click(function(event){
    $(".jsCitySelect").val("0");  
  });
}

function cityInputSelect(){
  $(".jsCitySelect").click(function(event){
    $(".jsCity").val("");  
  });
}
function resultButtonClicked(){
    $(".jsList").on("click",".jsListButton", function(event){
      event.preventDefault();
      event.stopImmediatePropagation();
      const itemIndex = $(this).attr("data-item-index");
      displayInfo(itemIndex);
      const offset = 5;
      $('html, body').animate({
          scrollTop: $("#map").offset().top + offset
      }, 300);
  })
  ;
}
function checkCharacters(name){
  if (name.length >= 30){
    const nameArr = name.split(" ")
    return nameArr[0];
  }
  else{
    return name;
  }
}
//initialize google maps with the first marker from the restaurants returned by the zomato api
function initMap(latitude,longitude,name,rating,text,votes,cost,address) {
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
  const newName = checkCharacters(name);
  const browserAddress = checkBrowser(address);
  let infowindow = new google.maps.InfoWindow({
    content: `<h2 class="markerHeading">${newName}</h2>
    <p>Rating: ${rating} "${text}"</p>
    <p>Votes: ${votes}</p>
    <p>Average Cost For Two: $${cost}</p>
    <p>Address: ${address}</p>
    <a target="_blank" href="${browserAddress}">Open In Google Maps</a>
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
function addMarker(latitude,longitude,map,name,rating,text,votes,cost,address,index){
  let labelNum = index + 1;
  labelNum = labelNum.toString();
  const uluru = {lat: latitude, lng: longitude};
  let marker = new google.maps.Marker({
    position: uluru,
    map: map,
    label: labelNum
  });  
  const newName = checkCharacters(name);
  const browserAddress = checkBrowser(address);
  let infowindow = new google.maps.InfoWindow({
    content: `<h2 class="markerHeading">${newName}</h2>
    <p>Rating: ${rating} "${text}"</p>
    <p>Votes: ${votes}</p>
    <p>Average Cost For Two: $${cost}</p>
    <p>Address: ${address}</p>
    <a target="_blank" href="${browserAddress}">Open In Google Maps</a>
    `
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
  infoWindowArray.push(infowindow);
  markerArray.push(marker);
}

function renderResult(name,rating,text,votes,cost, address,index){
  const htmlString = `
    <li class="resultItem jsItem" aria-live="assertive">
      <form>
      <button class="listButton jsListButton" data-item-index="${index}">
      <h3 class="listItemName">${name}</h3>
      <p class="listItemText">Rating: ${rating} "${text}"</p>
      <p class="listItemText">Votes: ${votes}</p>
      <p class="listItemText">Average Cost For Two: $${cost}</p>
      <p class="listItemText">Address: ${address}</p>
      <button class="jsGoogleLink listButton googleLink" data-item-index="${index}">Open In Google Maps</button>
      </button>
      </form>
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
    $(".jsList").prop('hidden',false);
    markerArray = [];
    infoWindowArray = [];
    addressArray = [];
    const initialName = data.restaurants[0].restaurant.name;
    const initialRating = data.restaurants[0].restaurant.user_rating.aggregate_rating;
    const initialText = data.restaurants[0].restaurant.user_rating.rating_text;
    const initialVotes = data.restaurants[0].restaurant.user_rating.votes;
    const initialLat = parseFloat(data.restaurants[0].restaurant.location.latitude);
    const initialLong = parseFloat(data.restaurants[0].restaurant.location.longitude);
    const costForTwo = parseInt(data.restaurants[0].restaurant.average_cost_for_two);
    const initialAddress = data.restaurants[0].restaurant.location.address;
    addressArray.push(initialAddress);
    let map1 = initMap(initialLat, initialLong,initialName,initialRating,initialText, initialVotes,costForTwo,initialAddress);
    renderResult(initialName,initialRating,initialText,initialVotes,costForTwo,initialAddress,0);
    for(i = 1; i < data.restaurants.length; i++){
      
      const name = data.restaurants[i].restaurant.name;
      const rating = data.restaurants[i].restaurant.user_rating.aggregate_rating;
      const text = data.restaurants[i].restaurant.user_rating.rating_text;
      const votes = data.restaurants[i].restaurant.user_rating.votes;
      const lat = parseFloat(data.restaurants[i].restaurant.location.latitude);
      const long = parseFloat(data.restaurants[i].restaurant.location.longitude);
      const cost = parseInt(data.restaurants[i].restaurant.average_cost_for_two);
      const address = data.restaurants[i].restaurant.location.address;
      addressArray.push(address);
      addMarker(lat,long,map1,name,rating,text,votes,cost,address,i);
      renderResult(name,rating,text,votes,cost,address,i);
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
    const cityId = data.location_suggestions[0].id;
    const cuisineType = $(".jsFoodType").val();
    const num = $(".jsResults").val();
    const checkChar = checkInput(cuisineType);
    callZomatoSearch(cityId,cuisineType,num,handlZomatoSearch);
  }
}

function callZomatoCity(city, callback, latitude, longitude){
  const newEndPoint = endUrl + "cities";
  let settings ={};
  if(latitude === undefined || longitude === undefined){
    settings = {
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
  }
  else{
    settings = {
      url: newEndPoint,
      headers:{
        "user-key": zomatoKey
      },
      data:{
        lat: latitude,
        lon:longitude
      },
      dataType: 'json',
      type: "GET",
      success: callback,
    };
  }
  $.ajax(settings);
}

function showPosition(position){

  callZomatoCity("",handleZomatoCity,position.coords.latitude,position.coords.longitude);
}

function showError(error){
    switch(error.code) {
        case error.PERMISSION_DENIED:
            $(".citySelectLabel").css("display","initial");
            $(".citySelect").css("display","initial");
            break;
        case error.POSITION_UNAVAILABLE:
            $(".citySelectLabel").css("display","initial");
            $(".citySelect").css("display","initial");
            alert("Cannot obtain location info")
            break;
        case error.TIMEOUT:
            $(".citySelectLabel").css("display","initial");
            $(".citySelect").css("display","initial");
            alert("The request to get user location timed out.")
            break;
        case error.UNKNOWN_ERROR:
            $(".citySelectLabel").css("display","initial");
            $(".citySelect").css("display","initial");
            alert("An unknown error occurred.")
            break;
    }
    $(".loader").css("display","none");  
}
//handle the submit button click
function submitClicked(){
  $(".submitForm").submit(function(event){
    $(".loader").css("display","initial");

    event.preventDefault();
    const cuisineType = $(".jsFoodType").val();
    const checkCharCuisine = checkInput(cuisineType);
    const userCitySelect = $(".jsCitySelect").val();

    if (cuisineType === ""){
      errorHandleEmpty();
    }
    else if (checkCharCuisine === false){
      errorHandleChar();
    }
    else if(userCitySelect != 0){
      $(".jsList").empty();
      callZomatoCity(userCitySelect,handleZomatoCity);
    }
    else if(cuisineType !== "" && userCitySelect == 0){  
        $(".jsList").empty();
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition,showError);
         } else {
          console.log("no location");
         }
    }
    else if (userCitySelect == 0){
      errorHandleEmpty();
    }
    
    mapSelector();
    resultButtonClicked();
    
  });
  foodInputClick();
  foodInputSelect();
  cityInputClick();
  cityInputSelect();
}

$(submitClicked)
