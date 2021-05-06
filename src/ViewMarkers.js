import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Marker, Source, Layer } from 'react-map-gl';

const MarkerIcon = ({ image, index, markerHandler, viewIcon }) => (
  <Marker {...image} offsetLeft={-15} offsetTop={-15}>
    <div
      role="button"
      tabIndex={index}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      onClick={() => markerHandler(image.ssid)}
      onKeyPress={() => markerHandler(image.ssid)}
    >
      {viewIcon}
    </div>
  </Marker>
);

MarkerIcon.propTypes = {
  image: PropTypes.shape().isRequired,
  index: PropTypes.number.isRequired,
  markerHandler: PropTypes.func.isRequired,
  viewIcon: PropTypes.node,
};

MarkerIcon.defaultProps = {
  viewIcon: null,
};

const Circle = ({ viewpoints }) => {
  const geojson = {
    type: 'FeatureCollection',
    features: viewpoints.map(v => ({
      type: 'Feature',
      id: v.ssid,
      properties: {
        title: v.title,
      },
      geometry: {
        type: 'Point',
        coordinates: [v.longitude, v.latitude],
      },
    })),
  };
  return (
    <Source type="geojson" data={geojson}>
      <Layer
        id="viewpoint-case"
        type="circle"
        paint={{ 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 2 }}
      />
    </Source>
  );
};

Circle.propTypes = {
  viewpoints: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

const ViewMarkers = ({ viewpoints, markerHandler, viewIcon, circleMarkers }) => {
  if (!viewpoints || !Array.isArray(viewpoints)) return null;

  if (circleMarkers) {
    return <Circle viewpoints={viewpoints} />;
  }
  return (
    <>
      {viewpoints.map((v, i) => (
        <MarkerIcon
          key={`marker${v.ssid}`}
          image={v}
          index={i}
          markerHandler={markerHandler}
          viewIcon={viewIcon}
        />
      ))}
    </>
  );
};

ViewMarkers.propTypes = {
  viewpoints: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  markerHandler: PropTypes.func,
  viewIcon: PropTypes.node,
  circleMarkers: PropTypes.bool,
};

ViewMarkers.defaultProps = {
  viewIcon: null,
  markerHandler: () => null,
  circleMarkers: false,
};

export default ViewMarkers;
