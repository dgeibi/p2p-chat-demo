/* eslint-disable no-param-reassign */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const chat = require('..');
const pkg = require('../package.json');

require('./menu.js');

let win;

function createWindow() {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    width: 800,
    height: 600,
    title: pkg.name,
    webPreferences: {
      nodeIntegrationInWorker: true,
    },
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  win.on('closed', () => {
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('setup', (event, username) => {
  chat.setup({ username }, (err, tag) => {
    event.sender.send('setup-reply', !err, tag);
    if (!err) {
      win.setTitle(`${username}[${tag.slice(0, 5)}] - ${pkg.name}`);
    }
  });
});

ipcMain.on('logout', (event, opts) => {
  chat.exit((err) => {
    event.sender.send('logout-reply', !err, opts);
  });
});

ipcMain.on('local-text', (event, tags, text) => {
  chat.textToUsers(tags, text);
});

ipcMain.on('local-file', (event, tags, filepath) => {
  chat.sendFileToUsers(tags, filepath);
});

ipcMain.on('accept-file', (event, tag, checksum) => {
  console.log(tag, checksum);
  chat.acceptFile(tag, checksum);
});

chat.events.on('login', (tag, username) => {
  win.webContents.send('people-login', chat.getUserInfos(), tag, username);
});

chat.events.on('logout', (tag, username) => {
  win.webContents.send('people-logout', chat.getUserInfos(), tag, username);
});

const bypass = (backEvent, frontEvent = backEvent) => {
  chat.events.on(backEvent, (...args) => {
    win.webContents.send(frontEvent, ...args);
  });
};

// bypass events;
bypass('text');
bypass('fileinfo');
bypass('file-receiced');
bypass('file-write-fail');
bypass('file-accepted');
