const fs = require("fs");
const json2csv = require('json2csv').parse;
const argv = require("yargs").argv;
const read = require("../services/reader")
const writer = require("../services/writer")
const count = argv.c + 1 || 2; // count files

const sendReport = (content, fileName) => {
    if (!content || !content.length) {
        console.log(`warning! Report ${fileName} is empty`);
        return;
    };
    try {
        const csv = json2csv(content, Object.keys(content[0]));
        fs.writeFileSync(`../files/csv/${fileName}.csv`, csv);
    } catch (error) {
        console.log("Error create report file:", error);
        content.forEach(item => console.log(item));
    }
};

const readFiles = async () => {
    const results = [];
    for (let i = 1; i < count; i++) {
        const result = {
            v1: [],
            v2: [],
        };

        let buffer = fs.readFileSync(`../files/txt/${i}.txt`, "utf8");
        buffer = buffer.split("\n");
        let version = "v1"
        buffer.forEach(line => {
            // get values
            const p = line.split(";");
            // check values
            if (p.length > 1) {
                body = {
                    u: p[0].trim(),
                    i: p[1].replace("\r", "").trim(),
                }
                result[version].push(body);
            } else {
                // get version
                let match = line.match(/\((\d)\)/)
                // check version
                if (!match) return;
                version = `v${match[1]}`
                result[version] = [];
            }
        });

        results.push(result);
    }
    return results
}

const main = async () => {
    // write report
    for (let i = 1; i < count; i++) {
        const content = await read(i);
        for (const version in content) {
            const file = content[version];
            await writer.do(file, `${i}${version}.csv`, "../files/csv");
        }
    }
    console.log("END");
    process.exit(0)
}

main();
