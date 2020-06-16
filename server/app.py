import gevent
import grequests
import requests
import instaloader
import datetime as DT
from flask_cors import CORS
from flask import Flask,request,jsonify,make_response
app = Flask(__name__)
CORS(app)

L = instaloader.Instaloader(
    save_metadata=False,
    download_comments=False,
    download_geotags=False,
    post_metadata_txt_pattern="",
)
L.login("new_for_project", "Newwwwww")

@app.route("/")
def hello():
    return "Hello World!"

@app.route('/locationByName', methods = ['POST'])
def getLocationsIdsByNameAsync():
    places_id_dict = {}
    place_id = -1

    data = request.json
    names_places_list = data["names"]
    formatted_list = [name.replace(" ", "+") for name in names_places_list]
    base_url = "https://www.instagram.com/web/search/topsearch/?context=blended&query={0}&rank_token=0.5023642331809408&include_reel=true"
    urls_formatted_list = [base_url.format(x) for x in formatted_list]

    rs = (grequests.get(u) for u in urls_formatted_list)
    map_res = grequests.map(rs)

    json_response_list = [x.json() for x in map_res]
    for json_response, place_name in zip(json_response_list, names_places_list):
        resp_places_list = json_response["places"]

        if resp_places_list and len(resp_places_list) > 0:
            place = resp_places_list[0]
            place_id = place["place"]["location"]["pk"]
            # id_places_list.append(place_id)
            places_id_dict[place_name] = place_id

    return jsonify(places_id_dict)

@app.route('/getPhotosFromLocations', methods = ['POST'])
def getPhotosFromLocations():
    #get: json file with a dictionary of location ids and names of the places
    #return:json files with an object with dictionary  of url photos and the id of the location an dictionary of counter under location ids
    response_object =  {}
    data = request.json
    places_ids = data['places']
   # places_ids = places_ids[:3]
    place_posts_dict = {}#save all the url under the ids
    place_popularity_dict = {}#save all the counters under the ids
    min_likes = 50
    min_count = 5
    photos_count = 0
    selected_posts_count = 0
    for place_id in places_ids:
        selected_posts = []
        posts_iterator = L.get_location_posts(location= place_id)

        for p in posts_iterator:
            photos_count += 1

            if p.likes >= min_likes:
                selected_posts_count += 1
                selected_posts.append(p)
                if len(selected_posts) == min_count:
                    break
        if selected_posts_count != 0: #to delete places with no photos
            place_popularity_dict[place_id] = photos_count
            place_posts_dict[place_id] = [x.url for x in selected_posts]
        print (photos_count)
        selected_posts_count = 0
        photos_count = 0
    response_object['place_posts_dict'] = place_posts_dict
    response_object['place_popularity_dict'] = sorted(place_popularity_dict.keys())
    return jsonify(response_object)


if __name__ == "__main__":
    app.run()
