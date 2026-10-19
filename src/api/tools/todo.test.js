const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseLine, findTodos, formatTodos, todoCommand } = require('./todo');

describe('parseLine', () => {
  test.each([
    ['// TODO: fix this', 'TODO', 'fix this'],
    ['  # FIXME handle errors', 'FIXME', 'handle errors'],
    ['/* TODO(bob): later */', 'TODO', 'bob): later'],
    ['<!-- TODO update docs -->', 'TODO', 'update docs'],
    [' * TODO: in a block', 'TODO', 'in a block'],
  ])('matches %s', (line, tag, text) => {
    expect(parseLine(line)).toEqual({ tag, text });
  });

  test.each([
    ['const todoList = []'],
    ['const x = "TODO";'],
    ['// nothing to see'],
    ['TODO without a comment marker'],
  ])('ignores %s', (line) => {
    expect(parseLine(line)).toBeNull();
  });
});

describe('findTodos', () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
    fs.mkdirSync(path.join(root, 'src'));
    fs.mkdirSync(path.join(root, 'node_modules'));
    fs.mkdirSync(path.join(root, '.git'));
    fs.writeFileSync(path.join(root, 'src', 'a.js'), 'const a = 1;\n// TODO: first\nconst b = 2;\n// FIXME second\n');
    fs.writeFileSync(path.join(root, 'b.py'), '# TODO python one\r\nprint(1)\r\n');
    fs.writeFileSync(path.join(root, 'node_modules', 'x.js'), '// TODO ignored\n');
    fs.writeFileSync(path.join(root, '.git', 'y'), '// TODO ignored\n');
    fs.writeFileSync(path.join(root, 'package-lock.json'), '// TODO ignored\n');
    fs.writeFileSync(path.join(root, 'bin.dat'), 'abc\0 // TODO binary\n');
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  test('finds todos with file and line, skipping ignored paths', () => {
    expect(findTodos(root)).toEqual([
      { file: 'b.py', line: 1, tag: 'TODO', text: 'python one' },
      { file: 'src/a.js', line: 2, tag: 'TODO', text: 'first' },
      { file: 'src/a.js', line: 4, tag: 'FIXME', text: 'second' },
    ]);
  });

  test('todoCommand formats the list with a count', () => {
    const out = todoCommand(root);
    expect(out).toContain('src/a.js:2: TODO first');
    expect(out).toContain('src/a.js:4: FIXME second');
    expect(out).toContain('3 TODO comments found.');
  });

  test('reports when there are none', () => {
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-empty-'));
    try {
      expect(todoCommand(empty)).toBe('No TODO comments found.');
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe('formatTodos', () => {
  test('uses singular for one item', () => {
    expect(formatTodos([{ file: 'a.js', line: 1, tag: 'TODO', text: '' }])).toBe(
      'a.js:1: TODO\n\n1 TODO comment found.'
    );
  });
});
