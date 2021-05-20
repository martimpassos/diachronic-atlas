import React from 'react';
import { last, findLast } from 'lodash';
import { rgb } from 'd3';

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
    children: (
      <svg x="0px" y="0px" width="40px" height="20px" viewBox="0 20 80 40">
        <path
          fill="currentColor"
          stroke="#999"
          strokeMiterlimit="10"
          d="M6.4,54.7c-1.4,0-2.7-0.5-3.6-1.4c-1-0.9-1.5-2.1-1.5-3.4
   c0-1.3,0.6-2.5,1.6-3.3l23.5-20c0.9-0.8,2.2-1.2,3.4-1.2c1.3,0,2.6,0.5,3.6,1.4l18.3,16.7L70,26.7c1-0.9,2.2-1.4,3.6-1.4
   c1.3,0,2.5,0.5,3.5,1.3c1,0.9,1.6,2.1,1.6,3.3c0,1.3-0.5,2.5-1.5,3.4l-21.8,20c-0.9,0.8-2.2,1.3-3.6,1.3c-1.4,0-2.7-0.5-3.6-1.3
   L29.8,36.5l-19.9,17C8.9,54.2,7.7,54.7,6.4,54.7z"
        />
      </svg>
    ),
    color,
    w: '35px',
    ml: '5px',
  };
};

const getLegend = ({ layer, type, style }) => {
  const layerStyle = getLayerStyle(layer, type, style);
  let swatch = { backgroundColor: 'white' };
  if (layerStyle[0]?.paint['fill-color']) {
    swatch = getPolygonStyle(layerStyle);
  }
  if (layerStyle[0]?.paint['line-color']) {
    swatch = getLineStyle(layerStyle);
  }
  return { type, swatch };
};

export default getLegend;
