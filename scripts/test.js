


let a = [
    "fasfasf (1)",
    "3214; 41242",
    "fasfasf (2)",
    "4124124; 4214124"
];

const result = {};
let version = "1";
a.forEach(line => {
    let match = line.match(/\((\d)\)/)
    if (match) version = match[1];
    console.log(version)
})