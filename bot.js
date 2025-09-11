const acknowledgements = [
  "Acknowledged.",
  "Noted.",
  "Thank you for your response.",
  "Understood.",
  "Your input has been recorded.",
  "Appreciate your response.",
  "Information received.",
  "Thank you, proceeding further.",
  "Got it, moving ahead.",
  "Your response is noted.",
  "Confirmed.",
  "Thank you, continuing.",
  "I have documented your input.",
  "Acknowledged, moving forward.",
  "Your answer has been saved.",
  "Input successfully recorded.",
  "Thank you for sharing.",
  "Message received.",
  "Noted, let’s continue.",
  "Understood, moving on.",
  "Your feedback has been logged.",
  "Input acknowledged.",
  "Thank you, moving to the next step.",
  "Your response has been registered.",
  "Recorded successfully."
];
const chatStartEnd = ["Do you need assistance with property matters? I’m here to help you. Let’s begin by getting to know each other so I can better understand your needs.", "Thanks for sharing your details. Based on your responses, I’ll prepare a list of properties that best suit your needs. Generating your PDF report now."]
let conversationState = "normal"
const apiUrl = "http://127.0.0.1:8000"
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

    const crossbutton = document.createElement("div");
    crossbutton.classList.add("cross-button")
    crossbutton.innerHTML = `<span>✖<span>`;
    innerCon.appendChild(crossbutton);

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
    let storedList = [];
    let QuestionProgress = 0;
    let lengthOfQUestions = 0;
    safeFetch(`${apiUrl}/questions`, {
            method: "GET",
            headers: headers
        },chatarea,inputarea,inputButton).then(questions => {
            console.log("Questions response:", questions);

            localStorage.setItem("questionlist", JSON.stringify(questions.questionlist));

            if (questions.session_id) {
                localStorage.setItem("session_id", questions.session_id);
                sessionId = questions.session_id;
            }
            storedList = JSON.parse(localStorage.getItem("questionlist"));
            QuestionProgress = 0;
            sessionStorage.setItem("progress", QuestionProgress);
            lengthOfQUestions = storedList.length;
                if(sessionStorage.getItem("progress") < lengthOfQUestions) {
        addBotmessage(chatStartEnd[0], chatarea,1000,inputarea,inputButton).then(() => {
            addBotmessage(storedList[0]["text"], chatarea, 1000,inputarea,inputButton)
            setTimeout(() => {
                inputarea.type = storedList[0]["type"]
                inputarea.name = storedList[0]["name"]
                inputarea.placeholder = `Please input your ${storedList[0]["name"].toLowerCase()}`
            }, 1000)

        });

    }
        }).catch(err => console.error("Error fetching questions:", err));
    // Starting the Chat now;




    let pendingCityOptions = [];



    inputButton.addEventListener("click", () => {
        if (document.getElementById("remove-Budget")) {
             document.getElementById("remove-Budget").remove();
          }

        const currentField = storedList[sessionStorage.getItem("progress")]["name"]?.toLowerCase();
        const userAnswer = inputarea.value.trim();

        


        if(conversationState === "need_otp")
        {
            
            safeFetch(`${apiUrl}/validateOtp`,{
                method: "GET",
                headers:{
                    "session-id":localStorage.getItem("session_id"),
                    "otp":userAnswer
                }
            },chatarea,inputarea,inputButton).then(data =>{
                if (data["status"])
                {
                    addUsermessage(userAnswer, chatarea);
                    addBotmessage("Verified sucessfully !! Thank you",chatarea,2000,inputarea,inputButton).then(()=>{
                    conversationState = "normal"
                    // normal question flow begins:
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton)
                    })


                }else{
                    addBotmessage("❌ Invalid OTP , please try again",chatarea,2000,inputarea,inputButton)
                    inputarea.value = ""
                    inputarea.focus();
                }
            });
            return;
        }
        if(conversationState == "need_Discount"){
            pendingCityOptions.push(userAnswer);
            safeFetch(`${apiUrl}/save-answer`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        session_id: localStorage.getItem("session_id"),
                        name: storedList[sessionStorage.getItem("progress")]["name"],
                        answer: pendingCityOptions
                    })
                },chatarea,inputarea,inputButton).then((data)=>{
                    pendingCityOptions = []
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                })

        }

        if (userAnswer != "") {

        addUsermessage(userAnswer, chatarea);
        inputarea.value = ""
            if (currentField === "phone" && conversationState == "normal") {
                if (!isValidPhone(userAnswer)) {
                    addBotmessage("📞 Please enter a valid 10-digit phone number.", chatarea,500,inputarea,inputButton);
                    return;
                }
                sessionStorage.setItem("phone",userAnswer);
                safeFetch(`${apiUrl}/otpgen` ,
                    {
                        method: "POST",
                        headers:{"Content-Type" : "application/json"},
                        body:JSON.stringify({
                            "session_id" : localStorage.getItem("session_id"),
                            "phone" : userAnswer
                        })
                    },chatarea,inputarea,inputButton
                ).then(data => {
                    if(data["status"] != true){
                    console.log(data)
                    addBotmessage(`We have sent an otp to ${userAnswer}.Please enter it below `,chatarea,2000,inputarea,inputButton).then(()=>{
                        changeEmailPhone(["Resend OTP",`${currentField == "email" ? "Change Email" : "Change Phone"}`],chatarea,inputarea,inputButton,storedList,currentField)
                    });
                    inputarea.value = "";
                    inputarea.placeholder = "please enter the otp"
                    inputarea.focus();
                    conversationState = "need_otp";
                    }else{
                    conversationState = "normal";
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                    }
                })
                return;
            }

            if (currentField === "email" && conversationState == "normal") {
                if (!isValidEmail(userAnswer)) {
                    addBotmessage("✉️ Please enter a valid email address.", chatarea,500,inputarea,inputButton);
                    return;
                }
                sessionStorage.setItem("email",userAnswer);
                safeFetch(`${apiUrl}/otpgen` ,
                    {
                        method: "POST",
                        headers:{"Content-Type" : "application/json"},
                        body:JSON.stringify({
                            "session_id" : localStorage.getItem("session_id"),
                            "email" : userAnswer
                        })
                    },chatarea,inputarea,inputButton
                ).then(data => {
                    if(data["status"] != true){
                    console.log(data)
                    addBotmessage(`We have sent an otp to ${userAnswer}.Please enter it below `,chatarea,2000,inputarea,inputButton).then(()=>{
                        changeEmailPhone(["Resend OTP",`${currentField == "email" ? "Change Email" : "Change Phone"}`],chatarea,inputarea,inputButton,storedList,currentField)
                    })
                    inputarea.value = "";
                    inputarea.placeholder = "please enter the otp"
                    inputarea.focus();
                    conversationState = "need_otp";
                    }else{
                    conversationState = "normal";
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                    }

                })
                return;
            }

            if (currentField === "budget") {
                if (!isvalidBudget(userAnswer)) {
                    addBotmessage("Please Enter a Budget in the shown format ", chatarea,500,inputarea,inputButton).then(()=>{
                      addbudgetslidebar(chatarea, inputarea ,50000 , 20000000 , 500000 , [50000,6550000] , "₹");
                    });
                    return;
                }
            }

            if (currentField === "squareft") {
                if (!isvalidBudget(userAnswer)) {
                    addBotmessage("Please Enter a squareft in the shown format ", chatarea,500,inputarea,inputButton).then(()=>{
                      addbudgetslidebar(chatarea, inputarea ,100 , 10100 , 500 , [600,1600],"sqrft ");
                    });
                    return;
                }
            }

            if (currentField === "onetimesettlement"){
                if (userAnswer.toLowerCase() === "yes"){
                  pendingCityOptions.push(userAnswer);
                  conversationState = "need_Discount";
                  addBotmessage("Please Do select a Dicount percent you want ?",chatarea,2000,inputarea,inputButton).then(()=>{
                    addOptions(["10%","20%","30%"], chatarea, inputarea, inputButton);
                  })
                  return;
                }else{
                    addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                    return;
                }
            }

            if(storedList[sessionStorage.getItem("progress")]["name"] != null && conversationState == "normal") {
                safeFetch(`${apiUrl}/save-answer`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        session_id: localStorage.getItem("session_id"),
                        name: storedList[sessionStorage.getItem("progress")]["name"],
                        answer: userAnswer
                    })
                },chatarea,inputarea,inputButton).then(data => {


                    if(data.status == "need_city") {
                        pendingCityOptions = data.optionsAndanswer["city_options"];
                        let matchflag = false;
                        pendingCityOptions.forEach((city) => {
                        if (city.toLowerCase() == userAnswer.toLowerCase()) {
                            matchflag = true;
                        }});
                        if (matchflag) {
                        safeFetch(`${apiUrl}/save-answer`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            session_id: localStorage.getItem("session_id"),
                            name: "Location",
                            answer: `Chhattisgarh,${userAnswer}`
                        })
                        },chatarea,inputarea,inputButton).then(data => console.log(data));

                        pendingCityOptions = []
                        addnextQuestion(inputarea,chatarea,outerInput,storedList,inputButton);
                } else {
                    safeFetch(`${apiUrl}/rapidfuzzy`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "locations": userAnswer,
                            "loclist": pendingCityOptions
                        })
                    },chatarea,inputarea,inputButton).then(suggestions => {
                        if (suggestions["expected_cities"].length > 0) {
                            const cityList = suggestions["expected_cities"]
                            .map(city => `${city}<br>`)
                            .join("");
                        addBotmessage("Please select a city only from Chhattishgarh",chatarea,2000,inputarea,inputButton).then(()=>{
                            addBotmessage(`Here are some cities that matches your input:<br>${cityList}`, chatarea, 1000,inputarea,inputButton);
                        })
                        return;
                        } else {
                            addBotmessage("Sorry unable to find any cities to your match", chatarea, 1000,inputarea,inputButton);
                            let reqoptionlist = "";
                            pendingCityOptions.forEach((city) => {
                                reqoptionlist += city + "<br>";
                            })
                            addBotmessage(` Here the city list : <br> ${reqoptionlist} Try again from these.`, chatarea, 1000,inputarea,inputButton)
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
    
inputarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault(); 
        inputButton.click();
    }
});

} //bot functions ends here !!




