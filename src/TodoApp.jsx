// src/TodoApp.jsx
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import './TodoApp.css';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [projectName, setProjectName] = useState("");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Fetch tasks from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "todos"), (snapshot) => {
      setTodos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (newTodo.trim()) {
      await addDoc(collection(db, "todos"), {
        text: newTodo,
        completed: false,
        project: projectName,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        due: dueDate
      });
      setNewTodo("");
      setProjectName("");
      setTags("");
      setDueDate("");
    }
  };

  const toggleTodo = async (id, completed) => {
    await updateDoc(doc(db, "todos", id), { completed: !completed });
  };

  const deleteTodo = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  return (
    <div className="todo-container">
      <h1>Simple To-Do</h1>

      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="Task name..."
        />
        <input
          type="text"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="Project..."
        />
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className="todo-item">
            <span
              className={`todo-text ${todo.completed ? "completed" : ""}`}
              onClick={() => toggleTodo(todo.id, todo.completed)}
            >
              {todo.text}
            </span>

            {todo.project && <span className="badge project">{todo.project}</span>}
            {todo.tags?.map(tag => <span key={tag} className="badge tag">{tag}</span>)}
            {todo.due && <span className="badge due">Due: {todo.due}</span>}

            <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>❌</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;
