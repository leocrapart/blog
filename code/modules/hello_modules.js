module.exports = {
    name: "hello",
    sayHello(person) {console.log("hello " + person)},
    addition: (statement) => (second) => { console.log("wow "+ statement+" "+ second)}
}
