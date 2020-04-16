$(document).ready(function() {
    const summaryDiv = document.getElementById('summary-card');

    function dateParser(string){
        dateObj = new Date(string);
        return dateObj.toUTCString()
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
            <h1>Deaths:</h1>
            <div class="maincounter-number" style="color:rgb(207, 30, 30) ">
            <span>${data.totalDischarged}</span>
            </div>
        </div>
        <div id="maincounter-wrap">
            <h1>Recovered:</h1>
            <div class="maincounter-number" style="color:#8ACA2B ">
            <span>${data.totalDeath}</span>
            </div>
        </div>
        `
        return summary
    }

    // get totals from /summary
    fetch('http://localhost:3000/summary')
    .then(res => res.json())
        .then(data=> {
            let content = createSummary(data)
            summaryDiv.innerHTML = content;
        })
        .catch(err => console.log(err, 'error'))





    const table = $('#stat-table').DataTable({
        "ajax": {
            url: 'http://localhost:3000/events',
            dataSrc : ""
        },
        "columns": [
            { "data": "name" },
            { "data": "totalCases" },
            { "data": "activeCases" },
            { "data": "discharged" },
            { "data": "deaths" },
            { "data": "changeTotal" },
            { "data": "changeActive" },
            { "data": "changeDischarged" },
            { "data": "changeDeaths" },
        ],
        "paging": false,
        "info": false,
        "responsive": true,
        "fixedHeader": true,
        "order": [[6, "desc"]],
        "columnDefs": [
            { responsivePriority: 1, targets: 0 },
            { responsivePriority: 2, targets: 1 },
            { responsivePriority: 10001, targets: 2 },
            { responsivePriority: 10001, targets: 5 }
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