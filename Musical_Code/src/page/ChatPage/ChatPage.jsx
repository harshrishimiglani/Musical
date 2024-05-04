import React, { useState, useEffect, useContext } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { auth, db } from "../../firebase-config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/auth";
import { ChatMessage } from "../../components/ChatMessage/ChatMessage";
import { Button, TextField } from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import Axios from "axios";
// var Latex=require("react-latex")

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  Timestamp,
  query,
  doc,
} from "firebase/firestore";
import chatBotResponses, {
  emotionsArray,
} from "./../../assets/data/chatBotResponses.js";
import { getRandomElementFromArray } from "./../../utility_functions/randomFunctions.js";
import getSongByID from "./../../assets/data/songLinks.js"

import {getEmotionFromList} from './../../emotion_identification/emotion_utils.js';
import axios from "axios";
import { List } from "@mui/icons-material";

// something firing after any edit in text box

export default function ChatPage() {
  const navigate = useNavigate();
  const user = useContext(AuthContext);
  const curr_user = auth.currentUser?.uid;
  const [time, setTime] = useState("");
  const [messageInBox, setMessageInBox] = useState("");
  const [sendButtonDisabled, setSendButtonDisabled] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer,setAnswer]=useState("");

  // useEffect(() => {
  //   if (!user.user) {
  //     navigate("/login");
  //   }
  // }, [user, navigate]);

  // unix to IST
  const unixToIST = (unix_time) => {
    // let IST = `${unix_time.getHours()}:${unix_time.getMinutes()}`;
    var hours = `${unix_time.getHours()}`
    var minutes = `${unix_time.getMinutes()}`

    const norm = (s) => {
      if (s.length === 1) {
        s = `0${s}`
      }

      return s;
    }

    return norm(hours) + ":" + norm(minutes);
  };

  const makeChatMessageJSX = (msg, sentTime, human, key = null, links = []) => {
    var positionClass = "";
    if (human) {
      positionClass = "place-items-end";
    } else {
      positionClass = "place-items-start";
    }

    return (
      <div
        key={key}
        className={`grid grid-cols-1 ${positionClass} hover:bg-gray-200 p-[2px] rounded-lg`}
      >
        <ChatMessage msg={msg} human={human} sentTime={sentTime} />
      </div>
    );
  };

  // API Call
  const axiosCall = (msg) => {
    console.log("idhar");
    console.log("inside axiosCall", msg, getRandomElementFromArray(chatBotResponses[emotionsArray[0]]));
    const api_url = `http://localhost:3000/emotion`;

      // Axios.post(api_url, {
      //   text: msg,
      // }).then((response) => {
      //   // got data here
      //   console.log("hohohoh");
      //   var emotions = [
      //     response.data.Happy,
      //     response.data.Sad,
      //     response.data.Angry,
      //     response.data.Fear,
      //     response.data.Surprise,
      //   ];

      // var max_emotion = Math.max(...emotions);
      // if(max_emotion===0){
      //   try {
      //     const chatCollectionRef = collection(
      //       db,
      //       "messages",
      //       curr_user,
      //       "chats"
      //     );
      //     const addChatbotResp = async () => {
      //       await addDoc(chatCollectionRef, {
      //         message: getRandomElementFromArray(
      //           chatBotResponses['greetings']
      //         ),
      //         from: "Chat-bot",
      //         SentAt: Timestamp.fromDate(new Date()),
      //       });
      //     };

      //     addChatbotResp();
      //   } catch {}
      //   // console.log(getRandomElementFromArray(chatBotResponses['greetings']));
      //   return;
      // }
      // console.log(max_emotion)
      // for (let i = 0; i < emotions.length; i++) {
      //   if (emotions[i] === max_emotion) {
      //     console.log(getSongByID(i))
      //     try {
      //       const chatCollectionRef = collection(
      //         db,
      //         "messages",
      //         curr_user,
      //         "chats"
      //       );
      //       const addChatbotResp = async () => {
      //         await addDoc(chatCollectionRef, {
      //           message: getSongByID(i),
      //           from: "Chat-bot",
      //           SentAt: Timestamp.fromDate(new Date()),
      //         });
      //       };

      //       addChatbotResp();
         // } catch {}
         // return;
        //}
      //}

     // return "";
    //  });
  };

  async function generateAnswer(){
    console.log("Loading..")
    setAnswer("Loading...");
    const response=await axios({
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBjqmzzfuLpdONDE6bdNbPmXyc_BQf6i4I",
      method:"post",
      data:{contents:[{parts:[{text: question+"based on my emotion suggest me 5 music each in languages Hindi,English and Punjabi in this format [Point No][name]:[Last.fm Website Link]"}]}]}
    });
    setAnswer(response['data']['candidates'][0]['content']['parts'][0]['text']);
    console.log(answer);
  }

  // Add new Message
  useEffect(() => {
    if (curr_user) {
      const chatCollectionRef = collection(db, "messages", curr_user, "chats");
      const q = query(chatCollectionRef, orderBy("SentAt", "asc"));
      const unsub=onSnapshot(q, (snap) => {
        let messages = [];
        snap.forEach((doc) => {
          messages.push(doc.data());
        });
        setChatMessages(messages);
        // console.log(messages);
      });
      return ()=>{unsub()};
    }
  }, []);

  // Send new message
  const sendMessage = async (e) => {
    e.preventDefault();
    // setChatMessages([
    //   ...chatMessages,
    //   [messageInBox, "11:45 PM", true],
    // ]);
    //axiosCall(messageInBox);
    try {
      const chatCollectionRef = collection(db, "messages", curr_user, "chats");
      await addDoc(chatCollectionRef, {
        message: messageInBox,
        from: curr_user,
        SentAt: Timestamp.fromDate(new Date()),
      });
    } catch {
      console.log("SomeFirebase in chatpage.jsx at Line: 152");
    }
    console.log(e);
    setMessageInBox("");

    // setChatMessages( [makeChatMessageJSX(chatBotReply, "12:22", false)], ...chatMessages )

    // const q=query(chatCollectionRef,orderBy('SentAt','asc'));
    // onSnapshot(q,(snap)=>{
    //   let messages=[];
    //   snap.forEach((doc)=>{
    //     messages.push(doc.data());
    //   })
    //   console.log(messages);
    // })
    // PRINTING TO SEE EMOTION FOR EACH TEXT
    console.log("Hello sir")
    console.log(messageInBox);
    //console.log("Emotion related to" + messageInBox + "are:\n", getEmotionFromList(messageInBox));
  };

  return (
    <div className="bg-[#202938] h-screen w-screen overflow-auto">
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col gap-y-5 justify-between items-center h-0.75rem mx-4 my-4 align-content: space-between place-content-center">
        <textarea value={question} onChange={(e)=>{setQuestion(e.target.value)}} cols="50" row="100" className="h-96  block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 " placeholder="Pour Your Feelings"></textarea>
        <button  onClick={generateAnswer} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800">
        <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
        Generate Music
        </span>
        </button>
        <pre className="text-cyan-50 ">{answer}</pre>
        </div>

    </div>
  );
}
