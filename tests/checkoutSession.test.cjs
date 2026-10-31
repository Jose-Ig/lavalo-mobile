const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function fixture() {
  const storage = new Map();
  const secureStore = {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'device-only',
    getItemAsync: async key => storage.get(key) ?? null,
    setItemAsync: async (key, value) => { storage.set(key, value); },
    deleteItemAsync: async key => { storage.delete(key); },
  };
  const source = readFileSync(join(__dirname, '../src/services/checkoutSession.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => { assert.equal(name, 'expo-secure-store'); return secureStore; } });
  const booking = id => ({ data: { id, status: 'pending' }, access_token: 'a'.repeat(64) });
  return { api: exports, booking };
}
test('a fresh reservation is selected without replacing it with a previous payment', async () => {
  const { api, booking } = fixture();
  await api.saveCheckoutSession(booking(10));
  await api.saveCheckoutSession(booking(20));
  assert.equal((await api.loadCheckoutSession(20)).booking.data.id, 20);
  assert.equal((await api.loadCheckoutSession()).booking.data.id, 20);
  assert.equal((await api.loadCheckoutSession(10)).booking.data.id, 10);
  assert.deepEqual(Array.from(await api.checkoutHistory()), [10, 20]);
});
test('an explicit missing reservation never resolves to the previous active one', async () => {
  const { api, booking } = fixture();
  await api.saveCheckoutSession(booking(10));
  assert.equal(await api.loadCheckoutSession(999), null);
});
test('canceling a historical reservation cannot clear a different active checkout', async () => {
  const { api, booking } = fixture();
  await api.saveCheckoutSession(booking(10));
  await api.saveCheckoutSession(booking(20));
  await api.clearCheckoutSession(10);
  assert.equal((await api.loadCheckoutSession()).booking.data.id, 20);
  await api.clearCheckoutSession(20);
  assert.equal(await api.loadCheckoutSession(), null);
  assert.equal((await api.loadCheckoutSession(10)).booking.data.id, 10);
});
