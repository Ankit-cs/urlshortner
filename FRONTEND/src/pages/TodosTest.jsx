import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function TodosTest() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    async function getTodos() {
      // NOTE: This will only work if you have a 'todos' table in your Supabase project
      // with 'id' and 'name' columns, and the RLS policies allow reading.
      const { data: todos, error } = await supabase.from('todos').select();

      if (todos) {
        setTodos(todos);
      } else if (error) {
        console.error('Error fetching todos:', error.message);
      }
    }

    getTodos();
  }, []);

  return (
    <div className="min-h-screen pt-32 px-4 bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Todos Test</h1>
        {todos.length === 0 ? (
          <p className="text-gray-500">No todos found (or the table doesn't exist yet).</p>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="p-4 border border-black/10 dark:border-white/10 rounded-xl">
                {todo.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
