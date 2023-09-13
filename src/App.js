import './App.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { kml } from '@tmcw/togeojson';
import JSZip from 'jszip'
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
    const shpConverter = new FileReader()

    reader.onload = (event) => {
      const shpBuffer = event.target.result
      shp(shpBuffer).then( (convGeoJson) => {
        L.geoJSON(convGeoJson, {
          style: function (feature) {
            return {
              color: 'pink', 
              fillOpacity: 0.05,
            };
          },
          onEachFeature: function (feature, layer) {
            if (feature.properties && feature.properties.name) {
              layer.bindPopup(feature.properties.name);
              // Add a label to the center of each feature
              const center = layer.getBounds().getCenter();
              L.marker(center, {
                icon: L.divIcon({
                  className: 'label-icon',
                  html: `<div>${feature.properties.name}</div>`,
                }),
              }).addTo(map)
            }
          },
        }).addTo(map)
      })
    }
    shpConverter.onload = (event) => {
      const shpBufferZip = event.target.result
      const zip = new JSZip();
      zip.file(file.name, shpBufferZip)
      zip.generateAsync({type: 'blob'})
      .then((blob) =>{
        reader.readAsArrayBuffer(blob)
      }
      )
    }

    /*Library only accepts zip files so if given individual shp convers it to zip first */
    if(file.name.split('.').pop().toLowerCase() == "shp")
      shpConverter.readAsArrayBuffer(file)
    else
      reader.readAsArrayBuffer(file)
    
    
  }

  const handleKML = (file) => {
    initmap();
    const reader = new FileReader();
    reader.onload = (event) => {
      const kmlText = event.target.result;
      const kmlParser = new DOMParser();
      const kmlDocument = kmlParser.parseFromString(kmlText, 'text/xml');
      const geojson = kml(kmlDocument);
  
      L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => {
          if (feature.properties && feature.properties.icon) {

            const icon = L.icon({
              iconUrl: feature.properties.icon,
              iconSize: [32, 32], 
            });
            return L.marker(latlng, { icon });
          }
          return L.circleMarker(latlng); 
        },
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.name) {
            layer.bindPopup(feature.properties.name);
          }
        },
      }).addTo(map);
    };
    reader.readAsText(file);
  };
  

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
      <input id="upload_file" type="file" accept=".zip, .json, .kml, .shp" onChange={handleFileChange} />
      <div id="map"></div>
    </>
  );
}

export default App;
