//(function(L) {
var embassies = new L.LayerGroup();

$.getJSON('data/embassies.geojson', function(data) {
  var geojson = L.geoJson(data, {
    // style: function(feature) {
    //   return {
    //     color: feature.properties.color
    //   };
    // },
    onEachFeature: onEachFeature
  });
  map.fitBounds(geojson.getBounds());
  geojson.addTo(embassies);
});

function onEachFeature(feature, layer) {
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

var gray = L.esri.basemapLayer('DarkGray'),
  imagery = L.esri.basemapLayer('Imagery'),
  topo = L.esri.basemapLayer('Topographic');

var map = L.map('leaflet-map', {
  center: [45.19613, 5.76465],
  zoom: 4,
  layers: [gray]
});

var baseLayers = {
  'Gray': gray,
  'Topo': topo,
  'Imagery': imagery
};

var overlays = {
  'embassies': embassies
};

L.control.layers(baseLayers, overlays, {
  collapsed: false
}).addTo(map);

 L.control.navbar().addTo(map);
//})(L);
