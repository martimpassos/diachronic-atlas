import { last, findLast } from 'lodash';
import { rgb } from 'd3';
import Line from './Line.svg';

const getLayerStyle = (layer, type, style) => {
  let layerStyle = style.layers.filter(
    l =>
      l.filter &&
      l['source-layer'].toLowerCase() === layer.name.toLowerCase() &&
      l.filter.find(f => Array.isArray(f) && f[2] && f[2][0] === type)
  );

  if (!layerStyle.length)
    layerStyle = style.layers.filter(
      l => l['source-layer']?.toLowerCase() === layer.name.toLowerCase()
    );

  return layerStyle;
};

const formatColor = bColor => {
  if (!bColor) return null;
  let color = bColor;
  if (Array.isArray(color)) color = last(color);
  if (color.match(/^hsl/gi)) color = rgb(color).formatHex();
  return color;
};

const getPolygonStyle = layerStyle => {
  let backgroundColor = layerStyle[0].paint['fill-color'];
  let borderColor = layerStyle[0].paint['fill-outline-color'];
  if (!borderColor)
    borderColor = layerStyle[1]
      ? layerStyle[1].paint['fill-color']
      : layerStyle[0].paint['fill-color'];

  [backgroundColor, borderColor] = [backgroundColor, borderColor].map(formatColor);

  return {
    borderColor,
    backgroundColor,
    borderWidth: 2,
    m: 1,
  };
};

const getLineStyle = layerStyle => {
  let color = findLast(layerStyle, lStyle => lStyle.paint['line-color']).paint['line-color'];
  color = formatColor(color);

  return {
    as: Line,
    color,
    w: '35px',
    ml: '5px',
  };
};

const getLegend = ({ layer, type, style }) => {
  const layerStyle = getLayerStyle(layer, type, style);
  if (!layerStyle.length) return { backgroundColor: 'white' };
  if (layerStyle[0].paint['fill-color']) {
    return getPolygonStyle(layerStyle);
  }
  if (layerStyle[0].paint['line-color']) {
    return getLineStyle(layerStyle);
  }
  return { backgroundColor: 'white' };
};

export default getLegend;
