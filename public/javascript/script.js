var mymap = L.map('mymap').setView([48.866667, 2.333333,4], 13);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);


var city = document.getElementsByTagName('li');
// var citieslistfront = city.dataset.lat

for (var index = 0; index < city.length; index++) {
    console.log(city[index])
    console.log(city[index].dataset.cityname)
    // console.log(city[index].dataset.lon)
    var citypos = {
        lat: city[index].dataset.lat,
        lon : city[index].dataset.lon,
        cityname : city[index].dataset.cityname
    }

    var customIcon = L.icon({
        iconUrl : '/images/leaf-green.png',
        shadowUrl : '/images/leaf-shadow.png',
    
        iconSize: [38,95],
        shadowSize: [50,64],
    
        iconAnchor: [22,94],
        shadowAnchor: [4,62],
    
        popupAnchor: [-3,-76]
    });
    
    L.marker([citypos.lat, citypos.lon], {icon: customIcon}).addTo(mymap).bindPopup(citypos.cityname)
}



