class Chart {

  constructor (selector, parameters) {
    this.data = parameters.data || [];
    this.orientation = parameters.orientation || 'vertical';
    this.titles = parameters.titles || [];

    this.iterations = parameters.iterations || 0;
    this.spacing = parameters.spacing || 0;

    this.hideLines = parameters.hideLines || false;
    this.hideLabels = parameters.hideLabels || false;
    this.hideTitles = parameters.hideTitles || !this.titles.length;
    this.responsive = (parameters.responsive === false || parameters.responsive === true) ? parameters.responsive:true;

    this.colors = [ '1abc9c', '2ecc71', '3498db', '9b59b6', '34495e', 'f1c40f', 'e67e22', 'e74c3c' ];
    this.renderedColors = [];

    this.calculateStats();
    document.addEventListener('DOMContentLoaded', () => {
      this.defineContainer(selector);
      this.buildGraph();
      this.renderTitles();
      this.renderIterations();
      this.renderData(this.data);

      if (!this.responsive) return;
      window.addEventListener('resize', () => {
        this.resizeData();
      });
    });
  }

  calculateStats () {
    const axies = {
      x: {
        max: 0,
        total: 0,
        min: 0
      },
      y: {
        max: 0,
        total: 0,
        min: 0
      }
    };

    let valueType = '';
    for (let i = 0; i < this.data.length; i++) {
      let value = this.data[i];
      let type = typeof value;

      if (type === 'string') {
        value = parseFloat(value);
        type = typeof value;
      }

      if (typeof value.concat === 'function') {
        value = {
          x: value[0],
          y: value[1]
        };
      }

      if (type === 'object' && value.value) type = 'number';

      if (!valueType) valueType = type;

      if (valueType !== type) {
        throw new Error('All values have to be of the same type.');
      }
      if (type === 'array' && value.length !== 2) {
        throw new Error('The array length has to be 2 to account for both axies (x, y).');
      }
      if (this.orientation === 'vertical' && type === 'object' && value.x < 0) {
        throw new Error('You cannot have a negative X value in a vertical graph.');
      }
      if (this.orientation === 'horizontal' && type === 'object' && value.y < 0) {
        throw new Error('You cannot have a negative Y value in a horizontal graph.');
      }

      this.singleAxis = (type === 'number');
      this.mainAxis = (this.orientation === 'vertical') ? 'y':'x';

      if (!this.singleAxis && this.titles.length && this.titles.length !== 2) {
        throw new Error('Since you supplied data for both axies you also need to supply either titles for both axies or exclude titles all together.');
      }

      function pushValueToAxis (value, a) {
        if (value.value) value = value.value;

        if (value >= 0) {
          axies[a].total += value;
          if (axies[a].max < value) axies[a].max = value;
        } else if (value < 0 && axies[a].min > value) {
          axies[a].min = value;
        }
      }

      if (type === 'number') {
        pushValueToAxis(value, (this.orientation === 'vertical') ? 'y':'x');
      } else {
        for (let v = 0; v < 2; v++) {
          const a = (v) ? 'x':'y';
          pushValueToAxis(value[a], a);
        }
      }

      this.data[i] = value;
    }

    if (this.orientation === 'vertical') {
      // Y is main axis
      const iterations = (typeof this.iterations === 'object') ? this.iterations.y:this.iterations;
      const totalValues = (axies.y.min * -1) + axies.y.max;
      axies.y.maxShare = (axies.y.min < 0) ? (axies.y.max / totalValues):1;
      axies.y.minShare = (axies.y.min < 0) ? ((axies.y.min * -1) / totalValues):0;
      axies.y.extraIterations = Math.floor((axies.y.minShare * 100) / ((axies.y.maxShare * 100) / (iterations + 1)));
    } else {
      // X is main axis
      const iterations = (typeof this.iterations === 'object') ? this.iterations.x:this.iterations;
      const totalValues = (axies.x.min * -1) + axies.x.max;
      axies.x.maxShare = (axies.x.min < 0) ? (axies.x.max / totalValues):1;
      axies.x.minShare = (axies.x.min < 0) ? ((axies.x.min * -1) / totalValues):0;
      axies.x.extraIterations = Math.floor((axies.x.minShare * 100) / ((axies.x.maxShare * 100) / (iterations + 1)));
    }

    this.axies = axies;
  }

