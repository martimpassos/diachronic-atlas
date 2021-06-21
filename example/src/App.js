import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { ChakraProvider, Box } from '@chakra-ui/react';

import { Atlas, getLegend } from 'diachronic-atlas';

import style from './style.json';
import geojson from './cone.json';
import documents from './documents.json';

const App = () => {
  const [layers, setLayers] = useState(null);
  const [legend, setLegend] = useState(null);
  const [highlightedLayer, setHighlightedLayer] = useState(null);

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
        // geojson={geojson}
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
      />

      {legend && (
        <div>
          {legend.map(layer => {
            return (
              <div>
                <p>{layer.title}</p>
                {layer.types.map(type => (
                  <Box
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
