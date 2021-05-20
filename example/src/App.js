import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

import Atlas from 'diachronic-atlas'

import style from './style.json'
import geojson from './cone.json'
import documents from './documents.json'

const App = () => {
  return (
  <Atlas 
    mapStyle={style}
    year={1980}
    basemapHandler={ssid => console.log(ssid)} 
    // geojson={geojson}
    viewport={{
      latitude: -22.90415,
      longitude: -43.17425,
      zoom: 15
    }}
    viewpoints={documents}
    viewIcon={<FontAwesomeIcon icon={faCamera}/>}
    circleMarkers
  />)
}

export default App
