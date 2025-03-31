var TrapNZDataHelper = function() {
    let self = this;

    // specifies where the images/icons for each trap are stored
    let imagePath = "images/";

    // determines what each type of trap is trying to catch so we can decide the icon to show
    const ratTraps = ["A24"];
    const mustelidTraps = ["DOC 200", "DOC 250","Rewild F-bomb", "BT 200"];
    const possumTraps = ["Possum Master", "Warrior", "Sentinel"];
    const catTraps = ["SA Cat"]
    
    self.showLegend = function() {

        if($(".legend-container").length === 0) {
            $("body").append(
                `
                <style>
                    .legend-container {
                        font-family: system-ui;
                        position: absolute; top: 80px; left: 0px; z-index: 1000;
                        background-color: #fff;
                        margin: 10px;
                        padding: 10px;
                        border-radius: 10px; border: 1px #dbdbdb solid;
                    }
                    .legend-title {
                        font-weight: bold;
                    }
                    .icon-legend img {
                        width: 50px;
                        margin-right: 3px;
                    }
                    .icon-legend {
                        display: flex;
                        align-items:center;
                    }
                    .bad-colour{
                        color: red;
                    }
                    .warning-colour{
                        color: orange;
                    }
                    .good-colour{
                        color: blue;
                    }
                    .line-items {
                        height: 200px;
                        overflow-y: scroll;
                    }
                    .line-item {
                        display: flex;
                        align-items:center;
                    }
                    .legend-line-sample {
                        height: 10px;
                        width: 20px;
                        margin-right: 5px;
                    }
                </style>
                `
            );
            $("body").append(
                `
                <div class='legend-container' style='display: none'>
                    <div class='trap-legend'></div>
                    <div class='line-legend'></div>
                </div>
                `
            );
        }
    }();

    self.showLineLegend = function(lineInfoForLegend) {
        lineInfoForLegend.sort(function(a,b){
            return a.lineName.localeCompare(b.lineName)
        })

        $('.legend-container').show();
        let lineLegend = `
                <div class='legend-title'>Line Legend</div>
                <div class='line-items'>
                `;
            lineInfoForLegend.forEach((lineInfo) => {
                lineLegend += `<div class="line-item"><div class="legend-line-sample" style="background-color: ${lineInfo.lineColour}"></div>${lineInfo.lineName}</div>`;
            });
            lineLegend += "</div>"
        $('.line-legend').html(lineLegend);
    }

    self.showTrapLegend = function() {
        $('.legend-container').show();
        let trapLegend =
            `
            <div class='legend-title'>Trap Legend</div>
            <div class='bad-colour'>RED = serviced > 24 days</div>
            <div class='warning-colour'>ORANGE = serviced > 14 days</div>
            <div class='good-colour'>BLUE = serviced < 14 days</div>
            <div class='icon-legend'><img src='images/BLUE_ICON_Rat.png' alt='rat icon'/>Rat</div>
            <div class='icon-legend'><img src='images/BLUE_ICON_Stoat.png' alt='stoat icon'/>Mustelid</div>
            <div class='icon-legend'><img src='images/BLUE_ICON_Cat.png' alt='cat icon'/>Cat</div>
            <div class='icon-legend'><img src='images/BLUE_ICON_Possum.png' alt='possum icon'/>Possum</div>
            `;
        $('.trap-legend').html(trapLegend);
    }

    // shows the traplines on the map
    self.showTrapLines = function(targetMap, trapLineJsonUrl) {
        lineInfoForLegend = new Array();
        // show the traplines on the map
        $.getJSON( trapLineJsonUrl, function( data ) {
            L.geoJSON(data, {
                style: function (feature) {
                    return {color: feature.properties.colour};
                },
                onEachFeature : function (feature, layer) {
                    layer.bindPopup("This line name is " + layer.feature.properties.line)
                    lineInfoForLegend.push(
                        {
                            lineName: layer.feature.properties.line,
                            lineColour: layer.feature.properties.colour
                        }
                    )
                    self.showLineLegend(lineInfoForLegend);
                }
                }).addTo(targetMap);
        });
    }

    // shows the trapicons on the map
    self.showTrapIcons = function(targetMap, trapJsonUrl) {
        // setup the various icons we want to display for traps
        const iconSize = targetMap.getZoom() * 2;

        const iconTemplate = L.Icon.extend({
            options: {
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize/2, iconSize/2]
            }
        })

        const stoatIcons = [new iconTemplate({iconUrl: imagePath+'RED_ICON_Stoat.png'}), new iconTemplate({iconUrl: imagePath+'ORANGE_ICON_Stoat.png'}), new iconTemplate({iconUrl: imagePath+'BLUE_ICON_Stoat.png'})];
        const ratIcons = [new iconTemplate({iconUrl: imagePath+'RED_ICON_Rat.png'}), new iconTemplate({iconUrl: imagePath+'ORANGE_ICON_Rat.png'}), new iconTemplate({iconUrl: imagePath+'BLUE_ICON_Rat.png'})]
        const possumIcons = [new iconTemplate({iconUrl: imagePath+'RED_ICON_Possum.png'}), new iconTemplate({iconUrl: imagePath+'ORANGE_ICON_Possum.png'}), new iconTemplate({iconUrl: imagePath+'BLUE_ICON_Possum.png'})];
        const catIcons = [new iconTemplate({iconUrl: imagePath+'RED_ICON_Cat.png'}),new iconTemplate({iconUrl: imagePath+'ORANGE_ICON_Cat.png'}),new iconTemplate({iconUrl: imagePath+'BLUE_ICON_Cat.png'})];
        const unknownIcon = new iconTemplate({iconUrl: imagePath+'ICON_Unknown.png'});
        const redIconIndex = 0;
        const orangeIconIndex = 1;
        const blueIconIndex = 2;

        // show the traps on the map
        $.getJSON( trapJsonUrl, function( data ) {
            L.geoJSON(data, {
                filter : function(feature) {
                    // don't include retired traps
                    return feature.properties.retired == 0;
                },
                onEachFeature : function (feature, layer) {
                    
                    const installedDate = Date.parse(layer.feature.properties.date_installed);
                    const installedDisplayDate = new Date(installedDate).toLocaleDateString();

                    const lastRecordDate = Date.parse(layer.feature.properties.last_record_date);
                    const lastRecordDisplayDate = new Date(lastRecordDate).toLocaleDateString();

                    // how many days since the trap last had a record 
                    const daysSinceLastRecord = Math.round(Math.abs((new Date() - new Date(lastRecordDate)) / (24 * 60 * 60 * 1000)));

                    // determine what colour icon we need based on the last trap record
                    let iconColourIndex = blueIconIndex; // default to blue
                    if(isNaN(daysSinceLastRecord)) {
                        iconColourIndex = redIconIndex; // if there has never been a recorded service then set colour to red
                    } else if(daysSinceLastRecord > 28) {
                        iconColourIndex = redIconIndex; 
                    } else if(daysSinceLastRecord > 14) {
                        iconColourIndex = orangeIconIndex;
                    }

                    // determine which animal icon we want
                    if(possumTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(possumIcons[iconColourIndex]);
                    } else if(mustelidTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(stoatIcons[iconColourIndex]);
                    } else if(ratTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(ratIcons[iconColourIndex]);
                    } else if(catTraps.includes(layer.feature.properties.trap_type)) {
                        layer.setIcon(catIcons[iconColourIndex]);
                    } else {
                        console.log("We don't have an icon for this type of trap: " + layer.feature.properties.trap_type);
                        layer.setIcon(unknownIcon);
                    }

                    layer.bindPopup("<p>Trap name: '" + layer.feature.properties.code + "'</p>" + 
                        "<p>Trap type: " + layer.feature.properties.trap_type + 
                        "</p>Installed by " + layer.feature.properties.installed_by + " on " + installedDisplayDate + "</p>" + 
                        "<p>Last serviced on " + lastRecordDisplayDate + " - " + daysSinceLastRecord + " days ago</p>")

                }
            }).addTo(targetMap);
        });
        trapsShown = true;
        self.showTrapLegend();
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