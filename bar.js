class Chart {

  constructor (container, parameters) {
    this.parameters = parameters;

    this.container = container;
    this.labels = parameters.labels || [];
    this.spacing = parameters.spacing || 0;
    this.mode = parameters.mode || 'vertical';
    this.data = parameters.data || [];
    this.stats = {};
    this.axies = {
      x: {},
      y: {}
    };
    this.colors = [ '1abc9c', '2ecc71', '3498db', '9b59b6', '34495e', 'f1c40f', 'e67e22', 'e74c3c' ];
    this.renderedColors = [];

    document.addEventListener('DOMContentLoaded', () => {
      this.defineContainer();
      this.buildChartElements();

      this.calculateStats();
      this.calculateAxies();

      // this.renderAxisLabels();
      this.renderIterations('x');
      this.renderIterations('y');
      this.renderData();

      window.addEventListener('resize', () => {
        this.resizeRender();
      });
    });
  }

  defineContainer () {
    this.container = document.querySelector(this.container);
    if (!this.container.classList.contains('chartContainer')) this.container.classList.add('chartContainer');
  }

  buildChartElements () {
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

    function buildChart (container) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('chartWrapper');

      const chart = document.createElement('div');
      chart.classList.add('chart');

      wrapper.appendChild(chart);
      container.appendChild(wrapper);
    }

    this.container.innerHTML = '';

    buildAxisElements(this.container);
    buildChart(this.container);
  }

  calculateStats () {
    this.chart = this.container.querySelector('.chart');
    const mainAxis = (this.mode === 'vertical') ? 'y':'x';
    const width = this.chart.offsetWidth;
    const height = this.chart.offsetHeight;

    let max = 0;
    let min = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i][mainAxis] < 0) this.data[i].negative = true;

      if (max < this.data[i][mainAxis]) max = this.data[i][mainAxis];
      if (min > this.data[i][mainAxis]) min = this.data[i][mainAxis];
    }

    let mainSize = (max / (max + (min * -1))) * ((mainAxis === 'y') ? height:width);
    let extraSize = ((min * -1) / (max + (min * -1))) * ((mainAxis === 'y') ? height:width);

    if (extraSize > 0) {
      mainSize -= 1;
    }

    this.stats = {
      width: width,
      height: height,
      mainSize: mainSize,
      extraSize: extraSize,
      mainAxis: mainAxis,
      mainMax: max,
      mainMin: min
    };
  }

  calculateAxies () {
    for (let i = 0; i < 2; i++) {
      const axis = (i) ? 'x':'y';
      const data = this.data;
      const isMainAxis = (axis === this.stats.mainAxis);

      this.axies[axis] = {
        id: axis,
        iterations: {
          count: 0,
          size: 0,
          value: 0
        },
        element: this.container.querySelector('.axis.'+axis),
        label: (this.labels) ? this.labels[axis]:'',
        max: 0,
        min: 0,
        total: 0,
        mainTotal: 0,
        extraTotal: 0
      };

      for (let e = 0; e < data.length; e++) {
        if (data[e].invalid) return;

        // Negative values should only be supported when the axis is the same as the mode
        // - Negative Y value only works when Mode is Vertical
        // - Negative X Value only works when Mode is Hortizontal
        if (!isMainAxis && data[e][axis] < 0) {
          data[e].invalid = true;
          return;
        }

        if (this.axies[axis].max < data[e][axis]) this.axies[axis].max = data[e][axis];
        if (isMainAxis && this.axies[axis].min > data[e][axis]) this.axies[axis].min = data[e][axis];

        if (!isMainAxis && data[e][axis] >= 0) this.axies[axis].total += data[e][axis];
        if (!isMainAxis && data[e][axis] >= 0) this.axies[axis].mainTotal += data[e][axis];
      }

      if (isMainAxis) this.axies[axis].total = this.axies[axis].max;
      if (isMainAxis) {
        this.axies[axis].mainTotal = this.axies[axis].max;
        this.axies[axis].extraTotal = this.axies[axis].min * -1;
      }

      if (this.parameters.iterations) {
        const count = (this.parameters.iterations[axis]) ? this.parameters.iterations[axis]:this.parameters.iterations;

        this.axies[axis].iterations.count = count;
        this.axies[axis].iterations.size = 100 / (count + 1);
        this.axies[axis].iterations.value = parseFloat(this.axies[axis].max / (count + 1).toFixed(1));
      }
    }
  }

  renderAxisLabels () {
    if (!this.labels) return;

    const axies = [ 'x', 'y' ];
    for (let i = 0; i < 2; i++) {
      this.axies[axies[i]].element.querySelector('.label').innerText = this.axies[axies[i]].label;
    }
  }

  renderIterations (axisChar) {
    const axis = this.axies[axisChar];
    const lines = axis.element.querySelector('.lines');
    const iterations = axis.element.querySelector('.iterations .inner');

    // Render the axis label, if specified
    if (axis.label) axis.element.querySelector('.label').innerText = axis.label;

    // Render out the first value of the axis (minimum value)
    const firstValue = document.createElement('p');
    firstValue.innerText = axis.min.toFixed(1).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,'$1');
    iterations.appendChild(firstValue);

    // Calculate the percentage size of each iteration
    let iterationPercentage = (1 / (axis.iterations.count + 1));
    let extra = 0;
    if (axisChar === this.stats.mainAxis) {
      iterationPercentage = (iterationPercentage * this.stats.mainSize) / (this.stats.mainAxis === 'y' ? this.stats.height:this.stats.width);
      const iterationSize = (axisChar === 'y' ? this.stats.height:this.stats.width) * iterationPercentage;
      extra = Math.floor(this.stats.extraSize / iterationSize);
    }

    // Render regular iterations (on positive side of mainAxis as well)
    for (let i = 0; i < axis.iterations.count; i++) {
      const line = document.createElement('div');
      const term = (axisChar === 'y') ? 'top':'right';
      const move = ((iterationPercentage * 100) * (i + 1));

      line.classList.add('line');
      line.style[term] = move + '%';
      lines.appendChild(line);

      const value = axis.iterations.value * (axis.iterations.count - (i));
      const label = document.createElement('p');
      label.innerText = value.toFixed(1).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,'$1');
      label.style[term] = move + '%';
      iterations.appendChild(label);
    }

    // Render extra iterations (on the mainAxis only)
    if (axisChar === this.stats.mainAxis) {
      for (let j = 0; j < extra; j++) {
        const count = axis.iterations.count + 1 + (j+1);

        const line = document.createElement('div');
        const term = (axisChar === 'y') ? 'top':'right';
        const move = ((iterationPercentage * 100) * count);
        line.classList.add('line');
        line.style[term] = move + '%';
        lines.appendChild(line);

        const label = document.createElement('p');
        const value = 0 - axis.iterations.value * (j + 1);
        label.innerText = value;
        label.style[term] = move + '%';
        iterations.appendChild(label);
      }
    }

    // If there is a negative value, render origo (0) first
    if (this.stats.mainAxis === axisChar && this.stats.extraSize > 0) {
      const term = (this.mode === 'vertical') ? 'top':'right';
      const move = ((iterationPercentage * 100) * (axis.iterations.count + 1));
      const origo = document.createElement('div');
      origo.classList.add('line');
      origo.classList.add('origo');
      origo.style[term] = move + '%';
      lines.appendChild(origo);

      const origoLabel = document.createElement('p');
      origoLabel.innerText = 0;
      origoLabel.style[term] = move + '%';
      iterations.appendChild(origoLabel);
    }

    // Render out the last iteration label (maximum / total value)
    const lastValue = document.createElement('p');
    lastValue.innerText = axis.max.toFixed(1).replace(/([0-9]+(\.[0-9]+[1-9])?)(\.?0+$)/,'$1');
    iterations.appendChild(lastValue);
  }

  randomizeColor () {
    const lastColor = (this.renderedColors.length) ? this.renderedColors[this.renderedColors.length-1]:'';
    let color = this.colors[ Math.floor( Math.random() * this.colors.length ) ];

    while (color === lastColor) {
      color = this.colors[ Math.floor( Math.random() * this.colors.length ) ];
    }

    this.renderedColors.push(color);
    return color;
  }

  calculateEntryProportions (entry) {
    let width = 0;
    let height = 0;
    let difference = this.data.length * this.spacing;

    if (this.stats.mainAxis === 'y') {
      width = (entry.x / this.axies.x.total) * (this.stats.width - difference);
      if (entry.negative) {
        height = ((entry.y*-1) / this.axies.y.extraTotal) * this.stats.extraSize;
      } else {
        height = (entry.y / this.axies.y.mainTotal) * this.stats.mainSize;
      }
    } else {
      if (entry.negative) {
        width = ((entry.x*-1) / this.axies.x.extraTotal) * this.stats.extraSize;
      } else {
        width = (entry.x / this.axies.x.mainTotal) * this.stats.mainSize;
      }
      height = (entry.y / this.axies.y.total) * (this.stats.height - difference);
    }

    return {
      width: width,
      height: height
    };
  }

  renderData () {
    this.chart.innerHTML = '';
    if (this.mode === 'horizontal') this.chart.classList.add('horizontal');

    const chartWidth = this.chart.offsetWidth;
    const chartHeight = this.chart.offsetHeight;

    let totalBarWidth = 0;

    function hexToRgb (hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return parseInt(result[1], 16)+', '+parseInt(result[2], 16)+', '+parseInt(result[3], 16);
    }

    for (let e = 0; e < this.data.length; e++) {
      const entry = this.data[e];
      if (entry.invalid) return;

      const proportions = this.calculateEntryProportions(entry);
      const color = entry.color || this.randomizeColor();
      const margin = (this.mode === 'vertical') ? '0px ' + (this.spacing / 2) + 'px': (this.spacing / 2) + 'px 0px';

      const bar = document.createElement('div');
      bar.classList.add('bar');
      bar.style.width = proportions.width + 'px';
      bar.style.height = proportions.height + 'px';
      bar.style.backgroundColor = 'rgba('+hexToRgb(color)+', 0.3)';
      bar.style.borderColor = '#' + color;
      bar.style.margin = margin;

      totalBarWidth += proportions.width;

      if (this.stats.extraSize > 0) {
        if (!entry.negative) {
          if (this.mode === 'vertical') {
            bar.style.transform = 'translate3d(0px,-'+this.stats.extraSize+'px,0px)';
          } else {
            bar.style.transform = 'translate3d('+this.stats.extraSize+'px,0px,0px)';
          }
        } else {
          bar.classList.add('negative');
          if (this.mode === 'vertical') {
            bar.style.transform = 'translate3d(0px,-'+(this.stats.extraSize - proportions.height)+'px,0px)';
          } else {
            bar.style.transform = 'translate3d('+(this.stats.extraSize - proportions.width)+'px,0px,0px)';
          }
        }
      }

      this.chart.appendChild(bar);
    }
    console.log(chartWidth, totalBarWidth);
  }

  resizeRender () {
    const width = this.chart.offsetWidth;
    const height = this.chart.offsetHeight;

    if (width === this.stats.width && height === this.stats.height) return;

    this.stats.width = width;
    this.stats.height = height;

    this.stats.mainSize = (this.stats.mainMax / (this.stats.mainMax + (this.stats.mainMin * -1))) * ((this.stats.mainAxis === 'y') ? this.stats.height:this.stats.width);
    this.stats.extraSize = ((this.stats.mainMin * -1) / (this.stats.mainMax + (this.stats.mainMin * -1))) * ((this.stats.mainAxis === 'y') ? this.stats.height:this.stats.width);

    if (this.stats.extraSize > 0) {
      this.stats.mainSize -= 1;
    }

    const data = this.data;
    const bars = this.chart.querySelectorAll('.bar');
    for (let i = 0; i < data.length; i++) {
      const entry = data[i];
      const bar = bars[i];

      const proportions = this.calculateEntryProportions(entry);

      bar.style.width = proportions.width + 'px';
      bar.style.height = proportions.height + 'px';

      if (this.stats.extraSize > 0) {
        if (!entry.negative) {
          if (this.mode === 'vertical') {
            bar.style.transform = 'translate3d(0px,-'+this.stats.extraSize+'px,0px)';
          } else {
            bar.style.transform = 'translate3d('+this.stats.extraSize+'px,0px,0px)';
          }
        } else {
          bar.classList.add('negative');
          if (this.mode === 'vertical') {
            bar.style.transform = 'translate3d(0px,-'+(this.stats.extraSize - proportions.height)+'px,0px)';
          } else {
            bar.style.transform = 'translate3d('+(this.stats.extraSize - proportions.width)+'px,0px,0px)';
          }
        }
      }
    }
  }

}
