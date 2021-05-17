
<h1 align="center">Hussar - Framework for developers that wants to work with JavaScript only</h1>

<p align="center">
  <img src="docs/logo.svg" alt="hussar-logo" width="120px" height="120px"/>
  <br>
  <i>Framework for those who would like to stick to JS only (no HTML nor CSS) 
    <br> and produce relatively fast and fairly small sized web apps.</i>
  <br>
</p>

<p align="center">
  <a href="https://danielmazurkiewicz.github.io/hussar/"><strong>https://danielmazurkiewicz.github.io/hussar/</strong></a>
  <br>
</p>

<p align="center">
  <a href="https://github.com/DanielMazurkiewicz/hussar/issues">Submit an Issue</a>
  <br>
  <br>
</p>



## Goals of this framework
- Pure JavaScript only, everything is a valid JavaScript code
- Produce small output code
- Produce fast output code
- Currently no external dependencies and keeping it that way
- No need for additional transpillers or compillers, only a bundler necesarry

## NOTE
This is Work In Progress (WIP), anything might be subject of change at any time.

At current stage it starts to be usable:
* you can create components
* you can create and attach styles
* you can do two-way bindings
* you can use efficient lifecycle events
* there are included libraries with usefull generic JS functionalities


## Examples:

### "static" components
```javascript
import { body, div, span } from 'husar/core.mjs';


const list = [
    {name: "John", surname: "Kowalski"};
];

const surnameStyle = style({
    text: {
        color: 'blue'
    }
});

const nameSurname = ({name, surname}) =>
    div(
        'Name and surname: ', name, span(surnameStyle, surname)
    );

const namesList = list =>
    div(
        ...list.map(nameSurname)
    );


body(
    namesList(list)
)

```

## Documentation
Documentation is available here (also a VERY WIP version at the moment):
https://danielmazurkiewicz.github.io/hussar/

Documentation itself uses this framework so for now it can give you a glympse of how to use it.
Look especially at these files:
* https://github.com/DanielMazurkiewicz/hussar/blob/main/docs/src/components/filter.mjs
* https://github.com/DanielMazurkiewicz/hussar/blob/main/docs/src/components/method.mjs