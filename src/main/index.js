const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const reqp = require('request-promise-native');
const _ = require('lodash');
const fs = require('fs');
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

const videoInfo = {
  url: ',asdfa',
  thumbnail: '../sample.png',
  title: 'NewTtiel',
  time_length: '212313h',
  file_size: '10 mb',
  quality: ['10', '123', '1235 ', '1235 ']
}


// ボタン＿検索
ipcMain.on('url:search', (event, url) => {
  ytdl.getInfo(url).then(info => {
    const thumbnail = info.videoDetails.thumbnail.thumbnails[0].url;
    const title = info.videoDetails.title;
    const time_length = secondsToHms(info.videoDetails.lengthSeconds);
    const mp4_audio_format = ytdl.chooseFormat(info.formats, {
      filter: format => format.container === 'mp4' && !format.hasAudio,
    });
    const mp4_videoonly_formats = ytdl.filterFormats(info.formats,
      format => format.container === 'mp4' && !format.hasAudio);
    const qualityLabel = _.map(mp4_videoonly_formats, 'qualityLabel');
    let video_bitrate = _.map(mp4_videoonly_formats, 'bitrate');
    let audio_bitrate = mp4_audio_format.bitrate;
    video_bitrate = _.map(video_bitrate, (bitrate) => {
      return bitrate + audio_bitrate;
    })
    let quality_text = [];
    for (let i = 0; i < video_bitrate.length; i++) {
      quality_text.push(qualityLabel[i] + '  ' + (video_bitrate[i] / 1024 / 1024).toFixed(2) + 'MB');
    }
    const video_info = {
      url: url,
      thumbnail: thumbnail,
      title: title,
      time_length: time_length,
      quality_text: quality_text,
      qualityLabel: qualityLabel
    }
    win.webContents.send('info:get', video_info);
  });
});

// urlから連想配列でビデオの詳細を返す
const getVideoInfo = (url) => {
  let video_info;

}

// ボタン＿保存フォルダ選択
ipcMain.on('folder:save', (event) => {
  let folder_path = dialog.showOpenDialogSync(win, {
    properties: ['openDirectory']
  });
  win.webContents.send('folder:selected', folder_path);
});

// ボタン＿ダウンロード開始
ipcMain.on('download:start', (event, id, folder_path) => {
  const audioOutput = path.resolve(__dirname, 'sound.mp4');

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

// seconds to hours, minutes, seconds.
const secondsToHms = (d) => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor(d % 3600 / 60);
  const s = Math.floor(d % 3600 % 60);

  const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay + sDisplay;
}