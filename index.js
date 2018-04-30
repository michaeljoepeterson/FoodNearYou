const endUrl = "https://developers.zomato.com/api/v2.1/"
const zomatoKey = "a0f05595eda479ba1030417f5224deca"
function errorHandle(){
  console.log("An error occured yup");
}

function handlZomatoSearch(data){
  console.log(data);
}

function callZomatoSearch(cityId, searchWord, numResults,callback){
  const newEndPoint = endUrl + "search";
  const settings = {
    url: newEndPoint,
    headers:{
      "user-key": zomatoKey
    },
    data:{
      entity_id:334,
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
  callZomatoSearch(data.location_suggestions[0].id,"burger",5,handlZomatoSearch);
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
function initMap(latitude,longitude) {
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
  return map
}
function addMarker(latitude,longitude,map){
  let uluru = {lat: latitude, lng: longitude};
  let marker = new google.maps.Marker({
    position: uluru,
    map: map,
    label: "2"
  });  
}
//$(initMap);
function submitClicked(){
  $(".submitForm").submit(function(event){
    event.preventDefault();
    let map1 = initMap(53.46927239999999
,  -113.63656679999997);
    addMarker(53.5176707,-113.4995439,map1)
    addMarker(53.552364,-113.4961727,map1)
    addMarker(53.518218,-113.5007353,map1)
    console.log($(".jsResults").val());
    callZomatoCity("edmonton",handleZomatoCity);
  });
}
$(submitClicked)
