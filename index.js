require('dotenv').config()
const TOKEN = process.env.TOKEN;
const APP_ID = process.env.APPLICATION_ID;
const PUBLIC_KEY = process.env.PUBLIC_KEY;
const GUILD_ID = process.env.GUILD_ID;
const gpt3Key = process.env.GPT_API;
const SecretKey = process.env.Secret;
const PORT = process.env.PORT || 3000

// const { REST, Routes, Client, GatewayIntentBits, SlashCommandBuilder, CommandInteractionOptionResolver } = require('discord.js');
// const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { testCall, RequestHandler, commands } = require("./myTools");

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const { InteractionType, InteractionResponseType, verifyKeyMiddleware } = require('discord-interactions');


const app = express();
// app.use(bodyParser.json());

const discord_api = axios.create({
  baseURL: 'https://discord.com/api/',
  timeout: 3000,
  headers: {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
	"Access-Control-Allow-Headers": "Authorization",
	"Authorization": `Bot ${TOKEN}`
  }
});

let bearerToken = null;
let getBearerToken = async (req) => {
    
    const code=req.query.code;
    const params = new URLSearchParams();
    let user;
    params.append('client_id', process.env.CLIENT_ID);
    params.append('client_secret', process.env.CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', "http://localhost:3000/register_commands");

    const URL = 'https://discord.com/api/oauth2/token';
    try 
    {
        let response = await axios.post(URL,params);
        console.log(response);
        console.log("in sucess");
        return response;
    } catch (err)
    {
        console.error(err);
        console.log("in err\n\n\n\n\n");
        console.log(err.request)
        return err;
    }
}

// responds to a message
app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
    const interaction = req.body;

    if (interaction.type !== InteractionType.APPLICATION_COMMAND) return;
    
    // grab the interaction id to edit the generic response sent 
    // generic response was sent because discord requires bots to respond within 3 seconds

    const interactionToken = interaction.token;
    
    // console.log(`\n\n\n\n\n\n${userPrompt}\n${creativityChoice}`);

    // const handler = new RequestHandler(interaction);
    // const request = interaction.data.name;
    // const response = await handler.respond(request);

    // console.log(`${request}\t${response}`);

    let response = 'question'
    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: `u asked a ${response}`,
        },
    });
});

// erdits a generic message sent in case we need to make an api call to resond to a message 
app.patch("/webhooks/messages/@original", async (req,res) => {
    const msg = req.body;
    console.log(msg);
});
// registers bot commands 
app.get('/register_commands', async (req,res) =>{

    // bearerToken = await getBearerToken(req);
    // console.log(`Bearer Token: ${bearerToken}`);
    // console.log(`Bearer Token: ${(bearerToken)? bearerToken.requests: "Request Failed"}`);
  try
  {
    for (const command of commands)
    {
        // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
        let discord_response = await discord_api.post(
            `/v10/applications/${APP_ID}/commands`,
            command
        );
    }
    return res.send('commands have been registered')
  }catch(e){
    console.error(e)
    console.error(e.code)
    console.error(e.response?.data.errors)
    return res.send(`${e.code} error from discord`)
  }
})


app.get('/', async (req,res) =>{
  return res.send('Follow documentation ')
})


app.listen(PORT, () => {
    console.log(`running on port ${PORT}`);
    // console.log(commands);
})