
import React, { useRef } from "react";
import './Taskify.css';

/*
    the HTML <form> element is used to create an HTML form for user input
    BEM CSS Naming Convention

    button types:
    button - The button is a clickable button
    submit - The button is a submit button (submits form-data)
    reset - The button is a reset button (resets the form-data to its initial values)

    https://shadows.brumm.af/

    useRef:
    Returns a mutable ref object whose .current property is initialized to the passed argument (initialValue). 
    The returned object will persist for the full lifetime of the component. A common use case is to access 
    a child imperatively.
    Essentially, useRef is like a “box” that can hold a mutable value in its .current property.
*/

interface Props {
    todo: string;
    setTodo: React.Dispatch<React.SetStateAction<string>>;
    handleAdd: (e: React.FormEvent) => void;
}

const InputField: React.FC<Props> = ({todo, setTodo, handleAdd}) => {

    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <form className="input" onSubmit={(e) => {
                handleAdd(e)
                inputRef.current?.blur();
                }}>
            <input 
                ref={inputRef}
                type="input"
                value={todo}
                onChange={(e)=>setTodo(e.target.value)}
                placeholder="Enter a task" 
                className="input__box"
            /> 
            <button className="input__submit" type="submit">GO</button>
        </form>
    )
};

export default InputField;