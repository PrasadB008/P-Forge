#!/usr/bin/env node
// Lists TODO/FIXME comments in a repository.
// Usage: node tools/todo.js [rootDir]   (rootDir defaults to the current directory)
const fs = require('fs');
const path = require('path');

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.terraform']);
const IGNORED_FILES = new Set(['package-lock.json']);
const BINARY_EXT = new Set(['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.zip', '.gz']);
const MAX_FILE_SIZE = 1024 * 1024;

// Matches a TODO/FIXME tag that follows a comment marker (//, #, /*, *, <!--, --).
const TODO_RE = /(?:\/\/|#|\/\*|^\s*\*|<!--|--)\s*(?:@?)(TODO|FIXME)\b[:(\s-]*(.*)$/;

function parseLine(line) {
  const match = TODO_RE.exec(line);
  if (!match) return null;
  const text = match[2].replace(/\s*(\*\/|-->)\s*$/, '').trim();
  return { tag: match[1], text };
}

function* walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) yield* walk(full);
    } else if (entry.isFile()) {
      if (IGNORED_FILES.has(entry.name)) continue;
      if (BINARY_EXT.has(path.extname(entry.name).toLowerCase())) continue;
      yield full;
    }
  }
}

function findTodos(rootDir) {
  const root = path.resolve(rootDir || '.');
  const results = [];
  for (const file of walk(root)) {
    let content;
    try {
      if (fs.statSync(file).size > MAX_FILE_SIZE) continue;
      content = fs.readFileSync(file, 'utf8');
    } catch (err) {
      continue;
    }
    if (content.includes('\0')) continue;
    content.split(/\r?\n/).forEach((line, i) => {
      const parsed = parseLine(line);
      if (parsed) {
        results.push({
          file: path.relative(root, file).split(path.sep).join('/'),
          line: i + 1,
          tag: parsed.tag,
          text: parsed.text,
        });
      }
    });
  }
  return results;
}

function formatTodos(todos) {
  if (todos.length === 0) return 'No TODO comments found.';
  const lines = todos.map((t) => `${t.file}:${t.line}: ${t.tag}${t.text ? ` ${t.text}` : ''}`);
  lines.push('', `${todos.length} TODO comment${todos.length === 1 ? '' : 's'} found.`);
  return lines.join('\n');
}

// Handler for the /todo command: returns the text to show the user.
function todoCommand(rootDir) {
  return formatTodos(findTodos(rootDir));
}

if (require.main === module) {
  console.log(todoCommand(process.argv[2]));
}

module.exports = { parseLine, findTodos, formatTodos, todoCommand };
