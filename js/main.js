d3.json("data/us_states.json").then(function (usMapData) {
    d3.csv("data/All_Places_of_Worship.csv").then(function (data) {

        const svg = d3.select("#detail-view")
            .append("svg")
            .attr("width", 800)
            .attr("height", 600);
        const projection = d3.geoAlbersUsa()
            .fitSize([2400, 1800], usMapData);
        const path = d3.geoPath().projection(projection);

        svg.selectAll("path")
            .data(usMapData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#fffacd")
            .attr("stroke", "black");

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => {
                const projected = projection([d.X, d.Y]);
                if (projected) {
                    return projected[0];
                } else {
                    return ; 
                }
            })
            .attr("cy", d => {
                const projected = projection([d.X, d.Y]);
                if (projected) {
                    return projected[1];
                } else {
                    return ; 
                }
            })
            .attr("r", 0.9)
            .style("fill", d => {
                if (d.SUBTYPE === "BUDDHIST") return "blue";
                if (d.SUBTYPE === "CHRISTIAN") return "green";
                if (d.SUBTYPE === "HINDU") return "red";
                if (d.SUBTYPE === "JUDAIC") return "yellow";
                if (d.SUBTYPE === "MUSLIM") return "pink";
                if (d.SUBTYPE === "OTHER") return "brown";
            });
    });
});

d3.json("data/us_states.json").then(function (usMapData) {
    d3.csv("data/All_Places_of_Worship.csv").then(function (data) {
        const svg = d3.select("#control-map")
            .append("svg")
            .attr("width", 400)
            .attr("height", 280);

        const projection = d3.geoAlbersUsa().fitSize([400, 280], usMapData);
        const path = d3.geoPath().projection(projection);

        svg.selectAll("path")
            .data(usMapData.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", "#d3d3d3")
            .attr("stroke", "black");

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", d => {
                const projected = projection([d.X, d.Y]);
                if (projected) {
                    return projected[0];
                } else {
                    return ; 
                }
            })
            .attr("cy", d => {
                const projected = projection([d.X, d.Y]);
                if (projected) {
                    return projected[1];
                } else {
                    return ; 
                }
            })
            .attr("r", 0.9)
            .style("fill", d => {
                if (d.SUBTYPE === "BUDDHIST") return "blue";
                if (d.SUBTYPE === "CHRISTIAN") return "green";
                if (d.SUBTYPE === "HINDU") return "red";
                if (d.SUBTYPE === "JUDAIC") return "yellow";
                if (d.SUBTYPE === "MUSLIM") return "pink";
                if (d.SUBTYPE === "OTHER") return "brown";
            });
    });
})

