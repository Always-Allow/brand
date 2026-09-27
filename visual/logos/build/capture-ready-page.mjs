// Capture a local build page only after its fonts and images have loaded.
// Chrome uses a private profile and a debugging pipe, with no listening port.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function captureReadyPage(chrome, page, target, width, height, font) {
  const profile = mkdtempSync(join(tmpdir(), 'aa-capture-'));
  const child = spawn(chrome, ['--headless', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--remote-debugging-pipe',
    `--user-data-dir=${profile}`, 'about:blank'],
  { detached: true, stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
  let sequence = 0, buffer = '', failure;
  const pending = new Map();
  const listeners = new Set();
  const fail = (error) => {
    failure ??= error;
    for (const item of pending.values()) item.reject(failure);
    pending.clear();
    for (const item of listeners) item.reject(failure);
    listeners.clear();
  };
  const closed = new Promise((resolveClose) => {
    child.once('close', () => {
      fail(new Error('Chrome closed before capture finished'));
      resolveClose();
    });
  });
  child.on('error', fail);
  child.stdio[3].on('error', fail);
  child.stdio[4].on('error', fail);
  child.stdio[4].setEncoding('utf8');
  child.stdio[4].on('data', (chunk) => {
    buffer += chunk;
    let end;
    while ((end = buffer.indexOf('\0')) !== -1) {
      const raw = buffer.slice(0, end);
      buffer = buffer.slice(end + 1);
      if (!raw) continue;
      let message;
      try { message = JSON.parse(raw); } catch (error) { fail(error); return; }
      if (message.id) {
        const item = pending.get(message.id);
        if (!item) continue;
        pending.delete(message.id);
        if (message.error) item.reject(new Error(JSON.stringify(message.error)));
        else item.resolve(message.result);
      } else {
        for (const item of listeners) {
          if (message.method === item.method && message.sessionId === item.sessionId) {
            listeners.delete(item);
            item.resolve(message.params);
          }
        }
      }
    }
  });
  const send = (method, params = {}, sessionId) => new Promise((resolveCall, reject) => {
    if (failure) { reject(failure); return; }
    const id = ++sequence;
    pending.set(id, { resolve: resolveCall, reject });
    child.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
  });
  const event = (method, sessionId) => new Promise((resolveEvent, reject) => {
    if (failure) { reject(failure); return; }
    listeners.add({ method, sessionId, resolve: resolveEvent, reject });
  });
  const forceClose = () => {
    if (!child.pid) return;
    try { process.kill(-child.pid, 'SIGKILL'); } catch (error) {
      if (error.code !== 'ESRCH') child.kill('SIGKILL');
    }
  };
  const pageURL = pathToFileURL(resolve(page)).href;
  const deadline = setTimeout(() => {
    fail(new Error('Chrome font/image readiness or capture timed out after 20 seconds'));
    forceClose();
  }, 20000);
  try {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId);
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false }, sessionId);
    // Subscribe before navigating so a fast local load cannot be missed.
    const loaded = event('Page.loadEventFired', sessionId);
    // Keep the event rejection observed if navigation itself fails first.
    loaded.catch(() => {});
    const navigation = await send('Page.navigate', { url: pageURL }, sessionId);
    if (navigation.errorText) throw new Error(navigation.errorText);
    await loaded;
    const ready = await send('Runtime.evaluate', {
      expression: `(async () => {
        if (location.href !== ${JSON.stringify(pageURL)}) throw new Error('Unexpected capture document');
        if (document.readyState !== 'complete') await new Promise(resolve => addEventListener('load', resolve, { once: true }));
        await document.fonts.ready;
        const requested = ${JSON.stringify(font)};
        const faces = await document.fonts.load(requested);
        if (!faces.length || faces.some(face => face.status !== 'loaded')) throw new Error('Required embedded font did not load');
        await Promise.all([...document.images].map(image => image.decode()));
        return true;
      })()`,
      awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (ready.exceptionDetails || ready.result?.value !== true) {
      throw new Error('Font/image readiness failed: ' + JSON.stringify(ready.exceptionDetails || ready.result));
    }
    const { data } = await send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: false,
      clip: { x: 0, y: 0, width, height, scale: 1 },
    }, sessionId);
    if (!data) throw new Error('Chrome returned an empty screenshot');
    writeFileSync(target, Buffer.from(data, 'base64'));
  } finally {
    clearTimeout(deadline);
    // Let Chrome stop its helpers before removing the profile. On failure, terminate
    // only the process group created above, never another user's browser session.
    let shutdownTimer;
    try {
      if (!failure) void send('Browser.close').catch(() => {});
      else forceClose();
      await Promise.race([closed, new Promise((resolveTimeout) => {
        shutdownTimer = setTimeout(() => { forceClose(); resolveTimeout(); }, 3000);
      })]);
    } finally {
      clearTimeout(shutdownTimer);
      try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); }
      catch (error) { console.error(`Chrome profile cleanup failed at ${profile}: ${error.message}`); }
    }
  }
}
