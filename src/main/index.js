const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const _ = require('lodash');
const fs = require('fs');
const open = require('open');
const path = require('path');

let win;

app.on('ready', () => {
  win = new BrowserWindow({
    title: 'Youtube Downloader',
    width: 1000,
    resizable: false,
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js'),
      devTools: false,
    }
  });
  win.removeMenu();
  win.loadURL(path.resolve(__dirname, '../../app/index.html'));
});

// // 初期設定しようとおもったがwebContentsがない
// win.webContents.send('config:submit', app.getPath('videos'));

// ボタン＿検索
ipcMain.on('url:search', (event, url) => {
  ytdl(url)
    .on('info', (info) => {
      const thumbnail = info.videoDetails.thumbnail.thumbnails[0].url;
      const title = info.videoDetails.title;
      const time_length = secondsToHms(info.videoDetails.lengthSeconds);
      const mp4_audio_format = ytdl.chooseFormat(info.formats, {
        filter: format => format.container === 'mp4' && !format.hasVideo,
      });
      const mp4_videoonly_formats = ytdl.filterFormats(info.formats,
        format => format.container === 'mp4' && !format.hasAudio);
      const qualityLabel = _.map(mp4_videoonly_formats, 'qualityLabel');
      let video_length = _.map(mp4_videoonly_formats, 'contentLength');
      const audio_length = mp4_audio_format.contentLength;
      video_length = _.map(video_length, (length) => {
        return Number(length) + Number(audio_length);
      });
      const codecs = _.map(mp4_videoonly_formats, 'codecs');
      let quality_text = [];
      for (let i = 0; i < video_length.length; i++) {
        quality_text.push(qualityLabel[i] + ' ' + (video_length[i] / 1024 / 1024).toFixed(1) + 'MB' + ' ' + codecs[i]);
      }
      let itag = _.map(mp4_videoonly_formats, 'itag');

      // AUDOフォーマットを配列に追加
      quality_text.push('MP3' + ' ' + (mp4_audio_format.contentLength / 1024 / 1024).toFixed(1) + 'MB' + ' AUDIOONLY');
      itag.push(mp4_audio_format.itag);
      video_length.push(mp4_audio_format.contentLength);

      const video_info = {
        url: url,
        thumbnail: thumbnail,
        title: title,
        time_length: time_length,
        quality_text: quality_text,
        itag: itag,
        contentLength: video_length,
        folder_path: app.getPath('videos'),
      }
      win.webContents.send('info:get', video_info, null);
    })
    .on('error', (e) => {
      win.webContents.send('info:get', null, e.message);
    })
});

// ボタン＿保存フォルダ選択
ipcMain.on('folder:save', (event) => {
  let folder_path = dialog.showOpenDialogSync(win, {
    properties: ['openDirectory']
  });
  win.webContents.send('folder:selected', folder_path);
});

// ボタン＿ダウンロード開始
ipcMain.on('download:start', (event, id, video_config) => {
  const audioOutput = path.resolve(app.getPath('temp'), 'sound' + id + '.mp4');
  console.log(audioOutput);
  let mainOutput;

  const onProgress = (chunkLength, downloaded, total) => {
    win.webContents.send('download:progress' + id, chunkLength);
  }

  // AUDIOONLYのときMP3を出力して終了
  if (video_config.itag === '140') {
    mainOutput = path.resolve(video_config.folder_path, video_config.title + '.mp3');
    console.log('AUDIOONLY')
    ytdl(video_config.url, {
      filter: format => format.container === 'mp4' && !format.hasVideo,
    }).on('error', console.error)
      .on('progress', onProgress)
      .pipe(fs.createWriteStream(mainOutput))
      .on('finish', () => {
        console.log('finished downloading, saved to' + mainOutput);
        win.webContents.send('download:end')
      });
  } 
  
  // AUDIOとVIDEOをそれぞれダウンロードして結合し，保存．
  else {
    mainOutput = path.resolve(video_config.folder_path, video_config.title + '.mp4');
    ytdl(video_config.url, {
      filter: format => format.container === 'mp4' && !format.hasVideo,
    }).on('error', console.error)
      .on('progress', onProgress)
      .pipe(fs.createWriteStream(audioOutput))
      .on('finish', () => {
        console.log('\ndownloading video');
        const video = ytdl(video_config.url, {
          quality: video_config.itag
        });
        video.on('progress', onProgress);
        // ffmpegの入力では，一度に一つのstreamしか受け取れない
        ffmpeg()
          .input(video)
          .videoCodec('copy')
          .input(audioOutput)
          .audioCodec('copy')
          .save(mainOutput)
          .on('error', console.error)
          .on('end', () => {
            fs.unlink(audioOutput, err => {
              if (err) console.error(err);
              else console.log(`\nfinished downloading, saved to ${mainOutput}`);
            });
            win.webContents.send('download:end')
          });
      });
  }

});


// ボタン＿フォルダを開く
ipcMain.on('folder:open', (event, folder_path) => {
  (async () => {
    await open(folder_path);
  })();
});


// ヘルパー関数類
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