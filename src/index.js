import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactMapGL, { Source, Layer, Marker, NavigationControl } from 'react-map-gl';

import { setStyleYear, fitBounds, setActiveLayer } from './mapUtils';
import styles from './styles.module.css';

const Atlas = ({
  size,
  year,
  activeBasemap,
  opacity,
  basemapHandler,
  highlightedLayer,
  geojson,
  viewpoints,
  mapStyle,
  rasterUrl,
  viewIcon,
  viewport,
}) => {
  const mapRef = useRef(null);

  const [mapViewport, setMapViewport] = useState({
    ...viewport,
    ...size,
  });

  useEffect(() => {
    setMapViewport({
      ...mapViewport,
      ...size,
    });
  }, [size]);

  const onViewportChange = nextViewport => {
    setMapViewport(nextViewport);
  };

  useEffect(() => {
    const map = mapRef.current.getMap();
    if (map) {
      map.setStyle(setActiveLayer(setStyleYear(year, mapStyle), highlightedLayer));
    }
  }, [year, highlightedLayer]);

  useEffect(() => {
    if (geojson) {
      setMapViewport(fitBounds(geojson, mapViewport));
    }
  }, [geojson]);

  return (
    <ReactMapGL
      ref={mapRef}
      mapStyle={mapStyle}
      onViewportChange={onViewportChange}
      {...mapViewport}
    >
      {rasterUrl && activeBasemap && (
        <Source
          key={activeBasemap}
          type="raster"
          tiles={[`${rasterUrl}/${activeBasemap}/{z}/{x}/{y}.png`]}
          scheme="tms"
        >
          <Layer id="overlay" type="raster" paint={{ 'raster-opacity': opacity }} />
        </Source>
      )}
      {geojson && !activeBasemap && (
        <Source key={`view${activeBasemap}`} type="geojson" data={geojson}>
          <Layer id="viewcone" type="fill" paint={{ 'fill-color': 'rgba(0,0,0,0.25)' }} />
        </Source>
      )}
      {viewpoints.map((v, i) => (
        <Marker key={`marker${v.ssid}`} {...v} offsetLeft={-15} offsetTop={-15}>
          <div
            role="button"
            tabIndex={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            onClick={() => {
              if (v.ssid !== activeBasemap) basemapHandler(v.ssid);
            }}
            onKeyPress={() => {
              if (v.ssid !== activeBasemap) basemapHandler(v.ssid);
            }}
          >
            {viewIcon}
          </div>
        </Marker>
      ))}
      <div className={styles.buttons}>
        <NavigationControl />
      </div>
    </ReactMapGL>
  );
};

Atlas.propTypes = {
  year: PropTypes.number.isRequired,
  activeBasemap: PropTypes.string,
  opacity: PropTypes.number,
  basemapHandler: PropTypes.func,
  highlightedLayer: PropTypes.shape(),
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  geojson: PropTypes.shape(),
  viewpoints: PropTypes.arrayOf(
    PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      ssid: PropTypes.string,
    })
  ),
  mapStyle: PropTypes.shape().isRequired,
  rasterUrl: PropTypes.string,
  viewIcon: PropTypes.node,
  viewport: PropTypes.shape().isRequired,
};

Atlas.defaultProps = {
  activeBasemap: null,
  opacity: 0.75,
  size: {
    width: 800,
    height: 600,
  },
  highlightedLayer: null,
  geojson: null,
  viewpoints: [],
  rasterUrl: null,
  viewIcon: null,
  basemapHandler: () => null,
};

export default Atlas;
