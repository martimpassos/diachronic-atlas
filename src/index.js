import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactMapGL, {
  Source,
  Layer,
  NavigationControl,
  WebMercatorViewport,
  AttributionControl,
} from 'react-map-gl';
import bboxPolygon from '@turf/bbox-polygon';

import ViewMarkers from './ViewMarkers';

import { setStyleYear, fitBounds, setActiveLayer, updateBearing } from './mapUtils';
import { requireAtLeastOne } from './utils';
import getLegend from './getLegend';

const Atlas = ({
  width,
  height,
  year,
  dates,
  activeBasemap,
  opacity,
  basemapHandler,
  highlightedLayer,
  geojson,
  showSatellite,
  hover,
  hoverHandler,
  viewpoints,
  mapStyle,
  rasterUrl,
  viewIcon,
  viewport,
  circleMarkers,
  bearing,
  minZoom,
  maxZoom,
  isDrawing,
  drawBoxHandler,
  bboxHandler,
  clickHandler,
}) => {
  const mapRef = useRef(null);
  const geoRef = useRef(null);
  const styleRef = useRef(JSON.stringify(mapStyle));

  const [mapViewport, setMapViewport] = useState({
    ...viewport,
    width,
    height,
  });
  const [hoveredStateId, setHoveredStateId] = useState(null);
  const [style, setStyle] = useState(mapStyle);
  const [drawBoxStart, setDrawBoxStart] = useState(null);
  const [drawBoxEnd, setDrawBoxEnd] = useState(null);
  const [drawBoxGeojson, setDrawBoxGeojson] = useState(null);

  useEffect(() => {
    const { zoom } = mapViewport;
    setMapViewport({
      ...mapViewport,
      zoom: Math.max(minZoom, Math.min(zoom, maxZoom)),
      width,
      height,
    });
  }, [width, height]);

  const onViewportChange = nextViewport => {
    // eslint-disable-next-line no-param-reassign
    nextViewport.zoom = Math.max(minZoom, Math.min(nextViewport.zoom, maxZoom));
    setMapViewport(nextViewport);
    bboxHandler(new WebMercatorViewport(nextViewport).getBounds());
  };

  useEffect(() => {
    const map = mapRef.current.getMap();
    if (map) {
      const range = dates || [year, year];
      setStyle(setActiveLayer(setStyleYear(range, JSON.parse(styleRef.current)), highlightedLayer));
    }
  }, [year, dates, highlightedLayer]);

  useEffect(() => setMapViewport(updateBearing(bearing, mapViewport)), [bearing]);

  useEffect(() => {
    geojson.forEach(({ id, data }) => {
      if (geoRef.current !== id) {
        setMapViewport(fitBounds(data, mapViewport, minZoom, maxZoom));
        geoRef.current = id;
      }
    });
  }, [geojson]);

  useEffect(() => {
    if (drawBoxStart && drawBoxEnd) {
      setDrawBoxGeojson(
        bboxPolygon([
          Math.min(drawBoxStart[0], drawBoxEnd[0]),
          Math.min(drawBoxStart[1], drawBoxEnd[1]),
          Math.max(drawBoxStart[0], drawBoxEnd[0]),
          Math.max(drawBoxStart[1], drawBoxEnd[1]),
        ])
      );
    }
  }, [drawBoxStart, drawBoxEnd]);

  return (
    <ReactMapGL
      ref={mapRef}
      mapStyle={style}
      onViewportChange={onViewportChange}
      interactiveLayerIds={viewpoints ? ['viewpoints'] : null}
      dragPan={!isDrawing}
      getCursor={({ isHovering, isDragging }) => {
        if (isDrawing || isHovering) return 'pointer';
        if (isDragging) return 'grabbing';
        return 'grab';
      }}
      onClick={e => {
        clickHandler(e.lngLat);
        const [feature] = e.features;
        if (feature) basemapHandler(feature.properties.ssid);
      }}
      onMouseDown={e => {
        if (isDrawing) {
          setDrawBoxStart(e.lngLat);
        }
      }}
      onMouseUp={() => {
        if (isDrawing && drawBoxStart) {
          drawBoxHandler([drawBoxStart, drawBoxEnd]);
          setDrawBoxStart(null);
          setDrawBoxEnd(null);
          setDrawBoxGeojson(null);
        }
      }}
      onMouseMove={e => {
        if (isDrawing && drawBoxStart) {
          setDrawBoxEnd(e.lngLat);
        }
      }}
      onHover={e => {
        if (!viewpoints) return;

        if (hoveredStateId !== null) {
          mapRef.current
            .getMap()
            .setFeatureState({ source: 'viewpoints', id: hoveredStateId }, { hover: false });
        }
        if (e.features.length > 0) {
          mapRef.current
            .getMap()
            .setFeatureState({ source: 'viewpoints', id: e.features[0].id }, { hover: true });
          setHoveredStateId(e.features[0].id);
        } else {
          setHoveredStateId(null);
        }
        hoverHandler(e);
      }}
      {...mapViewport}
    >
      <Source
        key="placeholder-source"
        type="geojson"
        data={{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
        }}
      >
        <Layer id="placeholder" type="circle" paint={{ 'circle-opacity': 0 }} />
      </Source>
      {showSatellite && (
        <Source
          id="satellite"
          type="raster"
          tiles={[
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ]}
        >
          <Layer id="satellite" type="raster" beforeId="placeholder" />
        </Source>
      )}
      {showSatellite && (
        <AttributionControl
          compact
          customAttribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          style={{
            bottom: 0,
            left: 0,
          }}
        />
      )}
      {rasterUrl && activeBasemap && (
        <Source
          key={activeBasemap}
          type="raster"
          tiles={[`${rasterUrl}/${activeBasemap}/{z}/{x}/{y}.png`]}
          scheme="tms"
        >
          <Layer
            id="overlay"
            type="raster"
            beforeId="placeholder"
            paint={{ 'raster-opacity': opacity }}
          />
        </Source>
      )}
      {geojson.map(({ id, data, paint, type }) => (
        <Source key={id} type="geojson" data={data}>
          <Layer id={id} type={type || 'fill'} paint={paint} />
        </Source>
      ))}
      {hover && (
        <Source key="view-hover" type="geojson" data={hover}>
          <Layer id="view-hover" type="fill" paint={{ 'fill-color': 'rgba(0,0,0,0.25)' }} />
        </Source>
      )}
      <ViewMarkers
        visible={!highlightedLayer}
        viewpoints={viewpoints}
        markerHandler={ssid => {
          if (ssid !== activeBasemap) basemapHandler(ssid);
        }}
        viewIcon={viewIcon}
        circleMarkers={circleMarkers}
      />
      {isDrawing && drawBoxGeojson && (
        <Source key="draw-box" type="geojson" data={drawBoxGeojson}>
          <Layer type="fill" id="draw-box-fill" paint={{ 'fill-color': 'rgba(0,0,0,0.25)' }} />
          <Layer type="line" id="draw-box-line" paint={{ 'line-width': 2 }} />
        </Source>
      )}
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
  width: PropTypes.number,
  height: PropTypes.number,
  geojson: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      data: PropTypes.shape().isRequired,
      type: PropTypes.oneOf(['fill', 'line', 'circle', 'symbol']),
      paint: PropTypes.shape(),
    })
  ),
  showSatellite: PropTypes.bool,
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
  bearing: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  isDrawing: PropTypes.bool,
  drawBoxHandler: PropTypes.func,
  bboxHandler: PropTypes.func,
  clickHandler: PropTypes.func,
};

Atlas.defaultProps = {
  year: null,
  dates: null,
  activeBasemap: null,
  opacity: 0.75,
  width: 800,
  height: 600,
  highlightedLayer: null,
  geojson: [],
  showSatellite: false,
  hover: null,
  hoverHandler: () => null,
  viewpoints: null,
  rasterUrl: null,
  viewIcon: null,
  basemapHandler: () => null,
  circleMarkers: false,
  bearing: 0,
  minZoom: 9,
  maxZoom: 17,
  isDrawing: false,
  drawBoxHandler: () => null,
  bboxHandler: () => null,
  clickHandler: () => null,
};

export default Atlas;

export { Atlas, getLegend };
