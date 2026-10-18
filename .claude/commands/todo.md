---
description: Find and summarise TODO/FIXME comments, or add a task to the app's to-do list via the API
argument-hint: [optional task name to add]
---

Handle the `/todo` request below. Arguments: $ARGUMENTS

## If no arguments are given

List outstanding work in the codebase:

1. Search `src/` and the root docs for `TODO`, `FIXME`, `HACK` and `XXX` comments. Skip `node_modules`, `.next` and lock files.
2. Group the results by tier (`src/web`, `src/api`, `src/db`, `src/infrastructure`, other).
3. For each hit show `path:line` and the comment text, then give a one-line suggestion on what to do.
4. Do not modify any files.

## If arguments are given

Treat the arguments as the name of a task to add to the app's to-do list:

1. Validate the name: it must be a non-empty string of at most 200 characters (the API rejects anything else). If invalid, say so and stop.
2. If the stack is running (`docker compose ps`), create the task with
   `POST /tasks` and the JSON body `{"name": "<task name>"}`. The API is internal to the Docker network, so run the request from inside a container, or against `http://localhost:3001` if the API is running locally. Take the URL from the `API_URL` environment variable where possible rather than hardcoding it.
3. Report the created task (id and name). If the stack is not running, say so and do not start it unless asked.
