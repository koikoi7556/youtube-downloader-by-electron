const { app, BrowserWindow, ipcMain } = require('electron');
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
}];
ipcMain.on('url:search', (event, url) => {
  win.webContents.send('info:get', videoInfo[i])
  i += 1;
})