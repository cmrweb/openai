 
import React from "react";
import { useState } from "react"; 
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: "",
});
const openai = new OpenAIApi(configuration); 

export default function Chat() {
    
    const [text, setText] = useState("");
    const [result, setResult] = useState("en attente");
    const [listening, setListening] = useState(false);

    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const synth = window.speechSynthesis;

    var recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onspeechend = () => {
        recognition.stop();
        setListening(false);
    }
    recognition.onerror = (e) => {
        console.log('Error : ' + e.error);
    }

    recognition.onresult = (e) => {
        let speech = e.results[0][0].transcript;
        let confidence = e.results[0][0].confidence;
        if (confidence > 0.8) {
            // console.log(text);
            setText(speech);
            sendData(speech);

        } else {
            setResult("je n'ai pas compris!");
            
        }
    }
    async function sendData(speech) {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: speech,
            temperature: 0,
            max_tokens: 256,
        });
        await setResult(response.data.choices[0].text);
        const reponse = new SpeechSynthesisUtterance(response.data.choices[0].text)
        await synth.speak(reponse)
    }


    return (
        <div className="form-group col-10 mx-auto mt-4">
            <div className="d-flex">
                <input onChange={e => setText(e.target.value)} value={text} className="form-control" type="text" autoComplete="off" />
                <button onClick={e => {
                    if (!listening) {
                        recognition.start();
                        setListening(true);
                    } else {
                        recognition.stop();
                        setListening(false);
                    }
                }}
                    className="btn btn-block btn-dark">Parler</button>
            </div>

            <div className="col-8 mx-auto card text-center m-4 p-4">
                <pre>{result}</pre>
            </div>
        </div>
    )
}