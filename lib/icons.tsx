import {
  IconBrandCraft,
  IconBrandFacebook,
  IconBrandGoogle,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconCubeSend,
  IconFlag,
  IconInfoCircle,
  IconMoodHappy,
  IconShoppingCart,
  IconUser,
  IconUserCircle,
} from "@tabler/icons-react";

type IconProps = React.ComponentProps<typeof IconBrandFacebook>;

export const TWhatsApp = (props: IconProps) => {
  return <IconBrandWhatsapp {...props} />;
};

export const TFacebook = (props: IconProps) => {
  return <IconBrandFacebook {...props} />;
};

export const TInstagram = (props: IconProps) => {
  return <IconBrandInstagram {...props} />;
};

export const TTwitter = (props: IconProps) => {
  return <IconBrandTwitter {...props} />;
};

export const TLinkedIn = (props: IconProps) => {
  return <IconBrandLinkedin {...props} />;
};
export const TShoppingCart = (props: IconProps) => {
  return <IconShoppingCart {...props} />;
};

export const TUser = (props: IconProps) => {
  return <IconUser {...props} />;
};
export const TUserCircle = (props: IconProps) => {
  return <IconUserCircle {...props} />;
};

export const TFabric = (props: IconProps) => {
  return <IconBrandCraft {...props} />;
};

export const TDelivery = (props: IconProps) => {
  return <IconCubeSend {...props} />;
};
export const THappyFace = (props: IconProps) => {
  return <IconMoodHappy {...props} />;
};
export const TFlag = (props: IconProps) => {
  return <IconFlag {...props} />;
};
export const TInfoCircle = (props: IconProps) => {
  return <IconInfoCircle {...props} />;
};

export const Tgoogle = (props: IconProps) => {
  return <IconBrandGoogle {...props} />;
};
