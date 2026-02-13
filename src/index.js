const express = require("express")
const {PORT} = require("./config/serverConfig")
const apiRoutes = require("./routes")
const CRON = require("./utils/common/cron-jobs")

const setupAndStartServer = async()=>{
    const app = express()

    app.use(express.json())
    app.use(express.urlencoded({extended : true}))

    app.use("/api", apiRoutes)

    app.listen(PORT, ()=>{
        console.log(`server listening on port ${PORT}`);
        CRON()
    })
}

setupAndStartServer()