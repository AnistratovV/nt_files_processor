const checkParams = (params, list) => {
    list = list.split(",").map(item => item.trim());
    for (const param of list) {
      if (!params[param]) throw new Error(`Missing parameter ${param}`);
    }
}



module.exports = {
    checkParams,
}