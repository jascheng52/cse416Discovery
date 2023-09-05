import React from 'react'

const FileUploader = () => {
  const handleFileChange = (event) => {
    const selected_file = event.target.files[0]
    if (selected_file) {
      // process file
    }
  }
  return (
    <input id="upload_file" type="file" accept=".shp, .geojson, .kml" onChange={handleFileChange} />
  )
}

export default FileUploader