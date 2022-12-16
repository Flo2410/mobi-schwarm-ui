import { FC, useEffect, useRef } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import { add_waypoint, on_path, on_theta_pos, ros } from "../../helper/rosbridge";
import { Path, PoseStamped, Twist } from "../../types/roslib.type";

export const P5Canvas: FC<{}> = () => {
  const path = useRef<Path>();
  const theta_pos = useRef<Twist>();

  let cam_x = 0;
  let cam_y = 0;
  let mouse_x_offset = 0;
  let mouse_y_offset = 0;
  let map: p5Types.Image;
  let point_to_drag: PoseStamped;

  useEffect(() => {
    on_theta_pos((twist) => {
      theta_pos.current = twist;
    });

    on_path((msg) => {
      path.current = msg as Path;
    });

    return () => {
      ros.removeAllListeners();
      ros.close();
    };
  }, []);

  const preload = (p5: p5Types) => {
    map = p5.loadImage("/map.png");
  };

  const on_mouse_pressed = (p5: p5Types) => {
    mouse_x_offset = p5.mouseX - cam_x;
    mouse_y_offset = p5.mouseY - cam_y;

    if (p5.mouseButton === p5.LEFT) {
      // find point to drag
      const point = path.current?.poses.filter(
        (p) =>
          p.pose.position.x > mouse_x_offset - 5 &&
          p.pose.position.x < mouse_x_offset + 5 &&
          p.pose.position.y > mouse_y_offset - 5 &&
          p.pose.position.y < mouse_y_offset + 5
      )[0];

      if (point) {
        point_to_drag = point;
        return;
      }

      if (
        mouse_x_offset > 0 &&
        mouse_x_offset < map.width &&
        mouse_y_offset > 0 &&
        mouse_y_offset < map.height
      ) {
        point_to_drag = add_waypoint(mouse_x_offset, mouse_y_offset);
      }
    } else if (p5.mouseButton === p5.RIGHT) {
      p5.cursor(p5.MOVE);
    }
  };

  const on_mouse_released = (p5: p5Types) => {
    p5.cursor(p5.ARROW);
    if (point_to_drag) {
      // socket.emit("move_point", points.current.filter((p) => p.id === point_to_drag.id)[0]);
      point_to_drag = undefined;
    }
  };

  const mouse_dragged = (p5: p5Types) => {
    if (p5.mouseButton === p5.LEFT && point_to_drag) {
      const index = path.current.poses.findIndex(
        (p) => p.header.frame_id === point_to_drag.header.frame_id
      );

      if (!path.current.poses[index]) return;

      path.current.poses[index].pose.position.x = p5.mouseX - cam_x;
      path.current.poses[index].pose.position.y = p5.mouseY - cam_y;
    } else if (p5.mouseButton === p5.RIGHT) {
      cam_x = p5.mouseX - mouse_x_offset;
      cam_y = p5.mouseY - mouse_y_offset;
    }
  };

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    canvasParentRef.addEventListener("contextmenu", (e) => e.preventDefault());

    cam_x = (p5.windowWidth - map.width) / 2;
    cam_y = (p5.windowHeight - map.height) / 2;
  };

  const draw = (p5: p5Types) => {
    p5.background("lightgray");
    p5.translate(cam_x, cam_y);
    p5.image(map, 0, 0, map.width, map.height);

    path.current?.poses.forEach((point, index) => {
      if (path.current.poses[index + 1]) {
        p5.strokeWeight(4);
        p5.stroke(255, 0, 0);
        p5.line(
          point.pose.position.x,
          point.pose.position.y,
          path.current.poses[index + 1].pose.position.x,
          path.current.poses[index + 1].pose.position.y
        );
      }

      p5.strokeWeight(10);
      p5.stroke(0, 0, 0);
      p5.point(point.pose.position.x, point.pose.position.y);
    });

    // Update pose of robots
    if (theta_pos.current) {
      const line_length = 20;

      const x1 = theta_pos.current.linear.y / 10;
      const y1 = theta_pos.current.linear.x / 10;
      const x2 = x1 + p5.cos(p5.degrees(theta_pos.current.angular.z)) * line_length;
      const y2 = y1 + p5.sin(p5.degrees(theta_pos.current.angular.z)) * line_length;

      p5.strokeWeight(4);
      p5.stroke(255, 0, 0);
      p5.line(x1, y1, x2, y2);

      p5.strokeWeight(10);
      p5.stroke(0, 255, 255);
      p5.point(x1, y1);
    }

    // Update stats display
    if (p5.frameCount % 10 === 0) {
      document.getElementById("fps").innerText = p5.frameRate().toFixed(1);
      document.getElementById("point_count").innerText = path.current?.poses.length.toString();
    }
  };

  return (
    <Sketch
      className="static"
      setup={setup}
      draw={draw}
      preload={preload}
      mouseDragged={mouse_dragged}
      mousePressed={on_mouse_pressed}
      mouseReleased={on_mouse_released}
    />
  );
};
