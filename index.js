/**
 * this is the structure for our house. Each house has a name and will also
 * have a bunch of different rooms which will be in an array.
 */
class House {
    constructor(name) {
        this.name = name;
        this.rooms = [];
    }
    //method that pushes new rooms into the rooms array.
    addRoom(name, area){
        this.rooms.push(new Room(name, area));
    }
}

/**
 * this is the structure for each room which. Each name will have a name and
 * it will also have an area measurement.
 */
class Room {
    constructor(name, area) {
        this.name = name;
        this.area = area;
    }
}

/**
 * this is the serivce or how we will be sending the http requests.
 */
class HouseService {
    static url = "https://ancient-taiga-31359.herokuapp.com/api/houses";        //this is the root url for all the end points we are going to call in the API

    //this will return all of the houses. the this.url refers to the url above.
    static getAllHouses() {
        return $.get(this.url);
    }

    //this will return a specific house. the id represents the specific house we want to return from the API.
    static getHouse(id) {
        return $.get(this.url + `/${id}`);
    }

    //this will allow us to create a house it takes a house(instance of the house class) and will post it to the API.
    static createHouse(house) {
        return $.post(this.url, house);
    }

    //this will allow us to update the items as needed.
    static updateHouse(house) {
        return $.ajax({
            url: this.url + `/${house._id}`,    //since we are passing in a house we are going to use the ID of that house to tell the API which house we want to update in the database. The underscore is used because thats the calue the database will automatically create for out house
            dataType: 'json',
            data: JSON.stringify(house),        //JSON.stringify will take an object and its going to convert it into a JSON string for sending it through the HTTP request and that JSON object is the house that is passed into the parameter.
            contentType: 'application/json',
            type: 'PUT'                         //this is the type of method we use.
        });
    }

    //this will allow us to delete the items as needed. the only thing we need is the id parameter
    static deleteHouse(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

/**
 * This is the DOM manager class which is where all the hard work is going to 
 * happen to rerender our DOM each time we create  a new class
 */


class DOMManager {
    static houses;
    //this method will call the get all houses method inside of our houseservices and then it is going
    //to render them to the DOM
    static getAllHouses() {
        HouseService.getAllHouses().then(houses => this.render(houses));
    }

    static createHouse(name) {
        HouseService.createHouse(new House(name))
         .then(() => {
             return HouseService.getAllHouses();
         })
         .then((houses) => this.render(houses));
    }

    static deleteHouse(id) {
        HouseService.deleteHouse(id)
        .then(() => {
            return HouseService.getAllHouses();
        })
        .then((houses) => this.render(houses));
    }

    static addRoom(id) {
        for(let house of this.houses) {
            if(house._id == id) {
              house.rooms.push(new Room($(`#${house._id}-room-name`).val(), $(`#${house._id}-room-area`).val()));
              HouseService.updateHouse(house) 
              .then(() => {
                  return HouseService.getAllHouses();
              })
              .then((houses) => this.render(houses));
            }   
        }
    }

    static deleteRoom(houseId, roomId) {
        for(let house of this.houses) {
            if(house._id == houseId) {
                for(let room of house.rooms) {
                    if(room._id ==roomId) {
                        house.rooms.splice(house.rooms.indexOf(room), 1);
                        HouseService.updateHouse(house)
                            .then(() => {
                                return HouseService.getAllHouses();
                            })
                            .then((houses) => this.render(houses));
                    }
                }
            }
        }
    }

    static render(houses){
        this.houses = houses;
        $('#app').empty();
        for(let house of houses) {
            $('#app').prepend(
                `<div id="${house._id}" class="card">
                    <div class="card-header">
                        <h2>${house.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteHouse('${house._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${house._id}-room-name" class="form-control" placeholder="Room Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${house._id}-room-area" class="form-control" placeholder="Room Area">
                                </div>
                            </div>
                            <button id="${house._id}-new-room" onclick="DOMManager.addRoom('${house._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div>` 
            );
            for(let room of house.rooms){
                $(`#${house._id}`).find('.card-body').append(
                  `<p>
                      <span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
                      <span id="name-${room._id}"><strong>Name: </strong> ${room.area}</span>
                      <button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house._id}', '${room._id}')">Delete Room</button>
                      `
                );
            }
        }
    }

}


$('#create-new-house').click(() => {
    DOMManager.createHouse($('#new-house-name').val())
    $('#new-house-name').val('');
});

DOMManager.getAllHouses();