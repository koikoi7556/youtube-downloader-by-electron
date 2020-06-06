const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const open = require('open');
const path = require('path');

let win;
let i = 0;

app.on('ready', () => {
  win = new BrowserWindow({
    title: 'youtube downloader',
    width: 1000,
    resizable: false,
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  });
  win.loadURL(path.resolve(__dirname, '../../app/index.html'));
});

const videoInfo = [{
  url: ',asdfa',
  thumbnail: '../sample.png',
  title: 'NewTtiel',
  time_length: '212313h',
  file_size: '10 mb',
  quality: ['10', '123', '1235 ', '1235 ']
},
{
  url: 'asdfas', 
  thumbnail: '../sample.png',
  title: 'NewTtasdfiel',
  time_length: '2123asdfa13h',
  file_size: '1asf0 mb',
  quality: ['10', '12a3', '1235 ', '1235 ', 'ASDF', 'ASD']
},
{
  url: 'asdaaaaafas', 
  thumbnail: '../sample.png',
  title: 'NewTtasdfiel',
  time_length: '2123asdfa13h',
  file_size: '1asf0 mb',
  quality: ['10', '12a3', '1235 ', '1235 ', 'ASDF', 'ASD']
},
{
  url: 'asdfaaasdsdfasdfs', 
  thumbnail: '../sample.png',
  title: 'NewTtasdfiel',
  time_length: '2123asdfa13h',
  file_size: '1asf0 mb',
  quality: ['10', '12a3', '1235 ', '1235 ', 'ASDF', 'ASD']
},
{
  url: 'asdfasasasdfasdfasdfadfasd', 
  thumbnail: '../sample.png',
  title: 'NewTtasdfiel',
  time_length: '2123asdfa13h',
  file_size: '1asf0 mb',
  quality: ['10', '12a3', '1235 ', '1235 ', 'ASDF', 'ASD']
},
];

// ボタン＿検索
ipcMain.on('url:search', (event, url) => {
  win.webContents.send('info:get', videoInfo[i])
  i += 1;
})

// ボタン＿保存フォルダ選択
ipcMain.on('folder:save', (event) => {
  let folder_path = dialog.showOpenDialogSync(win, {
    properties: ['openDirectory']
  });
  win.webContents.send('folder:selected', folder_path);
});

// ボタン＿ダウンロード開始
ipcMain.on('download:start', (event, id, folder_path) => {
  win.webContents.send('download:progress' + id, downloaded, total);
  win.webContents.send('download:end' + id);
});

// ボタン＿フォルダを開く
ipcMain.on('folder:open', (event, folder_path) => {
  folder_path = path.resolve(__dirname, folder_path);
  (async () => {
    await open(folder_path);
  })();
});