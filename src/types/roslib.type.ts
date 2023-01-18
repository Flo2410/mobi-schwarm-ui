import { Pose, Quaternion, Vector3 } from "roslib";

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

export interface PoseWithCovariance {
  pose: Pose;
  covariance: number;
}

export interface PoseWithCovarianceStamped {
  header: Header;
  pose: PoseWithCovariance;
}

export interface Imu {
  header: Header;
  orientation: Quaternion;
  orientation_covariance: number;
  angular_velocity: Vector3;
  angular_velocity_covariance: number;
  linear_acceleration: Vector3;
  linear_acceleration_covariance: number;
}

export interface KeyValue {
  key: string;
  value: string;
}

export enum Level {
  OK = 0,
  WARN = 1,
  ERROR = 2,
  STALE = 3,
}
export interface DiagnosticStatus {
  level: Level;
  name: string;
  message: string;
  hardware_id: string;
  values: KeyValue[];
}
