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
    console.log(this.quality)
    // 画像＿サムネイル画像
    this.thumbnail = this.el.querySelector('.item-thumbnail img');

    // テキスト＿動画タイトル，時間，容量
    this.title = this.el.querySelector('.item-video p');
    this.time_length = this.el.querySelectorAll('.item-video small')[0];
    this.file_size = this.el.querySelectorAll('.item-video small')[1];

    // テキスト＿ダウンロード済み
    this.downloaded = this.el.querySelector('.item-progress small')

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

  }

  searchVideo(url) {
    ipcRenderer.send('url:search', url);
    ipcRenderer.once('info:get', (event, video_info) => {
      this.setValue(video_info);
    });
  }

  setValue(videoInfo) {
    this.url.innerText = videoInfo.url;
    this.thumbnail.src = videoInfo.thumbnail;
    this.title.innerText = videoInfo.title;
    this.time_length.innerText = videoInfo.time_length;
    this.file_size.innerText = videoInfo.file_size;
    setSelectOptions(this.quality, videoInfo.quality);
  }

  onSavedFolder() {
    ipcRenderer.send('folder:save');
    ipcRenderer.once('folder:selected', (event, folder_path) => {
      if (folder_path !== undefined) {
        this.input_text_folder.value = folder_path;
      }
    });
  }

  // 要素を入れ替えてダウンロード開始
  onStartDownload() {
    this.el.querySelector('.btn-start-download').classList.add('d-none');
    this.el.querySelector('.btn-open-folder').classList.remove('d-none');
    this.el.querySelector('.item-progress').classList.remove('d-none');

    // const video_config = 
    // ipcRenderer.send('download:start', this.id, this.input_text_folder.value)
    // ipcRenderer.on('download:progress' + this.id, (event, downloaded, total) => {
    //   const percent = downloaded / total;
    //   this.downloaded.innerText = `(${(downloaded / 1024 / 1024).toFixed(2)}MB of ${(total / 1024 / 1024).toFixed(2)}MB)`
    // });
    // ipcRenderer.once('download:end', (event) => {
    //   ipcRenderer.removeAllLitener('download:progress' + this.id);

    // });
  }

  onOpenFolder() { 
    ipcRenderer.send('folder:open', this.input_text_folder.value);
  }

}

// select要素に複数オプションを追加
const setSelectOptions = (select_el, options) => {
  for (option of options) {
    const option_el = document.createElement('option');
    option_el.text = option;
    option_el.value = option;
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