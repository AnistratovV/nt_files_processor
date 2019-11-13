const fs = require("fs");
const json2csv = require('json2csv').parse;
const { checkParams } = require('check');

const getFormat = name => {
    const format = (name.split("."));
    return format[format.length - 1]
};

const processing = {
    csv: async (content, path) => {
        const csv = json2csv(content, Object.keys(content[0]));
        fs.writeFileSync(path, csv);
    },
    txt: async (content, path) => {
        const lines = content.map(item => {
            const result = []
            Object.keys(item).forEach(key => result.push(item[key]));
            return result.join(",");
        });
        const file = lines.join("\n");
        fs.writeFileSync(path, file);

    }
};

/**
 * @content = [ {...fields}, ..., etc ]
 * @fileName = `${fileName}.${format}`
 */
module.exports = {
    read: async ({ content, fileName, path }) => {
        try {
            checkParams({ content, fileName }, "content, fileName")
            if (!content.length) {
                console.log(`Warning! Report ${fileName} is empty`);
                return;
            };
    
            let format = getFormat(fileName);
            path = path ? path : "../files/"
            await processing[format](content, path + fileName)
        } catch (error) {
            console.log("Error create report file:", error);
            content.forEach(item => console.log(item));
        }
    },
    config: Object.keys(processing),
}