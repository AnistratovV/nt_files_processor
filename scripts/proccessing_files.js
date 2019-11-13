const fs = require("fs");
const json2csv = require('json2csv').parse;
const csv = require("csvtojson");
const found_value = "0,1011";

const sendReport = (content, fileName) => {
    if (!content || !content.length) {
        console.log(`warning! Report ${fileName} is empty`);
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

const readFiles = async (i) => {
    const content = {}
    let buffer = fs.readFileSync(`../files/csv/${i}v1.csv`, "utf8");
    content["v1"] = await csv({
        noheader: false,
        output: "json",
        ignoreEmpty: true
    }).fromString(buffer);

    buffer = fs.readFileSync(`../files/csv/${i}v2.csv`, "utf8");
    content["v2"] = await csv({
        noheader: false,
        output: "json",
        ignoreEmpty: true
    }).fromString(buffer);

    return content
}

const main = async () => {
    const results = [];
    // processing

    for (let i = 0; i < 1; i++) {
        const result = { N: i + 1 }
        const content = await readFiles(i+1);
        ["v1", "v2"].forEach(version => {
            const value = content[version].find(item => item.u === found_value);
            if (value) {
                value.u = value.u.replace(",", ".");
                value.i = value.i.replace(",", ".");
                result[`R ${version}`] = (parseFloat(value.u) / parseFloat(value.i)).toFixed(2);
            } else {
                console.log("Value", value);
                console.log(`WARNING! For file ${i+1}${version} value not found`);
                return;
            }
        })

        if (result["R v1"] > result["R v2"]) {
            const c = result["R v1"];
            result["R v1"] = result["R v2"];
            result["R v2"] = c;
        }
        results.push(result);
    }
    // write report
    await sendReport(results, "results_proccessing");
    console.log("END");
    process.exit(0)
}

main();