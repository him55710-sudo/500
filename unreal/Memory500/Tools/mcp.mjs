import fs from 'node:fs/promises';
const endpoint = 'http://127.0.0.1:8000/mcp';
let session;
let id = 0;
async function readMessage(response, requestId) {
  if (!response.headers.get('content-type')?.includes('text/event-stream')) return response.json();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) throw new Error('MCP stream ended before the response');
      pending += decoder.decode(value,{stream:true});
      const events = pending.split(/\r?\n\r?\n/);
      pending = events.pop();
      for (const event of events) {
        const data = event.split(/\r?\n/).filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!data) continue;
        const message = JSON.parse(data);
        if (message.id === requestId) return message;
      }
    }
  } finally {
    await reader.cancel();
  }
}
async function request(method, params) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {'Content-Type':'application/json', Accept:'application/json, text/event-stream', ...(session ? {'Mcp-Session-Id':session} : {})},
    body: JSON.stringify({jsonrpc:'2.0', id:++id, method, params}),
    signal: AbortSignal.timeout(90000),
  });
  session = response.headers.get('mcp-session-id') || session;
  if (!response.ok) throw new Error(`MCP HTTP ${response.status}: ${await response.text()}`);
  const message = await readMessage(response,id);
  if (!message) throw new Error('MCP response has no matching request ID');
  if (message.error) throw new Error(JSON.stringify(message.error));
  return message.result;
}
await request('initialize', {protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'memory500-setup',version:'1.0'}});
const [method = 'tools/list', paramsFile, outputFile] = process.argv.slice(2);
const params = paramsFile ? JSON.parse(await fs.readFile(paramsFile,'utf8')) : {};
const result = await request(method, params);
if (result?.isError) throw new Error(JSON.stringify(result));
const text = JSON.stringify(result,null,2);
if (outputFile) {
  await fs.writeFile(outputFile,text);
  console.log(`Saved MCP evidence: ${outputFile}`);
} else {
  console.log(text);
}
