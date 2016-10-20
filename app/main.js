const {app, BrowserWindow, Menu, autoUpdater} = require('electron');
const url = require('url');
const os = require('os');

//require('electron-reload')(__dirname);

var Emulator = module.exports = {

    openGameWindow: function () {
        var win = new BrowserWindow({
            width: 1024,
            height: 768,
            useContentSize: true,
            center: true
        });

        win.loadURL(`file://${__dirname}/game_frame.html`);

        if (this.gameWindows.length > 0)
            win.webContents.setAudioMuted(true);

        if (this.devMode)
            win.webContents.openDevTools();

        win.on('closed', () => {
            delete Emulator.gameWindows[Emulator.gameWindows.indexOf(win)];
            win = null;
        });

        this.gameWindows.push(win);
    },

    openMainWindow: function () {
        var win = new BrowserWindow({
            width: 700,
            height: 300
        });

        win.loadURL(`file://${__dirname}/main.html`);

        if (this.devMode)
            win.webContents.openDevTools();

        win.on('closed', () => {
            win = null
        });

        this.mainWindow = win;
    },

    setMenu: function () {

        const template = [
            {
              label: 'Fenetre',
                submenu: [
                    {
                        label: 'Nouvelle fenetre',
                        click (item, focusedWindow) {
                            Emulator.openGameWindow();
                        }
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Zoom +',
                        role: 'zoomin'
                    },
                    {
                        label: 'Zoom -',
                        role: 'zoomout'
                    },
                    {
                        label: 'Réinitialiser le zoom',
                        role: 'resetzoom'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        label: 'Mode plein écran',
                        role: 'togglefullscreen'
                    }
                ]
            },
            {
                label: 'Son',
                submenu: [
                    {
                        'label': 'Activer le son',
                        click(item, focusedWindow) {
                            focusedWindow.webContents.setAudioMuted(false);
                        }
                    },
                    {
                        'label': 'Désactiver le son',
                        click(item, focusedWindow) {
                            focusedWindow.webContents.setAudioMuted(true);
                        }
                    }
                ]
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'A propos',
                        click () { require('electron').shell.openExternal('https://emulator.dofustouch.tk/') }
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    },

    init: function () {
        this.devMode = false;
        this.mainWindow = null;
        this.gameWindows = [];
        this.version = '1.0.2';
        this.webSite = 'https://emulator.dofustouch.tk/';

        Emulator.setMenu();
        Emulator.openGameWindow();
        require('./updater').init();
    }
};

app.on('ready', function () {
    Emulator.init();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        Emulator.init();
    }
});

