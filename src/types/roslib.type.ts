import { Pose, Vector3 } from "roslib";

export interface Header {
  seq?: number;
  stamp:
    | {
        sec: number;
        nsec: number;
      }
    | Date;
  frame_id: string;
}

export interface PoseStamped {
  header: Header;
  pose: Pose;
}

export interface Twist {
  linear: Vector3;
  angular: Vector3;
}

export interface Path {
  header: Header;
  poses: PoseStamped[];
}
