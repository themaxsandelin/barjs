class Graph {

  constructor (container, parameters) {
    this.container = container;
    this.parameters = parameters;
    this.stats = {};
    this.defaults = {
      iterations: 2
    };

    document.addEventListener('DOMContentLoaded', () => {
      this.defineContainer();
      this.buildGraphElements();
      this.calculateStats();
      this.renderAxisLabels();
      this.renderIterations();
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
      axies.y.max = (axies.y.max < entry.y) ? entry.x:axies.y.max;

      axies.x.total += entry.x;
      axies.y.total += entry.y;
    }

    const graph = {
      element: this.container.querySelector('.graph'),
      width: this.container.querySelector('.graph').offsetWidth,
      height: this.container.querySelector('.graph').offsetHeight
    };

    if (this.parameters.iterations !== null) {
      if (this.parameters.iterations !== null) axies.x.iterations.count = this.parameters.iterations.x;
      if (this.parameters.iterations !== null) axies.y.iterations.count = this.parameters.iterations.y;
    }

    axies.x.iterations.size = graph.width / (axies.x.iterations.count + 1);
    axies.x.iterations.value = parseFloat(axies.x.max / (axies.x.iterations.count + 1)).toFixed(1);

    axies.y.iterations.size = graph.height / (axies.y.iterations.count + 1);
    axies.y.iterations.value = parseFloat(axies.y.max / (axies.y.iterations.count + 1)).toFixed(1);

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
        label.innerText = (x > 0 && x < (count - 1)) ? value:((x === 0) ? 0:axis.max);

        if (x > 0 && x < (count - 1)) {
          label.style[(axis.id === 'x') ? 'left':'top'] = (axis.iterations.size * x) + 'px';

          const lines = axis.element.querySelector('.lines');
          const line = document.createElement('div');
          line.classList.add('line');
          line.style[(axis.id === 'x') ? 'left':'top'] = (axis.iterations.size * x) + 'px';

          lines.appendChild(line);
        }

        element.appendChild(label);
      }
    }

    if (axis !== 'y') render(this.stats.axies.x);
    if (axis !== 'x') render(this.stats.axies.y);
  }

}
