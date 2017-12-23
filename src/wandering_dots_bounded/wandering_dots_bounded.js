function createWanderingDots() {
  const width = 300;
  const height = 300;
  let ctx = null;
  let particles = [];
  let t = null;
  let numParticles = 200;
  const particleR = 2.5;
  let running = true;
  let color = [0,0,0,0.8]

  let boundaryPolygon = [[0, 0], [width, 0], [width, height], [0, height], [0, 0]];
  let hull = d3.polygonHull(boundaryPolygon);
  let centroid = d3.polygonCentroid(boundaryPolygon);

  // a value between 0 and 1 which determines how close to the centroid
  // new points spawn. 1 = at centroid, 0 = at boundary.
  let centroidPull = 0.1;

  const tau = 2 * Math.PI;

  // helper to find a point within a convex hull by selecting three
  // points on the hull edge and interpolating between them.
  function pointWithinHull() {
    let hullPointA = hull[Math.floor(Math.random() * hull.length)];
    let hullPointB;
    do {
      hullPointB = hull[Math.floor(Math.random() * hull.length)];
    } while (hullPointA === hullPointB);

    let hullPointC;
    do {
      hullPointC = hull[Math.floor(Math.random() * hull.length)];
    } while (hullPointA === hullPointC && hullPointB === hullPointC);

    let point = d3.interpolateArray(hullPointA, hullPointB)(Math.random());
    point = d3.interpolateArray(point, hullPointC)(Math.random());

    // pull it slightly towards the middle so that points do not end up on
    // a border and get rejected
    point = d3.interpolateArray(point, centroid)(centroidPull);

    return point;
  }

  // helper to find a point within a polygon by selecting a point
  // within its hull until one is within the polygon
  function pointWithinPolygon() {
    let point;

    let attempts = 0;
    do {
      point = pointWithinHull();
      attempts += 1;
    } while (attempts < 10 && !d3.polygonContains(boundaryPolygon, point));

    if (attempts >= 10) {
      point = centroid;
    }

    return point;
  }

  function setupParticles() {
    particles = new Array(numParticles);

    for (let i = 0; i < numParticles; ++i) {
      const point = pointWithinPolygon();
      particles[i] = {
        x: point[0],
        y: point[1],
        vx: 0,
        vy: 0,
      };
    }
  }

  const chart = function wrapper(selection) {
    setupParticles();

    const div = d3.select(selection).append('div')
      .attr('class', 'vis')
      .style('width', width + 'px');

    const canvas = div.append('canvas')
      .attr('width', width)
      .attr('height', height);

    div.append('button')
      .attr('class', 'toggle-btn')
      .on('click', toggle)
      .text('start/stop');

    const scale = window.devicePixelRatio;
    ctx = canvas.node().getContext('2d');
    if (scale > 1) {
      canvas.style('width', width + 'px');
      canvas.style('height', height + 'px');
      canvas.attr('width', width * scale);
      canvas.attr('height', height * scale);
      ctx.scale(scale, scale);
    }

    t = d3.timer(update);
  };

  function update(elapsed) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // draw the boundaryPolygon
    ctx.strokeStyle = 'tomato';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(boundaryPolygon[0], boundaryPolygon[1]);
    boundaryPolygon.slice(1).forEach((point, i) => {
      ctx.lineTo(point[0], point[1]);
    });
    ctx.closePath();
    ctx.stroke();

    const spaceX = width / 2;
    const spaceY = height / 2;

    for (let i = 0; i < numParticles; ++i) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // generate a new point if it goes out of bounds
      if (!d3.polygonContains(boundaryPolygon, [p.x, p.y])) {
        const point = pointWithinPolygon();
        p.x = point[0];
        p.y = point[1];
      }

      p.vx += 0.2 * (Math.random() - 0.5) - 0.01 * p.vx;
      p.vy += 0.2 * (Math.random() - 0.5) - 0.01 * p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, particleR, 0, tau);
      ctx.fill();
    }
    ctx.restore();
  }

  function toggle() {
    if (running) {
      running = false;
      t.stop();
    } else {
      running = true;
      t.restart(update);
    }
  }

  chart.count = function count(_) {
    if (!arguments.length) {
      return numParticles;
    }

    numParticles = _;
    return this;
  };

  chart.boundary = function boundary(_) {
    if (!arguments.length) {
      return boundaryPolygon;
    }

    boundaryPolygon = _;
    hull = d3.polygonHull(boundaryPolygon);
    centroid = d3.polygonCentroid(boundaryPolygon);

    return this;
  };

  chart.centroidPull = function centroidPullGetterSetter(_) {
    if (!arguments.length) {
      return centroidPull;
    }

    centroidPull = _;
    return this;
  };

  return chart;
}

// draw with no specified boundary
const plot = createWanderingDots();
plot('#dot1');

// draw based on manual polygon pixels
const polygon = [
  [20, 20],
  [40, 10],
  [70, 25],
  [200, 5],
  [280, 50],
  [260, 100],
  [270, 200],
  [150, 240],
  [100, 100],
  [0, 30],
]
const plot2 = createWanderingDots().boundary(polygon);
plot2('#dot2');

// draw based on admin shape
const adminFile = '../../../src/basemap/southsudan_admin.json'
d3.json(adminFile, (err, admin) => {
  // just use the first admin area as an example
  const polygonGeoJson = admin.features[0].geometry;
  const coordinates = polygonGeoJson.coordinates[0];

  // project to the 300x300 box
  const projection = d3.geoMercator()
    .scale(1)
    .translate([0, 0])
    .fitSize([300, 300], polygonGeoJson);

  // convert lat long to pixel based on projection
  const pixelCoords = coordinates.map(projection);

  // draw the plots
  const plot3 = createWanderingDots().boundary(pixelCoords);
  plot3('#dot3');

  const plotc1 = createWanderingDots().boundary(pixelCoords).centroidPull(0.1);
  plotc1('#dotc1');

  const plotc2 = createWanderingDots().boundary(pixelCoords).centroidPull(0.5);
  plotc2('#dotc2');

  const plotc3 = createWanderingDots().boundary(pixelCoords).centroidPull(1.0);
  plotc3('#dotc3');
})
