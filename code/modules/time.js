const date = require("date-and-time")

const get_time = () => {
    const now_raw = new Date()
    const pattern = date.compile("ddd DD MMM YYYY, HH:mm")
    const now_refined = date.format(now_raw, pattern)
    return now_refined
}

module.exports = {
    get_time
}