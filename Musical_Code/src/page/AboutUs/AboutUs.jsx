import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import { ProfileCard } from "../../components/ProfileCard/ProfileCard";
import { Slide } from "react-awesome-reveal";

import aboutUsData from "./../../assets/data/aboutUsData.js";
import Tarundeep from "./../../assets/image/Tarundeep.png";
import HarshRishi from "./../../assets/image/HarshRishi.png";
import Atul from "./../../assets/image/Atul.png";
import Jashanjit from "./../../assets/image/Jashanjit.png";

const images = [Tarundeep, HarshRishi, Atul, Jashanjit];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#111828]">
      <div>
        <Navbar />
      </div>

      <div className="font-bold text-4xl text-white p-5 underline underline-offset-8 text-center uppercase">Meet our team</div>

      <div className="grid grid-cols-1 md:grid-cols-2 place-items-center">
        {aboutUsData?.map((person, key) => (
          <Slide key={key} triggerOnce direction={`${person.direction}`}>
            <div className="m-6">
              <ProfileCard
                name={person.name}
                subtitle={person.subtitle}
                content={person.content}
                socialLinks={person.socialLinks}
                profileImg={images[key]}
              />
            </div>
          </Slide>
        ))}
      </div>
    </div>
  );
}
