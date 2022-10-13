import React, { ReactNode, useState } from 'react';
import '../App.css';
import InputField from './InputField';
import TodoList from './TodoList';
import { Todo } from '../interfaces';

/*
  NOTES:

  React.FC functional Component
  Function Type Expressions (similar to arrow functions in javascript)

  The <span> tag is much like the <div> element, but <div> is a block-level 
  element and <span> is an inline element.

  spining element:
  <span className='spin-test'></span>

  synthetic Events:
  React uses synthetic events to handle events from button, input and form elements.
  A synthetic event is a shell around the native DOM event with additional 
  information for React.  Sometimes you have to use event.preventDefault(); in your application.

  useState()
  Is a Hook that allows you to have state variables in functional components. 
  Basically useState is the ability to encapsulate local state in a functional component.

  Syntax:  const [todo, setTodo] = useState<string>("");
  The first element is the initial state and the second one is a function that is used for updating the state.
*/


const DiscoPong: React.FC = () => {
  // useState is a hook that helps us manage state in function-based components in React
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault(); // preventDefault is called on the event when submitting the form to prevent a browser reload/refresh.

    if (todo) {
      // The JavaScript spread operator (...) allows us to quickly copy all or part of 
      // an existing array or object into another array or object.
      setTodos([...todos, { id: Date.now(), todo}]); // add the input to the array
      setTodo(""); // empty the input field
    }
  };

  return (
    <div className="App"> 
      <span className="heading">Disco Pong</span>
      <InputField todo={todo} setTodo={setTodo} handleAdd={handleAdd}/>
      <TodoList todos={todos} setTodos={setTodos}/>
    </div>
  );
}

export default DiscoPong;
