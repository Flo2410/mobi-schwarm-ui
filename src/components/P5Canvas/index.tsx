import { FC, useEffect, useRef } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import {
  add_waypoint,
  on_imu,
  on_path,
  on_status,
  on_theta_pos,
  ros,
} from "../../helper/rosbridge";
import { Path, PoseStamped } from "../../types/roslib.type";
import { Pose, Quaternion as RosQuaternion, Vector3 } from "roslib";
import Quaternion from "quaternion";

const SCALE = 13;

export const P5Canvas: FC<{}> = () => {
  const path = useRef<Path>();
  const theta_pos = useRef<Pose>(
    new Pose({
      orientation: new RosQuaternion({ w: 1, x: 0, y: 0, z: 0 }),
      position: new Vector3({ x: 0, y: 0, z: 0 }),
    })
  );

  const do_drive = useRef(false);
  const current_target_index = useRef(0);

  let cam_x = 0;
  let cam_y = 0;
  let mouse_x_offset = 0;
  let mouse_y_offset = 0;
  let map: p5Types.Image;
  let point_to_drag: PoseStamped;

  useEffect(() => {
    on_theta_pos((twist) => {
      theta_pos.current = new Pose({
        ...theta_pos.current,
        ...{ position: twist.linear },
      });
    });

    on_imu((quaternion) => {
      theta_pos.current = new Pose({
        ...theta_pos.current,
        ...{ orientation: quaternion },
      });
    });

    on_path((msg) => {
      path.current = msg as Path;
    });

    on_status((status) => {
      const status_container = document.getElementById("status_container");

      status.values.forEach((key_val) => {
        let key = document.getElementById(key_val.key);
        if (!key) {
          key = document.createElement("span");
          key.id = key_val.key;
          status_container.appendChild(key);
        }
        key.innerText = key_val.key
          .split("_")
          .map((word) => {
            return word[0].toUpperCase() + word.substring(1);
          })
          .join(" ");

        let value = document.getElementById(key_val.key + "_val");
        if (!value) {
          value = document.createElement("span");
          value.id = key_val.key + "_val";
          status_container.appendChild(value);
        }
        value.innerText = key_val.value;

        // Updated refs
        if (key_val.key === "do_drive")
          do_drive.current = key_val.value.toLocaleLowerCase() === "true";
        else if (key_val.key === "current_target_index")
          current_target_index.current = +key_val.value;
      });
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
    if (document.elementFromPoint(p5.mouseX, p5.mouseY).tagName !== "CANVAS") return;

    mouse_x_offset = p5.mouseY - cam_x;
    mouse_y_offset = p5.mouseX - cam_y;

    if (p5.mouseButton === p5.LEFT) {
      // find point to drag
      const point = path.current?.poses.filter(
        (p) =>
          p.pose.position.x / SCALE > mouse_x_offset - 5 &&
          p.pose.position.x / SCALE < mouse_x_offset + 5 &&
          p.pose.position.y / SCALE > mouse_y_offset - 5 &&
          p.pose.position.y / SCALE < mouse_y_offset + 5
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
        point_to_drag = add_waypoint(mouse_x_offset * SCALE, mouse_y_offset * SCALE);
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

      path.current.poses[index].pose.position.x = (p5.mouseY - cam_x) * SCALE;
      path.current.poses[index].pose.position.y = (p5.mouseX - cam_y) * SCALE;
    } else if (p5.mouseButton === p5.RIGHT) {
      cam_x = p5.mouseY - mouse_x_offset;
      cam_y = p5.mouseX - mouse_y_offset;
    }
  };

  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    canvasParentRef.addEventListener("contextmenu", (e) => e.preventDefault());

    // cam_x = p5.windowHeight / 2;
    // cam_y = p5.windowWidth / 2;
    cam_x = (p5.windowHeight - map.width) / 2;
    cam_y = (p5.windowWidth - map.height) / 2;
  };

  const draw = (p5: p5Types) => {
    p5.background("lightgray");
    p5.scale(-1, 1);
    p5.translate(-cam_y, cam_x);
    p5.rotate(p5.HALF_PI);

    p5.push();
    p5.scale(-1, 1);
    p5.image(map, -map.width, 0, map.width, map.height);
    p5.pop();

    // Coordinate System
    p5.strokeWeight(5);
    p5.stroke(255, 0, 0);
    p5.line(0, 0, 20, 0);

    p5.stroke(0, 255, 0);
    p5.line(0, 0, 0, 20);

    p5.strokeWeight(10);
    p5.stroke(0, 0, 255);
    p5.point(0, 0);

    path.current?.poses.forEach((point, index) => {
      if (path.current.poses[index + 1]) {
        p5.strokeWeight(4);
        p5.stroke(255, 0, 0);
        p5.line(
          point.pose.position.x / SCALE,
          point.pose.position.y / SCALE,
          path.current.poses[index + 1].pose.position.x / SCALE,
          path.current.poses[index + 1].pose.position.y / SCALE
        );
      }

      p5.strokeWeight(10);
      p5.stroke(0, 0, 0);
      const x = point.pose.position.x / SCALE;
      const y = point.pose.position.y / SCALE;
      p5.point(x, y);

      p5.push();
      p5.strokeWeight(1);
      p5.scale(-1, 1);
      p5.rotate(p5.HALF_PI);
      p5.text(index, y + 10, x);
      p5.pop();
    });

    // Update pose of robots
    if (theta_pos.current) {
      const line_length = 20;

      const x1 = theta_pos.current.position.x / SCALE;
      const y1 = theta_pos.current.position.y / SCALE;
      var euler = new Quaternion(
        theta_pos.current.orientation.w,
        theta_pos.current.orientation.x,
        theta_pos.current.orientation.y,
        theta_pos.current.orientation.z
      ).toEuler();

      const x2 = x1 + p5.sin(euler.yaw) * line_length;
      const y2 = y1 + p5.cos(euler.yaw) * line_length;

      p5.strokeWeight(4);
      p5.stroke(255, 0, 0);
      p5.line(x1, y1, x2, y2);

      p5.strokeWeight(10);
      p5.stroke(0, 255, 255);
      p5.point(x1, y1);

      // Draw line to current_target_index
      if (path.current?.poses.length > current_target_index.current) {
        const {
          pose: { position: current_point_pos },
        } = path.current.poses[current_target_index.current];
        p5.strokeWeight(2);
        p5.stroke(0, 255, 0);
        p5.line(x1, y1, current_point_pos.x / SCALE, current_point_pos.y / SCALE);
      }
    }
    // Update stats display
    if (p5.frameCount % 10 === 0) {
      document.getElementById("fps").innerText = p5.frameRate().toFixed(1);
      document.getElementById("point_count").innerText = path.current?.poses.length.toString();
      document.getElementById("orientation").innerText = p5.degrees(euler.yaw + p5.PI).toFixed(2);
      document.getElementById("pos_x").innerText = theta_pos.current.position.x.toFixed(0);
      document.getElementById("pos_y").innerText = theta_pos.current.position.y.toFixed(0);
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
