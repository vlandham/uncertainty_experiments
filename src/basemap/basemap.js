
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

  const chart = function wrapper(selection, borders, cities) {

    // auto figure out projection scale and transform from:
    // http://stackoverflow.com/a/14691788
    var b = path.bounds(borders),
      s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
      t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection to use computed scale & translate.
    projection
      .scale(s)
      .translate(t);

    const svg = d3.select(selection).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const EXCLUDE = [
      'El Fasher',
      'Zalingei',
      'Nyala',
      'Ed Daein',
      'Heglig',
      'Geneina (Al Junaynah)',
      'El Fula',
      'El Obeid (Al-Ubayyid)',
      'Kadugli',
      'Rabak',
      'Sennar',
      'Al Qadarif',
      'Ed Damazin'
    ]

    var citiesFiltered = cities.features.filter(function(d) {
      return !EXCLUDE.includes(d.properties['Town_Name']);
    });

    // g.append('path')
    //   .datum(data)
    //   .attr('class', 'feature')
    //   .attr('d', path);

    g.append('g')
      .attr('class', 'states')
      .selectAll('path')
        .data(borders.features)
      .enter()
      .append('path')
        .attr('d', path)
        .attr('class', 'state')
        .attr('fill-opacity', 0.5)
        .attr('stroke', '#222')

    path.pointRadius(2)
    g.append('g')
      .attr('class', 'pois')
      .selectAll('path')
        .data(citiesFiltered)
        .enter()
        .append('path')
      .attr('d', path)
      .attr('class', 'place');

    g.append('g')
      .attr('class', 'poi-labels')
      .selectAll(".place-label")
      .data(citiesFiltered)
      .enter()
      .append("text")
      .attr("class", "place-label")
      .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
      .attr("dy", ".35em")
      .attr("dx", ".35em")
      .text(function(d) { return d.properties['Town_Name']; });

  };

  return chart;
}

function loadBaseMap(selector ) {
  const borderFile = '../../../src/basemap/southsudan_admin.json';
  const cityFile = '../../../src/basemap/sudan_towns.json'
  const map = createMap();
  d3.queue()
    .defer(d3.json, borderFile)
    .defer(d3.json, cityFile)
    .await(function(error, borders, cities) {
      map(selector, borders, cities)
    })
  // d3.json(geojsonFile, function (geojson) {
  //
  //   map(selector, geojson);
  // });

  return map;
}

loadBaseMap('#map');
