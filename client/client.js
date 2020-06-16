    photos_dict = null
    sorted_popularity_list = null
    place_name_id_dict = null

    // This example uses the autocomplete feature of the Google Places API.
      // It allows the user to find all restaurants in a given place, within a given
      // country. It then displays markers for all the restaurants returned,
      // with on-click details for each restaurant.

      var map, places, infoWindow;
      var markers = [];
      var autocomplete;
      var countryRestrict = {'country': 'il'};
      var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
      var hostnameRegexp = new RegExp('^https?://.+?/');

      var countries = {
        'il':{
            center:{lat:31.2624181, lng:35.4093687},
            zoom:8
        },
        'au': {
          center: {lat: -25.3, lng: 133.8},
          zoom: 4
        },
        'br': {
          center: {lat: -14.2, lng: -51.9},
          zoom: 3
        },
        'ca': {
          center: {lat: 62, lng: -110.0},
          zoom: 3
        },
        'fr': {
          center: {lat: 46.2, lng: 2.2},
          zoom: 5
        },
        'de': {
          center: {lat: 51.2, lng: 10.4},
          zoom: 5
        },
        'mx': {
          center: {lat: 23.6, lng: -102.5},
          zoom: 4
        },
        'nz': {
          center: {lat: -40.9, lng: 174.9},
          zoom: 5
        },
        'it': {
          center: {lat: 41.9, lng: 12.6},
          zoom: 5
        },
        'za': {
          center: {lat: -30.6, lng: 22.9},
          zoom: 5
        },
        'es': {
          center: {lat: 40.5, lng: -3.7},
          zoom: 5
        },
        'pt': {
          center: {lat: 39.4, lng: -8.2},
          zoom: 6
        },
        'us': {
          center: {lat: 37.1, lng: -95.7},
          zoom: 3
        },
        'uk': {
          center: {lat: 54.8, lng: -4.6},
          zoom: 5
        }
      };
      function initMap() {
      //set the map and the info window
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: countries['il'].zoom,
          center: countries['il'].center,
          mapTypeControl: false,
          panControl: false,
          zoomControl: false,
          streetViewControl: false
        });

        infoWindow = new google.maps.InfoWindow({
          content: document.getElementById('info-content')
        });

        // Create the autocomplete object and associate it with the UI input control.
        // Restrict the search to the default country, and to place type "cities".
        autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */ (
                document.getElementById('autocomplete')), {
              types: ['(cities)'],
              componentRestrictions: countryRestrict
            });
        places = new google.maps.places.PlacesService(map);

        autocomplete.addListener('place_changed', onPlaceChanged);

        // Add a DOM event listener to react when the user selects a country.
        document.getElementById('country').addEventListener(
            'change', setAutocompleteCountry);
      }

      // When the user selects a city, get the place details for the city and
      // zoom the map in on the city.
      function onPlaceChanged() {
        var place = autocomplete.getPlace();
        if (place.geometry) {
          map.panTo(place.geometry.location);
          map.setZoom(15);
          search();
        } else {
          document.getElementById('autocomplete').placeholder = 'Enter a city';
        }
      }

      // Search for restaurant in the selected city, within the viewport of the map.
      // add the results and the markers to the map
      function search() {
        var search = {
          bounds: map.getBounds(),
          types: ['restaurant']
        };

        places.nearbySearch(search, function(results, status) {
            image_url_dict= getLocationIdUrlDict(results)
            console.log('sorted pop list')
            console.log(sorted_popularity_list)
          console.log('result')
          console.log(results)
          sorted_results = []
          for (var i=0;i <sorted_popularity_list.length; i++){
            placeId = sorted_popularity_list[i]

            for (var j =0;j<results.length;j++){
                console.log(results[j])
                res_name = results[j]['name']
                res_id = place_name_id_dict[res_name]
                if (res_id == placeId){
                    console.log('match')
                    console.log(results[j])
                    sorted_results.push(results[j])
                    break
                }

            }
          }
            console.log('sorted results')
          console.log(sorted_results)
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            clearResults();
            clearMarkers();
            // Create a marker for each restaurant found, and
            // assign a letter of the alphabetic to each marker icon.
            for (var i = 0; i < sorted_results.length; i++) {
              var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
              //var markerIcon = MARKER_PATH + markerLetter + '.png';
              var markerIcon = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
              // Use marker animation to drop the icons incrementally on the map.
              markers[i] = new google.maps.Marker({
                position: sorted_results[i].geometry.location,
                animation: google.maps.Animation.DROP,
                icon: markerIcon
              });
              // If the user clicks a restaurant marker, show the details of that restaurant
              // in an info window.
              markers[i].placeResult = sorted_results[i];
              google.maps.event.addListener(markers[i], 'click', showInfoWindow);
              setTimeout(dropMarker(i), i * 100);
              addResult(sorted_results[i], i);
            }
          }
            });
      }

      function clearMarkers() {
        for (var i = 0; i < markers.length; i++) {
          if (markers[i]) {
            markers[i].setMap(null);
          }
        }
        markers = [];
      }

      // Set the country restriction based on user input.
      // Also center and zoom the map on the given country.
      function setAutocompleteCountry() {
        var country = document.getElementById('country').value;
        if (country == 'all') {
          autocomplete.setComponentRestrictions({'country': []});
          map.setCenter({lat: 15, lng: 0});
          map.setZoom(2);
        } else {
          autocomplete.setComponentRestrictions({'country': country});
          map.setCenter(countries[country].center);
          map.setZoom(countries[country].zoom);
        }
        clearResults();
        clearMarkers();
      }

      function dropMarker(i) {
        return function() {
          markers[i].setMap(map);
        };
      }

      function addResult(result, i) {
      //get the result and the number of it
      //add the result to the map
        var results = document.getElementById('results');
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';
        //var markerIcon = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';
        var tr = document.createElement('tr');
        tr.style.backgroundColor = (i % 2 === 0 ? '#b0aac0' : '#c2d4dd');
        tr.onclick = function() {
          google.maps.event.trigger(markers[i], 'click');
        };

        var iconTd = document.createElement('td');
        var nameTd = document.createElement('td');
        var icon = document.createElement('img');
        icon.src = markerIcon;
        icon.setAttribute('class', 'placeIcon');
        icon.setAttribute('className', 'placeIcon');
        var name = document.createTextNode(result.name);
        iconTd.appendChild(icon);
        nameTd.appendChild(name);
        tr.appendChild(iconTd);
        tr.appendChild(nameTd);
        results.appendChild(tr);
      }

      function clearResults() {
        var results = document.getElementById('results');
        while (results.childNodes[0]) {
          results.removeChild(results.childNodes[0]);
        }
      }

      // Get the place details for a restaurant. Show the information in an info window,
      // anchored on the marker for the restaurant that the user selected.
      function showInfoWindow() {
        var marker = this;
        places.getDetails({placeId: marker.placeResult.place_id},
            function(place, status) {
              if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
              }
              infoWindow.open(map, marker);
              buildIWContent(place);

            });
      }

      // Load the place information into the HTML elements used by the info window.
      function buildIWContent(place) {
      //get a place and collect the urls of it to show in the info window, create a div with all the photos
//        console.log('place st')
        console.log(place["name"])
        document.getElementById('place_name').innerHTML = place["name"]
        place_id = place_name_id_dict[place["name"]]
        console.log(place_id)
        place_photo_urls = photos_dict[place_id]
        console.log(photos_dict)
        console.log(place_photo_urls)
        place_photo_size = 100 / place_photo_urls.length

        document.getElementById('image-container').innerHTML = " "
        for (var i = 0; i< place_photo_urls.length; i++){
            url = place_photo_urls[i]
            console.log(url)
            place_html = '<div class="column" style="width:'+place_photo_size +'%"><img src="'+ url +'" alt="Nature" style="width:100%" onclick="myFunction(this);"></div>'
            document.getElementById('image-container').innerHTML += place_html
        }
        myFunction({'src':place_photo_urls[0]})


//      place_photos = photos_dict[]

//        document.getElementById('iw-icon').innerHTML = '<img class="restaurantIcon" ' +
//            'src="' + place.icon + '"/>';
//        document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
//            '">' + place.name + '</a></b>';
//        document.getElementById('iw-address').textContent = place.vicinity;
//
//        if (place.formatted_phone_number) {
//          document.getElementById('iw-phone-row').style.display = '';
//          document.getElementById('iw-phone').textContent =
//              place.formatted_phone_number;
//        } else {
//          document.getElementById('iw-phone-row').style.display = 'none';
//        }

        // Assign a five-star rating to the restaurant, using a black star ('&#10029;')
        // to indicate the rating the restaurant has earned, and a white star ('&#10025;')
        // for the rating points not achieved.
//        if (place.rating) {
//          var ratingHtml = '';
//          for (var i = 0; i < 5; i++) {
//            if (place.rating < (i + 0.5)) {
//              ratingHtml += '&#10025;';
//            } else {
//              ratingHtml += '&#10029;';
//            }
//          document.getElementById('iw-rating-row').style.display = '';
//          document.getElementById('iw-rating').innerHTML = ratingHtml;
//          }
//        } else {
//          document.getElementById('iw-rating-row').style.display = 'none';
//        }

        // The regexp isolates the first part of the URL (domain plus subdomain)
        // to give a short URL for displaying in the info window.
//        if (place.website) {
//          var fullUrl = place.website;
//          var website = hostnameRegexp.exec(place.website);
//          if (website === null) {
//            website = 'http://' + place.website + '/';
//            fullUrl = website;
//          }
//          document.getElementById('iw-website-row').style.display = '';
//          document.getElementById('iw-website').textContent = website;
//        } else {
//          document.getElementById('iw-website-row').style.display = 'none';
//        }
      }

      function getLocationIdUrlDict(locations_object){
        console.log(locations_object)
        locations_names_list = locations_object.map(x => x.name);
        console.log(locations_names_list)
        location_id_dict = getPhotosUrlByName(locations_names_list);
        console.log(location_id_dict)
        return location_id_dict
      }


      function getPhotosUrlByName(names){
      // get: list of names , send it to the server in post request
      //return: dictionary of photos url under ids
           var location_ids = []
          $.ajax
          ({
                type: "POST",
                //the url where you want to sent the userName and password to
                url: 'http://127.0.0.1:5000/locationByName',
                dataType: 'json',
                async: false,
                //json object to sent to the authentication url
                data: JSON.stringify({'names':names}),
                dataType: 'json',
                contentType: 'application/json',
                success: function (data, status) {
                    place_name_id_dict = data
                    console.log('dict values')
                    console.log(Object.values(place_name_id_dict))
                    $.ajax({
                        type: "POST",
                        url: 'http://127.0.0.1:5000/getPhotosFromLocations',
                        dataType: 'json',
                        async: false,
                        //json object to sent to the authentication url
                        data: JSON.stringify({'places': Object.values(place_name_id_dict)}),
                        dataType: 'json',
                        contentType: 'application/json',
                        success: function (data, status) {
                            console.log('fetching photos')
                            console.log(data)
                            photos_dict = data['place_posts_dict']
                            sorted_popularity_list =  data['place_popularity_dict']

                        }
                    })
                }
            })
            return photos_dict
      }