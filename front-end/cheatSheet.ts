
/*
    .tsx extension is used when we want to embed JSX elements inside the files while 
    .ts is used for plain Typescript files and do not support adding JSX Elements.
*/


var age: number | string; // union, means age can be a string or a number
age = 5;

if (typeof age === "number") {
    console.log("Is a number");
}

type Person = { // definiton of an object
    name: string;
    age?: number; // optional element, if we make a person it can have an age but doesnt need to
};

let person: Person = { // person is a Person object
    name: "panini",
};

let lotsOfPeople: Person[]; // Array of Person