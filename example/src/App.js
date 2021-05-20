import React, { useState, useEffect } from 'react'
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

import Atlas, { getLegend } from 'diachronic-atlas'

import style from './style.json'
import geojson from './cone.json'
import documents from './documents.json'

const App = () => {
  const [layers, setLayers] = useState(null);
  const [legend, setLegend] = useState(null);

  if(!layers) axios.get('https://search.imaginerio.org/layers/').then(({ data }) => setLayers(data));

  useEffect(() => {
    if(layers){
      setLegend(layers.map(layer=>({
        ...layer,
        types: layer.types.map(type => getLegend({ layer, type, style }))
      })))
    }
  }, [layers])

  return (
    <div>
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
      />
      <pre>{JSON.stringify(legend, null, 2)}</pre>
    </div>
  )
}

export default App