  defineContainer (selector) {
    this.container = (selector.nodeType) ? selector:document.querySelector(selector);
  }

  buildGraph (callback) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('chartWrapper');

    const axisX = document.createElement('div');
    axisX.classList.add('axis');
    axisX.classList.add('x');

    const innerAxisX = document.createElement('div');
    innerAxisX.classList.add('inner');

    axisX.appendChild(innerAxisX);

    const axisY = document.createElement('div');
    axisY.classList.add('axis');
    axisY.classList.add('y');

    const innerAxisY = document.createElement('div');
    innerAxisY.classList.add('inner');

    axisY.appendChild(innerAxisY);

    const titleX = document.createElement('div');
    titleX.classList.add('title');
    titleX.classList.add('x');

    const titleY = document.createElement('div');
    titleY.classList.add('title');
    titleY.classList.add('y');

    const chart = document.createElement('div');
    chart.classList.add('chart');

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');

    chart.appendChild(svg);
    wrapper.appendChild(axisX);
    wrapper.appendChild(axisY);
    wrapper.appendChild(titleX);
    wrapper.appendChild(titleY);
    wrapper.appendChild(chart);
    this.container.appendChild(wrapper);

    this.wrapper = wrapper;
    this.chart = chart;
    this.svg = svg;
  }

  renderTitles () {
    if (this.hideTitles) return;

    if (this.singleAxis) {
      this.wrapper.classList.add('title' + this.mainAxis.toUpperCase());
      this.wrapper.querySelector('.title.' + this.mainAxis).innerText = this.titles[0];
      return;
    }

    for (let i = 0; i < 2; i++) {
      const axis = (i) ? 'x':'y';
      const title = this.titles[i];

      this.wrapper.classList.add('title' + axis.toUpperCase());
      this.wrapper.querySelector('.title.' + axis).innerText = title;
    }
  }

  renderIterations () {
    const mainAxis = (this.orientation === 'vertical') ? 'y':'x';
    if (this.axies[mainAxis].min < 0) {
      // Chart is negative, add origo.
      const origo = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      let x = 0;
      let y = 0;
      if (mainAxis === 'x') {
        x = 100 - (this.axies[mainAxis].maxShare * 100);
        y = 0;
      } else {
        x = 0;
        y = this.axies[mainAxis].maxShare * 100;
      }

      origo.setAttribute('fill', '#aaaaaa');
      origo.setAttribute('width', (mainAxis === 'x') ? '1':'100%');
      origo.setAttribute('height', (mainAxis === 'x') ? '100%':'1');
      origo.setAttribute('x', x + '%');
      origo.setAttribute('y', y + '%');

      this.svg.appendChild(origo);
    }

    if (!this.singleAxis) {
      if (!this.hideLines) {
        this.renderIterationLines('x');
        this.renderIterationLines('y');
      }
      if (!this.hideLabels) {
        this.renderIterationLabels('x');
        this.renderIterationLabels('y');
      }
      return;
    }

    if (!this.hideLines) this.renderIterationLines( (this.orientation === 'vertical') ? 'y':'x' );
    if (!this.hideLabels) this.renderIterationLabels( (this.orientation === 'vertical') ? 'y':'x' );
  }

  renderIterationLines (axis) {
    const iterations = (typeof this.iterations === 'object') ? this.iterations[axis]:this.iterations;
    if (!iterations) return;

    const heightReference = (this.mainAxis === axis) ? (this.axies[axis].maxShare * 100):100;

    const iterationPercentage = heightReference / (iterations + 1);
    const width = (axis === 'x') ? '1':'100%';
    const height = (axis === 'x') ? '100%':'1';
    const extraIterations = this.axies[this.mainAxis].extraIterations;

    for (let i = 0; i < iterations; i++) {
      const move = iterationPercentage * (i + 1);
      const x = (axis === 'x') ? 100 - move:0;
      const y = (axis === 'x') ? 0:move;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      line.setAttribute('fill', '#eeeeee');
      line.setAttribute('width', width);
      line.setAttribute('height', height);
      line.setAttribute('x', x + '%');
      line.setAttribute('y', y + '%');

      this.svg.appendChild(line);
    }

    if (this.mainAxis !== axis) return;

    for (let j = 0; j < extraIterations; j++) {
      const move = (iterationPercentage * (j + 1)) + (this.axies[axis].maxShare * 100);
      const x = (axis === 'x') ? 100 - move:0;
      const y = (axis === 'x') ? 0:move;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      line.setAttribute('fill', '#eeeeee');
      line.setAttribute('width', width);
      line.setAttribute('height', height);
      line.setAttribute('x', x + '%');
      line.setAttribute('y', y + '%');

      this.svg.appendChild(line);
    }
  }

  renderIterationLabels (axis) {
    const iterations = (typeof this.iterations === 'object') ? this.iterations[axis]:this.iterations;

    const element = this.wrapper.querySelector('.axis.' + axis + ' .inner');
    this.wrapper.classList.add('labels' + axis.toUpperCase());

    // Output MIN value and MAX value + ev. ORIGO(0) value
    const min = document.createElement('div');
    min.classList.add('label');
    min.classList.add('min');
    min.innerText = this.axies[axis].min;

    const max = document.createElement('div');
    max.classList.add('label');
    max.classList.add('max');
    max.innerText = this.axies[axis].max;

    element.appendChild(min);
    element.appendChild(max);

    if (this.axies[axis].min < 0) {
      const origo = document.createElement('div');
      const style = (axis === 'x') ? 'right':'top';
      origo.classList.add('label');
      origo.innerText = '0';
      origo.style[style] = this.axies[axis].maxShare * 100 + '%';

      element.appendChild(origo);
    }

    if (!iterations) return;

    const value = this.axies[axis].max / (iterations + 1);
    const percentage = (((this.mainAxis === axis) ? (this.axies[axis].maxShare * 100):100) / (iterations + 1));

    for (let i = 0; i < iterations; i++) {
      const move = ((i + 1) * percentage) + '%';
      const style = (axis === 'x') ? 'right':'top';
      const label = document.createElement('div');
      label.classList.add('label');
      label.innerText = parseFloat(value * (iterations - i)).toFixed(1);
      label.style[style] = move;

      element.appendChild(label);
    }

    if (this.mainAxis === axis && this.axies[this.mainAxis].extraIterations) {
      for (let j = 0; j < this.axies[this.mainAxis].extraIterations; j++) {
        const move = ((this.axies[axis].maxShare * 100) + ((j + 1) * percentage)) + '%';
        const style = (axis === 'x') ? 'right':'top';
        const label = document.createElement('div');
        label.classList.add('label');
        label.innerText = parseFloat(value * (j + 1)).toFixed(1) * -1;
        label.style[style] = move;

        element.appendChild(label);
      }
    }
  }

  calculateBarProportions (value) {
    const type = typeof value;
    let val = 0;

    const chartWidth = this.chart.clientWidth - ((this.orientation === 'vertical') ? ((this.spacing * (this.data.length + 1)) + (this.data.length)):1);
    const chartHeight = this.chart.clientHeight - ((this.orientation === 'horizontal') ? ((this.spacing * (this.data.length + 1)) + this.data.length):1);

    let width = 0;
    val = (type === 'object') ? value.x:value;
    if (this.orientation === 'vertical') {
      if (type === 'object') {
        width = (val / this.axies.x.total) * chartWidth;
      } else {
        width = chartWidth / this.data.length;
      }
    } else {
      if (val < 0) {
        width = ((val * -1) / (this.axies.x.min * -1)) * (chartWidth * this.axies.x.minShare) - 1;
      } else {
        width = (val / this.axies.x.max) * (chartWidth * this.axies.x.maxShare) - 1;
      }
    }

    let height = 0;
    val = (type === 'object') ? value.y:value;
    if (this.orientation == 'vertical') {
      if (val < 0) {
        height = ((val * -1) / (this.axies.y.min * -1)) * (chartHeight * this.axies.y.minShare) - 2;
      } else {
        height = (val / this.axies.y.max) * (chartHeight * this.axies.y.maxShare);
      }
    } else {
      if (type === 'object') {
        height = (val / this.axies.y.total) * chartHeight;
      } else {
        height = chartHeight / this.data.length;
      }
    }

    return {
      width: width,
      height: height
    };
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

  renderData (data = []) {
    let totalWidth = 0;
    let totalHeight = 0;

    this.lastWidth = this.chart.clientWidth;
    this.lastHeight = this.chart.clientHeight;

    function hexToRgb (hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return parseInt(result[1], 16)+', '+parseInt(result[2], 16)+', '+parseInt(result[3], 16);
    }

    const positive = (this.orientation === 'vertical') ? (this.lastHeight * this.axies.y.maxShare):(this.lastWidth * this.axies.x.minShare);
    for (let i = 0; i < data.length; i++) {
      const value = data[i].value || data[i];
      const proportions = this.calculateBarProportions(value);
      const color = data[i].color || this.randomizeColor();

      let x = 0;
      let y = 0;

      if (this.orientation === 'vertical') {
        const val = (typeof value === 'object') ? value.y:value;
        x = (totalWidth + this.spacing) + (0.5 + i);
        y = (val < 0) ? (positive + 1.5):(positive - proportions.height - 0.5);
        totalWidth += (proportions.width + this.spacing);
      } else {
        const val = (typeof value === 'object') ? value.x:value;
        x = (val > 0) ? (positive + 1.5):(positive - proportions.width - 0.5);
        y = (totalHeight + this.spacing) + (0.5 + i);
        totalHeight += (proportions.height + this.spacing);
      }

      const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bar.classList.add('bar');
      bar.setAttribute('width', proportions.width);
      bar.setAttribute('height', proportions.height);
      bar.setAttribute('stroke-width', '1');
      bar.setAttribute('x', x);
      bar.setAttribute('y', y);
      bar.style.stroke = '#' + color;
      bar.style.fill = 'rgba('+hexToRgb(color)+', 0.3)';

      this.svg.appendChild(bar);
    }
  }

  resizeData () {
    const width = this.chart.clientWidth;
    const height = this.chart.clientHeight;
    if (width === this.lastWidth && height === this.lastHeight) return;

    this.lastWidth = width;
    this.lastHeight = height;

    const positive = (this.orientation === 'vertical') ? (height * this.axies.y.maxShare):(width * this.axies.x.minShare);

    let totalWidth = 0;
    let totalHeight = 0;
    const bars = this.svg.querySelectorAll('rect.bar');
    for (let i = 0; i < bars.length; i++) {
      const value = this.data[i].value || this.data[i];
      const bar = bars[i];
      const proportions = this.calculateBarProportions(value);

      let x = 0;
      let y = 0;

      if (this.orientation === 'vertical') {
        const val = (typeof value === 'object') ? value.y:value;
        x = (totalWidth + this.spacing) + (0.5 + i);
        y = (val < 0) ? (positive + 1.5):(positive - proportions.height - 0.5);
        totalWidth += (proportions.width + this.spacing);
      } else {
        const val = (typeof value === 'object') ? value.x:value;
        x = (val > 0) ? (positive + 1.5):(positive - proportions.width - 0.5);
        y = (totalHeight + this.spacing) + (0.5 + i);
        totalHeight += (proportions.height + this.spacing);
      }

      bar.setAttribute('width', proportions.width);
      bar.setAttribute('height', proportions.height);
      bar.setAttribute('x', x);
      bar.setAttribute('y', y);
    }
  }

}
