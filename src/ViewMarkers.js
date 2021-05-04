import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Marker } from 'react-map-gl';

const ViewMarkers = ({ viewpoints, markerHandler, viewIcon }) => (
  <>
    {viewpoints.map((v, i) => (
      <Marker key={`marker${v.ssid}`} {...v} offsetLeft={-15} offsetTop={-15}>
        <div
          role="button"
          tabIndex={i}
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
          onClick={() => markerHandler(v.ssid)}
          onKeyPress={() => markerHandler(v.ssid)}
        >
          {viewIcon}
        </div>
      </Marker>
    ))}
  </>
);

ViewMarkers.propTypes = {
  viewpoints: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  markerHandler: PropTypes.func,
  viewIcon: PropTypes.node,
};

ViewMarkers.defaultProps = {
  viewIcon: null,
  markerHandler: () => null,
};

export default ViewMarkers;
