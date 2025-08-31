const acknowledgements = [
    "Got it 👍",
    "Alright, noted ✅",
    "Thanks for sharing 🙌",
    "Perfect, moving on 👉",
    "Understood 👌",
    "Okay, got that!",
    "Noted ✍️",
    "Alright, thanks!",
    "Cool, next question ➡️",
    "Thanks, let’s continue 🚀",
    "Okay, I hear you 👂",
    "Great, got your response 🌟",
    "Perfect, let’s go on →",
    "Awesome, noted!",
    "Okay, logging that 📝",
    "Good, moving forward ➡️",
    "Nice, got it!",
    "That works, let’s proceed ⏩",
    "Great, thanks for answering 🙏",
    "Okay, understood 🤝",
    "Perfect, thank you!",
    "Alright, let’s move ahead ⬆️",
    "Thanks, noted for now 🗒️",
    "Got your input ✔️",
    "Cool, proceeding!",
    "Okay, makes sense 👍",
    "Noted, moving on...",
    "Alright, all set ✅",
    "Good to know 👌",
    "Perfectly noted 🎯",
    "Thanks, continuing ➡️",
    "Alright, let’s keep going 🔄",
    "Gotcha 👊",
    "All clear, moving forward 🌐",
    "Okay, thanks a lot 🙏",
    "Noted with thanks 🖊️",
    "Great input, moving ahead 🏃",
    "Cool, next up!",
    "Perfect, let’s go 🚦",
    "Alright, I’ve got that saved 🗂️"
];
const chatStartEnd = ["Do you need assistance with property matters? I’m here to help you. Let’s begin by getting to know each other so I can better understand your needs.", "Thanks for sharing your details. Based on your responses, I’ll prepare a list of properties that best suit your needs. Generating your PDF report now."]
const chatbot = () => {
    const outerContainer = document.createElement("div");
    outerContainer.id = 'chatbot-container';
    outerContainer.classList.add("chat-con");
    document.body.append(outerContainer);

    // Header
    const innerCon = document.createElement("div");
    innerCon.classList.add("chat-header");
    innerCon.innerText = "Chat Bot";
    outerContainer.appendChild(innerCon);

    // Chat area
    const chatarea = document.createElement("div");
    chatarea.classList.add("chat-area");
    outerContainer.appendChild(chatarea);

    // Input container
    const outerInput = document.createElement("div");
    outerInput.classList.add("outerInput");
    outerContainer.appendChild(outerInput);

    // Input field
    const inputarea = document.createElement("input");
    inputarea.classList.add("input-sec");
    outerInput.appendChild(inputarea);

    window.addEventListener("click", (event) => {
        if (event.target.className == 'input-sec') {
            outerInput.style.boxShadow = `rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset`;
        } else {
            outerInput.style.boxShadow = "none"
        }
    })

    // Send button
    const inputButton = document.createElement("button");
    inputButton.innerText = ">";
    outerInput.appendChild(inputButton);
    inputButton.id = "inputans"

    let sessionId = localStorage.getItem("session_id");

    // Build headers object
    let headers = {};
    if (sessionId) {
        headers["session-id"] = sessionId;
    }
    console.log(headers);
    // chatarea.appendChild(addmessage("hii this is test"));
    safeFetch("http://127.0.0.1:8000/questions", {
            method: "GET",
            headers: headers
        }).then(questions => {
            console.log("Questions response:", questions);

            localStorage.setItem("questionlist", JSON.stringify(questions.questionlist));

            if (questions.session_id) {
                localStorage.setItem("session_id", questions.session_id);
                sessionId = questions.session_id;
            }
        }).catch(err => console.error("Error fetching questions:", err));
    // Starting the Chat now;

    const storedList = JSON.parse(localStorage.getItem("questionlist"));
    let QuestionProgress = 0;
    sessionStorage.setItem("progress", QuestionProgress);
    let lengthOfQUestions = storedList.length;

    if(sessionStorage.getItem("progress") < lengthOfQUestions) {
        addBotmessage(chatStartEnd[0], chatarea).then(() => {
            addBotmessage(storedList[0]["text"], chatarea, 1000)
            setTimeout(() => {

                inputarea.type = storedList[0]["type"]
                inputarea.name = storedList[0]["name"]
                inputarea.placeholder = `Please input your ${storedList[0]["name"].toLowerCase()}`
            }, 1000)

        });

    }


    let conversationState = "normal"
    let pendingCityOptions = [];



    inputButton.addEventListener("click", () => {
        if (document.getElementById("remove-Budget")) {
             document.getElementById("remove-Budget").remove();
          }

        const currentField = storedList[sessionStorage.getItem("progress")]["name"]?.toLowerCase();
        const userAnswer = inputarea.value.trim();

        


        if(conversationState === "need_otp")
        {
            
            safeFetch("http://127.0.0.1:8000/validateOtp",{
                method: "GET",
                headers:{
                    "session-id":localStorage.getItem("session_id"),
                    "otp":userAnswer
                }
            }).then(data =>{
                if (data["status"])
                {
                    addUsermessage(userAnswer, chatarea);
                    addBotmessage("Verified sucessfully !! Thank you",chatarea,2000).then(()=>{
                    conversationState = "normal"
                    // normal question flow begins:
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton)
                    })


                }else{
                    addBotmessage("❌ Invalid OTP , please try again",chatarea,2000)
                }
            });
            return;
        }
        if(conversationState == "need_Discount"){
            pendingCityOptions.push(userAnswer);
            safeFetch("http://127.0.0.1:8000/save-answer",{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        session_id: localStorage.getItem("session_id"),
                        name: storedList[sessionStorage.getItem("progress")]["name"],
                        answer: pendingCityOptions
                    })
                }).then((data)=>{
                    pendingCityOptions = []
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                })

        }

        if (userAnswer != "") {

        addUsermessage(userAnswer, chatarea);

          if (currentField === "name") {
                if (!isValidName(userAnswer)) {
                    addBotmessage("❌ Please enter a valid name (only alphabets, min 2 characters).", chatarea);
                    return;
                }
            }

            if (currentField === "phone" && conversationState == "normal") {
                if (!isValidPhone(userAnswer)) {
                    addBotmessage("📞 Please enter a valid 10-digit phone number.", chatarea);
                    return;
                }
                safeFetch("http://127.0.0.1:8000/otpgen" ,
                    {
                        method: "POST",
                        headers:{"Content-Type" : "application/json"},
                        body:JSON.stringify({
                            "session_id" : localStorage.getItem("session_id"),
                            "phone" : userAnswer
                        })
                    }
                ).then(data => {
                    if(data["status"] != true){
                    console.log(data)
                    addBotmessage(`We have sent an otp to ${userAnswer}.Please enter it below `,chatarea,2000);
                    inputarea.value = "";
                    inputarea.focus();
                    conversationState = "need_otp";
                    }else{
                    conversationState = "normal";
                    addBotmessage("✅ Phone already verified. Skipping OTP.", chatarea, 1000).then(()=>{
                        addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                    })
                    }
                })
                return;
            }

            if (currentField === "email" && conversationState == "normal") {
                if (!isValidEmail(userAnswer)) {
                    addBotmessage("✉️ Please enter a valid email address.", chatarea);
                    return;
                }
                safeFetch("http://127.0.0.1:8000/otpgen" ,
                    {
                        method: "POST",
                        headers:{"Content-Type" : "application/json"},
                        body:JSON.stringify({
                            "session_id" : localStorage.getItem("session_id"),
                            "email" : userAnswer
                        })
                    }
                ).then(data => {
                    if(data["status"] != true){
                    console.log(data)
                    addBotmessage(`We have sent an otp to ${userAnswer}.Please enter it below `,chatarea,2000);
                    inputarea.value = "";
                    inputarea.focus();
                    conversationState = "need_otp";
                    }else{
                    conversationState = "normal";
                    addBotmessage("✅ email already verified. Skipping OTP.", chatarea, 1000).then(()=>{
                        addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                    })
                    }

                })
                return;
            }

            if (currentField === "budget") {
                if (!isvalidBudget(userAnswer)) {
                    addBotmessage("Please Enter a Budget in the shown format ", chatarea).then(()=>{
                      addbudgetslidebar(chatarea,inputarea);
                    });
                    return;
                }
            }

            if (currentField === "onetimesettlement"){
                if (userAnswer.toLowerCase() === "yes"){
                    console.log("hii i am here")
                  pendingCityOptions.push(userAnswer);
                  conversationState = "need_Discount";
                  addBotmessage("Please Do select a Dicount percent you want ?",chatarea,2000).then(()=>{
                    addOptions(["10%","20%","30%"], chatarea, inputarea, inputButton);
                  })
                  return;
                }else{
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                    return;
                }
            }

            if(storedList[sessionStorage.getItem("progress")]["name"] != null && conversationState == "normal") {
                safeFetch("http://127.0.0.1:8000/save-answer", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        session_id: localStorage.getItem("session_id"),
                        name: storedList[sessionStorage.getItem("progress")]["name"],
                        answer: inputarea.value
                    })
                }).then(data => {


                    if(data.status == "need_city") {
                        pendingCityOptions = data.optionsAndanswer["city_options"];
                        let matchflag = false;
                        pendingCityOptions.forEach((city) => {
                        if (city.toLowerCase() == userAnswer.toLowerCase()) {
                            matchflag = true;
                        }});
                        if (matchflag) {
                        safeFetch("http://127.0.0.1:8000/save-answer", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            session_id: localStorage.getItem("session_id"),
                            name: "Location",
                            answer: `Chhattisgarh,${userAnswer}`
                        })
                        }).then(data => console.log(data));

                        pendingCityOptions = []
                        addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                } else {
                    safeFetch("http://127.0.0.1:8000/rapidfuzzy", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "locations": userAnswer,
                            "loclist": pendingCityOptions
                        })
                    }).then(suggestions => {
                        if (suggestions["expected_cities"].length > 0) {
                            const cityList = suggestions["expected_cities"]
                            .map(city => `${city}<br>`)
                            .join("");
                        addBotmessage("Please select a city only from Chhattishgarh",chatarea,2000).then(()=>{
                            addBotmessage(`Here are some cities that matches your input:<br>${cityList}`, chatarea, 1000);
                        })
                        return;
                        } else {
                            addBotmessage("Sorry unable to find any cities to your match", chatarea, 1000);
                            let reqoptionlist = "";
                            pendingCityOptions.forEach((city) => {
                                reqoptionlist += city + "<br>";
                            })
                            addBotmessage(` Here the city list : <br> ${reqoptionlist} Try again from these.`, chatarea, 1000)
                            return;
                        }
                    })
                }

                }else{

                    if (document.getElementById("remove-Budget")) {
                        document.getElementById("remove-Budget").remove();
                    }
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                }

                })
            }else{
                    if (document.getElementById("remove-Budget")) {
                        document.getElementById("remove-Budget").remove();
                    }
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);

                }
        }
    })

} //bot functions ends here !!




