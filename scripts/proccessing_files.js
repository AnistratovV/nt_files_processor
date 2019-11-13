const fs = require("fs");
const json2csv = require('json2csv').parse;
const csv = require("csvtojson");
const argv = require("yargs").argv;
const moment = require("moment-timezone");
const read = require("../services/reader")
const writer = require("../services/writer")

if (argv.format && !writer.config.includes(argv.format)) throw new Error("Unsupported format file");
const count = argv.c + 1 || 2; // count files
if (!argv.u) {
    throw new Error("Missing required parameter 'u'. Please enter 'u' with command. Example: node ... -u=1,4214")
} else {
    // fix format
    argv.u = argv.u.replace(".", ",")
}
const mode = argv.i || "default";
const now = moment(new Date()).tz("europe/moscow").format("DD_MM_YYYY_hh_mm_a")

const sendReport = (content, fileName) => {
    if (!content || !content.length) {
        console.log(`Warning! Report ${fileName} is empty`);
        return;
    };
    try {
        const csv = json2csv(content, Object.keys(content[0]));
        fs.writeFileSync(`../files/${fileName}.csv`, csv);
    } catch (error) {
        console.log("Error create report file:", error);
        content.forEach(item => console.log(item));
    }
};

const readFiles = async n => {
    const result = {}
    let buffer = fs.readFileSync(`../files/txt/${n}.txt`, "utf8");
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
    return result;
}

const main = async () => {
    const results = [];
    // processing

    for (let i = 1; i < count; i++) {
        const result = { N: i }
        const content = await read(i);
        Object.keys(content).forEach(version => {
            const value = content[version].find(item => item.u === argv.u);
            if (value) {
                value.u = value.u.replace(",", ".");
                value.i = value.i.replace(",", ".");
                result[`R ${version}`] = (parseFloat(value.u) / parseFloat(value.i)).toFixed(2);
            } else {
                console.log(`WARNING! For file ${i}${version} value u = ${argv.u} not found`);
                return;
            }
        })

        // for inverse mode
        if (mode === "inverse" && result["R v1"] > result["R v2"]) {
            const c = result["R v1"];
            result["R v1"] = result["R v2"];
            result["R v2"] = c;
        }
        results.push(result);
    }
    // write report
    await writer.do(results, `${mode}_${argv.u}_results_proccessing_${now}.${argv.format || "csv"}`)
    console.log("END");
    process.exit(0)
}

main();