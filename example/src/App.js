import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { ChakraProvider, Box } from '@chakra-ui/react';

import { Atlas, getLegend } from 'diachronic-atlas';

import style from './style.json';
import cone from './cone.json';
import documents from './documents.json';

const App = () => {
  const [layers, setLayers] = useState(null);
  const [legend, setLegend] = useState(null);
  const [highlightedLayer, setHighlightedLayer] = useState(null);
  const [heading, setHeading] = useState(0);
  const [geojson, setGeoJson] = useState([{id: 'asdlkjldlkj', data: cone, paint: { 'fill-color': 'rgba(0,0,0,0.25)' }}]);

  // setTimeout(() => {
  //   setGeoJson([{id: 'testjson', data: cone, paint: { 'fill-color': 'rgba(0,0,0,0.25)' }}]);
  // }, 3000);

  if (!layers)
    axios.get('https://search.imaginerio.org/layers/').then(({ data }) => setLayers(data));

  useEffect(() => {
    if (layers) {
      setLegend(
        layers.map(layer => ({
          ...layer,
          types: layer.types.map(type => getLegend({ layer, type, style })),
        }))
      );
    }
  }, [layers]);

  return (
    <ChakraProvider>
      <Atlas
        mapStyle={style}
        year={1800}
        basemapHandler={ssid => console.log(ssid)}
        geojson={geojson}
        viewport={{
          latitude: -22.90415,
          longitude: -43.17425,
          zoom: 15,
        }}
        viewpoints={documents}
        viewIcon={<FontAwesomeIcon icon={faCamera} />}
        circleMarkers
        hoverHandler={e => console.log(e)}
        highlightedLayer={highlightedLayer}
        rasterUrl="https://imaginerio-rasters.s3.us-east-1.amazonaws.com"
        // activeBasemap="24048803"
        bearing={heading}
        // isDrawing
        bboxHandler={e => console.log(e)}
      />

      {legend && (
        <div>
          {legend.map(layer => {
            return (
              <div key={layer.name}>
                <p>{layer.title}</p>
                {layer.types.map(type => (
                  <Box
                    key={type.type}
                    onClick={() =>
                      setHighlightedLayer(
                        highlightedLayer &&
                          layer.name === highlightedLayer.layer &&
                          type.type === highlightedLayer.type
                          ? null
                          : { layer: layer.name, type: type.type }
                      )
                    }
                  >
                    <p>{type.type}</p>
                    <Box {...type.swatch} />
                  </Box>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </ChakraProvider>
  );
};

export default App;
