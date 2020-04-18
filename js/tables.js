import { createProgressBar, createSummary, percentageCalc } from './helpers'

$(document).ready(function() {
    const summaryDiv = document.getElementById('summary-card');
    const recoveryBar = document.getElementById('recovery-progress');
    const fatalityBar = document.getElementById('fatality-rate');

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