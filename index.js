function initMap(latitude,longitude) {
  let uluru = {lat: latitude, lng: longitude};
  let map = new google.maps.Map(document.getElementById('map'), {
    zoom: 20,
    center: uluru
  });
  let marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
  return map
}
function addMarker(latitude,longitude,map){
  let uluru = {lat: latitude, lng: longitude};
  let marker = new google.maps.Marker({
    position: uluru,
    map: map
  });  
}
//$(initMap);
function submitClicked(){
  $(".submitForm").submit(function(event){
    event.preventDefault();
    map1 = initMap(53.5182744,-113.4953357);
    addMarker(53.5176707,-113.4995439,map1)
    addMarker(53.552364,-113.4961727,map1)
    addMarker(53.518218,-113.5007353,map1)
    console.log($(".jsResults").val());
  });
}
$(submitClicked)
