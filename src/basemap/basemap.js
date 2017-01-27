
function createMap() {
  const width = 800;
  const height = 800;
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  let g = null;
  let data = [];

  // Create a unit projection.
  const projection = d3.geoMercator()
    .scale(1)
    .translate([0, 0]);

  // Create a path generator.
  const path = d3.geoPath()
      .projection(projection);

  const chart = function wrapper(selection, geoJson) {
    console.log(geoJson);

    // auto figure out projection scale and transform from:
    // http://stackoverflow.com/a/14691788
    var b = path.bounds(geoJson),
      s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection to use computed scale & translate.
    projection
      .scale(s)
      .translate(t);

    data = geoJson;

    const svg = d3.select(selection).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // g.append('path')
    //   .datum(data)
    //   .attr('class', 'feature')
    //   .attr('d', path);

    g.append('g')
      .attr('class', 'states')
      .selectAll('path')
        .data(data.features)
      .enter()
      .append('path')
        .attr('d', path)
        .attr('class', 'state')
        .attr('fill-opacity', 0.5)
        .attr('stroke', '#222')
  };

  return chart;
}

function loadBaseMap(selector, geojsonFile) {
  const map = createMap();
  d3.json(geojsonFile, function (geojson) {

    map(selector, geojson);
  });

  return map;
}

loadBaseMap('#map', '/src/basemap/southsudan_admin.json');
