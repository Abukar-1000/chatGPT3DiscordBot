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
app.use(bodyParser.json());

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


app.post('/interactions', verifyKeyMiddleware(PUBLIC_KEY), async (req, res) => {
    const interaction = req.body;

    if (interaction.type !== InteractionType.APPLICATION_COMMAND) return;
    
    const handler = new RequestHandler(interaction);
    const request = interaction.data.name;
    const response = await handler.respond(request);

    console.log(`${request}\t${response}`);

    return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
            content: response,
        },
    });
});


app.get('/register_commands', async (req,res) =>{

    // bearerToken = await getBearerToken(req);
    // console.log(`Bearer Token: ${bearerToken}`);
    // console.log(`Bearer Token: ${(bearerToken)? bearerToken.requests: "Request Failed"}`);
  try
  {
    // api docs - https://discord.com/developers/docs/interactions/application-commands#create-global-application-command
    let discord_response = await discord_api.post(
      `/v10/applications/${APP_ID}/commands`,
      JSON.stringify(commands)
    )
    console.log(discord_response)
    console.log(discord_response.data)
    return res.send('commands have been registered')
  }catch(e){
    console.error(e)
    console.error(e.code)
    console.error(e.response?.data)
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