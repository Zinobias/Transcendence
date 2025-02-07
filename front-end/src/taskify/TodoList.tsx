import React from "react";
import { Todo } from "../interfaces";
import SingleTodo from "./SingleTodo";
import './Taskify.css';

interface Props {
    todos: Todo[];
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
}

const TodoList: React.FC<Props> = ({todos, setTodos}) => {

    return (
        <div className="todos">
            {todos.map(todo => (
                <SingleTodo todo={todo} todos={todos} setTodos={setTodos}/>
            ))}
        </div>
    )
};

export default TodoList