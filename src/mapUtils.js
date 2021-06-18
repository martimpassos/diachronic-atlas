import bbox from '@turf/bbox';
import { isArray } from 'lodash';
import { hsl } from 'd3';
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

const updateFillColor = (val, activeLayer) => {
  const color = hsl(val);
  if (activeLayer) {
    color.s -= 0.2;
    color.l -= 0.2;
    color.opacity = 1;
  } else {
    color.opacity = 0.2;
  }
  return color.formatHsl();
};

const setActiveLayer = (currentStyle, highlightedLayer) => {
  const style = { ...currentStyle };
  style.layers = style.layers.map(mapLayer => {
    if (
      mapLayer.type === 'raster' ||
      mapLayer.type === 'background' ||
      mapLayer.id === 'land' ||
      mapLayer['source-layer'] === 'groundcoverpoly'
    ) {
      return mapLayer;
    }

    const newLayer = { ...mapLayer };
    if (highlightedLayer) {
      const { layer, type } = highlightedLayer;
      let activeLayer = false;
      if (
        newLayer.filter &&
        newLayer.filter.find(l => l[1][1] === 'type') &&
        newLayer.filter.find(l => l[1][1] === 'type')[2][0] === type &&
        newLayer['source-layer'].toLowerCase() === layer.toLowerCase()
      ) {
        activeLayer = true;
      }

      if (newLayer.type === 'fill') {
        if (Array.isArray(newLayer.paint['fill-color'])) {
          newLayer.paint['fill-color'] = newLayer.paint['fill-color'].map(val => {
            if (val.toString().match(/^(hsl|rgb|#\d\d\d)/)) {
              return updateFillColor(val, activeLayer);
            }
            return val;
          });
        } else {
          newLayer.paint['fill-color'] = updateFillColor(newLayer.paint['fill-color'], activeLayer);
        }
      } else if (newLayer.type === 'symbol') {
        ['text-opacity', 'icon-opacity'].forEach(prop => {
          newLayer.paint[prop] = activeLayer ? 1 : 0.2;
        });
      } else if (newLayer.type === 'line') {
        newLayer.paint['line-opacity'] = activeLayer ? 1 : 0.2;
      }
    }
    return newLayer;
  });
  return style;
};

export { setStyleYear, fitBounds, setActiveLayer };
