const fs = require("fs");
const json2csv = require('json2csv').parse;
const csv = require("csvtojson");
const argv = require("yargs").argv;
const count = argv.c + 1 || 2; // count files
if (!argv.u) {
    throw new Error("Missing required parameter 'u'. Please enter 'u' with command. Example: node ... -u=1,4214")
} else {
    // fix format
    argv.u = argv.u.replace(".", ",")
}
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
            if (line.includes("(2)")) version = "v2";
            const p = line.split(";");
            if (p.length > 1) {
                body = {
                    u: p[0].trim(),
                    i: p[1].replace("\r", "").trim(),
                }
                result[version].push(body);
            }
        });

        results.push(result);
    }
    return results
}

const main = async () => {
    const content = await readFiles();
    // write report
    for (let i = 0; i < content.length; i++) {
        let n = i + 1;
        await sendReport(content[i]["v1"], `${n}v${1}`);
        await sendReport(content[i]["v2"], `${n}v${2}`);
    }
    console.log("END");
    process.exit(0)
}

main();
