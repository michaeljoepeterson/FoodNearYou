const endUrl = "https://developers.zomato.com/api/v2.1/";
const zomatoKey = "a0f05595eda479ba1030417f5224deca";
let infoWindowArray = [];
let markerArray = [];
let mapObj;
function errorHandle(){
  console.log("An error occured yup");
}

function displayInfo(index){
  const map = infoWindowArray[index].getMap();
    if (map !== null && typeof map !== "undefined"){
      infoWindowArray[index].close();
      //console.log("close");
        //onVal = true;
    }
    else{
      infoWindowArray[index].open(mapObj,markerArray[index]);
        //onVal = false
      //console.log("open");
    }
    mapObj.setZoom(15);
    mapObj.panTo(markerArray[index].position);
    //console.log(map);
}

function resultClicked(){
  $(".jsList").on("click",".jsItem", function(event){
    event.stopImmediatePropagation();
    const itemIndex = $(this).attr("data-item-index");
    displayInfo(itemIndex);
  });
}

function renderResult(name,rating,text,votes,index){
  const htmlString = `
    <li class="resultItem jsItem" data-item-index="${index}">
      <h3 class="listItemName">${name}</h3>
      <p class="listItemText">Rating: ${rating} "${text}"</p>
      <p class="listItemText">Votes: ${votes}</p>
    </li>
    `;
  $(".jsList").append(htmlString);
}

function handlZomatoSearch(data){
  console.log(data);
  const initialName = data.restaurants[0].restaurant.name;
  const initialRating = data.restaurants[0].restaurant.user_rating.aggregate_rating;
  const initialText = data.restaurants[0].restaurant.user_rating.rating_text;
  const initialVotes = data.restaurants[0].restaurant.user_rating.votes;
  let initialLat = parseFloat(data.restaurants[0].restaurant.location.latitude);
  let initialLong = parseFloat(data.restaurants[0].restaurant.location.longitude);
  let map1 = initMap(initialLat, initialLong,initialName,initialRating,initialText,initialVotes);

  renderResult(initialName,initialRating,initialText,initialVotes,0);

  for(i = 1; i < data.restaurants.length; i++){
    let name = data.restaurants[i].restaurant.name;
    let rating = data.restaurants[i].restaurant.user_rating.aggregate_rating;
    let text = data.restaurants[i].restaurant.user_rating.rating_text;
    let votes = data.restaurants[i].restaurant.user_rating.votes;
    let lat = parseFloat(data.restaurants[i].restaurant.location.latitude);
    let long = parseFloat(data.restaurants[i].restaurant.location.longitude);
    addMarker(lat,long,map1,name,rating,text,votes,i);
    renderResult(name,rating,text,votes,i);
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

function handleZomatoCity(data){
  console.log(data);
  console.log(data.location_suggestions[0].id);
  let cityId = data.location_suggestions[0].id;
  let cuisineType = $(".jsFoodType").val();
  let cuisineDropDown = $(".jsCuisineSelect").val();
  let num = $(".jsResults").val();
  if (cuisineType === "" && cuisineDropDown == 0){
    console.log("empty");
  }
  else if(cuisineType === "" && cuisineDropDown != 0){
    callZomatoSearch(cityId,cuisineDropDown,num,handlZomatoSearch);
  }
  else{
    callZomatoSearch(cityId,cuisineType,num,handlZomatoSearch);
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
/*
function handleGeocode(results, status){
  console.log(results,status);
}

function callGeocode(){
  let geocoder = new google.maps.Geocoder();

  geocoder.geocode({'address': "t6m2w9"},handleGeocode);
}
*/
function initMap(latitude,longitude,name,rating,text,votes) {
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

  var infowindow = new google.maps.InfoWindow({
    content: `<h2 class="markerHeading">${name}</h2>
    <p>Rating: ${rating} "${text}"</p>
    <p>Votes: ${votes}</p>
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
function addMarker(latitude,longitude,map,name,rating,text,votes,index){
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
    `
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
  infoWindowArray.push(infowindow);
  markerArray.push(marker);
}


function submitClicked(){
  $(".submitForm").submit(function(event){
    event.preventDefault();
    $(".jsList").empty();
    let userCity = $(".jsCity").val();
    markerArray = [];
    infoWindowArray = [];
    callZomatoCity(userCity,handleZomatoCity);
    console.log(infoWindowArray);
    console.log(markerArray);
    ;
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
