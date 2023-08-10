const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const axios = require("axios");
const iconv = require('iconv-lite');

app.get('/', async(req, res)=>{
        const teams = await scrapeData(18);
        const json = {
            teams: teams
        }
        res.send(json);
});

app.get('/meczyki', async(req, res)=>{
    const teams = await scrapeDataMeczyki(18);
    const json = {
        teams: teams
    }
    res.send(json);
});

app.listen('8080');
console.log('API is running on http://localhost:8080');

async function scrapeData(numOfTeams) {
      const response = await axios({
        method: 'get',
        url: 'http://www.90minut.pl/liga/1/liga12496.html',
        responseType: 'arraybuffer'
      });
      const data = iconv.decode(response.data, 'iso-8859-2');
      const $ = cheerio.load(data);
      // ładowanie tabeli
      let teamsTable = $(".main2 tbody tr td");
      //usuwanie drugiej niepotrzebnej tabeli i napisów nad tabelą
      teamsTable.splice(0,29)
      teamsTable.splice(numOfTeams*22)
      let teamsString = [];
      let teams = [];
      teamsTable.each((idx, el)=>{
        teamsString.push($(el).text())
      })
      
      for(let i = 0; i<18;i++){
          const teamObject = {
              position: teamsString[0].slice(0,-1),
              name: teamsString[1].slice(1),
              matches: teamsString[2],
              points: teamsString[3],
              wins: teamsString[4],
              draws: teamsString[5],
              loses: teamsString[6],
              goals: teamsString[7].replace(/-/g, ":"),
              statsHome: {
                  wins: teamsString[8],
                  draws: teamsString[9],
                  loses: teamsString[10],
                  goals: teamsString[11].replace(/-/g, ":")
              },
              statsAway: {
                  wins: teamsString[12],
                  draws: teamsString[13],
                  loses: teamsString[14],
                  goals: teamsString[15].replace(/-/g, ":")
              }
          };
          teamsString = teamsString.slice(22)
          teams.push(teamObject)
      }
      return teams;
}

async function scrapeDataMeczyki(numOfTeams) {
    const response = await axios({
      method: 'get',
      url: 'http://www.90minut.pl/liga/1/liga12496.html',
      responseType: 'arraybuffer'
    });
    const data = iconv.decode(response.data, 'iso-8859-2');
    const $ = cheerio.load(data);
    // ładowanie tabeli
    let teamsTable = $(".main2 tbody tr td");
    //usuwanie drugiej niepotrzebnej tabeli i napisów nad tabelą
    teamsTable.splice(0,29)
    teamsTable.splice(numOfTeams*22)
    let teamsString = [];
    let teams = [];
    teamsTable.each((idx, el)=>{
      teamsString.push($(el).text())
    })
    for(let i = 0; i<18;i++){
        const goalsScored = teamsString[7].split("-")[0];
        const goalsLost = teamsString[7].split("-")[1]; 
        const teamObject = {
            position: teamsString[0].slice(0,-1),
            name: teamsString[1].slice(1),
            matches: teamsString[2],
            points: teamsString[3],
            wins: {
              total: teamsString[4]
            },
            draws: {
              total: teamsString[5]
            },
            loses: {
              total: teamsString[6]
            },
            goals:{
              goalsScored:{
                  total: goalsScored
              },
              goalsLost:{
                    total: goalsLost
              }
            },
            statsHome: {
                wins: teamsString[8],
                draws: teamsString[9],
                loses: teamsString[10],
                goals: teamsString[11].replace(/-/g, ":")
            },
            statsAway: {
                wins: teamsString[12],
                draws: teamsString[13],
                loses: teamsString[14],
                goals: teamsString[15].replace(/-/g, ":")
            }
        };
        teamsString = teamsString.slice(22)
        teams.push(teamObject)
    }
    return teams;
}
module.exports = app;