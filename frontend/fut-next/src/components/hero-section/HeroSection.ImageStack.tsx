import Stack from "./StackImage";

const images = [
  { id: 1, img: "/Images/Hero/player.png" },
  { id: 2, img: "/Images/Hero/player.png" },
  // Add other images as needed
];

export const HeroSectionImageStack = () => (
  <Stack
    randomRotation={true}
    sensitivity={180}
    cardDimensions={{ width: 200, height: 200 }}
    cardsData={images}
  />
);
