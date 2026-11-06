const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
// Use the project's compiler so these tests also run on Node without TS loading.
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/reservationTimer.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const exported = {};
vm.runInNewContext(compiled.outputText, { exports: exported, Date, Math });
const { remainingMilliseconds, freezeTimer, timerMessage } = exported;

const base = { status: 'confirmed', activation_status: 'active', operational_state: 'running',
  end_time: '2026-11-06T12:20:00Z', operational_end_ms: 1200000, client_clock_offset_ms: 100000 };

test('server clock correction and recovered execution override the commercial schedule', () => {
  assert.equal(remainingMilliseconds(base, 200000), 900000);
  assert.equal(remainingMilliseconds({...base, operational_end_ms:1500000}, 200000),1200000);
});
test('device outage freezes the server sample while Wi-Fi reconciliation consumes elapsed time', () => {
  const frozen={...base, activation_status:'controller_offline', operational_state:'communication_lost', timer_frozen:true, remaining_ms:900000};
  assert.equal(remainingMilliseconds(frozen,200000),900000);
  assert.equal(remainingMilliseconds(frozen,380000),900000);
  assert.equal(remainingMilliseconds(base,380000),720000);
});
test('phone-only outage freezes locally once and a server refresh replaces it', () => {
  const frozen=freezeTimer(base,200000);
  assert.equal(remainingMilliseconds(frozen,380000),900000);
  assert.equal(remainingMilliseconds(freezeTimer(frozen,380000),500000),900000);
  assert.equal(remainingMilliseconds(base,380000),720000);
  assert.match(timerMessage(frozen),/servidor/);
});
test('completion and closure cannot display old frozen time', () => {
  for (const state of ['completed','closed']) assert.equal(remainingMilliseconds({...base, operational_state:state,timer_frozen:true,remaining_ms:900000}),0);
  assert.equal(remainingMilliseconds({...base,activation_status:'ended',remaining_ms:900000,timer_frozen:true}),0);
});
test('blocked recovery preserves time and explains the reservation conflict', () => {
  const pending={...base,activation_status:'pending_recovery', operational_state:'pending_recovery', operational_reason:'slot_conflict',remaining_ms:600000};
  assert.equal(remainingMilliseconds(pending,999999999),600000);
  assert.match(timerMessage(pending),/reservado/);
});
