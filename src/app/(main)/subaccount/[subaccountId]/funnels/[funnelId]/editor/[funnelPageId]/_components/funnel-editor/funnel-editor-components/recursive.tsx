import { EditorElement } from "@/providers/editor/editor-provider";
import React from "react";
import Container from "./container";
import VideoComponent from "./video-component";
import LinkComponent from "./link-component";
import ContactFormComponent from "./contact-form-component";
import Checkout from "./checkout-component";
import TextComponent from "./text-component";
import ImageComponent from "./image-component";
import ButtonComponent from "./button-component";
import SeparatorComponent from "./separator-component";
import NavbarComponent from "./navbar-component";
import CustomCodeComponent from "./custom-code-component";

type Props = {
  element: EditorElement;
};

const Recursive = ({ element }: Props) => {
  switch (element.type) {
    case "text":
      return <TextComponent element={element} />;
    case "container":
      return <Container element={element} />;
    case "video":
      return <VideoComponent element={element} />;
    case "contactForm":
      return <ContactFormComponent element={element} />;
    case "paymentForm":
      return <Checkout element={element} />;
    case "2Col":
      return <Container element={element} />;
    case "3Col":
      return <Container element={element} />;
    case "__body":
      return <Container element={element} />;
    case "link":
      return <LinkComponent element={element} />;
    case "image":
      return <ImageComponent element={element} />;
    case "button":
      return <ButtonComponent element={element} />;
    case "separator":
      return <SeparatorComponent element={element} />;
    case "navbar":
      return <NavbarComponent element={element} />;
    case "customCode":
      return <CustomCodeComponent element={element} />;
    default:
      return null;
  }
};

export default Recursive;
