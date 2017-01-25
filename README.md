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
To create a new chart you need a container element with a width and a height. You then pass the selector of the element along with your preferred parameters into the `Chart object`. For example:

```html
<div id="chart" style="width: 720; height: 480px;"></div>

<script>
  const chart = new Chart('#chart', {
    titles: [ 'Valuable values' ],
    iterations: '3'
    data: [ 1, 3, 3, 7 ]
  });
</script>
```

### Parameters

- `orientation (String)`
Defines which orientation the chart should render in, vertical or horizontal. (`Default: vertical`)

- `data (Array)`
A list of values to be displayed in the chart. This property supports a variety of formats in the `Array`, as long as all items are either a `Number` or an `Object`.

- `iterations (Number or Object)`
The number of iterations between 0 and the max value of one or both of the axies. You can either define the value as a Number, then it will be applied to both axies (if two axies are used). You can also define it as an Object and then define individual iterations for both axies.

- `titles (Array)`
The titles to be rendered on either or both axies, which is the bold text on the top left of the chart on the Y-axis and on the bottom right on the X-axis. If you use only 1 axis, the chart will use only the first value in the Array. If you use both axies the chart requires two values in the `titles Array`.

- `hideTitles (Boolean)`
Defines the hidden state of the chart titles on both axies. (`Default: false`)

- `hideLabels (Boolean)`
Defines the hidden state of the axis labels on both axies. (`Default: false`)

- `hideLines (Boolean)`
Defines the hidden state of the iteration lines in the chart. (`Default: false`)

## License
[MIT](LICENSE.md) © [Max Sandelin](https://github.com/themaxsandelin)
