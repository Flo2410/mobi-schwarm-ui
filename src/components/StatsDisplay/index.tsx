import { clear_path, drive } from "../../helper/rosbridge";

export const StatsDisplay = () => {
  return (
    <div
      className={`absolute top-0 left-0 z-10 px-4 py-2 m-2 text-white rounded-md select-none bg-black/40 backdrop-blur`}
    >
      <div className="grid grid-cols-2" id="status_container">
        <span>FPS</span>
        <span id="fps">0</span>

        <span>Point Count</span>
        <span id="point_count">0</span>

        <span>Position</span>
        <div>
          <span className="mr-1">x:</span>
          <span id="pos_x">0</span>
          <span className="mr-4">mm</span>
          <span className="mr-1">y:</span>
          <span id="pos_y">0</span>
          <span>mm</span>
        </div>
      </div>

      <div className="flex justify-center col-span-2 mt-2 gap-x-4">
        <button className="px-2 border rounded-md cursor-pointer" onClick={() => clear_path()}>
          Clear Points
        </button>
        <button
          className="px-2 bg-green-500 border rounded-md cursor-pointer"
          onClick={() => drive(true)}
        >
          Start
        </button>
        <button
          className="px-2 bg-red-500 border rounded-md cursor-pointer"
          onClick={() => drive(false)}
        >
          stop
        </button>
      </div>
    </div>
  );
};
