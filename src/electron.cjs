const windowStateManager = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

import('../index.js').then(x => {
	console.log(`imported from "index.js":${x}`);
}).catch(err => console.error(err));

// async function asyncImport() {
// 	const imported = await import('../test.cjs');

// 	console.log({imported});
// }

// asyncImport();

try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
}

const port = process.env.PORT = process.env.PORT || 5173;
console.log({ port });
const dev = !app.isPackaged;
let mainWindow;

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: 360,
		defaultHeight: 600,
	});

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 32,
		},
		webPreferences: {
			enableRemoteModule: true,
			contextIsolation: true,
			nodeIntegration: true,
			spellcheck: false,
			devTools: true,
			preload: path.join(__dirname, 'preload.cjs'),
		},
		x: windowState.x,
		y: windowState.y,
		width: 360,
		height: 600,
		resizable: false,
	});

	windowState.manage(mainWindow);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	mainWindow.on('close', () => windowState.saveState(mainWindow));

	return mainWindow;
}

contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Make App 💻',
		},
	],
});

function loadURL(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => loadURL(port), 200);
	});
}

function createMainWindow() {
	mainWindow = createWindow();
	mainWindow.once('close', () => {
		mainWindow = null;
	});

	console.log({ dev });

	loadURL(port);
}

app.once('ready', createMainWindow);
app.on('activate', () => mainWindow || createMainWindow());
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('to-main', (event, count) => mainWindow.webContents.send('from-main', `next count is ${count + 1}`));
