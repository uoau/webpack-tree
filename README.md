# Intro
This extension will show the dependency tree when webpack is built. You can see the project structure clearly.

# Usage
First, you need install `dependency-tree-webpack-plugin` in your project.
```
npm i dependency-tree-webpack-plugin -D
```

Second, Add webpack plug to your project.
``` javascript
const DependencyTreePlugin = require('dependency-tree-webpack-plugin').default;

...
    plugins:[
        ...,
        new DependencyTreePlugin(),
    ]
}
```

Then, just run your project, a `dependency-tree.json` file will appear in your root directory. The content of this file will look like this.

<div align=center><img width="400" src="https://github.com/uoau/dependency-tree-webpack-plugin/blob/master/readme-img/1.png?raw=true"/></div>

# What's the use of this JSON
You need install the VSCode extension `webpack tree`, And load the json file, and it will generate a tree view in the sidebar, like this.

<div align=center><img width="400" src="https://github.com/uoau/dependency-tree-webpack-plugin/blob/master/readme-img/3.png?raw=true"/></div>

You can take the initiative to load the JSON file, or the  VSCode extension will automatically search the `/` folder, `build` folder, `.Vscode` folder in the directory to find this file `dependency-tree.json`. 

<div align=center><img width="400" src="https://github.com/uoau/dependency-tree-webpack-plugin/blob/master/readme-img/2.png?raw=true"/></div>

This tree is made up of project dependencies, and you can clearly understand the structure of the project. you can jump quickly between these files.