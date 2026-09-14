import { test } from 'node:test';
import assert from 'node:assert/strict';
import { updateWorkDraft } from '../src/work-data.js';
import { validate } from '../server/api.js';

test('choosing an image and saving preserves both descriptions', () => {
  const original = { id: 'work', name: 'Work', cat: 'Plugin', github: 'https://github.com/Jefoze/JefTrade', short: {en:'English text', ru:'Старый текст'}, img: {seed:1} };
  const fields = {name:'JefTrade', cat:'Plugin', github:original.github, short:'Новый текст'};
  const draft = updateWorkDraft(original, fields, 'ru');
  draft.img = {src:'/api/images/' + 'a'.repeat(64)};
  const saved = updateWorkDraft(draft, fields, 'ru');
  assert.deepEqual(saved.short, {en:'English text', ru:'Новый текст'});
  assert.equal(original.short.ru, 'Старый текст');
  assert.equal(saved.img.src, draft.img.src);
  assert.doesNotThrow(() => validate('works', [saved]));
});

test('a work with an uploaded image can have only one translation', () => {
  const work = {id:'work', name:'JefTrade', cat:'Plugin', github:'https://github.com/Jefoze/JefTrade', img:{src:'/api/images/' + 'a'.repeat(64)}};
  for (const language of ['en','ru']) assert.doesNotThrow(() => validate('works', [{...work, short:{[language]:'Description'}}]));
  for (const short of [{ru:42}, {en:'x'.repeat(2001)}, {de:'text'}, {}, []]) assert.throws(() => validate('works', [{...work, short}]), /Invalid content/);
});