function addBotmessage(message, chatarea, delay = 1500) {
    return new Promise(resolve => {
        const typeanimation = addtypingAnimation();
        chatarea.appendChild(typeanimation);
        typeanimation.scrollIntoView({
            behavior: "smooth"
        });
        setTimeout(() => {
            chatarea.removeChild(typeanimation);
            const outermessagebox = document.createElement("div");
            outermessagebox.id = "outermessage";
            const botimage = document.createElement("img")
            botimage.src = "./images/6596121.png";
            outermessagebox.appendChild(botimage);
            const messagebox = document.createElement("div");
            messagebox.classList.add("bot-message");
            messagebox.innerHTML = message;
            outermessagebox.appendChild(messagebox);
            chatarea.appendChild(outermessagebox);
            outermessagebox.scrollIntoView({
                behavior: "smooth"
            })
            resolve();
        }, delay);
    });
}

function addUsermessage(message, chatarea) {

    const outermessagebox = document.createElement("div");
    outermessagebox.id = "outerusermessage";
    const botimage = document.createElement("img")
    botimage.src = "./images/6596121.png";

    const messagebox = document.createElement("div");
    messagebox.classList.add("bot-message");
    messagebox.innerText = message;
    outermessagebox.appendChild(messagebox);
    outermessagebox.appendChild(botimage);
    chatarea.appendChild(outermessagebox);
}

