# Extended interface version

This is the extended version with advanced UI. Use it if you don't want to build from scratch. Modify anything you want : )

### Functionality
* Drag & Drop
* Uploading progress
* Shows steps
* Intuitive flow, ability to back to previus steps
* Validates files
* Shows up notifications and errors
* Detects the platform
* Sends files to PatchKit and process them
* Allows to cancel operation
* Shows progress
* Allows to download the PatchKit Launcher with the uploaded game
* Allows to create another launcher

## Dependencies
* [zip.js](https://gildas-lormeau.github.io/zip.js/)

## Run the widget

> [!ATTENTION]
> Run the server first!

Open the `pkWidget-interface_extended` folder on the live server.

If you are using VSCode with Live Server extension, just open the folder in VSCode and click the `Go Live` icon in the bottom-right corner.

The widget should open in the web browser.

## Icons
We are using [Fontello](https://fontello.com/) to easier style our icons treating them like a text. The .svg files are in the `_assets` folder. You can modify them as you wish and then process by Fontello. Then just replace the `fontello.css` and the `font` folder.

> [!TIP]
> Fontello process correctly only icons based on path. Objects and strokes are misunderstood. If you experience any issues just open the .svg file in [Inkspace](https://inkscape.org) and convert it to path.
> (Path > Stroke to Path | Path > Object to Path)

## File structure
* _assets - used only on Fontello, if you don't want to edit them, can be removed
* font - Fontello icons
* src
  * lib
    * `zip.min.js` - minimized zip.js library
  * pkWidget
    * components - all the interface components
      * `Component.js` - general component file
      * `Button.js`
      * `dashed.js` - dashed border
      * `Div.js`
      * `Dropdown.js`
      * `FileInput.js`
      * `PlatformSelect.js`
      * `Progress.js`
      * `ProgressRing.js` - round progress while uploading
      * `StepProgress.js` - steps on the top of the screen
    * `Alert.js` - notifications
    * `Components.js` - collection of components for easier access
    * `config.js` - configuration
    * `engine.js` - computational utils (validate, detectPlatforms, upload, trackProcessing, trackPublishing, process)
    * `main.js` - here is the main operation flow
    * `request.js` - wrapper for requests making code in engine.js clearer
    * `utils.js` - collection of additional utils making code in main.js and engine.js clearer
  * `main.js` - init file 

## The general way the widget works

In the `index.html` there is a div with the 'widget' id. This is the main container where widget will appear.
The line in the `main.js` connects the widget with the div:
``` js
new pkWidget('#widget');
```
The widget is divided into components and views. In each view, the layout of components can be different.
Inside the widget we can navigate by changing views.

## Components
The components are collected in the `pkWidget/Components.js` file. This allows for easier access to them.

Each component extends the base component `pkWidget/components/Component.js`. 
This allows to create universal methods for each component, such as:
`appendTo()`, `prependTo()`, `remove()`, `setOpacity()`, `collapse()`, `fadeIn()`, `fadeOut()`, `fadeInContent()`, `fadeOutContent()`. They are responsible for displaying and animation.

Besides, each component has a unique functionality.

## Views

There are 3 views: `file`, `summary` and `processing`.
In the `pkWidget/main.js` there are two methods responsible for displaying the views:

### setView
Describes how components should appear on each view.

As the second argument is passed `data` - an object containing all the data needed by the view.

### cleanupView
Describes how components should disappear on a specific view. This is necessary because it is possible to back out of certain views.