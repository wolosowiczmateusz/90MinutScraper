const express = require('express');
const request = require('request');
const cheerio = require('cheerio');
const app = express();
const puppeteer = require("puppeteer");

app.get('/', async(req, res)=>{
    const teams = await scrapeTeams();
    const json = {
        teams: teams
    }
    res.send(json);
});




app.listen('8080');
console.log('API is running on http://localhost:8080');module.exports = app;


const scrapeTeams = async(res) =>{
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    await page.goto("http://www.90minut.pl/liga/1/liga12974.html");

    const grabTable = await page.evaluate(() =>{
        const teamsTable = document.querySelectorAll(".main2 tbody tr td")
        let teamsString = [];
        let teams = [];
        teamsTable.forEach((team)=>{
            teamsString.push(team.innerText)
        })
        teamsString = teamsString.slice(29,425)
        for(let i = 0; i<18;i++){
            let teamObject = {
                position: teamsString[0],
                name: teamsString[1],
                matchesPlayed: teamsString[2],
                points: teamsString[3],
                wins: teamsString[4],
                draws: teamsString[5],
                loses: teamsString[6],
                goals: teamsString[7],
                statsHome: {
                    wins: teamsString[8],
                    draws: teamsString[9],
                    loses: teamsString[10],
                    goals: teamsString[11]
                },
                statsAway: {
                    wins: teamsString[12],
                    draws: teamsString[13],
                    loses: teamsString[14],
                    goals: teamsString[15]
                }
            };
            teamsString = teamsString.slice(22)
            teams.push(teamObject)
        }
        console.log("XXXXXX");
        return teams;
    });
    await browser.close();
    return grabTable;

}