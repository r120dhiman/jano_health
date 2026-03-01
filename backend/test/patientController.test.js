import test from 'node:test';
import assert from 'node:assert/strict';

import { getAllPatients } from '../controller/patient.js';
import { Patient } from '../Model/patient.js';

function createMockRes() {
  return {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('getAllPatients returns patients list with 200 status', async () => {
  const mockPatients = [
    { _id: '1', name: 'Alice' },
    { _id: '2', name: 'Bob' },
  ];

  const originalFind = Patient.find;
  Patient.find = () => ({
    sort: () => Promise.resolve(mockPatients),
  });

  try {
    const req = {};
    const res = createMockRes();

    await getAllPatients(req, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, mockPatients);
  } finally {
    Patient.find = originalFind;
  }
});

