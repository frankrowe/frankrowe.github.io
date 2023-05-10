var wms_layers = [];

var lyr_MD_NAIPImagery_0 = new ol.layer.Tile({
                            source: new ol.source.TileWMS(({
                              url: "https://geodata.md.gov/imap/services/Imagery/MD_NAIPImagery/ImageServer/WMSServer",
    attributions: ' ',
                              params: {
                                "LAYERS": "MD_NAIPImagery",
                                "TILED": "true",
                                "VERSION": "1.3.0"},
                            })),
                            title: "MD_NAIPImagery",
                            opacity: 1.000000,
                            
                            
                          });
              wms_layers.push([lyr_MD_NAIPImagery_0, 0]);
var format_Soils_1 = new ol.format.GeoJSON();
var features_Soils_1 = format_Soils_1.readFeatures(json_Soils_1, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_Soils_1 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_Soils_1.addFeatures(features_Soils_1);
var lyr_Soils_1 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_Soils_1, 
                style: style_Soils_1,
                interactive: true,
                title: '<img src="styles/legend/Soils_1.png" /> Soils'
            });
var format_contours_1ft_smooth_2 = new ol.format.GeoJSON();
var features_contours_1ft_smooth_2 = format_contours_1ft_smooth_2.readFeatures(json_contours_1ft_smooth_2, 
            {dataProjection: 'EPSG:4326', featureProjection: 'EPSG:3857'});
var jsonSource_contours_1ft_smooth_2 = new ol.source.Vector({
    attributions: ' ',
});
jsonSource_contours_1ft_smooth_2.addFeatures(features_contours_1ft_smooth_2);
var lyr_contours_1ft_smooth_2 = new ol.layer.Vector({
                declutter: true,
                source:jsonSource_contours_1ft_smooth_2, 
                style: style_contours_1ft_smooth_2,
                interactive: true,
                title: '<img src="styles/legend/contours_1ft_smooth_2.png" /> contours_1ft_smooth'
            });

lyr_MD_NAIPImagery_0.setVisible(true);lyr_Soils_1.setVisible(true);lyr_contours_1ft_smooth_2.setVisible(true);
var layersList = [lyr_MD_NAIPImagery_0,lyr_Soils_1,lyr_contours_1ft_smooth_2];
lyr_Soils_1.set('fieldAliases', {'OBJECTID_1': 'OBJECTID_1', 'MUSYM': 'MUSYM', 'MUNAME': 'MUNAME', 'CORSTEEL': 'CORSTEEL', 'DEP2WATTBL': 'DEP2WATTBL', 'DRAINCLASS': 'DRAINCLASS', 'EROHZDRT': 'EROHZDRT', 'FRMLNDCLS': 'FRMLNDCLS', 'FROSTACT': 'FROSTACT', 'HYDRCRATNG': 'HYDRCRATNG', 'HYDROLGRP': 'HYDROLGRP', 'KFACTRF': 'KFACTRF', 'PARMATNM': 'PARMATNM', 'CLAY': 'CLAY', 'SAND': 'SAND', 'SILT': 'SILT', 'SURFTEXT': 'SURFTEXT', 'TFACTOR': 'TFACTOR', 'CORCONCRET': 'CORCONCRET', 'Shape_area': 'Shape_area', 'Shape_len': 'Shape_len', 'id': 'id', });
lyr_contours_1ft_smooth_2.set('fieldAliases', {'fid': 'fid', 'ID': 'ID', 'ELEV': 'ELEV', });
lyr_Soils_1.set('fieldImages', {'OBJECTID_1': 'TextEdit', 'MUSYM': 'TextEdit', 'MUNAME': 'TextEdit', 'CORSTEEL': 'TextEdit', 'DEP2WATTBL': 'TextEdit', 'DRAINCLASS': 'TextEdit', 'EROHZDRT': 'TextEdit', 'FRMLNDCLS': 'TextEdit', 'FROSTACT': 'TextEdit', 'HYDRCRATNG': 'TextEdit', 'HYDROLGRP': 'TextEdit', 'KFACTRF': 'TextEdit', 'PARMATNM': 'TextEdit', 'CLAY': 'TextEdit', 'SAND': 'TextEdit', 'SILT': 'TextEdit', 'SURFTEXT': 'TextEdit', 'TFACTOR': 'TextEdit', 'CORCONCRET': 'TextEdit', 'Shape_area': 'TextEdit', 'Shape_len': 'TextEdit', 'id': 'TextEdit', });
lyr_contours_1ft_smooth_2.set('fieldImages', {'fid': 'TextEdit', 'ID': 'Range', 'ELEV': 'TextEdit', });
lyr_Soils_1.set('fieldLabels', {'OBJECTID_1': 'no label', 'MUSYM': 'header label', 'MUNAME': 'inline label', 'CORSTEEL': 'no label', 'DEP2WATTBL': 'no label', 'DRAINCLASS': 'no label', 'EROHZDRT': 'no label', 'FRMLNDCLS': 'no label', 'FROSTACT': 'no label', 'HYDRCRATNG': 'no label', 'HYDROLGRP': 'no label', 'KFACTRF': 'no label', 'PARMATNM': 'no label', 'CLAY': 'no label', 'SAND': 'no label', 'SILT': 'no label', 'SURFTEXT': 'no label', 'TFACTOR': 'no label', 'CORCONCRET': 'no label', 'Shape_area': 'no label', 'Shape_len': 'no label', 'id': 'no label', });
lyr_contours_1ft_smooth_2.set('fieldLabels', {'fid': 'inline label', 'ID': 'inline label', 'ELEV': 'inline label', });
lyr_contours_1ft_smooth_2.on('precompose', function(evt) {
    evt.context.globalCompositeOperation = 'normal';
});