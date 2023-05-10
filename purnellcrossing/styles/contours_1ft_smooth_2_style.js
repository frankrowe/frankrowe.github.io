var size = 0;
var placement = "point";

var style_contours_1ft_smooth_2 = function (feature, resolution) {
  var context = {
    feature: feature,
    variables: {},
  };
  var value = "";
  var labelText = "";
  size = 0;
  var labelFont = "13.0px '.AppleSystemUIFont', sans-serif";
  var labelFill = "#000000";
  var bufferColor = "#ffffff";
  var bufferWidth = 1.0;
  var textAlign = "left";
  var offsetX = 8;
  var offsetY = 3;
  var placement = "point";

  const elev = feature.get("ELEV") * 3.28;
  const elevWhole = Math.round(elev);
  labelText = String(elevWhole) + " ft";

  var style = [
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "rgba(255,0,0,1.0)",
        lineDash: null,
        lineCap: "round",
        lineJoin: "round",
        width: 1,
      }),
      text: createTextStyle(
        feature,
        resolution,
        labelText,
        labelFont,
        labelFill,
        placement,
        bufferColor,
        bufferWidth
      ),
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "rgba(255,255,255,0.6509803921568628)",
        lineDash: null,
        lineCap: "round",
        lineJoin: "round",
        width: 0,
      }),
      text: createTextStyle(
        feature,
        resolution,
        labelText,
        labelFont,
        labelFill,
        placement,
        bufferColor,
        bufferWidth
      ),
    }),
  ];

  return style;
};
