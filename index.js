const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const axios = require("axios");
const iconv = require('iconv-lite');
const { readFileSync } = require('fs');
const path = require('path');
const { error } = require('console');

app.get('/:league', async(req, res)=>{
        const data = converter(req.params.league)
        if(data!=null){
            const teams = await scrapeData(data);
            const json = {
                teams: teams
            }
            res.send(json);
        }    
        else{
            res.send("error")
        }
});

app.get('/meczyki/:league', async(req, res)=>{
    const data = converter(req.params.league)
    if(data!=null){
        const teams = await scrapeDataMeczyki(data);
        const json = {
            teams: teams
        }
        res.send(json);
    }
    else{
        res.send("error")
    }
    
});

app.listen('8080');
console.log('API is running on http://localhost:8080');

async function scrapeData(params) {
      const response = await axios({
        method: 'get',
        url: params.url,
        responseType: 'arraybuffer'
      });
      const data = iconv.decode(response.data, 'iso-8859-2');
      const $ = cheerio.load(data);
      // ładowanie tabeli
      let teamsTable = $(".main2 tbody tr td");
      //usuwanie drugiej niepotrzebnej tabeli i napisów nad tabelą
      teamsTable.splice(0,29)
      teamsTable.splice(params.numOfTeams*22)
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

async function scrapeDataMeczyki(params) {
    const response = await axios({
      method: 'get',
      url: params.url,
      responseType: 'arraybuffer'
    });
    const data = iconv.decode(response.data, 'iso-8859-2');
    const $ = cheerio.load(data);
    // ładowanie tabeli
    let teamsTable = $(".main2 tbody tr td");
    //usuwanie drugiej niepotrzebnej tabeli i napisów nad tabelą
    teamsTable.splice(0,29)
    teamsTable.splice(params.numOfTeams*22)
    let teamsString = [];
    let teams = [];
    teamsTable.each((idx, el)=>{
      teamsString.push($(el).text())
    })
    for(let i = 0; i<params.numOfTeams;i++){
        const goalsScored = teamsString[7].split("-")[0];
        const goalsLost = teamsString[7].split("-")[1];
        const teamObject = {
            position: teamsString[0].slice(0,-1),
            name: teamsString[1].slice(1),
            matches: teamsString[2],
            points: {
                total: teamsString[3]
            },
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

const converter = (name) =>{
    const file = path.join(process.cwd(), '', 'data.json')
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    const info = data[name] || data.history[name] || null;

        if (info) {
            return info
        }
        else{
            return null
        }
    }



module.exports = app;