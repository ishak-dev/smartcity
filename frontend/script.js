'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const containerOptions = document.querySelector('.options');
let editBtn;
let deleteBtn;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, duration, description) {
    this.coords = coords; // [lat, lng]
    this.duration = duration; //in min
    this.description = description;
  }

  click() {
    this.clicks++;
  }
}

class Kultura extends Workout {
  type = 'kultura';
  constructor(coords, duration, description) {
    super(coords, duration, description);
  }
}
class Radovi extends Workout {
  type = 'radovi';
  constructor(coords, duration, description) {
    super(coords, duration, description);
  }
}
class Saobracaj extends Workout {
  type = 'saobracaj';
  constructor(coords, duration, description) {
    super(coords, duration, description);
  }
}
class Eventi extends Workout {
  type = 'eventi';
  constructor(coords, duration, description) {
    super(coords, duration, description);
  }
}

const kultura1 = new Kultura([43.8589727, 18.4179311], '3d');
const radovi1 = new Radovi([39, -12], '20h');
//console.log(kultura1, radovi1);

/////////////////////////////////////////////////////////////
//APLICATION ARHITECTURE
class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  #dataSet;
  latLng;

  constructor() {
    //Get users position
    this._getPosition();

    //Get data from local storage
    //this._getLocalStorage();
    //Attach event handlers
    //form.addEventListener('submit', this._newWorkout.bind(this));
    window.onload = this._getData();
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    //containerWorkouts.addEventListener('click', this._showOption.bind(this));
    containerOptions.addEventListener('click', this._filterData.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('could not get your position');
        }
      );
  }

  _loadMap(position) {
    //console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    //console.log(latitude, longitude);
    //console.log(`https://www.google.com/maps/@${latitude},${longitude}z`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on map
    //this.#map.on('click', this._showForm.bind(this));
    //this.#map.addEventListener('click', this._setMarker.bind(this));

    //Load map
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
      this._renderWorkoutMarker(work);
    });
  }

  _getCoordinates(coords) {
    const { lat, lng } = coords;
    return [lat, lng];
  }

  setedMarker = [0, 0];

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _getData() {
    const getJSON = function (url) {
      return fetch(url).then(response => response.json());
    };
    getJSON(`rest/home`).then(data => {
      console.log(data.length);
      data.forEach(d => {
        this._newWorkout(d);
      });
      //
    });
  }
  _newWorkout(data) {
    //  const validInputs = (...inputs) => inputs.every(inp => inp != ''); //Number.isFinite(inp));

    //const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = data.type;
    const coords = [data.lat, data.lng];
    const time = data.Time;
    const description = data.TweetText;
    let workout;
    //Check if data is valid

    //If activity running, create running object
    if (type === 'kultura') {
      workout = new Kultura(coords, time, description);
    }

    if (type === 'radovi') {
      workout = new Radovi(coords, time, description);
    }
    if (type === 'saobracaj') {
      workout = new Saobracaj(coords, time, description);
    }
    if (type === 'eventi') {
      workout = new Eventi(coords, time, description);
    }
    //Add new object to workout array
    this.#workouts.push(workout);

    //Delete seted(position) Marker
    this.#map.removeLayer(this.setedMarker);

    //Render workout on map as marker
    //display marker
    this._renderWorkoutMarker(workout);

    //Render workout on list
    this._renderWorkout(workout);

    // Set local storage to all workouts
    //this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    let color = 'blue';
    if (workout.type == 'radovi') color = 'blue';
    else if (workout.type == 'kultura') color = 'green';
    else if (workout.type == 'saobracaj') color = 'red';
    else if (workout.type == 'eventi') color = 'purple';
    var myIcon = L.AwesomeMarkers.icon({
      markerColor: color,
    });
    L.marker(workout.coords, {
      icon: myIcon,
    })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `(${workout.type.toUpperCase()}) ${workout.description.substring(
          0,
          30
        )}...`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
    <li class="workout ${workout.type}" data-id="${workout.id}" type="${
      workout.type
    }">
    <div class="description">
      <p>
        ${workout.description}
      </p>
    </div>
    <br />
    <hr />
    <br />
    <div class="duration">
      <p> ${
        workout.type == ('kultura' || 'eventi')
          ? 'Vrijeme izvodjenja '
          : 'Rješavanje problema u narednih '
      }: <span class="time">${workout.duration}</span></p>
    </div>
  </li>

    `;

    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest('.workout');

    console.log(workoutEl);

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });

    this.#dataSet = workoutEl.dataset.id;
    //using the public interface
    //workout.click();
  }

  _showOption(e) {
    let workoutID = this.#dataSet;

    deleteBtn = e.target.closest('.delete__btn');
    editBtn = e.target.closest('.edit__btn');
    //remove old popUp
    const allOptions = document.querySelectorAll('.options');
    allOptions.forEach(option => option.classList.add('btn__hidden'));

    //show options for this popUp
    //console.log(workoutID);
    let addId = document.querySelector(`.options-${workoutID}`);

    if (!addId) return;
    addId.classList.remove('btn__hidden');

    //console.log(clickedButton);
    //console.log(options.dataset.id);
    let positionArray = this.#workouts
      .map(workout => workout.id)
      .indexOf(workoutID);
    console.log(positionArray);

    if (!deleteBtn) return;
    deleteBtn.addEventListener('click', this._deleteWork(positionArray));
  }

  _deleteWork(positionArray) {
    console.log(this.#workouts[positionArray].coords);
    this.#map.removeLayer([43.83390764535554, 18.28968310970687]);
    this.#workouts.splice(positionArray, 1);
    document.querySelector(`[data-id="${this.#dataSet}"]`).remove();

    let pos = positionArray;
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  #data;
  /*  _getLocalStorage() {
    this.#data = JSON.parse(localStorage.getItem('workouts'));
    //console.log(data);
    if (!this.#data) return;

    this.#workouts = this.#data;
  } */
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }

  removeFromStorage(pos) {
    delete this.#data[0];
    //console.log(data);

    location.reload();
  }

  _filterData(e) {
    const type = e.target.closest('.option');
    console.log(type);
    const allWorkouts = document.querySelectorAll('.workout');
    allWorkouts.forEach(option => {
      console.log(option.type, type);
      if (type.id == 'all') {
        option.classList.remove('btn__hidden');
      } else if (option.type != type.id) {
        option.classList.add('btn__hidden');
      } else option.classList.remove('btn__hidden');
    });
  }
}

const app = new App();

///// CODE FOR MARKER
////////////////////////////////////////////////////////////////////
/*
  Leaflet.AwesomeMarkers, a plugin that adds colorful iconic markers for Leaflet, based on the Font Awesome icons
  (c) 2012-2013, Lennard Voogdt

  http://leafletjs.com
  https://github.com/lvoogdt
*/

/*global L*/

(function (window, document, undefined) {
  'use strict';
  /*
   * Leaflet.AwesomeMarkers assumes that you have already included the Leaflet library.
   */

  L.AwesomeMarkers = {};

  L.AwesomeMarkers.version = '2.0.1';

  L.AwesomeMarkers.Icon = L.Icon.extend({
    options: {
      iconSize: [35, 45],
      iconAnchor: [17, 42],
      popupAnchor: [1, -32],
      shadowAnchor: [10, 12],
      shadowSize: [36, 16],
      className: 'awesome-marker',
      prefix: 'glyphicon',
      spinClass: 'fa-spin',
      extraClasses: '',
      icon: 'home',
      markerColor: 'blue',
      iconColor: 'white',
    },

    initialize: function (options) {
      options = L.Util.setOptions(this, options);
    },

    createIcon: function () {
      var div = document.createElement('div'),
        options = this.options;

      if (options.icon) {
        div.innerHTML = this._createInner();
      }

      if (options.bgPos) {
        div.style.backgroundPosition =
          -options.bgPos.x + 'px ' + -options.bgPos.y + 'px';
      }

      this._setIconStyles(div, 'icon-' + options.markerColor);
      return div;
    },

    _createInner: function () {
      var iconClass,
        iconSpinClass = '',
        iconColorClass = '',
        iconColorStyle = '',
        options = this.options;

      if (
        options.icon.slice(0, options.prefix.length + 1) ===
        options.prefix + '-'
      ) {
        iconClass = options.icon;
      } else {
        iconClass = options.prefix + '-' + options.icon;
      }

      if (options.spin && typeof options.spinClass === 'string') {
        iconSpinClass = options.spinClass;
      }

      if (options.iconColor) {
        if (options.iconColor === 'white' || options.iconColor === 'black') {
          iconColorClass = 'icon-' + options.iconColor;
        } else {
          iconColorStyle = "style='color: " + options.iconColor + "' ";
        }
      }

      return (
        '<i ' +
        iconColorStyle +
        "class='" +
        options.extraClasses +
        ' ' +
        options.prefix +
        ' ' +
        iconClass +
        ' ' +
        iconSpinClass +
        ' ' +
        iconColorClass +
        "'></i>"
      );
    },

    _setIconStyles: function (img, name) {
      var options = this.options,
        size = L.point(options[name === 'shadow' ? 'shadowSize' : 'iconSize']),
        anchor;

      if (name === 'shadow') {
        anchor = L.point(options.shadowAnchor || options.iconAnchor);
      } else {
        anchor = L.point(options.iconAnchor);
      }

      if (!anchor && size) {
        anchor = size.divideBy(2, true);
      }

      img.className = 'awesome-marker-' + name + ' ' + options.className;

      if (anchor) {
        img.style.marginLeft = -anchor.x + 'px';
        img.style.marginTop = -anchor.y + 'px';
      }

      if (size) {
        img.style.width = size.x + 'px';
        img.style.height = size.y + 'px';
      }
    },

    createShadow: function () {
      var div = document.createElement('div');

      this._setIconStyles(div, 'shadow');
      return div;
    },
  });

  L.AwesomeMarkers.icon = function (options) {
    return new L.AwesomeMarkers.Icon(options);
  };
})(this, document);
