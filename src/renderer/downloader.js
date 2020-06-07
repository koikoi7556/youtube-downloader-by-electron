class Downloader {
  constructor(id) {
    // console.log(id + ':' + webFrame.routingId)
    this.id = id;

    this.el = document.querySelector('#' + this.id);
    // テキスト＿URL
    this.url = this.el.querySelector('.item_url');

    // テキスト＿保存フォルダ
    this.input_text_folder = this.el.querySelector('.input-text-folder');

    // セレクタ＿画質
    this.quality = this.el.querySelector('.input-select-quality');
    // 画像＿サムネイル画像
    this.thumbnail = this.el.querySelector('.item-thumbnail img');

    // テキスト＿動画タイトル，時間
    this.title = this.el.querySelector('.item-video p');
    this.time_length = this.el.querySelectorAll('.item-video small')[0];

    // テキスト＿ダウンロード済み
    this.downloaded = this.el.querySelector('.txt-download');

    // ブロック＿ダウンロード プログレスバー
    this.downloadbar = this.el.querySelector('.item-progress .progress-bar');

    // ボタン＿保存フォルダ選択
    this.el.querySelector('.item-config .btn-saved-folder').addEventListener('click', (e) => {
      this.onSavedFolder();
    });

    // ボタン＿ダウンロード開始
    this.el.querySelector('.btn-start-download').addEventListener('click', (e) => {
      this.onStartDownload();
    });

    // ボタン＿フォルダを開く
    this.el.querySelector('.btn-open-folder').addEventListener('click', (e) => {
      this.onOpenFolder();
    });

    // ボタン＿ダウンローダー削除
    this.el.querySelector('.close').addEventListener('click', (e) => {
      this.onDelete();
    });

    // itag, 動画容量 配列
    this.itag;
    this.contentLength;
  }

  // 使用しない
  // searchVideo(url) {
  //   ipcRenderer.send('url:search', url);
  //   ipcRenderer.once('info:get', (event, video_info) => {
  //     this.setValue(video_info);
  //   });
  // }

  // プロパティを一括設定
  setValue(video_info) {
    this.url.innerText = video_info.url;
    this.thumbnail.src = video_info.thumbnail;
    this.title.innerText = video_info.title;
    this.time_length.innerText = video_info.time_length;
    this.itag = video_info.itag;
    this.contentLength = video_info.contentLength;
    this.input_text_folder.value = video_info.folder_path;
    setSelectOptions(this.quality, video_info.quality_text, video_info.itag);
  }

  onSavedFolder() {
    ipcRenderer.send('folder:save');
    ipcRenderer.once('folder:selected', (event, folder_path) => {
      if (folder_path !== undefined) {
        this.input_text_folder.value = folder_path;
      }
    });
  }

  // 要素入れ替え，非表示 ＞ ダウンロード開始
  onStartDownload() {
    this.el.querySelector('.btn-start-download').classList.add('d-none');
    this.el.querySelector('.btn-open-folder').classList.remove('d-none');
    this.el.querySelector('.item-progress').classList.remove('d-none');
    this.el.querySelector('.close').disabled = true;
    this.el.querySelector('.item-config .btn-saved-folder').disabled = true;
    this.quality.disabled = true;

    const video_config = {
      url: this.url.innerText,
      title: this.title.innerText,
      itag: this.quality.value,
      folder_path: this.input_text_folder.value,
    };
    const itag_index = this.itag.findIndex(item => item === Number(this.quality.value))
    const total = this.contentLength[itag_index];
    let downloaded = 0;

    ipcRenderer.send('download:start', this.id, video_config);
    // ダウンロード状況を逐次受け取り，加工後に表示．
    ipcRenderer.on('download:progress' + this.id, (event, chunkLength) => {
      downloaded += chunkLength;
      const percent = downloaded / total;
      this.downloaded.innerText = `${(downloaded / 1024 / 1024).toFixed(1)}MB of ${(total / 1024 / 1024).toFixed(1)}MB`
      this.downloadbar.style.width = percent * 100 + '%';
    });
    ipcRenderer.once('download:end', (event) => {
      this.downloaded.innerText = 'Done!';
      this.downloadbar.classList.remove('progress-bar-striped');
    this.el.querySelector('.close').disabled = false;
      ipcRenderer.removeAllListener('download:progress' + this.id);
    });
  }

  onOpenFolder() {
    ipcRenderer.send('folder:open', this.input_text_folder.value);
  }

  onDelete() {
    this.el.remove();
  }
}

// ヘルパー関数類
// select要素に複数オプションを追加
const setSelectOptions = (select_el, texts, values) => {
  for (let i = 0; i < texts.length; i++) {
    const option_el = document.createElement('option');
    option_el.text = texts[i];
    option_el.value = values[i];
    select_el.appendChild(option_el);
  }
}

// 子エレメントを全削除
const removeChildren = (parent) => {
  if (parent.hasChildNodes()) {
    while (parent.childNodes.length > 0) {
      parent.removeChild(parent.firstChild)
    }
  }
}

module.exports = Downloader;