function addOptions(optionsarray, chatarea, inputbox, inputButton) {
    let outerdiv = document.createElement("div");
    outerdiv.classList.add("options-out");

    optionsarray.forEach(element => {

        let spanele = document.createElement("span");
        spanele.innerText = element;
        spanele.classList.add("bot-options");

        spanele.addEventListener("click", () => {
            inputbox.value = spanele.innerText;
            inputButton.click();
            outerdiv.remove();
        })

        outerdiv.appendChild(spanele);
    });

    chatarea.appendChild(outerdiv);
    outerdiv.scrollIntoView({
        behavior: "smooth"
    });
}

const addtypingAnimation = () => {
    const typecon = document.createElement("div");
    typecon.setAttribute("class", "typing")
    for (let i = 0; i < 3; i++) {
        const dots = document.createElement("span");
        typecon.appendChild(dots);
    }
    return typecon;
}


function isValidName(name) {
    // Only alphabets and spaces, min 2 chars
    return /^(?!.*([A-Za-z\s])\1\1)[A-Za-z\s]{2,}$/.test(name);
}

function isValidPhone(phone) {
    // 10 digit Indian mobile numbers
    return /^[6-9]\d{9}$/.test(phone);
}

function isValidEmail(email) {
    // Basic email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isvalidBudget(Budget) {
    return /^\s*(\d{1,7})\s*-\s*(\d{1,7})\s*$/.test(Budget);
}

