const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const filesJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'files.json')));
const child_process = require('child_process');

let jsonPath = ''; // 依赖树json的地址
let jsonData = {};   // 依赖树数据

function open(uri) {
    if (process.platform == 'wind32') {
        cmd = 'start "%ProgramFiles%\Internet Explorer\iexplore.exe"';
    } else if (process.platform == 'linux') {
        cmd = 'xdg-open';
    } else if (process.platform == 'darwin') {
        cmd = 'open';
    }
    child_process.exec(`${cmd} "${uri}"`);
}

function getFileInfo(filename){
    let use = filesJson.search.find((item)=>{
        return filename.indexOf(item) > -1; 
    })
    if(!use){
        use = filename.match(/\.(.*)$/);
        use = use ? use[1] : undefined;
    }
    if(!use){
        use = 'default';
    }
    return filesJson.files[use];
}

class TreeItemNode {
    constructor({uri, collapsibleState, childrenName} = {}){
        this.uri = uri;
        this.isModule = /^node_modules/.test(uri);

        if(this.isModule) {
            this.filename = uri.match(/node_modules\/(.*)/)[1];
            this.label = this.filename;
        } else {
            this.filename = uri.match(/\/([^\/]*)$/)[1];
            if((/^index\./).test(this.filename)){
                this.label = uri.match(/\/([^\/]*)\/[^\/]*$/)[1] + '/' + this.filename;
            } else {
                this.label = this.filename;
            }
        }

        this.children = childrenName.map((item) => {
            return new TreeItemNode({
                uri: item,
                collapsibleState: jsonData.modules[item] && jsonData.modules[item].length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                childrenName: jsonData.modules[item] || []
            })
        });
        this.children.sort((a, b)=> {
            return a.level - b.level;
        })
        this.collapsibleState = collapsibleState;
        let fileInfo = getFileInfo(this.label);
        this.level = this.isModule ? 100 : fileInfo.level;
        this.iconPath =  
            this.isModule ?
            path.join(__filename, '..', 'img', 'icons', 'npm.svg') :  
            path.join(__filename, '..', 'img', 'icons', fileInfo.icon); 
        this.tooltip = this.uri;
    };
    command = {
        title: this.label,
        command: 'extension.itemClick',
        tooltip: this.uri,
        arguments: [
            this
        ]
    };
}

class TreeDataProvider {
    getTreeItem(element){
        return element;
    };
    getChildren(element){
        if (element === undefined) {
            // 初始化入口
            const rootArr = jsonData.entry.map((item) => {
                return new TreeItemNode({
                    uri: item,
                    collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                    childrenName: jsonData.modules[item] || []
                })
            })
            return rootArr;
        }
        return element.children;
    };
}

function initTree(uri){    
    jsonPath = uri;
    const jsonStr = fs.readFileSync(uri);
    let jsonObj = {};
    if(!jsonStr){
        vscode.window.showErrorMessage('未找到文件或文件为空');
        return false;
    }
    try {
        jsonObj = JSON.parse(jsonStr);
    }catch(e) {
        vscode.window.showErrorMessage('请使用格式正确的 json 文件');
        return false;
    }
    jsonData = jsonObj;
    const treeDataProvider = new TreeDataProvider();
    const treeView = vscode.window.createTreeView('treeView-item',{
        treeDataProvider
    });
}

function autoSearchJson(){
    for(const index in vscode.workspace.workspaceFolders){
        let workspace = vscode.workspace.workspaceFolders[index];
        let rootPath = workspace.uri.path;
        const searchDir = ['.','build','.vscode'];
        while(searchDir.length && !jsonPath){
            try {
                let thisPath = path.join(rootPath, searchDir[0]);
                searchDir.splice(0,1);
                files = fs.readdirSync(thisPath);
                files.forEach((item) => {
                    if(item === 'dependency-tree.json'){
                        jsonPath = path.join(thisPath, 'dependency-tree.json');
                    }
                })  
            }catch(e) {
            }
        }
        if(jsonPath){
            break;
        }
    }
    jsonPath ? initTree(jsonPath) : null;
}

exports.activate = function(context) {
    // search the dependency-tree.json automatically.
    autoSearchJson();

    // user selected the dependency-tree.json
    context.subscriptions.push(vscode.commands.registerCommand('extension.getEntryWebpack', async (uri) => {
        initTree(uri.path);
    }));

    // click the tree item
    let clickCount = 0;
    let lastLabl = '';
    context.subscriptions.push(vscode.commands.registerCommand('extension.itemClick', (treeItem) => {
        if(treeItem.isModule){
            clickCount ++;
            lastLabl = treeItem.label;
            if(clickCount >=2 && lastLabl === treeItem.label){
                open(`https://www.npmjs.com/package/${treeItem.label}`);
                clickCount = 0;
                lastLabl = '';
            }
            setTimeout(() => {
                clickCount = 0;
                lastLabl = '';
            }, 200);
        }else {
            let to = path.join(jsonData.rootDir, treeItem.uri);
            vscode.workspace.openTextDocument(to).then((document) => { 
                vscode.window.showTextDocument(document)
            });
        }
    }));
    
    // on json change & hot change
    vscode.workspace.onDidChangeTextDocument((obj) => {
        if(obj.document.fileName === jsonPath){
            initTree(jsonPath);
        }
    })
};
