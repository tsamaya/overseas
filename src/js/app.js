//(function(L) {

// wire events
$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  //map.fitBounds(maxExtent);
  map.fitWorld();
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn2").click(function() {
  //map.fitBounds(maxExtent);
  map.fitWorld();
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

$("#list-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

// $(document).on("mouseover", ".feature-row", function(e) {
//   var layer = countriesLayer.getLayer($(this).attr('id'));
//   highlight.clearLayers().addLayer(L.multiPolygon(layer.feature.geometry.coordinates, highlightStyle));
// });

$(document).on("mouseout", ".feature-row", clearHighlight);

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
};

function clearHighlight() {
  highlight.clearLayers();
};

function sidebarClick(id) {
  var layer = countriesLayer.getLayer(id);
  map.fitBounds(layer.getBounds());
  layer.fire("click");
  // Hide sidebar and go to the map on small screens 
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
};

var isCollapsed = false;

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  isCollapsed = true;
}

/* Highlight search box text on click */
$("#searchbox").click(function() {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function(e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function(e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});



// load map, layers and basemap

var embassies = new L.LayerGroup();
var world = new L.LayerGroup();
var countriesLayer,  featureList, countrySearch = [];


$.getJSON('data/embassies.geojson', function(data) {
  var geojson = L.geoJson(data, {
    onEachFeature: onEachEmbassyFeature
  });
  //maxExtent = geojson.getBounds();
  //map.fitBounds(maxExtent);
  geojson.addTo(embassies);
});

$.getJSON('data/world3.geojson', function(data) {
  countriesLayer = L.geoJson(data, {
    style: styleCountry,
    onEachFeature: onEachCountryFeature
  });
  countriesLayer.addTo(world);
});

function layerCountryFeatureListContent(layer) {
  return '<tr class="feature-row" id="' + L.stamp(layer) + '"><td style="vertical-align: middle;"><i class="fa fa-bar-chart"></i></td><td class="feature-name">' + layer.feature.properties.name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>';
};

function onEachCountryFeature(feature, layer) {
  // does this feature have a property named name?
  // if (feature.properties && feature.properties.name) {
  //   layer.bindPopup(feature.properties.name);
  // }
  $("#feature-list tbody").append(layerCountryFeatureListContent(layer));
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToCountry
  });
  countrySearch.push({
    name: layer.feature.properties.name,
    address: layer.feature.properties.ADDRESS1,
    source: "Countries",
    id: L.stamp(layer),
    geom: layer.feature.geometry
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
    weight: 1,
    opacity: 0.4,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.4,
  };
};

function highlightFeature(e) {
  if (map._zoom < 8) {
    var layer = e.target;
    layer.setStyle({
      weight: 5,
      color: '#999',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
      layer.bringToFront();
    }
  }
  //info.update(layer.feature.properties);
};

function resetHighlight(e) {
  countriesLayer.resetStyle(e.target);
  //info.update();
};

function zoomToCountry(e) {
  map.fitBounds(e.target.getBounds());
};

var gray = L.esri.basemapLayer('DarkGray');
// ,
//   imagery = L.esri.basemapLayer('Imagery'),
//   topo = L.esri.basemapLayer('Topographic');

var map = L.map('leaflet-map', {
  center: [25, -8],
  zoom: 3,
  layers: [gray, world]
});

var baseLayers = {
  'Dark Gray': gray
    // ,
    // 'Topo': topo,
    // 'Imagery': imagery
};

var overlays = {
  'french embassies': embassies,
  'world countries': world
};

L.control.layers(baseLayers, overlays, {
  collapsed: false
}).addTo(map);

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function(e) {
  syncSidebar();
});


/* Clear feature highlight when map is clicked */
// map.on("click", function(e) {
//   highlight.clearLayers();
// });

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
      weight: 5,
  
  fillColor: "#FF0000",
  fillOpacity: 0.7
  
};

// var groupedOverlays = {
//   "Points of Interest": {
//     "<i class='fa fa-university'></i>&nbsp;": embassies
//   },
//   "Reference": {
//     "Countries": countriesLayer
//   }
// };

// var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
//   collapsed: isCollapsed
// }).addTo(map);

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through theaters layer and add only features which are in the map bounds */
  countriesLayer.eachLayer(function (layer) {
    if (map.hasLayer(countriesLayer)) {
      if (map.getBounds().intersects(layer.getBounds())) { 
        $("#feature-list tbody").append(layerCountryFeatureListContent(layer));
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
};

$(document).one("ajaxStop", function() {
  $("#loading").hide();

  var countriesBH = new Bloodhound({
    name: "Countries",
    datumTokenizer: function(d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: countrySearch,
    limit: 10
  });

  countriesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Countries",
    displayKey: "name",
    source: countriesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Countries</h4>"
    }
  }).on("typeahead:selected", function(obj, datum) {
    if (datum.source === "Countries") {
      if (!map.hasLayer(countriesLayer)) {
        map.addLayer(countriesLayer);
      }
      map.fitBounds(datum.geom.coordinates); // todo: improve
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function() {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function() {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});


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