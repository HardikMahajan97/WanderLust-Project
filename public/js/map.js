mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 8 // starting zoom
});


//Just setting up the marker for the map to pin-point location!
const marker = new mapboxgl.Marker({color: 'red'})
.setLngLat(listing.geometry.coordinates)   //passing the longitudes and latitudes.
.setPopup(
    new mapboxgl.Popup({offset: 25})
    .setHTML(`<h4>${listing.title}</h4> <p>Exact location will be displayed after booking</p>`))
.addTo(map);
