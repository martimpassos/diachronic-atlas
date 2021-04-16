import React from 'react'

import Atlas from 'diachronic-atlas'

import style from './style.json'
import geojson from './cone.json'
import 'diachronic-atlas/dist/index.css'

const App = () => {
  return (
  <Atlas 
    mapStyle={style}
    year={1950} 
    basemapHandler={() => {}} 
    geojson={geojson}
    viewport={{
      latitude: 29.74991,
      longitude: -95.36026,
      zoom: 11
    }} 
  />)
}

export default App
