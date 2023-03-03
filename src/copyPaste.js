let target;
let breakpointId;

if (chrome?.debugger) {
  const targets = await chrome.debugger.getTargets();
  target = { tabId: targets.find(t => t.url.includes('vmwarehorizon.com/appblast/webclient')).tabId };

  chrome.debugger.attach(target, '1.3', async () => {
    const enableRes = await sendCommand('Debugger.enable');
    if (!enableRes) return;

    const setBreakpointByUrlRes = await sendCommand(
      'Debugger.setBreakpointByUrl',
      {
        urlRegex: '.*app-htmlaccess.*\.js',
        lineNumber: 0,
        columnNumber: 396203
      }
    );
    if (!setBreakpointByUrlRes) return;

    ({ breakpointId } = setBreakpointByUrlRes);
    console.log(`setBreakpoint: ${breakpointId}`, setBreakpointByUrlRes);

    chrome.debugger.onEvent.addListener(onEventFn);

    await tap('AltLeft', 'Alt');
  });
}

async function onEventFn(...pausedRes) {
  const [tabId, reason, params] = pausedRes;
  if (reason !== 'Debugger.paused') return;

  const { callFrameId, scopeChain } = params.callFrames[0];

  await sendCommand('Debugger.evaluateOnCallFrame', { callFrameId, expression: `window.keyboardManager2 = this` });
  await sendCommand('Debugger.removeBreakpoint', { breakpointId });
  await sendCommand('Debugger.resume');
  chrome.debugger.onEvent.removeListener(onEventFn);
  await sleep(50);
  chrome.debugger.detach(target);
}



async function sendCommand(command, params) {
  return new Promise(resolve => {
    chrome.debugger.sendCommand(
      target,
      command,
      params,
      resolve
    );
  });
}



async function tap(code, key = undefined) {
  await sendCommand('Input.dispatchKeyEvent', { type: 'keyDown', code, key });

  await sleep(10);

  await sendCommand('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
}



const sleep = async (ms) => await new Promise(resolve => setTimeout(resolve, ms));
