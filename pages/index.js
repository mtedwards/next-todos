import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react'
 import { useForm } from 'react-hook-form';

import supabase from "../utils/initSupabase";

export default function Home({todos}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  // Update ToDo (completed state)
  const handleComplete = async (id, completed) => {
    await supabase.from("todos").update( { completed: !completed }).match({ id: id });
    router.replace(router.asPath);
  }
  
  // Delete Todo
  const handleDelete = async (id) => {
    await supabase.from("todos").delete().match({ id: id });
    router.replace(router.asPath);
  }

  // form has been submitted
  const handleNewTodo = async (data) => {
    setBusy(true);
    await supabase.from("todos").insert([{ title: data.todo }]);
    await router.replace(router.asPath);
    setBusy(false);
  }

  // Reset the form to a blank state when the form is submitted
  let formRef = useRef();
   useEffect(() => {
     if(!busy) {
       formRef.current.reset();
     }
   }, [busy])

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4", maxWidth: "800px", marginLeft:'auto', marginRight: "auto" }}>
      <h1>My Todos</h1>
      <ul className="todo-list" style={{dispay:"flex", flexDirection:"column", padding:0 }}>
        {todos.map((todo) => (
          <li key={todo.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              margin: 0,
              padding: 5,
              background: "#eee",
              border: "1px solid #111"
            }}
          >
            {todo.completed ? <strike>{todo.title}</strike> : todo.title}
            <span className="controls"
              style={{
                display: "flex",
                gap: 5
              }}>
              
              <button onClick={() => handleComplete(todo.id, todo.completed)}>{todo.completed ? <>&#8592;</> : <>&#10004;</>}</button>
              <button onClick={() => handleDelete(todo.id)}>&#10060;</button>
            </span>
          </li>
        ))}

      </ul>
      <form ref={formRef} onSubmit={handleSubmit(handleNewTodo)} style={{marginTop: "1rem", display: "flex", gap: 10}} >
        <input type="text" name="todo" {...register("todo", {required: true})} style={{padding:10, flex: 1}}/>
        <button disabled={busy} type="submit" style={{padding:10}}>{busy ? "Adding..." : "Add New Todo"}</button>
      </form>
    </div>
  )
}

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries.
export async function getStaticProps() {
  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  const res = await supabase.from("todos").select("id, title, completed");
  const todos = await res.data;

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      todos,
    },
  }
}