const windowStateManager = require('electron-window-state');
const contextMenu = require('electron-context-menu');
const { app, BrowserWindow, ipcMain, globalShortcut, clipboard } = require('electron');
const path = require('path');
const robot = require('@jitsi/robotjs');
const base32 = require('base32');

// import('../index.js').then(x => {
// 	console.log(`imported from "index.js":${x}`);
// }).catch(err => console.error(err));

try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
}

const port = process.env.PORT = process.env.PORT || 5173;
// console.log({ port });
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
		minWidth: 170 + 12,
		maxWidth: 505 + 12,
		height: 600,
		minHeight: 400,
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

	// console.log({ dev });

	loadURL(port);
}

app.once('ready', () => {
	// pasteShortcut();
	createMainWindow();
});
app.on('activate', () => mainWindow || createMainWindow());
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

ipcMain.on('to-main', (event, count) => mainWindow.webContents.send('from-main', `next count is ${count + 1}`));

function pasteShortcut() {
	const acc = 'CommandOrControl+V';
	const ret = globalShortcut.register(acc, () => {
    console.log(`${acc} is pressed`);

		const text = clipboard.readText();
		console.log({text});

		const encoded = base32.encode(text);
		console.log({ encoded });

		setTimeout(async () => {
			// robot.typeStringDelayed(text, 600);
			// Semplice1!
			for (let char of encoded) {
				robot.keyTap(base32Symbols[char]);
				await sleep(50);
			}
		}, 500);
  })

  ret || console.log('registration failed');

  // Check whether a shortcut is registered.
  console.log(globalShortcut.isRegistered(acc));
}


const sleep = async (ms) => await new Promise(resolve => setTimeout(resolve, ms));

const base32Symbols = {
	"a": 30,
	"b": 48,
	"c": 46,
	"d": 32,
	"e": 18,
	"f": 33,
	"g": 34,
	"h": 35,
	"i": 23,
	"j": 36,
	"k": 37,
	"l": 38,
	"m": 50,
	"n": 49,
	"o": 24,
	"p": 25,
	"q": 16,
	"r": 19,
	"s": 31,
	"t": 20,
	"u": 22,
	"v": 47,
	"w": 17,
	"x": 45,
	"y": 21,
	"z": 44,
	"0": 11,
	"9": 10,
	"8": 9,
	"7": 8,
	"6": 7,
	"5": 6,
	"4": 5,
	"3": 4,
	"2": 3,
	"1": 2,
	"=": 13,
};



const fromKeyCodeToVScanCode = {
	"ControlLeft": 29,
	"ControlRight": 285,
	"ShiftLeft": 42,
	"ShiftRight": 54,
	"AltLeft": 56,
	"AltRight": 312,
	"MetaLeft": 347,
	"MetaRight": 348,
	"OSLeft": 347,
	"OSRight": 348,
	"Home": 327,
	"ArrowUp": 328,
	"PageUp": 329,
	"ArrowLeft": 331,
	"ArrowRight": 333,
	"End": 335,
	"ArrowDown": 336,
	"PageDown": 337,
	"Insert": 338,
	"Delete": 339,
	"NumpadDivide": 309,
	"NumpadMultiply": 55,
	"Numpad7": 71,
	"Numpad8": 72,
	"Numpad9": 73,
	"NumpadSubtract": 74,
	"Numpad4": 75,
	"Numpad5": 76,
	"Numpad6": 77,
	"NumpadAdd": 78,
	"Numpad1": 79,
	"Numpad2": 80,
	"Numpad3": 81,
	"Numpad0": 82,
	"NumpadDecimal": 83,
	"NumpadComma": 126,
	"NumpadEnter": 284,
	"NumpadEqual": 13,
	"NumpadClear": 69,
	"ScrollLock": 70,
	"PrintScreen": 311,
	"Pause": 256,
	"Backspace": 14,
	"NumLock": 69,
	"Tab": 15,
	"Escape": 1,
	"Enter": 28,
	"Space": 57,
	"CapsLock": 58,
	"F1": 59,
	"F2": 60,
	"F3": 61,
	"F4": 62,
	"F5": 63,
	"F6": 64,
	"F7": 65,
	"F8": 66,
	"F9": 67,
	"F10": 68,
	"F11": 87,
	"F12": 88,
	"F13": 100,
	"F14": 101,
	"F15": 102,
	"F16": 103,
	"F17": 104,
	"F18": 105,
	"F19": 106,
	"F20": 107,
	"F21": 108,
	"F22": 109,
	"F23": 110,
	"F24": 118,
	"KeyA": 30,
	"KeyB": 48,
	"KeyC": 46,
	"KeyD": 32,
	"KeyE": 18,
	"KeyF": 33,
	"KeyG": 34,
	"KeyH": 35,
	"KeyI": 23,
	"KeyJ": 36,
	"KeyK": 37,
	"KeyL": 38,
	"KeyM": 50,
	"KeyN": 49,
	"KeyO": 24,
	"KeyP": 25,
	"KeyQ": 16,
	"KeyR": 19,
	"KeyS": 31,
	"KeyT": 20,
	"KeyU": 22,
	"KeyV": 47,
	"KeyW": 17,
	"KeyX": 45,
	"KeyY": 21,
	"KeyZ": 44,
	"Backquote": 41,
	"Digit0": 11,
	"Digit9": 10,
	"Digit8": 9,
	"Digit7": 8,
	"Digit6": 7,
	"Digit5": 6,
	"Digit4": 5,
	"Digit3": 4,
	"Digit2": 3,
	"Digit1": 2,
	"Equal": 13,
	"Minus": 12,
	"Slash": 53,
	"BracketLeft": 26,
	"BracketRight": 27,
	"Backslash": 43,
	"Semicolon": 39,
	"Quote": 40,
	"Comma": 51,
	"Period": 52,
	"IntlBackslash": 86,
	"ContextMenu": 349,
	"KanaMode": 112,
	"IntlRo": 115,
	"IntlYen": 125,
	"Convert": 121,
	"NonConvert": 123,
	"Power": 350,
	"Lang1": 114,
	"Lang2": 113,
	"MediaTrackPrevious": 272,
	"MediaTrackNext": 281,
	"VolumeMute": 288,
	"AudioVolumeMute": 288,
	"LaunchApp2": 289,
	"MediaPlayPause": 290,
	"MediaStop": 292,
	"VolumeDown": 302,
	"VolumeUp": 304,
	"AudioVolumeDown": 302,
	"AudioVolumeUp": 304,
	"BrowserHome": 306,
	"BrowserSearch": 357,
	"BrowserFavorites": 358,
	"BrowserRefresh": 359,
	"BrowserStop": 360,
	"BrowserForward": 361,
	"BrowserBack": 362,
	"LaunchApp1": 363,
	"LaunchMail": 364,
	"MediaSelect": 365
};