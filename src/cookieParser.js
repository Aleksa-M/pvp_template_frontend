export default function cookieParser(cookie) {
    const x = cookie.toString()
    const y = x.split('; ')
    var cookieJSON = {}
    for (var i = 0; i < y.length; i++) {
        let field = y[i].split("=")
        let property = field[0]
        let value = field[1]

        if (property == "user") {
            cookieJSON.user = value
        } else if (property == "pass") {
            cookieJSON.pass = value
        }
    }
    if (typeof cookieJSON.user == "undefined") {
        cookieJSON.user = ""
    }
    if (typeof cookieJSON.pass == "undefined") {
        cookieJSON.pass = ""
    }
    return cookieJSON
}