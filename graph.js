function Graph (container, data) {
  this.container = container;
  this.data = data;
  this.stats = {};
  this.filter = {};
  
  // Defines the container selector and adds any missing classes to it
  function defineContainer (container) {
    this.container = document.querySelector(container);
    if (!this.container.classList.contains('graphContainer')) this.container.classList.add('graphContainer');
  }
  
  // Creates and appends all neccessary elements for the graph
  function buildGraphElements () {
    
    // Builds both axis elements with required child elements.
    function buildAxisElements (container) {
      // X-Axis build
      var xAxis = document.createElement('div');
      xAxis.classList.add('axis');
      xAxis.classList.add('x');
      
      var xLabel = document.createElement('div');
      xLabel.classList.add('label');
      xAxis.appendChild(xLabel);
      
      var xIterations = document.createElement('div');
      xIterations.classList.add('iterations');
      xAxis.appendChild(xIterations);
      
      // Y-Axis build
      var yAxis = document.createElement('div');
      yAxis.classList.add('axis');
      yAxis.classList.add('y');
      
      var yLabel = document.createElement('div');
      yLabel.classList.add('label');
      yAxis.appendChild(yLabel);
      
      var yIterations = document.createElement('div');
      yIterations.classList.add('iterations');
      yAxis.appendChild(yIterations);
      
      container.appendChild(yAxis);
      container.appendChild(xAxis);
    }
    
    function buildGraph (container) {
      var wrapper = document.createElement('div');
      wrapper.classList.add('graphWrapper');
      
      var graph = document.createElement('div');
      graph.classList.add('graph');
      
      wrapper.appendChild(graph);
      container.appendChild(wrapper);
    }
    
    buildAxisElements(this.container);
    buildGraph(this.container);
  }
  
  // Initial setup scripts that runs once the DOM is loaded
  function setup () {
    defineContainer(this.container);
    buildGraphElements();
  }
  
  document.addEventListener('DOMContentLoaded', function () {
    setup.bind(this)();
  }.bind(this));
}