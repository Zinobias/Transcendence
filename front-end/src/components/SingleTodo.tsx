import React, { useState, useRef } from "react";
import { Todo } from "../interfaces";
import { AiFillEdit, AiFillDelete } from 'react-icons/ai'
import "./components.css"


interface Props {
    todo: Todo;
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
};

const SingleTodo: React.FC<Props> = ({todo, todos, setTodos}) => {

    const inputRef = useRef<HTMLInputElement>(null);
    
    const [edit, setEdit] = useState<boolean>(false);
    const [editTodo, setEditTodo] = useState<string>(todo.todo);

    const handleDelete = (id: number) => {
        /* 
            It’s the process of looping through an array and including or excluding 
            elements inside that array based on a condition that you provide.
        */
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const handleEdit = (e: React.FormEvent, id: number) => {
        e.preventDefault();

        setTodos(
            todos.map((todo) => (todo.id === id ? {...todo,todo:editTodo} : todo))
        );
        setEdit(false);
    };

    return (
        <form className="todos__single" onSubmit={(e) => handleEdit(e, todo.id)}>
            { 
                edit ? 
                <input ref={inputRef} value={editTodo} onChange={(e) => setEditTodo(e.target.value)} className="todos__single--input" /> : 
                <span className="todos__single--text">{todo.todo}</span> 
            }
            <div>
                <span className="icon" onClick={()=> {if (!edit) setEdit(!edit);}}>
                    <AiFillEdit />
                </span>
                <span className="icon" onClick={() => handleDelete(todo.id)}>
                    <AiFillDelete />
                </span>
            </div>
        </form>
    )
};

export default SingleTodo;