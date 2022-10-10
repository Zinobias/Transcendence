/*
    DOCUMENTATION:
    https://www.typescriptlang.org/docs/handbook/intro.html

    to compile start docker
    tsc cheatSheet.ts
    node cheatSheet.js

    .tsx extension is used when we want to embed JSX elements inside the files while 
    .ts is used for plain Typescript files and do not support adding JSX Elements.
*/

/*
    unknown is the type-safe counterpart of any. 
    Anything is assignable to unknown, but unknown isn't assignable to anything but 
    itself and any without a type assertion or a control flow based narrowing. 
    Likewise, no operations are permitted on an unknown without first asserting 
    or narrowing to a more specific type.
*/
var test1: any; // BAD
var test2: unknown; // GOOD

var age: number | string; // union, means age can be a string or a number
age = 5;

// if we want to check what type age is in the end we can use type of and ===
// === is used for typechecking and not just for comparing the values
if (typeof age === "number") { 
    console.log("Is a number");
}

if (typeof age === "string") {
    console.log("Is a string");
}

/*
    The interface contains only the declaration of the methods and fields, 
    but not the implementation. We cannot use it to build anything. 
    A class inherits an interface, and the class which implements interface 
    defines all members of the interface.
*/
interface Panini { 
    a: string;
    b: string;
};

interface Zino extends Panini { // inherits from Panini
    c: string;
};

type Person = { // definiton of an object
    name: string;
    age?: number; // optional element, if we make a person it can have an age but doesnt need to
};

type Animal = Person & { // inherits from Person
    race: string;
};

let person: Person = { // person is a Person object
    name: "panini",
};

let lotsOfPeople: Person[]; // Array of Person

function printName(name: string) {
    console.log(name);
}

// like this we can give a return type to a function
let printName2: (name: string) => void; // return type is undefined
let printName3: (name: string) => never; // never returns anything


// assigning s1 and s2 in one line
class example {
    public s1 : string;
    public s2: string;
    
    printTest() {
        [this.s1, this.s2] = ["test", "test2"];
        console.log(this.s1 + " " + this.s2);
    }
}

let examplee = new example();
examplee.printTest();