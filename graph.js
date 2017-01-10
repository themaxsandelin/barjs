class Graph {

  constructor (container, parameters) {
    this.container = container;
    this.parameters = parameters;
    this.mode = parameters.mode || 'vertical';
    this.axies = {
      x: {},
      y: {}
    };
    this.colors = [ '1abc9c', '2ecc71', '3498db', '9b59b6', '34495e', 'f1c40f', 'e67e22', 'e74c3c' ];
    this.renderedColors = [];

    document.addEventListener('DOMContentLoaded', () => {
      this.defineContainer();
      this.buildGraphElements();
      this.calculateAxies();
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
    this.graph = this.container.querySelector('.graph');
  }

  calculateAxies () {
    const modes = {
      x: 'horizontal',
      y: 'vertical'
    };
    for (let i = 0; i < 2; i++) {
      const axis = (i) ? 'x':'y';
      const entries = this.parameters.entries;
      const totalIsMax = this.mode === modes[axis];

      this.axies[axis] = {
        id: axis,
        iterations: {
          count: 0,
          size: 0,
          value: 0
        },
        element: this.container.querySelector('.axis.'+axis),
        label: this.parameters.labels[axis],
        max: 0,
        total: 0
      };

      for (let e = 0; e < entries.length; e++) {
        this.axies[axis].max = (this.axies[axis].max < entries[e][axis]) ? entries[e][axis]:this.axies[axis].max;
        if (!totalIsMax) this.axies[axis].total += entries[e][axis];
      }
      if (totalIsMax) this.axies[axis].total = this.axies[axis].max;

      if (this.parameters.iterations) {
        const count = (this.parameters.iterations[axis]) ? this.parameters.iterations[axis]:this.parameters.iterations;

        this.axies[axis].iterations.count = count;
        this.axies[axis].iterations.size = 100 / (count + 1);
        this.axies[axis].iterations.value = parseFloat(this.axies[axis].total / (count + 1).toFixed(1));
      }
    }
  }

  renderAxisLabels () {
    const axies = [ 'x', 'y' ];
    for (let i = 0; i < 2; i++) {
      this.axies[axies[i]].element.querySelector('.label').innerText = this.axies[axies[i]].label;
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

    if (axis !== 'y') render(this.axies.x);
    if (axis !== 'x') render(this.axies.y);
  }

  randomizeColor () {
    const lastColor = (this.renderedColors.length) ? this.renderedColors[this.renderedColors.length-1]:'';
    let color = this.colors[ Math.floor( Math.random() * this.colors.length ) ];

    while (color === lastColor) {
      color = this.colors[ Math.floor( Math.random() * this.colors.length ) ];
    }

    this.renderedColors.push(color)
    return color;
  }

  renderEntries () {
    this.graph.innerHTML = '';

    function hexToRgb (hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return parseInt(result[1], 16)+', '+parseInt(result[2], 16)+', '+parseInt(result[3], 16);
    }

    for (let e = 0; e < this.parameters.entries.length; e++) {
      const entry = this.parameters.entries[e];
      const graphWidth = this.graph.offsetWidth;
      const graphHeight = this.graph.offsetHeight;

      const width = (entry.x / this.axies.x.total) * (graphWidth - ((this.mode === 'vertical') ? (2 + (this.parameters.entries.length * 2)):0));
      const height = (entry.y / this.axies.y.total) * (graphHeight - ((this.mode === 'horizontal') ? (2 + (this.parameters.entries.length * 2)):0));
      const color = entry.color || this.randomizeColor();

      const bar = document.createElement('div');
      bar.classList.add('bar');
      bar.style.width = width + 'px';
      bar.style.height = height + 'px';
      bar.style.backgroundColor = 'rgba('+hexToRgb(color)+', 0.3)';
      bar.style.borderColor = '#' + color;

      this.graph.appendChild(bar);
    }

    if (this.mode === 'horizontal') this.graph.classList.add('horizontal');
  }

  resizeRender () {
    const graphWidth = this.graph.offsetWidth;
    const graphHeight = this.graph.offsetHeight;

    const entries = this.parameters.entries;
    const bars = this.graph.querySelectorAll('.bar');
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const bar = bars[i];

      const width = (entry.x / this.axies.x.total) * (graphWidth - ((this.mode === 'vertical') ? (2 + (entries.length * 2)):0));
      const height = (entry.y / this.axies.y.total) * (graphHeight - ((this.mode === 'horizontal') ? (2 + (entries.length * 2)):0));

      bar.style.width = width + 'px';
      bar.style.height = height + 'px';
    }
  }

}
