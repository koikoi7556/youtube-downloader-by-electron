class Downloader {
  constructor(id) {
    this.id = id;
    this.el = document.querySelector('#' + this.id);
    // テキスト＿URL
    this.url = this.el.querySelector('.item_url');

    // テキスト＿保存フォルダ
    this.input_text_folder = this.el.querySelector('.item-config .input-text-folder').value;

    // セレクタ＿画質
    this.quality = this.el.querySelector('.input-select-quality');
    console.log(this.quality)
    // 画像＿サムネイル画像
    this.thumbnail = this.el.querySelector('.item-thumbnail img');

    // テキスト＿動画タイトル，時間，容量
    this.title = this.el.querySelector('.item-video p');
    this.time_length = this.el.querySelectorAll('.item-video small')[0];
    this.file_size = this.el.querySelectorAll('.item-video small')[1];


    // ボタン＿保存フォルダ選択
    this.el.querySelector('.item-config .btn-saved-folder').addEventListener('click', (e) => {
      onSavedFolder();
    });

    // ボタン＿ダウンロード開始
    this.el.querySelector('.btn-start-download').addEventListener('click', (e) => {
      onStartDownload();
    });

    // ボタン＿フォルダを開く
    this.el.querySelector('.btn-open-folder').addEventListener('click', (e) => {
      onOpenFolder();
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

  onSavedFolder() { }
  onStartDownload() { }
  onOpenFolder() { }

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