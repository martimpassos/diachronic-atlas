import bbox from '@turf/bbox';
import { isArray } from 'lodash';
import { hsl } from 'd3-color';
import { WebMercatorViewport, FlyToInterpolator } from 'react-map-gl';

const setStyleYear = (range, currentStyle) => {
  const style = { ...currentStyle };
  const [minYear, maxYear] = range;
  style.layers = style.layers.map(layer => {
    if (layer.source === 'composite') {
      const filter = layer.filter
        ? layer.filter.filter(f => isArray(f) && f[0] !== '<=' && f[0] !== '>=')
        : [];
      return {
        ...layer,
        filter: [
          'all',
          ['<=', ['get', 'firstyear'], maxYear],
          ['>=', ['get', 'lastyear'], minYear],
          ...filter,
        ],
      };
    }
    if (layer.source?.match('hillshade')) {
      const hillshades = Object.keys(style.sources)
        .filter(s => s.match('hillshade'))
        .sort((a, b) => parseInt(b.replace(/\D/gi, ''), 10) - parseInt(a.replace(/\D/gi, ''), 10));

      const newSource = hillshades.find(h => parseInt(h.replace(/\D/gi, ''), 10) <= maxYear);
      if (newSource) {
        return {
          ...layer,
          source: newSource,
        };
      }
    }
    return layer;
  });
  return style;
};

const fitBounds = (geom, mapViewport) => {
  const [minX, minY, maxX, maxY] = bbox(geom);
  const { longitude, latitude, zoom } = new WebMercatorViewport(mapViewport).fitBounds(
    [
      [minX, minY],
      [maxX, maxY],
    ],
    { padding: 100 }
  );
  return {
    ...mapViewport,
    longitude,
    latitude,
    zoom,
    transitionDuration: 1000,
    transitionInterpolator: new FlyToInterpolator(),
  };
};

const getOpacityKey = layer => {
  if (layer.type === 'line') return ['line-opacity'];
  if (layer.type === 'symbol') return ['text-opacity', 'icon-opacity'];
  return ['fill-opacity'];
};

const updateOpacity = (layer, keys, opacity) => {
  const newLayer = { ...layer };
  keys.forEach(key => {
    newLayer.paint[key] = opacity;
  });
  return newLayer;
};

const setActiveLayer = (currentStyle, highlightedLayer) => {
  const style = { ...currentStyle };
  style.layers = style.layers.map(mapLayer => {
    if (mapLayer.type === 'raster' || mapLayer.type === 'background' || mapLayer.id === 'land') {
      return mapLayer;
    }

    let newLayer = { ...mapLayer };
    if (highlightedLayer) {
      const opacityKey = getOpacityKey(newLayer);
      const { layer, type } = highlightedLayer;
      let activeLayer = false;
      if (
        newLayer.filter.find(l => l[1][1] === 'type') &&
        newLayer.filter.find(l => l[1][1] === 'type')[2][0] === type &&
        newLayer['source-layer'].toLowerCase() === layer.toLowerCase()
      ) {
        activeLayer = true;
      }
      newLayer = updateOpacity(newLayer, opacityKey, activeLayer ? 1 : 0.2);
      if (newLayer['fill-color'] && activeLayer) {
        const color = hsl(newLayer['fill-color']);
        color.s -= 20;
        color.l -= 20;
        newLayer['fill-color'] = color.formatHsl();
      }
    }
    return newLayer;
  });
  return style;
};

export { setStyleYear, fitBounds, setActiveLayer };
