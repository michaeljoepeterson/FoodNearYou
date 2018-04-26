function initMap(latitude,longitude) {
  var uluru = {lat: latitude, lng: longitude};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 20,
    center: uluru
  });
  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
}
//$(initMap);
function submitClicked(){
  $(".submitForm").submit(function(event){
    event.preventDefault();
    initMap(33.8120918,-117.9211682);
    console.log($(".jsResults").val());
  });
}
$(submitClicked)
