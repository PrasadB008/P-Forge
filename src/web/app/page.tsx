import { getTasks, createTask, toggleTask, clearCompleted } from './actions';

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default async function Home() {
  const tasks = await getTasks();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 py-16 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">
          To-Do List
        </h1>

        {/* Add task form */}
        <form action={createTask} className="flex gap-2 mb-8">
          <input
            name="name"
            type="text"
            required
            placeholder="Add a new task..."
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-2 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          />
          <select
            name="priority"
            defaultValue="medium"
            aria-label="Priority"
            className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 dark:bg-zinc-50 px-5 py-2 font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Task list */}
        <ul className="space-y-2">
          {tasks.length === 0 && (
            <li className="text-zinc-400 text-center py-8">No tasks yet. Add one above!</li>
          )}
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3"
            >
              <form
                action={async () => {
                  'use server';
                  await toggleTask(task.id, !task.completed);
                }}
              >
                <button
                  type="submit"
                  className={`h-5 w-5 rounded border-2 flex-shrink-0 transition-colors ${
                    task.completed
                      ? 'bg-zinc-900 dark:bg-zinc-50 border-zinc-900 dark:border-zinc-50'
                      : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-500'
                  }`}
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed && (
                    <svg viewBox="0 0 12 12" className="text-white dark:text-zinc-900 w-full h-full p-0.5">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </form>
              <span
                className={`flex-1 text-sm ${
                  task.completed
                    ? 'line-through text-zinc-400'
                    : 'text-zinc-800 dark:text-zinc-100'
                }`}
              >
                {task.name}
              </span>
              <span
                data-testid="priority-badge"
                className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  PRIORITY_STYLES[task.priority] ?? PRIORITY_STYLES.medium
                }`}
              >
                {task.priority ?? 'medium'}
              </span>
            </li>
          ))}
        </ul>

        {tasks.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-xs text-zinc-400">
              {tasks.filter((t) => t.completed).length} / {tasks.length} completed
            </p>
            {tasks.some((t) => t.completed) && (
              <form
                action={async () => {
                  'use server';
                  await clearCompleted(tasks);
                }}
              >
                <button
                  type="submit"
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
                >
                  Clear completed
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
