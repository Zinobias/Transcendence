
import React from "react";
import './components.css';

/*
    the HTML <form> element is used to create an HTML form for user input
    BEM CSS Naming Convention

    button types:
    button - The button is a clickable button
    submit - The button is a submit button (submits form-data)
    reset - The button is a reset button (resets the form-data to its initial values)

    https://shadows.brumm.af/
*/

const InputField = () => {
    return (
        <form className="input">
            <input type="input" placeholder="Ente a task" className="input__box"/> 
            <button className="input__submit" type="button">GO</button>
        </form>
    )
};

export default InputField;