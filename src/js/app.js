//(function(L) {

// wire events
$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(maxExtent);
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});


$(document).one("ajaxStop", function() {
  $("#loading").hide();
});

// load map, layers and basemap

var embassies = new L.LayerGroup();
var world = new L.LayerGroup();
var countries;
var maxExtent = 0;

$.getJSON('data/embassies.geojson', function(data) {
  var geojson = L.geoJson(data, {
    onEachFeature: onEachEmbassyFeature
  });
  maxExtent = geojson.getBounds();
  //map.fitBounds(maxExtent);
  geojson.addTo(embassies);
});

$.getJSON('data/world.geojson', function(data) {
  countries = L.geoJson(data, {
    style: styleCountry,
    onEachFeature: onEachCountryFeature
  });
  countries.addTo(world);
});



function onEachCountryFeature(feature, layer) {
  // does this feature have a property named name?
  // if (feature.properties && feature.properties.name) {
  //   layer.bindPopup(feature.properties.name);
  // }
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToCountry
  });
};

function onEachEmbassyFeature(feature, layer) {
  // does this feature have a property named Pays?
  if (feature.properties && feature.properties.Pays) {
    layer.bindPopup(feature.properties.Pays + zoomlink(layer));
  }
};

function zoomlink(layer) {
  var ret = '<br /><br /><a href="#" onclick="zoomTo(' + layer._latlng.lat + ',' + layer._latlng.lng + ');">zoom</a>';
  return ret;
};

function zoomTo(lat, lon) {
  map.setView(L.latLng(lat, lon), 10);
};


function styleCountry(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    //fillColor: getColor(feature.properties.density)
  };
};

function highlightFeature(e) {
  if (map._zoom < 8) {
    var layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.8
    });

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }
  //info.update(layer.feature.properties);
};

function resetHighlight(e) {
  countries.resetStyle(e.target);
  //info.update();
};

function zoomToCountry(e) {
  map.fitBounds(e.target.getBounds());
};

var gray = L.esri.basemapLayer('DarkGray'),
  imagery = L.esri.basemapLayer('Imagery'),
  topo = L.esri.basemapLayer('Topographic');

var map = L.map('leaflet-map', {
  center: [25, -8],
  //center: [45.19613, 5.76465],
  zoom: 3,
  layers: [gray, world]
});

var baseLayers = {
  'Gray': gray,
  'Topo': topo,
  'Imagery': imagery
};

var overlays = {
  'french embassies': embassies,
  'world countries': world
};

L.control.layers(baseLayers, overlays, {
  collapsed: false
}).addTo(map);


// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
    .disableClickPropagation(container)
    .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}

//})(L);