function isvalidstate(stateinp) {
    return states.some(state => state.toLowerCase() === stateinp.toLowerCase());
}

function addbudgetslidebar(chatarea, inputbox) {
    let createouterBudget = document.createElement("div");
    createouterBudget.id = "remove-Budget";
    createouterBudget.innerHTML = `
    <div id="budgetSlider"></div>
    <center><p>Selected: ₹<span id="minVal"></span> - ₹<span id="maxVal"></span></p></center>
  `;

    // append first so that #budgetSlider exists in DOM
    chatarea.appendChild(createouterBudget);
    createouterBudget.scrollIntoView({
        behavior: "smooth"
    });

    // now query inside this container instead of whole document
    let slider = createouterBudget.querySelector("#budgetSlider");

    noUiSlider.create(slider, {
        start: [20000, 800000], // initial min & max
        connect: true,
        step: 1000,
        range: {
            'min': 8000,
            'max': 1000000
        }
    });

    slider.noUiSlider.on('update', function(values) {
        createouterBudget.querySelector('#minVal').innerText = Math.round(values[0]);
        createouterBudget.querySelector('#maxVal').innerText = Math.round(values[1]);
        inputbox.value = `${Math.round(values[0])} - ${Math.round(values[1])}`;
    });
}


async function safeFetch(url , options = {},chatarea) {
    try{
        const response = await fetch(url,options);
        if(!response.ok){
            throw new Error(`Server returned ${response.status}`)
        }
        return await response.json();
    }catch(err){
        console.log("API Error",err);
        addBotmessage("⚠️ Server error or Session timed out. Please reload or try again later.", chatarea, 2000);
        
        if(confirm("The server is down or restarting. Do you want to restart the chatbot?"))
        {
            resetEverything(chatarea);
        }
        return null;
    }
}

