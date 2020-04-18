$(document).ready(function() {
    const summaryDiv = document.getElementById('summary-card');
    const recoveryBar = document.getElementById('recovery-progress');
    const fatalityBar = document.getElementById('fatality-rate');

    function dateParser(string){
        dateObj = new Date(string);
        return dateObj.toUTCString()
    }

    function createProgressBar(change, orig){
        let percentage = Math.round(change*100/orig);
        return `
        <div class="progress-bar" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">${percentage}%</div>`
    }

    function createSummary(data){
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

    // get totals from /summary
    fetch('http://localhost:3000/summary')
    .then(res => res.json())
        .then(data=> {
            let { totalDischarged, totalCases, totalDeath } = data
            let content = createSummary(data);
            let recovery = createProgressBar(totalDischarged, totalCases)
            let deaths = createProgressBar(totalDeath, totalCases)
            recoveryBar.innerHTML = recovery;
            fatalityBar.innerHTML = deaths;
            summaryDiv.innerHTML = content;
        })
        .catch(err => console.log(err, 'error'))

    const percentageCalc = (change, orig) => {
        if (change == 0) return 0
        let perc =  Math.round(change*100/orig);
        return change + ` (${perc}%)`
    }


    const table = $('#stat-table').DataTable({
        "ajax": {
            url: 'http://localhost:3000/events',
            dataSrc : ""
        },
        "columns": [
            { "data": "name" },
            { "data": "totalCases" },
            { "data": null, render: function(data, type){
                return percentageCalc(data.changeTotal, data.totalCases)
            } },

            { "data": null, render: function(data, type){
                return data.discharged;
            } },
            { "data": null, render: function(data, type){
                return percentageCalc(data.changeDischarged, data.discharged)
            } },
            { "data": null, render: function(data, type){
                return data.deaths 
            } },
            { "data": null, render: function(data, type){
                return percentageCalc(data.changeDeaths, data.deaths) 
            } },
            { "data": null, render: function(data, type){
                return data.activeCases
            } },
            { "data": null, render: function(data, type){
                return data.changeActive
            } }
            // { "data": "changeDischarged" },
            // { "data": "changeDeaths"}
            // { "data": "changeDeaths", render: $.fn.dataTable.render.number( ',', '.', 0, '', '%2' ) }
        ],
        "paging": false,
        "info": false,
        "responsive": true,
        "fixedHeader": true,
        "order": [[1, "desc"]],
        "columnDefs": [
            { responsivePriority: 1, targets: 0 },
            { responsivePriority: 2, targets: 1 },
            { responsivePriority: 3, targets: 3 },
            { responsivePriority: 4, targets: 5 },
            { responsivePriority: 10001, targets: [2,4,6,8] },
            { type: 'natural', targets: [ 2, 4, 6 ] },
            {  className: "recovery", targets: [3, 4] },
            {  className: "deaths", targets: [5, 6] }
        ],
    });


    source = new EventSource('http://localhost:3000/stream');

    source.onopen = function(e){
        console.log('connection made');
    }

    source.addEventListener('event', function(evt){
        const { summary, data } = JSON.parse(evt.data);
        updatedSum = createSummary(summary)
        summaryDiv.innerHTML = updatedSum;
        // console.log(data)
        table.clear()
        table.rows.add(data)
        table.draw()
    }, false)
    
    source.onerror = function(e){
        console.log(e)
    }

} );