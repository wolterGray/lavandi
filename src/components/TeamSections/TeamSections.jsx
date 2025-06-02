import ScrollAnimationWrapper from "../../ui/ScrollAnimationWrapper";
import SectionTitle from "../../ui/SectionTitle";
import {useAnimation, motion} from "framer-motion";

function TeamSections() {
  const teamInfo = [
    {
      name: "Olha",
      img: "/team/2.webp",
      desc: "Masażystka", // жіночий варіант
    },
    {
      name: "Volodymyr",
      img: "/team/1.webp",
      desc: "Administrator",
    },
  ];
  return (
    <section id="team" className="my-10  select-none">
      <ScrollAnimationWrapper>
        <SectionTitle>Nasz zespół</SectionTitle>
        <div className="flex items-center justify-center ">
          {teamInfo.map((person) => (
            <div key={person.img} className="w-64 text-center flex flex-col items-center space-y-3">
              <div className="w-36 h-36 border-2 border-goldMuted rounded-full overflow-hidden">
                <img
                  loading="lazy"
                  className="w-full h-full object-cover"
                  src={person.img}
                  alt={person.desc}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">{person.name}</h3>
                <p className="text-primaryColor-500">{person.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollAnimationWrapper>
    </section>
  );
}

export default TeamSections;
