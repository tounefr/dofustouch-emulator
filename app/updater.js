const {app, dialog} = require('electron');
const {BrowserWindow} = require('electron');
const https = require('https');
const path = require('path');
const os = require('os');
const fs = require('fs');
const url = require('url');
const Emulator = require('./main');

var Updater = module.exports = {

    failedCheckUpdates: function() {
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
            type: 'error',
            title: 'Error',
            message: 'Impossible de vérifier les mises à jours...\nVérifiez votre connexion à Internet.',
            buttons: ['Fermer']
        });
    },

    checkMAJ: function() {
        var queries = '?version=' + app.getVersion() + '&platform=' + os.platform() + '&arch=' + os.arch();
        https.get(url.resolve(Emulator.webSite, 'app.json' + queries), (res) => {
            if (!res || !res.statusCode || res.statusCode != 200) {
                this.failedCheckUpdates();
            } else {
                var body = '';
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    Updater.responseBody = JSON.parse(body);
                    if (Updater.responseBody.version) {
                        console.log(Updater.responseBody.version + ' ' + app.getVersion());
                        if (Updater.responseBody.version != Emulator.version) {
                            dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
                                type: 'info',
                                title: 'Nouvelle version : ' + Updater.responseBody.version,
                                message: 'Une nouvelle version est disponible !\n',
                                buttons: ['Télécharger', 'Ignorer']
                            }, Updater.onNewVersion);
                        }
                    } else
                        this.failedCheckUpdates();
                });
            }
        }).on('error', this.failedCheckUpdates);
    },

    getUserHome: function() {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    },

    onNewVersion: function(i) {
        if (i != 0) {
            return false;
        }

        switch (os.platform()) {
            case 'win32':
                Updater.binPath = Updater.responseBody.bin.win64;
                break;
            case 'linux':
                Updater.binPath = Updater.responseBody.bin.linux;
                break;
            default:
                dialog.showMessageBox({
                    type: 'error',
                    title: 'Error',
                    message: 'L\'architechture de votre ordinateur n\'est pas supporté.',
                    buttons: ['Fermer']
                });
                return;
                break;
        }

        var splittedBinPath = Updater.binPath.split('/');
        Updater.binName = splittedBinPath[splittedBinPath.length - 1];
        var defaultSavePath = Updater.getUserHome() + '/' + Updater.binName;
        if (os.platform() === 'win32') {
            defaultSavePath = Updater.getUserHome() + '\\Desktop\\' + Updater.binName;
        }

        Updater.toSaveFilePath = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
            title: 'Emplacement de sauvegarde',
            defaultPath: defaultSavePath,
            buttonLabel: 'Enregistrer'
        });

        var win = new BrowserWindow({
            width: 600,
            height: 200,
            modal: false,
            resizable: Emulator.devMode,
            center: true,
            parent: BrowserWindow.getFocusedWindow(),
            darkTheme: true,
            skipTaskbar: true,
            frame: false
        });

        win.on('closed', () => {
            win = null
        });

        win.loadURL(`file://${__dirname}/updater.html`);
        if (Emulator.devMode)
            win.webContents.openDevTools();
    },

    init: function() {
        this.checkMAJ();
    }
};