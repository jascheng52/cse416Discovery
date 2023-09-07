import './App.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
/* global shp */

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
    const reader = new FileReader()

    reader.onload = (event) => {
      const shpBuffer = event.target.result
      console.log(shpBuffer instanceof ArrayBuffer)
      shp(shpBuffer).then( (convGeoJson) => {
        L.geoJSON(convGeoJson, {
          onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.name) {
              layer.bindPopup(feature.properties.name)
            }
          }
        }).addTo(map)
      }
      )
    }
    reader.readAsArrayBuffer(file)
    //
  }

  const handleKML = (file) => {
    initmap()
    //
  }

  const handleUnknownFile = (file) => {
    //
  }

  const handleFileChange = (event) => {
    const selected_file = event.target.files[0]
    const file_type = selected_file.name.split('.').pop().toLowerCase()

    switch (file_type) {
      // case 'shp':
      case 'zip':
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
      <input id="upload_file" type="file" accept=".zip, .json, .kml" onChange={handleFileChange} />
      <div id="map"></div>
    </>
  );
}

export default App;
