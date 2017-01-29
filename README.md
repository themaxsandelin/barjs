# Bar.js

<img src="https://cloud.githubusercontent.com/assets/7646347/22403615/899c3bb2-e61d-11e6-83af-f3334ce8659e.jpg" width="100%">

Bar.js is a JavaScript library generating HTML based bar charts. The library supports a wide range of use cases, including negative values, both vertical and horizontal charts as well as multiple axis data.

## Installation

Download the library and include both the `bar.js` as well as the `bar.css` in your project.
```html
<link rel="stylesheet" href="css/bar.css">
<script src="js/bar.js"></script>
```

> Node.js (npm) support coming soon

## Usage
To create a new chart you need a container element with a width and a height. You then pass the selector of the element along with your preferred parameters into the `Bar object`. For example:

```html
<div id="chart" style="width: 720; height: 480px;"></div>

<script>
    const params = {
      orientation: 'vertical',
      titles: [ "Amazing data" ],
      iterations: 3,
      data: [ 20, 18, 16, 15, 13, 10, 9, 8, 7, 4, 3, 2, 1, -2, -4 ]
    };

    const barChart = new Bar('#chart', params);
</script>
```

### Parameters

- `orientation (String)`
Defines which orientation the chart should render in, vertical or horizontal. (`Default: vertical`)

- `data (Array)`: A list of values to be displayed in the chart.

  - `entry (Number)`: A numeric value that represents one bar.

  - `entry (Object)`: An object containing the bar properties.
    - `entry.value (Number)`: Used if the bar only has one value (one axis) and represents the main axis value.
    - `entry.x (Number)`: Mainly used if the bar has two values (two axies) and represents the X-value.
    - `entry.y (Number)`: Mainly used if the bar has two values (two axies) and represents the Y-value.
    - `entry.color (String)`: The color of the bar in HEX-format.
    > This is automatically randomized if not specified.

- `iterations (Number or Object)`: The number of iterations between 0 and the max value of one or both of the axies. You can either define the value as a Number, then it will be applied to both axies (if two axies are used). You can also define it as an Object and then define individual iterations for both axies.

- `titles (Array)`: The titles to be rendered on either or both axies, which is the bold text on the top left of the chart on the Y-axis and on the bottom right on the X-axis. If you use only 1 axis, the chart will use only the first value in the Array. If you use both axies the chart requires two values in the `titles Array`.

- `spacing (Number)`: Specifies the spacing in between the bars in pixels.

- `disable (Array)`: A list of properties to disable in the rendering of the chart. Supported values:

  - `"titles"`: Disables the chart titles on both axies.
  - `"labels"`: Disables the iteration labels on both axies.
  - `"lines"`: Disables the iteration lines on both axies.

## License
[MIT](LICENSE.md) © [Max Sandelin](https://github.com/themaxsandelin)
