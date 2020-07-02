# Intro
This extension will show the dependency tree when webpack is built. You can see the project structure clearly.

# Usage
First, you need install the webpack plugin "dependency-tree-webpack-plugin", and use it in you webpack.config.js.
```
npm i dependency-tree-webpack-plugin -D
```

```
const DependencyTreePlugin = require('dependency-tree-webpack-plugin').default;

...
    plugins:[
        ...,
        new DependencyTreePlugin(),
    ]
}
```
This webpack plugin will create a dependency-tree.json in your root directory. And the vscode extension will automatically load this file and build a dependency tree in the sidebar.