require('../stylesheets/main.min.css');
require('bootstrap');
require('bootstrap/dist/css/bootstrap.min.css');
const Downloader = require('./downloader');

let list_downloader = [];
let i = 0;

// テキスト＿検索URL
const input_text_url = document.querySelector('#input_text_url');

// サーバーのHTMLファイルを取得する同期処理
const addListHtml = (id) => {
  return new Promise((resolve) => {
    const myXml = new XMLHttpRequest();
    myXml.onreadystatechange = function () {
      if ((myXml.readyState === 4) && (myXml.status === 200)) {
        const item = document.createElement('div');
        item.id = id;
        item.innerHTML = myXml.responseText;
        document.getElementById("list").appendChild(item);

        resolve();
      }
    }
    myXml.open("GET", "./list.html", true);
    myXml.send();
  });
}

// ボタン＿検索(promiseは最初だけ面倒であとはチェーンで返り値を自動的にpromiseでラッパする)
document.querySelector('#btn_search_url').addEventListener('click', (e) => {
  // htmlを追加 ＞ URLを検索 ＞ itemに反映
  addListHtml('item_downloader' + i)
  .then(() => {
    let item = new Downloader('item_downloader' + i);
    list_downloader.push(item);
    list_downloader[i].searchVideo(input_text_url.value);
    i += 1;
    })
});


