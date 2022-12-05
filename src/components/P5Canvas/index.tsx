import { FC } from "react";
import Sketch from "react-p5";
import p5Types from "p5"; //Import this for typechecking and intellisense

export const P5Canvas: FC<{}> = () => {
  let cam_x = 0;
  let cam_y = 0;
  let mouse_x_offset = 0;
  let mouse_y_offset = 0;
  let points = [];

  let map: p5Types.Image;
  const preload = (p5: p5Types) => {
    map = p5.loadImage("/map.png");
  };

  const on_mouse_pressed = (p5: p5Types) => {
    mouse_x_offset = p5.mouseX - cam_x;
    mouse_y_offset = p5.mouseY - cam_y;

    if (p5.mouseButton === p5.LEFT) {
      // DEBUG: console.log(`x: ${cam_x_offset} | y: ${cam_y_offset}`);
      p5.cursor(p5.MOVE);
    } else if (p5.mouseButton === p5.RIGHT) {
      if (
        mouse_x_offset > 0 &&
        mouse_x_offset < map.width &&
        mouse_y_offset > 0 &&
        mouse_y_offset < map.height
      )
        points.push(p5.createVector(mouse_x_offset, mouse_y_offset));
    }
  };

  const on_mouse_released = (p5: p5Types) => {
    p5.cursor(p5.ARROW);
  };

  const mouse_dragged = (p5: p5Types) => {
    cam_x = p5.mouseX - mouse_x_offset;
    cam_y = p5.mouseY - mouse_y_offset;
  };

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    canvasParentRef.addEventListener("contextmenu", (e) => e.preventDefault());
  };

  const draw = (p5: p5Types) => {
    p5.background("lightgray");
    p5.translate(cam_x, cam_y);
    const img_width = map.width;
    const img_height = map.height;
    p5.image(map, 0, 0, img_width, img_height);

    p5.strokeWeight(10);
    points.forEach((point) => p5.point(point.x, point.y));
  };

  return (
    <Sketch
      className="absolute"
      setup={setup}
      draw={draw}
      preload={preload}
      mouseDragged={mouse_dragged}
      mousePressed={on_mouse_pressed}
      mouseReleased={on_mouse_released}
    />
  );
};
