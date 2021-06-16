import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactMapGL, { Source, Layer, NavigationControl } from 'react-map-gl';

import ViewMarkers from './ViewMarkers';

import { setStyleYear, fitBounds, setActiveLayer } from './mapUtils';
import { requireAtLeastOne } from './utils';
import getLegend from './getLegend';

const Atlas = ({
  size,
  year,
  dates,
  activeBasemap,
  opacity,
  basemapHandler,
  highlightedLayer,
  geojson,
  hover,
  hoverHandler,
  viewpoints,
  mapStyle,
  rasterUrl,
  viewIcon,
  viewport,
  circleMarkers,
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
      const range = dates || [year, year];
      map.setStyle(setActiveLayer(setStyleYear(range, mapStyle), highlightedLayer));
    }
  }, [year, dates, highlightedLayer]);

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
      interactiveLayerIds={viewpoints.lenght ? ['viewpoints'] : []}
      onClick={e => {
        const [feature] = e.features;
        if (feature) basemapHandler(feature.properties.ssid);
      }}
      onHover={e => {
        if (e.features.length) {
          hoverHandler(e.features[0]);
        } else {
          hoverHandler(null);
        }
      }}
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
      {hover && (
        <Source key="view-hover" type="geojson" data={hover}>
          <Layer id="view-hover" type="fill" paint={{ 'fill-color': 'rgba(0,0,0,0.25)' }} />
        </Source>
      )}
      <ViewMarkers
        viewpoints={viewpoints}
        markerHandler={ssid => {
          if (ssid !== activeBasemap) basemapHandler(ssid);
        }}
        viewIcon={viewIcon}
        circleMarkers={circleMarkers}
      />
      <div
        className="atlas___zoom-controls"
        style={{ position: 'absolute', left: 15, right: 'auto', top: 15 }}
      >
        <NavigationControl />
      </div>
    </ReactMapGL>
  );
};

const dateProps = requireAtLeastOne({
  year: PropTypes.number,
  dates: PropTypes.arrayOf(PropTypes.number),
});

Atlas.propTypes = {
  year: dateProps,
  dates: dateProps,
  activeBasemap: PropTypes.string,
  opacity: PropTypes.number,
  basemapHandler: PropTypes.func,
  highlightedLayer: PropTypes.shape(),
  size: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  geojson: PropTypes.shape(),
  hover: PropTypes.shape(),
  hoverHandler: PropTypes.func,
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
  circleMarkers: PropTypes.bool,
};

Atlas.defaultProps = {
  year: null,
  dates: null,
  activeBasemap: null,
  opacity: 0.75,
  size: {
    width: 800,
    height: 600,
  },
  highlightedLayer: null,
  geojson: null,
  hover: null,
  hoverHandler: () => null,
  viewpoints: null,
  rasterUrl: null,
  viewIcon: null,
  basemapHandler: () => null,
  circleMarkers: false,
};

export default Atlas;

export { Atlas, getLegend };
