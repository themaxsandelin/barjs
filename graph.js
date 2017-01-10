class Graph {

  constructor (container, parameters) {
    this.container = container;
    this.parameters = parameters;
    this.stats = {};
    this.mode = parameters.mode || 'vertical';
    this.defaults = {
      iterations: 0
    };

    document.addEventListener('DOMContentLoaded', () => {
      this.defineContainer();
      this.buildGraphElements();
      this.calculateStats();
      this.renderAxisLabels();
      this.renderIterations();
      this.renderEntries();

      window.addEventListener('resize', () => {
        this.resizeRender();
      });
    });
  }

  defineContainer () {
    this.container = document.querySelector(this.container);
    if (!this.container.classList.contains('graphContainer')) this.container.classList.add('graphContainer');
  }

  buildGraphElements () {
    // Builds both axis elements with required child elements.
    function buildAxisElements (container) {
      // X-Axis build
      const xAxis = document.createElement('div');
      xAxis.classList.add('axis');
      xAxis.classList.add('x');

      const xLabel = document.createElement('div');
      xLabel.classList.add('label');
      xAxis.appendChild(xLabel);

      const xIterations = document.createElement('div');
      xIterations.classList.add('iterations');

      const xIterationsInner = document.createElement('div');
      xIterationsInner.classList.add('inner');
      xIterations.appendChild(xIterationsInner);

      const xLines = document.createElement('div');
      xLines.classList.add('lines');

      xAxis.appendChild(xLines);
      xAxis.appendChild(xIterations);

      // Y-Axis build
      const yAxis = document.createElement('div');
      yAxis.classList.add('axis');
      yAxis.classList.add('y');

      const yLabel = document.createElement('div');
      yLabel.classList.add('label');
      yAxis.appendChild(yLabel);

      const yIterations = document.createElement('div');
      yIterations.classList.add('iterations');

      const yIterationsInner = document.createElement('div');
      yIterationsInner.classList.add('inner');
      yIterations.appendChild(yIterationsInner);

      const yLines = document.createElement('div');
      yLines.classList.add('lines');

      yAxis.appendChild(yLines);
      yAxis.appendChild(yIterations);

      container.appendChild(yAxis);
      container.appendChild(xAxis);
    }

    function buildGraph (container) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('graphWrapper');

      const graph = document.createElement('div');
      graph.classList.add('graph');

      wrapper.appendChild(graph);
      container.appendChild(wrapper);
    }

    this.container.innerHTML = '';

    buildAxisElements(this.container);
    buildGraph(this.container);
  }

  calculateStats () {
    const entries = this.parameters.entries;
    const axies = {
      x: {
        id: 'x',
        iterations: {
          count: this.defaults.iterations,
          size: 0,
          value: 0
        },
        element: this.container.querySelector('.axis.x'),
        max: 0,
        total: 0,
        label: this.parameters.labels.x
      },
      y: {
        id: 'y',
        iterations: {
          count: this.defaults.iterations,
          size: 0,
          value: 0
        },
        element: this.container.querySelector('.axis.y'),
        max: 0,
        total: 0,
        label: this.parameters.labels.y
      }
    };

    for (let a = 0; a < entries.length; a++) {
      const entry = entries[a];
      axies.x.max = (axies.x.max < entry.x) ? entry.x:axies.x.max;
      axies.y.max = (axies.y.max < entry.y) ? entry.y:axies.y.max;

      if (this.mode === 'vertical') axies.x.total += entry.x;
      if (this.mode === 'horizontal') axies.y.total += entry.y;
    }

    if (this.mode === 'vertical') axies.y.total = axies.y.max;
    if (this.mode === 'horizontal') axies.x.total = axies.x.max;

    const graph = {
      element: this.container.querySelector('.graph'),
      width: this.container.querySelector('.graph').offsetWidth,
      height: this.container.querySelector('.graph').offsetHeight
    };

    if (this.parameters.iterations !== undefined) {
      if (this.parameters.iterations.x !== undefined) axies.x.iterations.count = this.parameters.iterations.x;
      if (this.parameters.iterations.y !== undefined) axies.y.iterations.count = this.parameters.iterations.y;
    }

    axies.x.iterations.size = 100 / (axies.x.iterations.count + 1);
    axies.x.iterations.value = parseFloat(axies.x.total / (axies.x.iterations.count + 1)).toFixed(1);

    axies.y.iterations.size = 100 / (axies.y.iterations.count + 1);
    axies.y.iterations.value = parseFloat(axies.y.total / (axies.y.iterations.count + 1)).toFixed(1);

    this.stats = {
      axies: axies,
      graph: graph
    };
  }

  renderAxisLabels () {
    for (let i = 0; i < 2; i++) {
      const axis = (i === 0) ? this.stats.axies.x:this.stats.axies.y;
      axis.element.querySelector('.label').innerText = axis.label;
    }
  }

  renderIterations (axis) {

    function render (axis) {
      const count = axis.iterations.count + 2; // Add 2 to accomodate for origo(0) and max value

      for (let x = 0; x < count; x++) {
        const element = axis.element.querySelector('.iterations .inner');
        const value = x * axis.iterations.value;

        const label = document.createElement('p');
        label.innerText = (x > 0 && x < (count - 1)) ? value.toFixed(1):((x === 0) ? 0:axis.total);

        if (x > 0 && x < (count - 1)) {
          if (axis.id === 'x') {
            label.style.left = (axis.iterations.size * x) + '%';
          } else {
            label.style.bottom = (axis.iterations.size * x) + '%';
          }

          const lines = axis.element.querySelector('.lines');
          const line = document.createElement('div');
          line.classList.add('line');
          line.style[(axis.id === 'x') ? 'left':'top'] = (axis.iterations.size * x) + '%';

          lines.appendChild(line);
        }

        element.appendChild(label);
      }
    }

    if (axis !== 'y') render(this.stats.axies.x);
    if (axis !== 'x') render(this.stats.axies.y);
  }

  renderEntries () {

    function calculateEntryProportions (entry) {
      const entryCount = this.parameters.entries.length;
      const width = this.stats.graph.width - ((this.mode === 'vertical') ? (2 + (entryCount * 2)):0);
      const height = this.stats.graph.height - ((this.mode === 'horizontal') ? (2 + (entryCount * 2)):0);

      // Calculate width and height percentage
      const widthPercentage = entry.x / this.stats.axies.x.total;
      const heightPercentage = entry.y / this.stats.axies.y.total;

      // Return width and height calculations
      return {
        width: Math.floor(width * widthPercentage),
        height: Math.floor(height * heightPercentage)
      };
    }

    this.stats.graph.element.innerHTML = '';

    for (let e = 0; e < this.parameters.entries.length; e++) {
      const entry = this.parameters.entries[e];
      const proportions = calculateEntryProportions.bind(this)(entry, this.stats, this.parameters.entries.length);

      const bar = document.createElement('div');
      bar.classList.add('bar');
      bar.style.width = proportions.width + 'px';
      bar.style.height = proportions.height + 'px';

      this.stats.graph.element.appendChild(bar);
    }

    if (this.mode === 'horizontal') this.stats.graph.element.classList.add('horizontal');
  }

  resizeRender () {
    const graphWidth = this.stats.graph.element.offsetWidth;
    const graphHeight = this.stats.graph.element.offsetHeight;

    const entries = this.parameters.entries;
    const bars = this.stats.graph.element.querySelectorAll('.bar');
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const bar = bars[i];

      const width = (entry.x / this.stats.axies.x.total) * (graphWidth - ((this.mode === 'vertical') ? (2 + (entries.length * 2)):0));
      const height = (entry.y / this.stats.axies.y.total) * (graphHeight - ((this.mode === 'horizontal') ? (2 + (entries.length * 2)):0));

      bar.style.width = width + 'px';
      bar.style.height = height + 'px';
    }
  }

}
