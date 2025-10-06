"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Task = {
  id: string;
  text: string;
  done: boolean;
  list_id: string;
};

const LIST_ID = "friends-trip"; // 공유용 리스트 ID

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [lastError, setLastError] = useState("");

  // DB에서 불러오기
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("list_id", LIST_ID)
        .order("id", { ascending: true });

      if (error) setLastError("SELECT error: " + error.message);
      else setTasks(data || []);
    })();
  }, []);

  // 추가
  const addTask = async () => {
    console.log("ADD clicked", input);
    if (!input.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert([{ text: input, done: false, list_id: LIST_ID }])
      .select();

    if (error) {
      setLastError("INSERT error: " + error.message);
      console.error(error);
      return;
    }
    setLastError("");
    setTasks([...tasks, data![0]]);
    setInput("");
  };

  // 토글
  const toggleTask = async (task: Task) => {
    const { data, error } = await supabase
      .from("tasks")
      .update({ done: !task.done })
      .eq("id", task.id)
      .select();

    if (error) return setLastError("UPDATE error: " + error.message);
    setTasks(tasks.map((t) => (t.id === task.id ? data![0] : t)));
  };

  // 삭제
  const removeTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return setLastError("DELETE error: " + error.message);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 text-white flex flex-col items-center py-12 px-4">
      <div className="bg-white/10 backdrop-blur-md shadow-2xl rounded-3xl w-full max-w-md p-8 border border-white/20">
        {/* eslint-disable-next-line react/no-unescaped-entities */}
        <h1 className="text-3xl font-bold mb-6 text-center">🗹 Ploy's Checklist</h1>

        <div className="flex gap-2 mb-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type here na ka 🛫🛫🛫"
            className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={addTask}
            className="bg-blue-500 hover:bg-blue-600 px-5 py-3 rounded-xl font-semibold shadow-lg transition active:scale-95"
          >
            Add😸
          </button>
        </div>

        {lastError && (
          <div className="mb-4 text-sm text-red-300 bg-red-900/30 p-2 rounded">
            {lastError}
          </div>
        )}

        {tasks.length === 0 ? (
          <p className="text-center text-gray-400 italic">Nothing here yet... 😌</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleTask(task)}
                    className="w-5 h-5 accent-green-400 cursor-pointer"
                  />
                  <span className={task.done ? "line-through text-gray-400" : "text-white"}>
                    {task.text}
                  </span>
                </label>
                <button
  onClick={() => removeTask(task.id)}
  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg shadow-md transition active:scale-95"
  aria-label="삭제"
>
  Delete 😿
</button>
              </li>
            ))}
          </ul>
        )}
        <footer className="mt-8 text-center text-sm text-gray-400">
  <div className="mt-2 text-xs text-gray-500">
    Made by <span className="font-semibold text-gray-300">แฮอิน จ้า นะ ค่ะ</span> 😺
  </div>
</footer>
      </div>
    </main>
  );
}
