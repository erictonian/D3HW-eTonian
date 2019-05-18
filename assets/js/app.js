let svgWidth = 1080;
let svgHeight = 600;

let margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
let chosenXAxis = "poverty"
let chosenYAxis = "healthcare"

// function used for updating x-scale let upon click on axis label
function xScale(demoData, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(demoData, d => d[chosenXAxis]) * 0.9,
            d3.max(demoData, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);

    return xLinearScale;

}

function yScale(demoData, chosenYAxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(demoData, d => d[chosenYAxis]) * 0.75,
            d3.max(demoData, d => d[chosenYAxis]) * 1.05
        ])
        .range([height, 0]);

    return yLinearScale;

}

// function used for updating xAxis let upon click on axis label
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderXCircles(circlesXGroup, newXScale, chosenXAxis) {
    circlesXGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))

    return circlesXGroup;
}

function renderYCircles(circlesYGroup, newYScale, chosenYAxis) {
    circlesYGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))

    return circlesYGroup;
}

// function used to create x circle labels
function renderXLabels(labelsXGroup, newXScale, chosenXAxis) {
    labelsXGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))

    return labelsXGroup
}

// function used to create y circle labels
function renderYLabels(labelsYGroup, newYScale, chosenYAxis) {
    labelsYGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis] - .2))

    return labelsYGroup
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let xlabel = ""
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty (%):";
    } else if (chosenXAxis === "age") {
        xlabel = "Age :"
    } else {
        xlabel = "Income ($):";
    }

    let ylabel = ""
    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare (%):"
    } else if (chosenYAxis === "smokes") {
        ylabel = "Smokes (%):"
    } else {
        ylabel = "Obesity (%):"
    }

    let toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
            toolTip.show(data, this);
        })
        // onmouseout event
        .on("mouseout", function (data, index) {
            toolTip.hide(data, this);
        });

    return circlesGroup;
}

(async function () {
    let demoData = await d3.csv("assets/data/data.csv");

    // parse data
    demoData.forEach(data => {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // LinearScale functions above csv import
    let xLinearScale = xScale(demoData, chosenXAxis);
    let yLinearScale = yScale(demoData, chosenYAxis)

    // Create initial axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(demoData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("class", "stateCircle")

    // append initial circle labels    
    let circlesLabel = chartGroup.selectAll(".circleLabel")
        .data(demoData)
        .enter()
        .append("text")
        .text(data => data.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis] - .22))
        .attr("class", "stateText")
        .attr("font-size", "14px")

    // Create group for  2 x- axis labels
    let xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    let povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    let ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // append y axis
    let yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    let healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "60px")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)
        .text("Lacks Healthcare (%)");

    let smokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "40px")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .classed("active", false)
        .text("Smokes (%)");

    let obesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "20px")
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .classed("active", false)
        .text("Obese (%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            let value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(demoData, chosenXAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

                // update lables with new x values
                circlesLabel = renderXLabels(circlesLabel, xLinearScale, chosenXAxis)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            let value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                console.log(chosenYAxis)

                // functions here found above csv import
                // updates x scale for new data
                yLinearScale = yScale(demoData, chosenYAxis);

                // updates x axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

                // update lables with new x values
                circlesLabel = renderYLabels(circlesLabel, yLinearScale, chosenYAxis)

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
})()