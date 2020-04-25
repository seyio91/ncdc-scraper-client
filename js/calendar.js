$(document).ready(()=>{

    fetch('http://localhost:3000/timeline')
    .then(res => res.json())
    .then(data => {
        generateCalendar();
        datasets = arrayGenerator(data)
        const { dataSet1, dataSet2 , dataSet3, dataSet4 } = datasets;
        lineChartGen(dataSet1, dataSet2 , dataSet3, dataSet4)

        console.log(data)
    })
    .catch(err => console.log(err))
})


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



const lineChartGen = (data1, data2, data3, data4) => {

    let lineChart = new Chart(myChart, {
          type: 'line',
          data: {
              labels: data4.reverse(),
            //   labels: ['world'],
              datasets: [{ 
                  data: data1.reverse(),
                  label: "Total Cases",
                  borderColor: "#3e95cd",
                  fill: false
              }, { 
                  data: data2.reverse(),
                  label: "Recovery",
                  borderColor: "#8e5ea2",
                  fill: false
              }, { 
                  data: data3.reverse(),
                  label: "Deaths",
                  borderColor: "#3cba9f",
                  fill: false
              }
              ]
          },
          options: {
              responsive: true,
              title: {
              display: true,
              text: 'World population per region (in millions)'
              }
          }
          });
}

const generateCalendar = (events) => {
    $('#mini-clndr').clndr({
        template: $('#mini-clndr-template').html(),
        events: events,
        clickEvents: { 
            click: function(target) {
                console.log(target.date)
                if(target.events.length) { 
                    var daysContainer = $('#mini-clndr').find('.days-container'); 
                    daysContainer.toggleClass('show-events', true); 
                    var selectedClass = target.date.format('YYYY-MM-DD'); 
                    $('.eventday').hide(); 
                    $('#event-'+selectedClass).show(); 
                    $('#mini-clndr').find('.x-button').click( function() { 
                        daysContainer.toggleClass('show-events', false); 
                    });
                } 
            } 
        },
        adjacentDaysChangeMonth: true,
        forceSixRows: true
      });
}