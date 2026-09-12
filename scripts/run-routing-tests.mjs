import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const port = await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
        const address = probe.address();
        const freePort = typeof address === 'object' && address ? address.port : null;
        probe.close(error => error ? reject(error) : resolve(freePort));
    });
});
if (!port) throw new Error('Could not reserve a local routing-test port');
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn('npx', ['wrangler', 'pages', 'dev', 'dist', '--ip', '127.0.0.1', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
});

let output = '';
server.stdout.on('data', chunk => { output += chunk; process.stdout.write(chunk); });
server.stderr.on('data', chunk => { output += chunk; process.stderr.write(chunk); });

async function waitForServer() {
    for (let attempt = 0; attempt < 60; attempt += 1) {
        if (server.exitCode !== null) throw new Error(`wrangler pages dev exited with ${server.exitCode}\n${output}`);
        try {
            const response = await fetch(baseUrl);
            if (response.ok) return;
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 250));
    }
    throw new Error(`wrangler pages dev did not become ready\n${output}`);
}

try {
    await waitForServer();
    const test = spawn('node', ['scripts/verify-static-routing.mjs', baseUrl], { stdio: 'inherit' });
    const exitCode = await new Promise((resolve, reject) => {
        test.once('error', reject);
        test.once('exit', code => resolve(code ?? 1));
    });
    if (exitCode !== 0) process.exitCode = exitCode;
} finally {
    if (server.pid) {
        try { process.kill(-server.pid, 'SIGTERM'); } catch (error) {
            if (error.code !== 'ESRCH') throw error;
        }
    }
    await new Promise(resolve => {
        if (server.exitCode !== null) return resolve();
        server.once('exit', resolve);
        setTimeout(() => {
            if (server.pid) {
                try { process.kill(-server.pid, 'SIGKILL'); } catch {}
            }
            resolve();
        }, 3000).unref();
    });
}
