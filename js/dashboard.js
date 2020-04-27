const baseDate = '2020-02-29'
const  baseEventURL = '/api/user/v1/events';
const graphURL = '/api/user/v1/timeline';
const streamURL = '/api/user/v1/stream';
const summaryURL = '/api/user/v1/summary';
const globalStatURL = "https://api.thevirustracker.com/free-api?global=stats"

const currentDate = moment().format('YYYY-MM-DD');

const dateParser = (string) => {
    return moment(string).format('LLLL')
}

const createProgressBar = (change, orig, style) => {
    let percentage = Math.round(change*100/orig);
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
        <span style="color:rgba(0, 181, 204, 0.7)">${data.totalcases} </span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Deaths:</h1>
        <div class="maincounter-number" style="color:rgb(207, 30, 30) ">
        <span >${data.deaths}</span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Recovered:</h1>
        <div class="maincounter-number" style="color:#8ACA2B ">
        <span>${data.discharged}</span>
        </div>
    </div>
    <div id="maincounter-wrap">
        <h1>Tests:</h1>
        <div class="maincounter-number" style="color:#8ACA2B ">
        <span style="color:#aaa">${data.test}</span>
        </div>
    </div>
    `
    return summary
}

const totalDataLabel = (active, recovered, dead) => {
    return `<p>Active: <span class="activecase">${active}</span>    Recovered: <span class="recovery">${recovered}</span>   Dead: <span class="deaths">${dead}</span></p>`
}

const outcomeDataLabel = ( recovered, dead) => {
    return `<p>Recovered: <span class="recovery">${recovered}</span>    Dead: <span class="deaths">${dead}</span></p>`
}

const globalRender = (total, resolved, deaths) => {
    html = `
            <div class="row pt-1 font-weight-bold">
                <div class="col">
                    Global Report:
                </div>
                <div class="col">
                    Confirmed: <span style="color:rgba(0, 181, 204, 0.7);">${total}</span>
                </div>
                <div class="col">
                    Deaths: <span class="deaths">${resolved}</span>
                </div>
                <div class="col">
                    Recovered: <span class="recovery">${deaths}</span>
                </div>
            </div>
        `
    return html
}

const prevDayCheck = (day) => {
    return moment(day).isAfter(baseDate)
}

const nextDayCheck = (day) => {
    return moment(day).isBefore(currentDate)
}


const percentageCalc = (change, orig) => {
    if (change == 0) return 0
    let perc =  Math.round(change*100/orig);
    return `+${change} (${perc}%)`
}

const urlGen = (date) => {
    date = moment(date);
    let url = date.isSame(currentDate)? baseEventURL: `${baseEventURL}/${date.format('YYYY-MM-DD')}`
    return url
}

const arrayGenerator = (largeArr) => {
    dataSet1 = [];
    dataSet2 = [];
    dataSet3 = [];
    dataSet4 = [];

    largeArr.forEach(dict => {
        if (dict.totalcases > 0){
            dataSet1.push(dict.totalcases);
            dataSet2.push(dict.discharged);
            dataSet3.push(dict.deaths);
            dataSet4.push(moment(dict.date).format('YYYY-MM-DD'))
        }
    })

    return { dataSet1, dataSet2, dataSet3, dataSet4 }
}




$(document).ready(function() {
    const summaryDiv = document.getElementById('summary-card');
    const recoveryBar = document.getElementById('recovery-progress');
    const fatalityBar = document.getElementById('fatality-rate');
    const prevDate = document.getElementById('previousDate');
    const nextDate = document.getElementById('nextDate');
    const tdChart = document.getElementById('donut-total');
    const odChart = document.getElementById('donut-outcome');
    const myChart = document.getElementById('myChart');
    const searchDate = document.getElementById('searchDate')
    const totalLabel = document.getElementById('tData-label')
    const outcomeLabel = document.getElementById('outcomelabel')
    const globalDiv = document.getElementById('globalstats')
    const progresstotal = document.getElementById('progress-totalcases')
    const progresstest = document.getElementById('progress-totaltest')


    // Initialize Date Picker
    $( "#datepicker" ).datepicker({
        dateFormat: 'yy-mm-dd',
        minDate: baseDate,
        maxDate: currentDate,
        defaultDate: currentDate
    });
    

    // Initialize Side Bar, Summary and Graphs
    fetch(summaryURL)
    .then(res => res.json())
        .then(response => {
            if (response.status == 'success'){

                let { activecases, discharged, totalcases, deaths } = response.data;
                let content = createSummary(response.data);

                summaryDiv.innerHTML = content;
                tdChart.style.display = 'block'
                odChart.style.display = 'block'
                createTotalDonut([activecases, discharged, deaths])
                totalLabel.innerHTML = totalDataLabel(activecases, discharged, deaths)
                createOutcomeDonut([discharged, deaths])
                outcomeLabel.innerHTML = outcomeDataLabel(discharged, deaths)
            } else {
                // perform some error handling
                return
            }
        })
        .catch(err => console.error(err));


    const loadGlobalStats = () => {
        fetch(globalStatURL)
        .then(res => res.json())
            .then(response => {
                if (response.stat != 'ok') return;
                const { total_cases, total_recovered, total_deaths } = response.results[0];
                globalDiv.innerHTML = globalRender(total_cases, total_recovered, total_deaths)
            })
            .catch(err => console.error(err));
    }


    // Date Change Event Listeners
    prevDate.addEventListener('click', (evt) => {
        evt.preventDefault();
        let date = $('#datepicker').val();
        if(!prevDayCheck(date)) return;
        let newPrev = moment(date).subtract(1, 'day')
        renderDate(newPrev)
    })

    nextDate.addEventListener('click', (evt) => {
        evt.preventDefault();
        let date = $('#datepicker').val();
        if(!nextDayCheck(date)) return;
        let newDay = moment(date).add(1, 'day')
        renderDate(newDay)
    })

    searchDate.addEventListener('click', (evt) => {
        evt.preventDefault();
        let date = $('#datepicker').val();
        eventURL = urlGen(date)
        dataLoad(eventURL)
    })


    const renderDate = (string) => {
        date = moment(string)
        if (date.isSame(baseDate)){
            prevDate.style.opacity = 0.1
        } else {
            prevDate.removeAttribute('style')
        }

        if (date.isSame(currentDate)){
            nextDate.style.opacity = 0.1
        } else {
            nextDate.removeAttribute('style')
        }
        date = moment(string).format('YYYY-MM-DD')
        $('#datepicker').val(date)
    }




    
    // Options for DataTables
    const dataOptions = {
        "language": {
            searchPlaceholder: "Search State",
            search: "",
          },
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
            {  className: "deaths", targets: [5, 6] },
            {  className: "activecase", targets: [7, 8] },
            { "searchable": false, "targets": [1,2,3,4,5,6,7,8] }
        ],
    }

    const table = $('#stat-table').DataTable(dataOptions);



    // Chart Creating Functions
    const lineChartGen = (data1, data2, data3, data4) => {
        let lineChart = new Chart(myChart, {
              type: 'line',
              data: {
                  labels: data4.reverse(),
                //   labels: ['world'],
                  datasets: [{ 
                      data: data1.reverse(),
                      label: "Total Cases",
                      borderColor: 'rgba(0, 181, 204, 0.7)',
                      fill: true
                  }, { 
                      data: data2.reverse(),
                      label: "Recovery",
                      borderColor: 'rgba(123, 239, 178, 0.7)',
                      fill: true
                  }, { 
                      data: data3.reverse(),
                      label: "Deaths",
                      borderColor: 'rgba(255, 99, 132, 0.7)',
                      fill: true
                  }
                  ]
              },
              options: {
                  responsive: true,
                  title: {
                  display: true,
                  text: 'Average Cases Per Week',
                  fontSize: 18,
                  fontColor: "#FFFFFF"
                  },
                  legend: {
                    display: true,
                    labels: {
                        fontColor: '#FFFFFF'
                    }
                },
                // new options here
                scales: {
                    xAxes: [{ 
                        ticks: {
                          fontColor: "#FFFFFF",
                        },
                    }],
                    yAxes: [{
                        ticks: {
                            fontColor: "#FFFFFF",
                          },
                    }],
                }
              }
              });
    }
    // Chart end


    // Doughnut Charts
    const createTotalDonut = (data) => {
        let totalDoughnut = new Chart(tdChart, {
            type: 'doughnut',
            data: {
                labels: ['ACTIVE', 'RECOVERED', 'DEAD'],
                datasets: [{
                  label: '# of Cases',
                  data: data,
                  backgroundColor: [
                    'rgba(245, 215, 110, 0.7)',
                    'rgba(123, 239, 178, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                    
                  ],
                  borderColor: [
                    'rgba(245, 215, 110, 1)',
                    'rgba(123, 239, 178, 1)',
                    'rgba(255,99,132,1)'
                  ],
                  borderWidth: 1
                }]
              },
            options : {
                responsive: true,
                title: {
                    display: true,
                    position: "top",
                    text: "Totals Chart",
                    fontSize: 18,
                    fontColor: "#FFFFFF"
                  },
                  legend: {
                    display: true,
                    labels: {
                        fontColor: '#FFFFFF'
                    }
                }
            }
        })
    }

    const createOutcomeDonut = (data) => {
        let outcomeDoughnut = new Chart(odChart, {
            type: 'doughnut',
            data: {
                labels: ['RECOVERED', 'DEAD'],
                datasets: [{
                  label: '# of Outcomes',
                  data: data,
                  backgroundColor: [
                    'rgba(123, 239, 178, 0.7)',
                    'rgba(255, 99, 132, 0.7)'
                  ],
                  borderColor: [
                    'rgba(123, 239, 178, 1)',
                    'rgba(255,99,132,1)'
                  ],
                  borderWidth: 1
                }]
              },
            options : {
                responsive: true,
                title: {
                    display: true,
                    position: "top",
                    text: "Outcomes Chart",
                    fontSize: 18,
                    fontColor: "#FFFFFF"
                  },
                  legend: {
                    display: true,
                    labels: {
                        fontColor: '#FFFFFF'
                    }
                }
            }
        })
    }
    // donut end




    fetch(graphURL)
    .then(res => res.json())
    .then(response => {
        if (response.status == 'success'){
            datasets = arrayGenerator(response.data)
            const { dataSet1, dataSet2 , dataSet3, dataSet4 } = datasets;
            myChart.style.display = 'block'
            lineChartGen(dataSet1, dataSet2 , dataSet3, dataSet4)
        }
    })
    .catch(err => console.error(err))

    const daySummaryBar = (summary) => {
        const { discharged, totalcases, deaths, test } = summary;
        let recovery = createProgressBar(discharged, totalcases, 'bg-recovery')
        let deathbar = createProgressBar(deaths, totalcases, 'bg-fatality')
        recoveryBar.innerHTML = recovery;
        fatalityBar.innerHTML = deathbar;
        progresstotal.innerText = totalcases;
        progresstest.innerText = test;
    }

    const dataLoad = (eventURL) => {
        fetch(eventURL)
        .then(res => res.json())
            .then(response => {
                if (response.status == 'success'){
                    const { summary, data } = response.data
                    let date = eventURL == baseEventURL ? currentDate: data[0].date;
                    daySummaryBar(summary)
                    renderDate(date)
                    table.clear();
                    table.rows.add(data)
                        .draw();
                }
            })
            .catch(err => console.error(err))
    }

    // Init Functions
    loadGlobalStats()
    dataLoad(baseEventURL);
    

    source = new EventSource(streamURL);

    source.onopen = function(e){
        console.info('Connected for Streaming Events');
    }

    // Real Time Update Stream
    source.addEventListener('event', function(evt){
        const { summary, data } = JSON.parse(evt.data);
        updatedSum = createSummary(summary)
        summaryDiv.innerHTML = updatedSum;
        daySummaryBar(summary)
        table.clear()
        table.rows.add(data)
        table.draw()
    }, false)
    
    source.onerror = function(e){
        console.error(e)
    }

} );
