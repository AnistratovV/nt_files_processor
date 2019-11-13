const fs = require("fs");

module.exports = async name => {
    const result = {}
    let buffer = fs.readFileSync(`../files/txt/${name}.txt`, "utf8");
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
};