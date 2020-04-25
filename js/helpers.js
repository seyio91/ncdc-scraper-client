const dateParser = (string) => {
    let dateObj = new Date(string);
    return dateObj.toUTCString()
}

export const createProgressBar = (change, orig) => {
    let percentage = Math.round(change*100/orig);
    return `
    <div class="progress-bar" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">${percentage}%</div>`
}

export const createSummary= (data) => {
    let parsedDate = dateParser(data.updateTime)
   let summary =  `
    <div class="card-body">
    <div style="font-size:13px; color:#999; margin-top:5px; text-align:center">Last updated: <span id="update-time">${parsedDate}</span> </div>
    <div id="maincounter-wrap">
        <h1>Coronavirus Cases:</h1>
        <div class="maincounter-number" >
        <span style="color:#aaa">${data.totalCases} </span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Recovered:</h1>
        <div class="maincounter-number" style="color:rgb(207, 30, 30) ">
        <span>${data.totalDischarged}</span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Deaths:</h1>
        <div class="maincounter-number" style="color:#8ACA2B ">
        <span>${data.totalDeath}</span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Total Tests:</h1>
        <div class="maincounter-number" style="color:#8ACA2B ">
        <span style="color:#aaa">${data.testSum}</span>
        </div>
    </div>
    `
    return summary
}

export const percentageCalc = (change, orig) => {
    if (change == 0) return 0
    let perc =  Math.round(change*100/orig);
    return change + ` (${perc}%)`
}
