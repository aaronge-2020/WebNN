import * as langChain from "https://esm.sh/langchain";

import * as tools from "https://esm.sh/langchain@0.0.66/tools";

import * as agents from "https://esm.sh/langchain@0.0.66/agents";
let key = null //'null'

function check4key(k){
    if(!k){
        const msgTrue = 'API key found, provided to SDK'
        const msgFalse = 'No GPT API Key found, please generate one at https://platform.openai.com/account/api-keys'
        if((localStorage.GPT_API_key)&&(localStorage.GPT_API_key!='null')&&(localStorage.GPT_API_key.length>0)){
            console.log(msgTrue)
        }else{
            console.log(msgFalse)
            localStorage.GPT_API_key=prompt(msgFalse+' and provide it here: ')
        }
        key=localStorage.GPT_API_key
        // delete localStorage.GPT_API_key // if this machine cannot be trusted with a persistent API key
    }else{
        localStorage.GPT_API_key=k
        check4key()
    }
}


check4key();

const data = await fetch("articles_database_2023-04-28.json")
  .then(response => response.json())
  .then(data => {
    return data
  })
  .catch(error => {
    console.error('Error fetching JSON data:', error);
  });

const toolkit = new agents.JsonToolkit(new tools.JsonSpec(data));
const model = new langChain.OpenAI({ openAIApiKey: localStorage.GPT_API_key, temperature: 0 });

const executor = agents.createJsonAgent(model, toolkit);

const input = `What is the most important article in this database?`;

console.log(`Executing with input "${input}"...`);

const result = await executor.call({ input });

console.log(`Got output ${result.output}`);

console.log(
`Got intermediate steps ${JSON.stringify(
result.intermediateSteps,
null,
2
)}`
);


