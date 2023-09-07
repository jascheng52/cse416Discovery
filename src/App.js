import './App.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { kml } from '@tmcw/togeojson';

function App() {
  let map // map container

  const initmap = () => {
    if (map) {
      map.eachLayer((layer) => {
        map.removeLayer(layer)
      })

      map.remove()
    }
    map = L.map('map').setView([0, 0], 2) // initialize map with zoom level 2
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)
  }

  const handleGeoJSON = (file) => {
    initmap()
    const reader = new FileReader()
    reader.onload = (event) => {
      const geojson = JSON.parse(event.target.result)
      L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(feature.properties.name)
          }
        }
      }).addTo(map)
    }

    reader.readAsText(file)
  }

  const handleShapeFile = (file) => {
    initmap()
    //
  }

  const handleKML = (file) => {
    initmap()
    const reader = new FileReader()
    reader.onload = (event) => {
      const kmlText = event.target.result
      const kmlParser = new DOMParser();
      const kmlDocument = kmlParser.parseFromString(kmlText, 'text/xml');
      const geojson = kml(kmlDocument);
      L.geoJSON(geojson, {
        onEachFeature: function (feature, layer) {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(feature.properties.name)
          }
        }
      }).addTo(map)
    }
    reader.readAsText(file)
  }

  const handleUnknownFile = (file) => {
    //
  }

  const handleFileChange = (event) => {
    const selected_file = event.target.files[0]
    const file_type = selected_file.name.split('.').pop().toLowerCase()

    switch (file_type) {
      case 'shp':
        handleShapeFile(selected_file)
        break
      case 'json':
        handleGeoJSON(selected_file)
        break
      case 'kml':
        handleKML(selected_file)
        break
      default:
        handleUnknownFile(selected_file)
    }
  }


  return (
    <>
      <input id="upload_file" type="file" accept=".shp, .json, .kml" onChange={handleFileChange} />
      <div id="map"></div>
    </>
  );
}

export default App;