function addBotmessage(message, chatarea, delay = 1500,inputarea = null, inputButton = null) {
    return new Promise(resolve => {
        const typeanimation = addtypingAnimation();
        chatarea.appendChild(typeanimation);
        typeanimation.scrollIntoView({
            behavior: "smooth"
        });
        if (inputarea) inputarea.disabled = true;
        if (inputButton) inputButton.disabled = true;
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
            if (inputarea) inputarea.disabled = false;
            if (inputButton) inputButton.disabled = false;
            inputarea?.focus();
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

function addbudgetslidebar(chatarea, inputbox , min , max ,steps , start ,type) {
    let createouterBudget = document.createElement("div");
    createouterBudget.id = "remove-Budget";
    createouterBudget.innerHTML = `
    <div id="budgetSlider"></div>
    <center><p id = "budgetSliderScroll">Selected: ${type}<span id="minVal"></span> - <span id="maxVal"></span></p></center>
  `;

    // append first so that #budgetSlider exists in DOM
    chatarea.appendChild(createouterBudget);

    setTimeout(() => {
    document.getElementById("budgetSliderScroll").scrollIntoView({
        behavior: "smooth",
        block: "center"  // optional: align to center instead of top
    });
    }, 50);

    // now query inside this container instead of whole document
    let slider = createouterBudget.querySelector("#budgetSlider");

    noUiSlider.create(slider, {
        start: start, // initial min & max
        connect: true,
        step: steps,
        range: {
            'min': min,
            'max': max
        }
    });

    slider.noUiSlider.on('update', function(values) {
        createouterBudget.querySelector('#minVal').innerText = Math.round(values[0]);
        createouterBudget.querySelector('#maxVal').innerText = Math.round(values[1]);
        inputbox.value = `${Math.round(values[0])} - ${Math.round(values[1])}`;
    });
}


async function safeFetch(url , options = {},chatarea,inputarea,inputButton) {
    try{
        const response = await fetch(url,options);
        if(!response.ok){
            throw new Error(`Server returned ${response.status}`)
        }
        return await response.json();
    }catch(err){
        console.log("API Error",err);
        addBotmessage("⚠️ Server error or Session timed out. Please reload or try again later.", chatarea, 2000,inputarea,inputButton);
        
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
    const removeChange = document.getElementById("remove-change");
if(removeChange){
    removeChange.remove();
}
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
            }else if(storedList[parseInt(sessionStorage.getItem("progress"))]["name"] === "Budget"){
                outerInput.style.display = "grid";
                let randack = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
                addBotmessage(`${randack}.\n ${storedList[sessionStorage.getItem("progress")]["text"]}`, chatarea, 1000).then(() => {
                addbudgetslidebar(chatarea, inputarea ,50000 , 20000000 , 500000 , [50000,6550000],"₹");
                })
            }else if(storedList[parseInt(sessionStorage.getItem("progress"))]["name"] === "squareft"){
                outerInput.style.display = "grid";
                let randack = acknowledgements[Math.floor(Math.random() * acknowledgements.length)];
                addBotmessage(`${randack}.\n ${storedList[sessionStorage.getItem("progress")]["text"]}`, chatarea, 1000).then(() => {
                addbudgetslidebar(chatarea, inputarea ,100 , 10100 , 500 , [600,1600],"sqrft ");
                })
            }
            else if(storedList[parseInt(sessionStorage.getItem("progress"))]["name"] === "Phone"){
                addBotmessage(`Right !! Moving Forward To Next Question.\n${storedList[sessionStorage.getItem("progress")]["text"]}`, chatarea, 1000)
                inputarea.type = storedList[sessionStorage.getItem("progress")]["type"]
                inputarea.name = storedList[sessionStorage.getItem("progress")]["name"] ?
                storedList[sessionStorage.getItem("progress")]["name"].toLowerCase() : "null";
                let inputname = storedList[sessionStorage.getItem("progress")]["name"] ? storedList[sessionStorage.getItem("progress")]["name"].toLowerCase() : "answer"
                inputarea.placeholder = `Please input your ${inputname}`;

            }
            else{
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


const changeEmailPhone = (optionsarray,chatarea,inputarea,inputButton,storedList,currentField) =>{
    let outerdiv = document.createElement("div");
    outerdiv.classList.add("options-out");
    outerdiv.id = "remove-change"

    optionsarray.forEach(element => {

        let spanele = document.createElement("span");
        spanele.innerText = element;
        spanele.classList.add("bot-options");

        spanele.addEventListener("click", () => {
            const choice = spanele.innerText;
            switch(choice){
                case "Change Email":
                    sessionStorage.setItem("progress",parseInt(storedList.findIndex((question)=>{
                       return question.name == "Email"
                    })))
                    conversationState = "normal"
                    addBotmessage("Please Enter the new Email Address",chatarea,500,inputarea,inputButton);
                    inputarea.placeholder = "Enter new mail address";
                    outerdiv.remove();
                    return;
                case "Change Phone":
                    sessionStorage.setItem("progress",parseInt(storedList.findIndex((question)=>{
                        return question.name == "Phone"
                    })))
                    conversationState = "normal"
                    addBotmessage("Please Enter the new Phone Number",chatarea,500,inputarea,inputButton);
                    inputarea.placeholder = "Enter new Phone Number";
                    outerdiv.remove();
                    return;
                case "Resend OTP":
                    safeFetch(`${apiUrl}/otpgen`,{
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            session_id: localStorage.getItem("session_id"),
                            [currentField]:sessionStorage.getItem(currentField)
                        })

                    }).then(()=>{
                        addBotmessage("🔄 OTP has been resent, please check again!", chatarea);
                        inputarea.placeholder = "Enter the new otp."
                     });
                    return;           
            }
        })

        outerdiv.appendChild(spanele);
    });

    chatarea.appendChild(outerdiv);
    outerdiv.scrollIntoView({
        behavior: "smooth"
    });
    
}

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

    // check screen size
    if (window.innerWidth <= 480 || window.innerWidth <= 768) {
        // mobile behavior
        bot.style.display = "none";
        if (!botOuter) chatbot();
        let chat = document.getElementById("chatbot-container");
        chat.style.display = "grid";

        // show cross button
        let cross = chat.querySelector(".cross-button");
        cross.style.display = "block";

        cross.onclick = () => {
            chat.remove();
            bot.style.display = "block";
            isOpen = false;
        }

        isOpen = true;
    } else {
        if (!isOpen) {
            console.log("hii")
            if (botOuter) botOuter.remove();
            chatbot();
            isOpen = true;
        } else {
            if (botOuter) botOuter.remove();
            isOpen = false;
        }
    }
});


