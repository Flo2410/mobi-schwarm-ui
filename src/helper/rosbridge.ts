import { Message, Pose, Quaternion, Ros, Topic } from "roslib";
import { v4 as uuidv4 } from "uuid";
import { DiagnosticStatus, PoseStamped, Twist } from "../types/roslib.type";

export const ros = new Ros({
  url: "ws://10.56.42.202:9090",
});

ros.on("connection", () => {
  console.log("Connected to websocket server.");
});

ros.on("error", (error) => {
  console.log("Error connecting to websocket server: ", error);
});
ros.on("close", () => {
  console.log("Connection to websocket server closed.");
});

export const on_theta_pos = (cb: (twist: Twist) => void) => {
  const sub = new Topic({
    ros: ros,
    name: "/theta/pozyx",
    messageType: "geometry_msgs/Twist",
  });

  sub.subscribe(cb);
};

export const on_path = (cb: (msg: Message) => void) => {
  const sub = new Topic({
    ros: ros,
    name: "/web/path",
    messageType: "nav_msgs/Path",
  });

  sub.subscribe(cb);
};

export const on_imu = (cb: (msg: Quaternion) => void) => {
  const sub = new Topic({
    ros,
    name: "/theta/imu",
    messageType: "geometry_msgs/Quaternion",
  });
  sub.subscribe(cb);
};

export const on_status = (cb: (msg: DiagnosticStatus) => void) => {
  const sub = new Topic({
    ros,
    name: "/theta/status",
    messageType: "diagnostic_msgs/DiagnosticStatus",
  });
  sub.subscribe(cb);
};

export const add_waypoint = (x: number, y: number) => {
  const pub = new Topic({
    ros: ros,
    name: "/web/add_pose",
    messageType: "geometry_msgs/PoseStamped",
  });

  const msg: PoseStamped = {
    header: {
      stamp: new Date(),
      frame_id: uuidv4(),
    },
    pose: new Pose({
      position: {
        x,
        y,
      },
    }),
  };

  pub.publish(new Message(msg));
  return msg;
};

export const clear_path = () => {
  const pub = new Topic({
    ros,
    name: "/web/clear_path",
    messageType: "std_msgs/Empty",
  });
  pub.publish({});
};

export const drive = (drive: boolean) => {
  const pub = new Topic({
    ros,
    name: "/theta/drive",
    messageType: "std_msgs/Bool",
  });
  pub.publish({ data: drive });
};
