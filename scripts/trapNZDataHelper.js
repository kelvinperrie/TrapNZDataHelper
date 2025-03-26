var TrapNZDataHelper = function() {
    let self = this;

    // specifies where the images/icons for each trap are stored
    let imagePath = "images/";

    // determines what each type of trap is trying to catch so we can decide the icon to show
    const ratTraps = ["A24"];
    const mustelidTraps = ["DOC 200", "DOC 250","Rewild F-bomb", "BT 200"];
    const possumTraps = ["Possum Master", "Warrior", "Sentinel"];
    const catTraps = ["SA Cat"]

    // shows the traplines on the map
    self.showTrapLines = function(targetMap, trapLineJsonUrl) {
        // show the traplines on the map
        $.getJSON( trapLineJsonUrl, function( data ) {
            L.geoJSON(data, {
                style: function (feature) {
                    return {color: feature.properties.colour};
                },
                onEachFeature : function (feature, layer) {
                    layer.bindPopup("This line name is " + layer.feature.properties.line)
                }
                }).addTo(targetMap);
        });
    }

    // shows the trapicons on the map
    self.showTrapIcons = function(targetMap, trapJsonUrl) {
        // setup the various icons we want to display for traps
        const iconSize = targetMap.getZoom() * 2;

        const stoatIconTemplate = L.Icon.extend({
                        options: {
                            iconUrl: imagePath+'ICON_Stoat.png',
                            iconSize: [iconSize, iconSize],
                            iconAnchor: [iconSize/2, iconSize/2]
                        }
                    });
        const stoatIcon = new stoatIconTemplate();
        const ratIconTemplate = L.Icon.extend({
                        options: {
                            iconUrl: imagePath+'ICON_Rat.png',
                            iconSize: [iconSize, iconSize],
                            iconAnchor: [iconSize/2, iconSize/2]
                        }
                    });
        const ratIcon = new ratIconTemplate();
        const possumIconTemplate = L.Icon.extend({
                        options: {
                            iconUrl: imagePath+'ICON_Possum.png',
                            iconSize: [iconSize, iconSize],
                            iconAnchor: [iconSize/2, iconSize/2]
                        }
                    });
        const possumIcon = new possumIconTemplate();
        const catIconTemplate = L.Icon.extend({
                        options: {
                            iconUrl: imagePath+'ICON_Cat.png',
                            iconSize: [iconSize, iconSize],
                            iconAnchor: [iconSize/2, iconSize/2]
                        }
                    });
        const catIcon = new catIconTemplate();
        const unknownIconTemplate = L.Icon.extend({
                        options: {
                            iconUrl: imagePath+'ICON_Unknown.png',
                            iconSize: [iconSize, iconSize],
                            iconAnchor: [iconSize/2, iconSize/2]
                        }
                    });
        const unknownIcon = new unknownIconTemplate();

        // show the traps on the map
        $.getJSON( trapJsonUrl, function( data ) {
            L.geoJSON(data, {
                filter : function(feature) {
                    // don't include retired traps
                    return feature.properties.retired == 0;
                },
                onEachFeature : function (feature, layer) {
                    // determine which icon we want
                    if(possumTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(possumIcon);
                    } else if(mustelidTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(stoatIcon);
                    } else if(ratTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(ratIcon);
                    } else if(catTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(catIcon);
                    } else {
                        console.log("We don't have an icon for this type of trap: " + layer.feature.properties.trap_type);
                        layer.setIcon(unknownIcon);
                    }

                    const installedDate = Date.parse(layer.feature.properties.date_installed);
                    const displayDate = new Date(installedDate).toLocaleDateString();
                    layer.bindPopup("This is trap '" + layer.feature.properties.code + "'', it's a " + layer.feature.properties.trap_type + 
                            " trap installed by " + layer.feature.properties.installed_by + " on " + displayDate)

                }
            }).addTo(targetMap);
        });
    }

    // called (optionally) after a map is zoomed to resize icons
    self.resizeTrapIconsOnZoom = function(targetMap) {
        // when zoomed we want to change the marker/icon sizes
        // not entirely sure this works ... lets hope you don't have any other point layers ...
        iconSize = targetMap.getZoom() * 2;
        targetMap.eachLayer(function(layer){
            if(layer.feature && layer.feature.geometry && layer.feature.geometry.type === "Point") {
                let icon = layer.options.icon;
                icon.options.iconSize = [iconSize, iconSize];
                icon.options.iconAnchor = [iconSize / 2,iconSize / 2]
                layer.setIcon(icon);
            }
        });
    }
}

let trapNZDataHelper = new TrapNZDataHelper();