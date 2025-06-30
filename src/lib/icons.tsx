import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandWhatsapp,
  IconShoppingCart,
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