const resetEverything = (chatarea)=>{
    console.log("reseting the chatBot");
    localStorage.removeItem("questionlist");
    localStorage.removeItem("session_id");
    sessionStorage.removeItem("progress");
    chatarea.innerHTML = "";
    chatbot();
}

function addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton){
    inputarea.value = "";
    let QuestionProgress = parseInt(sessionStorage.getItem("progress"))
    QuestionProgress = QuestionProgress + 1;
    sessionStorage.setItem("progress", QuestionProgress);
    let lengthOfQUestions = storedList.length;
    console.log(sessionStorage.getItem("progress"));
     if (parseInt(sessionStorage.getItem("progress")) === lengthOfQUestions) {
        addBotmessage(chatStartEnd[1], chatarea, 2000).then(()=>{
            inputarea.style = "none"
        })
    }else{
        if ((storedList[sessionStorage.getItem("progress")]["options"])) {
            let randack = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
            addBotmessage(`${randack}.\n ${storedList[sessionStorage.getItem("progress")]["text"]}`, chatarea, 1000).then(() => {
                addOptions(storedList[sessionStorage.getItem("progress")]["options"], chatarea, inputarea, inputButton);
            })
            inputarea.type = storedList[sessionStorage.getItem("progress")]["type"]
            inputarea.name = storedList[sessionStorage.getItem("progress")]["name"] ?
            storedList[sessionStorage.getItem("progress")]["name"].toLowerCase() : "null";
            inputarea.placeholder = `Please input your ${storedList[sessionStorage.getItem("progress")]["name"].toLowerCase()}`
            outerInput.style.display = "none";
            } else if(storedList[parseInt(sessionStorage.getItem("progress"))]["name"] === "Budget"){
                outerInput.style.display = "grid";
                let randack = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
                addBotmessage(`${randack}.\n ${storedList[sessionStorage.getItem("progress")]["text"]}`, chatarea, 1000).then(() => {
                addbudgetslidebar(chatarea, inputarea);
                })
            }else{
                outerInput.style.display = "grid"
                let randack = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
                addBotmessage(`${randack}.\n ${storedList[sessionStorage.getItem("progress")]["text"]}`, chatarea, 1000)
                inputarea.type = storedList[sessionStorage.getItem("progress")]["type"]
                inputarea.name = storedList[sessionStorage.getItem("progress")]["name"] ?
                storedList[sessionStorage.getItem("progress")]["name"].toLowerCase() : "null";
                let inputname = storedList[sessionStorage.getItem("progress")]["name"] ? storedList[sessionStorage.getItem("progress")]["name"].toLowerCase() : "answer"
                inputarea.placeholder = `Please input your ${inputname}`;

            }
    }



}

// chatbot();
// chatbot();

// making it just an small icon in the page:
// let bot = document.createElement("div")
// bot.id = "float-bot";
// let botImage = document.createElement("img");
// botImage.src = `./images/bot-float.png`
// botImage.setAttribute("class","bot-image");
// bot.appendChild(botImage);
// document.body.append(bot);
// let counter = 0;
// bot.addEventListener("click",()=>{
// let botOuter = document.getElementById("chatbot-container");
// console.log(counter)
//     if(counter == 0){

//         botOuter.style.display = "grid"
//         counter++;
//     }
//     else if(counter == 1){  
//         botOuter.style.display = "None"
//         counter--;
//     }
// })


// create floating bot icon
let bot = document.createElement("div");
bot.id = "float-bot";
let botImage = document.createElement("img");
botImage.src = `./images/bot-float.png`;
botImage.setAttribute("class","bot-image");
bot.appendChild(botImage);
document.body.append(bot);

let isOpen = false;

bot.addEventListener("click", () => {
    let botOuter = document.getElementById("chatbot-container");

    if (!isOpen) {
        if (botOuter) botOuter.remove();
        chatbot();
        isOpen = true;
    } else {
        if (botOuter) botOuter.remove();
        isOpen = false;
    }
});

