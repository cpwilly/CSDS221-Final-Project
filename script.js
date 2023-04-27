// Declare and initialize global variables
var clicksCount = 0;
var sunkenShipsCount = 0;

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
var shipSize = urlParams.get('size');

// Object 'typical' with different functions
var typical = {
  // Function to fire a shot and update the game state
  fireShot: function (guess) {
    // Iterate through each ship in the array
    for (var i = 0; i < this.shipQuant; i++) {
      var ship = this.ships[i];
      var index = ship.locations.indexOf(guess);

      // If the position has already been hit, display appropriate message on the banner
      if (ship.hits[index] === 'hit') {
        view.banner('You already hit this part of the ship');
        return true;
      }
      // If the position is a hit, update ship hits, display hit message on banner and check if the ship is sunk
      else if (index >= 0) {
        ship.hits[index] = 'hit';
        view.beenHit(guess);
        view.banner('You hit part of a ship!');

        if (this.isSunk(ship)) {
          view.banner('You sunk a ship!');
          this.shipsSunk++;
          sunkenShipsCount = this.shipsSunk;
          document.getElementById('shipsSunk').innerHTML = sunkenShipsCount;
          document.getElementById('shipsLeft').innerHTML =
            this.shipQuant - sunkenShipsCount;
        }
        return true;
      }
    }
    // If the position is a miss, display miss message
    view.missed(guess);
    view.banner('No Ship');
    return false;
  },

  // Function to check if a ship is sunk
  isSunk: function (ship) {
    for (var i = 0; i < this.shipLength; i++) {
      if (ship.hits[i] !== 'hit') {
        return false;
      }
    }
    return true;
  },

  // Function to randomly generate ship locations
  shipSpawn: function () {
    var locations;
    console.log('genShipLocations');
    for (var i = 0; i < this.shipQuant; i++) {
      do {
        locations = this.generateShip();
      } while (this.doubleShip(locations));
      this.ships[i].locations = locations;
    }
  },

  // Function to generate a single ship's location
  generateShip: function () {
    console.log('genShip');
    var direction = Math.floor(Math.random() * 2);
    var row, col;

    if (direction === 1) {
      row = Math.floor(Math.random() * 7);
      col = Math.floor(Math.random() * (9 - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (7 - this.shipLength));
      col = Math.floor(Math.random() * 9);
    }

    var locateNewShip = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        locateNewShip.push(row + '' + (col + i));
      } else {
        locateNewShip.push(row + i + '' + col);
      }
    }
    return locateNewShip;
  },

  // Function to check if there is are two ships together
  doubleShip: function (locations) {
    for (var i = 0; i < this.shipQuant; i++) {
      var ship = this.ships[i];
      for (var j = 0; j < locations.length; j++) {
        if (ship.locations.indexOf(locations[j]) >= 0) {
          return true;
        }
      }
    }
    return false;
  },

  // Declare and initialize object properties
  shipQuant: 3,
  shipLength: shipSize,
  shipsSunk: 0,
  ships: [
    { locations: [0, 0, 0], hits: ['', '', ''] },
    { locations: [0, 0, 0], hits: ['', '', ''] },
    { locations: [0, 0, 0], hits: ['', '', ''] },
  ],
};

// Object 'view' with different display functions
var view = {
  // Function to display a message
  banner: function (msg) {
    var banner = document.getElementById('banner');
    banner.innerHTML = msg;
  },

  // Function to update the game board when a ship has been hit
  beenHit: function (location) {
    var hitCell = document.getElementById(location);
    hitCell.classList.add('hit');
    hitCell.innerHTML = '<i class="fa fa-bomb"></i>';

    // Check if the ship is sunk and update the game board accordingly
    var sunkShips = typical.ships.filter(function (ship) {
      return ship.locations.indexOf(location) !== -1 && typical.isSunk(ship);
    });
    sunkShips.forEach(function (ship) {
      ship.locations.forEach(function (shipLocation) {
        var sunkCell = document.getElementById(shipLocation);
        sunkCell.classList.add('sunk');
        sunkCell.setAttribute('class', 'sunk');
        sunkCell.innerHTML = '<i class="fa fa-ship"></i>';
      });
    });
  },

  // Function to display a miss on the game board
  missed: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute('class', 'miss');
    cell.innerHTML = '<i class="fas fa-times"></i>';
  },
};

// Object 'controller' with different game logic functions
var controller = {
  guesses: 0,
  userClicked: function (location) {
    console.log(this.guesses);
    if (location) {
      this.guesses++;
      clicksCount++;
      var scoreKeep = document.getElementById('score');
      scoreKeep.innerHTML = clicksCount;
      var hit = typical.fireShot(location);

      // Check if all ships are sunk and display win message
      if (sunkenShipsCount == typical.shipQuant) {
        view.banner('You Win! Check Score Below!');
        document.getElementById('block').style.visibility = 'visible';
        document.getElementById('scoreboard').style.zIndex = '999';
        document.getElementById('restartButton').setAttribute('class', 'redo');
      }
    }
  },
};

// Function to initialize the game
function init() {
  console.log('start');
  document.getElementById('shipSize').innerHTML = shipSize;

  // Attach click event handler to all td elements
  var guessClick = document.getElementsByTagName('td');
  for (var i = 0; i < guessClick.length; i++) {
    guessClick[i].addEventListener('click', answer);
  }

  // Update shipsLeft element with remaining ship count
  var shipsLeft = document.getElementById('shipsLeft');
  shipsLeft.innerHTML = typical.shipQuant - sunkenShipsCount;

  // Generate ship locations and display initial message
  typical.shipSpawn();
  view.banner('Begin by clicking on a position!');
}

// Function to handle a player's guess
function answer(eventObj) {
  console.log('ans');
  var shot = eventObj.target;

  var location = shot.id;
  controller.userClicked(location);
}

// Function to restart the game
function restart() {
  location.reload();
}

// Initialize the game when the page is loaded
window.onload = init;
