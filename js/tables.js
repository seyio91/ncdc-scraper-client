// import { createProgressBar, createSummary, percentageCalc } from './helpers.js'
const baseDate = '2020-02-29'
const dateParser = (string) => {
    return moment(string).format('LLLL')
}

const createProgressBar = (change, orig, style) => {
    let percentage = Math.round(change*100/orig);
    console.log(percentage)
    return `
    <div class="progress-bar ${style}" role="progressbar" style="width: ${percentage}%;" aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">${percentage}%</div>`
}

const createSummary= (data) => {
    let parsedDate = dateParser(data.date)
   let summary =  `
    <div class="card-body">
    <div style="font-size:13px; color:#999; margin-top:5px; text-align:center">Last updated: <span id="update-time">${parsedDate}</span> </div>
    <div id="maincounter-wrap">
        <h1>Coronavirus Cases:</h1>
        <div class="maincounter-number" >
        <span style="color:#aaa">${data.totalcases} </span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Recovered:</h1>
        <div class="maincounter-number" style="color:rgb(207, 30, 30) ">
        <span>${data.discharged}</span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Deaths:</h1>
        <div class="maincounter-number" style="color:#8ACA2B ">
        <span>${data.deaths}</span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Total Tests:</h1>
        <div class="maincounter-number" style="color:#8ACA2B ">
        <span style="color:#aaa">${data.test}</span>
        </div>
    </div>
    `
    return summary
}

const prevDayCheck = (day) => {
    return moment(day).isAfter(baseDate)
}

const nextDayCheck = (day) => {
    return moment(day).isBefore(moment().format('YYYY-MM-DD'))
}


const percentageCalc = (change, orig) => {
    if (change == 0) return 0
    let perc =  Math.round(change*100/orig);
    return `+${change} (${perc}%)`
}


$(document).ready(function() {
    const summaryDiv = document.getElementById('summary-card');
    const recoveryBar = document.getElementById('recovery-progress');
    const fatalityBar = document.getElementById('fatality-rate');
    const displayDate = document.getElementById('displayDate');
    const prevDate = document.getElementById('previousDate');
    const nextDate = document.getElementById('nextDate');
    

    // get totals from /summary
    fetch('http://localhost:3000/summary')
    .then(res => res.json())
        .then(response => {
            if (response.status == 'success'){

                let { discharged, totalcases, deaths } = response.data;
                let content = createSummary(response.data);
                let recovery = createProgressBar(discharged, totalcases, 'bg-recovery')
                let deathbar = createProgressBar(deaths, totalcases, 'bg-fatality')
                recoveryBar.innerHTML = recovery;
                fatalityBar.innerHTML = deathbar;
                summaryDiv.innerHTML = content;
            } else {
                // perform some error handling
                return
            }
        })
        .catch(err => console.log(err, 'error'));


    prevDate.addEventListener('click', (evt) => {
        evt.preventDefault();
        let date = displayDate.innerText;
        if(!prevDayCheck(date)) return;
        let newPrev = moment(date).subtract(1, 'day')
        // render the whole screen here
        renderDate(newPrev)
    })

    nextDate.addEventListener('click', (evt) => {
        evt.preventDefault();
        let date = displayDate.innerText;
        if(!nextDayCheck(date)) return;
        let newDay = moment(date).add(1, 'day')
        // render the whole screen here
        renderDate(newDay)
    })


    const renderDate = (string) => {
        date = moment(string)
        if (date.isSame(baseDate)){
            prevDate.style.opacity = 0.1
        } else {
            prevDate.removeAttribute('style')
        }

        if (date.isSame(moment().format('YYYY-MM-DD'))){
            nextDate.style.opacity = 0.1
        } else {
            nextDate.removeAttribute('style')
        }
        date = moment(string).format('YYYY-MM-DD')
        displayDate.innerText = date;
    }
    

    const dataOptions = {
        "columns": [
            { "data": null, render: function(data, type){
                return data.name;
            } },
            { "data": null, render: function(data, type){
                return data.totalcases
            } },
            { "data": null, render: function(data, type){
                return percentageCalc(data.changetotal, data.totalcases)
            } },

            { "data": null, render: function(data, type){
                return data.discharged;
            } },
            { "data": null, render: function(data, type){
                return percentageCalc(data.changedischarged, data.discharged)
            } },
            { "data": null, render: function(data, type){
                return data.deaths 
            } },
            { "data": null, render: function(data, type){
                return percentageCalc(data.changedeaths, data.deaths) 
            } },
            { "data": null, render: function(data, type){
                return data.activecases
            } },
            { "data": null, render: function(data, type){
                return data.changeactive
            } }

        ],
        "paging": false,
        // "info": false,
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
    }

    const table = $('#stat-table').DataTable(dataOptions);

    fetch('http://localhost:3000/events')
    .then(res => res.json())
        .then(response => {
            if (response.status == 'success'){
                // render date field
                renderDate(response.data[0].date)
                // renderDate('2020-04-24')
                data = response.data
                table.rows.add(data)
                    .draw();
            }
        })
        .catch()




    // Test Click
    const testData = [{
        "id": 731,
        "name": "Lagos",
        "totalcases": 657,
        "activecases": 525,
        "discharged": 116,
        "deaths": 16,
        "changetotal": 75,
        "changeactive": 65,
        "changedischarged": 10,
        "changedeaths": 0,
        "date": "2020-04-23T22:00:00.000Z"
      },
      {
        "id": 731,
        "name": "Lagos",
        "totalcases": 657,
        "activecases": 525,
        "discharged": 116,
        "deaths": 16,
        "changetotal": 75,
        "changeactive": 65,
        "changedischarged": 10,
        "changedeaths": 0,
        "date": "2020-04-23T22:00:00.000Z"
      }
    ]

    const testClick = document.getElementById('testload');

    testClick.addEventListener('click', (evt)=> {
        evt.preventDefault();
        table.clear();
        table.rows.add(testData)
            .draw()
    })
    // 


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

// #343a40