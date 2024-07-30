const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'bca49d947bmsh77610508b23afddp11c12ajsn2b199144b983',
        'X-RapidAPI-Host': 'weather-by-api-ninjas.p.rapidapi.com'
    }
};
const getWeather =(city)=>
{
    cityName.innerHTML = city
    fetch('https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city='+ city, options)
    .then(response => response.json())
    .then(response => {
        console.log(response)

        cloud_pct.innerHTML = response.cloud_pct
        temp.innerHTML = response.temp
        temp2.innerHTML = response.temp

        feels_like.innerHTML = response.feels_like 
        humidity.innerHTML = response.humidity
        humidity2.innerHTML = response.humidity
        min_temp.innerHTML = response.min_temp
        max_temp.innerHTML = response.max_temp
        wind_speed.innerHTML = response.wind_speed
        wind_speed2.innerHTML = response.wind_speed

        wind_degrees.innerHTML = response.wind_degrees
        sunrise.innerHTML = response.sunrise
        sunset.innerHTML = response.sunset
        

    })
    .catch(err => console.error(err));
}
submit.addEventListener("click", (e)=>{
    e.preventDefault()
    getWeather(city.value)

})

function getCoordintes() { 
    var options = { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
    }; 
  
    function success(pos) { 
        var crd = pos.coords; 
        var lat = crd.latitude.toString(); 
        var lng = crd.longitude.toString(); 
        var coordinates = [lat, lng]; 
        console.log(`Latitude: ${lat}, Longitude: ${lng}`); 
        getCity(coordinates); 
        return; 
  
    } 
  
    function error(err) { 
        console.warn(`ERROR(${err.code}): ${err.message}`); 
    } 
  
    navigator.geolocation.getCurrentPosition(success, error, options); 
} 
  
function getCity(coordinates) { 
    var xhr = new XMLHttpRequest(); 
    var lat = coordinates[0]; 
    var lng = coordinates[1]; 
  

    xhr.open('GET', "  https://us1.locationiq.com/v1/reverse.php?key=pk.7d3824cd94100d9ce73a34e90749db92&lat=" + lat + "&lon=" + lng + "&format=json", true); 
    xhr.send(); 
    xhr.onreadystatechange = processRequest; 
    xhr.addEventListener("readystatechange", processRequest, false); 
  
    function processRequest(e) { 
        if (xhr.readyState == 4 && xhr.status == 200) { 
            var response = JSON.parse(xhr.responseText); 
            var city = response.address.city; 
            getWeather(city)
            return; 
        } 
    } 
} 
  
getCoordintes()