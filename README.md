# Bar.js

Bar.js is a JavaScript library generating HTML based bar charts. The library supports a wide range of use cases, including negative values, both vertical and horizontal charts as well as multiple axis data.

## Installation

Download the library and include both the `bar.js` as well as the `bar.css` in your project.
```html
<link rel="stylesheet" href="css/bar.css">
<script src="js/bar.js"></script>
```

> Node.js (npm) support coming soon

## Usage
To create a new bar chart you will need to initiate a new `Chart object`.

```js
const chart = new Chart(selector, parameters);
```

The `Chart object` requires parameters to render the chart, the bare minimum being the element to contain the chart as well as the `data` to be rendered in the chart.

```js
const parameters = {
  data: [{ x: 10, y: 5 }, { x: 8, y: 9}, { x: 11, y: 6 }]
};

const chart = new Chart('#chart', parameters);
```

## License
[MIT](LICENSE.md) © [Max Sandelin](https://github.com/themaxsandelin)
