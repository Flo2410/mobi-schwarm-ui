import { FC } from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense

export const P5Canvas: FC<{}> = () => {
  let cam_x = 0;
  let cam_y = 0;

  let img: p5Types.Image;
  const preload = (p5: p5Types) => {
    img = p5.loadImage("/map.png");
  };

  const mouse_dragged = (p5: p5Types) => {
    cam_x = p5.mouseX - cam_x;
    cam_y = p5.mouseY - cam_y;
  };

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
  };

  const draw = (p5: p5Types) => {
    p5.background("lightgray");
    p5.translate(cam_x, cam_y);
    const img_width = img.width;
    const img_height = img.height;
    p5.image(img, 0, 0, img_width, img_height);
  };

  return <Sketch setup={setup} draw={draw} preload={preload} mouseDragged={mouse_dragged} />;
};
